import Reservation from '../reservation/reservation.model.js'
import Room from '../room/room.model.js'
import User from '../user/user.model.js'
import Hotel from '../hotel/hotel.model.js'
import Invoice from '../invoice/invoice.model.js'
import fs from 'fs'
import PDFDocument from 'pdfkit'
import moment from 'moment-timezone';



export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'test good' })
}

function getCurrentDateInGuatemala() {
    return moment().tz('America/Guatemala').startOf('day').toDate(); 
}

function convertToGuatemalaTimeAtNoon(date) {
    return moment(date).tz('America/Guatemala').startOf('day').hours(12).toDate();
}

export const add = async (req, res) => {
    try {
        let data = req.body;
        let uId = req.user._id.toString()

        if (!data.hotel || !data.rooms || !data.checkInDate || !data.checkOutDate || !data.numberOfGuests) {
            return res.status(400).send({ message: 'Se requieren todos los parámetros' });
        }

        const userExists = await User.findById(uId);
        const hotelExists = await Hotel.findById(data.hotel);

        if (!userExists || !hotelExists) {
            return res.status(404).send({ message: 'Usuario o hotel no encontrados' });
        }

        const roomsExist = await Room.find({ _id: { $in: data.rooms } });
        if (!roomsExist) {
            return res.status(404).send({ message: 'Una o varias habitaciones no encontradas' });
        }

        for (const room of roomsExist) {
            if (room.hotel.toString() !== data.hotel) {
                return res.status(400).send({ message: 'Una o varias habitaciones no pertenecen al hotel especificado' });
            }
        }

        const currentGuatemalaDate = getCurrentDateInGuatemala();

        const checkInDate = new Date(data.checkInDate);
        checkInDate.setHours(24, 0, 0, 0); // Establecer la hora a las 12:00:00

        const checkOutDate = new Date(data.checkOutDate);
        checkOutDate.setHours(24, 0, 0, 0); // Establecer la hora a las 12:00:00
        console.log(currentGuatemalaDate)
        console.log(checkInDate)
        console.log(checkOutDate)
        if (checkInDate <= currentGuatemalaDate || checkOutDate <= currentGuatemalaDate) {
            return res.status(400).send({ message: 'Las fechas de check-in y check-out deben ser futuras' });

        }

        if (checkInDate >= checkOutDate) {
            return res.status(400).send({ message: 'La fecha de check-in debe ser anterior a la fecha de check-out' });
        }

        const overlappingReservations = await Reservation.find({
            hotel: data.hotel,
            $or: [
                { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }, // La reserva se superpone si la fecha de check-in está antes de checkOutDate y la fecha de check-out está después de checkInDate
                { checkInDate: { $gte: checkInDate, $lt: checkOutDate } }, // La reserva se superpone si la fecha de check-in está entre checkInDate y checkOutDate
                { checkOutDate: { $gt: checkInDate, $lte: checkOutDate } } // La reserva se superpone si la fecha de check-out está entre checkInDate y checkOutDate
            ]
        });

        for (const reservation of overlappingReservations) {
            for (const room of reservation.rooms) {
                if (data.rooms.includes(room)) {
                    return res.status(400).send({ message: 'Una o varias habitaciones ya están siendo utilizadas en las fechas especificadas' });
                }
            }
        }

        for (const room of roomsExist) {
            if (room.status !== 'AVAILABLE') {
                return res.status(400).send({ message: 'Una o varias habitaciones no están disponibles' });
            }

            if (data.numberOfGuests > room.amountOfPeople) {
                return res.status(400).send({ message: 'El número de huéspedes excede la capacidad de una o varias habitaciones' });
            }
        }

        const oneDay = 24 * 60 * 60 * 1000;
        const nights = Math.round(Math.abs((checkOutDate - checkInDate) / oneDay));

        let totalAmount = 0;
        for (const room of roomsExist) {
            totalAmount += room.price * nights;
        }

        const reservation = new Reservation({
            user: uId,
            hotel: data.hotel,
            rooms: data.rooms,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            numberOfGuests: data.numberOfGuests,
            total: totalAmount,
            status: 'CONFIRMED'
        });

        

        const savedReservation = await reservation.save();

        const invoice = new Invoice({
            reservation: savedReservation._id,
            user: uId,
            hotel: data.hotel,
            totalAmount: totalAmount,
            status: 'ACTIVE'
        });

        await invoice.save();
        await generateInvoicePDF(invoice, reservation, userExists, hotelExists);

        return res.send({ message: 'Reserva creada exitosamente', invoice });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al crear la reserva' });
    }
};

export const update = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const { checkInDate, checkOutDate, numberOfGuests } = req.body;
        const userId = req.user._id.toString();

        // Buscar la reserva por su ID
        const reservation = await Reservation.findById(reservationId).populate('rooms');
        if (!reservation) {
            return res.status(404).send({ message: 'Reserva no encontrada' });
        }

        if (reservation.user.toString() !== userId) {
            return res.status(403).send({ message: 'No estás autorizado para actualizar esta reserva' });
        }

        const currentDate = new Date();

        if (checkInDate && new Date(checkInDate) <= currentDate) {
            return res.status(400).send({ message: 'La fecha de check-in debe ser en el futuro' });
        }

        if (checkOutDate && new Date(checkOutDate) <= currentDate) {
            return res.status(400).send({ message: 'La fecha de check-out debe ser en el futuro' });
        }

        if (checkInDate && checkOutDate && new Date(checkInDate) >= new Date(checkOutDate)) {
            return res.status(400).send({ message: 'La fecha de check-in debe ser anterior a la fecha de check-out' });
        }

        const oneDay = 24 * 60 * 60 * 1000; 

        const nights = Math.round(Math.abs((new Date(checkOutDate) - new Date(checkInDate)) / oneDay));

        const updateData = {};
        if (checkInDate) {
            updateData.checkInDate = checkInDate;
        }
        if (checkOutDate) {
            updateData.checkOutDate = checkOutDate;
        }
        if (numberOfGuests) {
            updateData.numberOfGuests = numberOfGuests;
        }

        const updatedReservation = await Reservation.findOneAndUpdate(
            { _id: reservationId },
            updateData,
            { new: true }
        );

        if (!updatedReservation) {
            return res.status(404).send({ message: 'Reserva no encontrada' });
        }

        let updatedTotalAmount = 0;
        for (const room of reservation.rooms) {
            updatedTotalAmount += room.price * nights;
        }

        updatedReservation.total = updatedTotalAmount;
        await updatedReservation.save();

        const cancelledInvoice = await Invoice.findOneAndUpdate(
            { reservation: reservationId },
            { status: 'CANCELLED' },
            { new: true }
        );

        const newInvoice = new Invoice({
            reservation: updatedReservation._id,
            user: updatedReservation.user,
            hotel: updatedReservation.hotel,
            totalAmount: updatedTotalAmount,
            status: 'ACTIVE'
        });
        await newInvoice.save();

        return res.send({ message: 'Reserva actualizada exitosamente', updatedReservation, cancelledInvoice, newInvoice });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al actualizar la reserva' });
    }
};


export const getUserReservations = async (req, res) => {
    try {
        let uId = req.user._id.toString()

        const userReservations = await Reservation.find({ user: uId });

        return res.send({ reservations: userReservations });
    } catch (error) {
        console.error('Error retrieving user reservations:', error);
        return res.status(500).send({ message: 'Error retrieving user reservations' });
    }
};

export const getReservationsByHotel = async (req, res) => {
    try {
        let { id } = req.params;

        const reservations = await Reservation.find({ hotel: id }).populate('user').populate('rooms');

        if (!reservations || reservations.length === 0) {
            return res.status(404).send({ message: 'No reservations found for the specified hotel' });
        }

        return res.send({ reservations });
    } catch (error) {
        console.error('Error retrieving reservations by hotel:', error);
        return res.status(500).send({ message: 'Error retrieving reservations by hotel', error });
    }
};

export const deleted = async (req, res) => {
    try {
        const reservationId = req.params.reservationId;
        let uId = req.user._id.toString()

        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            return res.status(404).send({ message: 'Reservation not found' });
        }


        if (reservation.user.toString() !== uId) {
            return res.status(403).send({ message: 'You are not authorized to delete this reservation' });
        }

        await Reservation.findByIdAndDelete(reservationId);

        await Room.updateOne({ _id: reservation.room }, { $set: { status: 'AVAILABLE' } });

        return res.send({ message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        return res.status(500).send({ message: 'Error deleting reservation' });
    }
};

export const cancelReservation = async (req, res) => {
    try {
        const reservationId = req.params.reservationId;
        let uId = req.user._id.toString()
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            return res.status(404).send({ message: 'Reservation not found' });
        }

        if (reservation.user.toString() !== uId) {
            return res.status(403).send({ message: 'You are not authorized to cancel this reservation' });
        }

        reservation.status = 'CANCELLED';
        await reservation.save();

        const room = await Room.findById(reservation.room);

        await room.save();

        return res.send({ message: 'Reservation cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        return res.status(500).send({ message: 'Error cancelling reservation' });
    }
};

export const generateInvoicePDF = async (invoiceData, reservationData, userData, hotelData) => {
    try {
        const doc = new PDFDocument();

        const fileName = `Factura_No.${invoiceData._id}.pdf`;
        const filePath = `./invoice/${fileName}`;

        doc.pipe(fs.createWriteStream(filePath));
        const logoPath = './src/img/logoSF.png';
        doc.image(logoPath, 50, 30, { width: 100, height: 100, opacity: 0.3 });


        doc.font('Helvetica-Bold');
        doc.fontSize(18).text('FACTURA', { align: 'center', underline: true }).moveDown(2);

        doc.font('Helvetica');
        doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`).moveDown();

        doc.fontSize(12).text(`Usuario: ${userData.nameUser}`, { width: 410, align: 'left', continued: true }).text(`Hotel: ${hotelData.name}`, { width: 410, align: 'right' }).moveDown();

        doc.fillColor('black')
            .text(`Total: Q${invoiceData.totalAmount}`, { width: 410, align: 'left', continued: true })
            .text(`Estado: ${invoiceData.status}`, { width: 410, align: 'right' }).moveDown();

        doc.font('Helvetica-Bold');
        doc.fontSize(16).text('RESERVA', { align: 'center', underline: true }).moveDown();

        doc.fontSize(12).text(`Fecha de Check-In: ${reservationData.checkInDate}`).moveDown();
        doc.fontSize(12).text(`Fecha de Check-Out: ${reservationData.checkOutDate}`).moveDown();
        doc.fontSize(12).text(`Número de Huéspedes: ${reservationData.numberOfGuests}`).moveDown();

        const roomNames = await Room.find({ _id: { $in: reservationData.rooms } }).distinct('description');

        doc.fontSize(12).text('Habitaciones:', { underline: true }).moveDown();
        for (const roomName of roomNames) {
            doc.fontSize(12).text(roomName).moveDown();
        }

        doc.end();

        console.log(`Factura generada y guardada en: ${filePath}`);
    } catch (error) {
        console.error('Error al generar la factura en PDF:', error);
    }
};

export const getReservationHotel = async (req, res) => {
    try {
        let id = req.user._id
        let user = await User.findById(id)
        let reservations = await Reservation.find({ hotel: user.hotel }).populate('user', ['username']).populate(
            'hotel', ['name']
        ).populate('rooms', ['description'])
        if (!reservations) return res.status(404).send({ message: 'hotel not have reservations' })
        return res.send({ message: reservations })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error fetching Reservations', err: err })

    }
}

export const getUserReservation = async (req, res) => {
    try {
        let id = req.user._id
        let user = await User.findById(id)
        let reservations = await Reservation.find({ hotel: user.hotel }).populate('user', ['id', 'nameUser', 'email', 'phone', 'username'])
        if (!reservations) return res.status(404).send({ message: 'hotel not have reservations' })
        //let userReservations = await User.find({_id: reservations.user.id})
        let userReservations = [];
        reservations.forEach(reservation => {
            userReservations.push({
                username: reservation.user.username,
                email: reservation.user.email,
                nameUser: reservation.user.nameUser,
                phone: reservation.user.phone
            });
        });
        return res.send({ message: 'User Reservations Info', userReservations })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error fetching users ', err: err })

    }
}

export const getReservationUser = async (req, res) => {
    try {
        let { id } = req.params
        let user = await User.findOne({ _id: id })
        if (!user) return res.send({ message: 'User not found' })
        let reservation = await Reservation.find({ user: id })
        if (!reservation) return res.send({ message: 'The user not have reservation' })
        return res.send(reservation)

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error fetching users ', err: err })
    }
}

export const getReservationMyUser = async (req, res) => {
    try {
        let uid = req.user._id;
        let user = await User.findOne({ _id: uid });
        if (!user) return res.send({ message: 'User not found' });
        
        let reservations = await Reservation.find({ user: uid }).populate('hotel', 'name'); // Solo obtener el nombre del hotel

        if (!reservations || reservations.length === 0) return res.send({ message: 'The user does not have reservations' });
        
        
        let modifiedReservations = reservations.map(reservation => ({
            nameUser: user.nameUser,
            hotelName: reservation.hotel.name,
            checkIn: reservation.checkInDate.toISOString().split('T')[0], // Obtener solo la fecha sin esa opcion de horario
            checkOut: reservation.checkOutDate.toISOString().split('T')[0], // Obtener solo la fecha
            total: reservation.total,
            status: reservation.status
        }));

        return res.send(modifiedReservations);

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error fetching users ', err: err });
    }
};