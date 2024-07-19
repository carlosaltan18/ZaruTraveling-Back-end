'use strict'

import Room from './room.model.js'
import Hotel from '../hotel/hotel.model.js'
import Reservation from '../reservation/reservation.model.js'
import CategoryRoom from '../categoryRoom/categoryRoom.model.js'
import { checkUpdateRoom } from '../utils/validator.js'
import mongoose from 'mongoose'

export const addRoom = async (req, res) => {
    try {
        let data = req.body

        let hotel = await Hotel.findOne({ _id: data.hotel })
        if (!hotel) return res.status(404).send({ message: 'Hotel not found' })

        let categoryRoom = await CategoryRoom.findOne({ _id: data.categoryRoom })
        if (!categoryRoom) return res.status(404).send({ message: 'Category of room not found' })

        if (data.additionalAmenities && Array.isArray(data.additionalAmenities)) {
            data.amenities.push(...data.additionalAmenities)
        }

        if (req.files && req.files.length > 0) {
            data.imagesRoom = req.files.map(file => '/uploads/' + file.filename)
        }

        let room = new Room(data)
        await room.save()
        return res.send({ message: 'Room registered successfully', room })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error registering room', error: error })
    }
}

export let updateRoom = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let update = checkUpdateRoom(data, false)

        let room = await Room.findOne({ _id: id })
        if (!room) return res.status(404).send({ message: 'Room not found' })

        if (req.files && req.files.length > 0) {
            data.imagesRoom = req.files.map(file => '/uploads/' + file.filename);
        }

        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        let updateRoom = await Room.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    description: data.description,
                    beds: data.beds,
                    amountOfPeople: data.amountOfPeople,
                    amenities: data.amenities,
                    price: data.price,
                    status: data.status,
                    imagesRoom: data.imagesRoom
                }
            },
            { new: true }
        ).populate({
            path: 'categoryRoom',
            select: ['nameCategoryRoom', 'descriptionCategoryRoom']
        }).populate({
            path: 'hotel',
            select: ['name']
        })
        if (!updateRoom) return res.status(404).send({ message: 'Room not found and not updated' })
        return res.send({ message: 'Room updated successfully', updateRoom })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating room' })
    }
}

export let deleteRoom = async (req, res) => {
    try {
        let { id } = req.params

        let room = await Room.findOne({ _id: id })
        if (!room) return res.status(404).send({ message: 'Room not found' })

        let deletedRoom = await Room.deleteOne({ _id: id })
        if (deletedRoom.deletedCount === 0) return res.status(404).send({ message: 'Room not found and not deleted' })
        return res.send({ message: 'Deleted room successfully' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting room' })
    }
}

export const getAvailableRooms = async (req, res) => {
    try {
        const availableRooms = await Room.find({ status: 'AVAILABLE' })
            .populate('categoryRoom', ['nameCategoryRoom', 'descriptionCategoryRoom'])
            .populate('hotel', ['name']);
        return res.send({ availableRooms });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error fetching available rooms', error });
    }
}

export const getAvailableRoomsByHotelName = async (req, res) => {
    try {
        let { search } = req.body

        let hotels = await Hotel.find({ name: { $regex: search, $options: 'i' } })
        if (hotels.length === 0) {
            return res.status(404).send({ message: 'Hotels not found' })
        }

        let hotelIds = hotels.map(hotel => hotel._id)

        let availableRooms = await Room.find({ hotel: { $in: hotelIds }, status: 'AVAILABLE' })
            .populate('categoryRoom', ['nameCategoryRoom', 'descriptionCategoryRoom'])
            .populate('hotel', ['name'])

        if (availableRooms.length === 0) return res.status(404).send({ message: 'Available rooms not found for the searched hotels' })

        return res.send({ availableRooms })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error searching available rooms by hotel coincidence', error })
    }
}

export const updateRoomStatus = async () => {
    try {
        const currentDate = new Date();

        // Buscar todas las reservaciones que tengan fecha de check-out menor o igual a la fecha actual y estén confirmadas
        const reservations = await Reservation.find({
            checkOutDate: { $lte: currentDate },
            status: 'CONFIRMED'
        });

        // Recorrer las reservaciones encontradas
        for (const reservation of reservations) {
            // Obtener la habitación de cada reservación
            const room = await Room.findById(reservation.room);

            // Verificar si la habitación existe y está ocupada
            if (room && room.status === 'OCCUPIED') {
                // Actualizar el estado de la habitación a "AVAILABLE"
                room.status = 'AVAILABLE';
                await room.save();
            }
        }

        console.log('Estado de las habitaciones actualizado correctamente');
    } catch (error) {
        console.error('Error al actualizar el estado de las habitaciones:', error);
    }
};

export const roomsByHotel = async (req, res) => {
    try {
        let { id } = req.params
        let roomsH = await Room.find({ hotel: id })
            .populate('categoryRoom', ['nameCategoryRoom', 'descriptionCategoryRoom'])
            .populate('hotel', ['name'])
        return res.send({ roomsH })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error fetching available rooms', error })
    }
}

export const getAvailableRoomsByHotelId = async (req, res) => {
    try {
        let { id } = req.params

        let hotels = await Hotel.find({ _id: id })
        if (hotels.length === 0) {
            return res.status(404).send({ message: 'Hotel not found' })
        }

        let availableRooms = await Room.find({ hotel: id, status: 'AVAILABLE' })
            .populate('categoryRoom', ['nameCategoryRoom', 'descriptionCategoryRoom'])
            .populate('hotel', ['name'])

        if (availableRooms.length === 0) {
            return res.status(404).send({ message: 'No available rooms found for the hotel' })
        }

        return res.send({ availableRooms })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error searching available rooms by hotel ID', error })
    }
}


export const findAvailableRooms = async (req, res) => {
    try {
        const { address, checkIn, checkOut, people } = req.body;

        const overlappingReservations = await Reservation.find({
            status: 'CONFIRMED',
            $or: [
                { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } },
                { checkInDate: { $eq: checkIn }, checkOutDate: { $eq: checkOut } },
                { checkInDate: { $gt: checkIn, $lt: checkOut } },
            ],
        });

        const occupiedRoomIds = overlappingReservations.flatMap(reservation => reservation.rooms);

        const hotels = await Hotel.find({ address: address });

        const hotelIds = hotels.map(hotel => hotel._id);

        const availableRooms = await Room.find({
            hotel: { $in: hotelIds },
            status: 'AVAILABLE',
            amountOfPeople: { $gte: people },
            _id: { $nin: occupiedRoomIds },
            $or: [
                { checkInDate: { $gte: checkOut } },
                { checkOutDate: { $lte: checkIn } }
            ]
        })
            .populate('categoryRoom', ['nameCategoryRoom', 'descriptionCategoryRoom'])
            .populate('hotel', ['name', 'address']);

        return res.send({ availableRooms });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error searching available rooms', error });
    }
};

export const getAvailableRoomsPeople = async (req, res) => {
    try {
        let { capacity } = req.params;
        if (isNaN(capacity)) {
            return res.status(400).send({ message: "Capacity must be a number" });
        }

        capacity = parseInt(capacity);
        const availableRooms = await Room.find({
            status: 'AVAILABLE',
            amountOfPeople: { $gte: capacity }
        }).populate('hotel categoryRoom');
        return res.send({ availableRooms });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const getAvailableRoomsBeds = async (req, res) => {
    try {
        let { beds } = req.params;

        if (isNaN(beds)) {
            return res.status(400).send({ message: "Beds must be a number" });
        }

        beds = parseInt(beds);

        const availableRooms = await Room.find({
            status: 'AVAILABLE',
            beds: { $gte: beds }
        }).populate('hotel categoryRoom');

        return res.send({ availableRooms });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const getAvailableRoomsInCountry = async (req, res) => {
    try {
        const { country } = req.params;

        if (typeof country !== 'string') {
            return res.status(400).send({ message: "Country must be a text" });
        }

        const regex = new RegExp(country, 'i');

        const hotels = await Hotel.find({ country: regex }).select('_id');

        const availableRooms = await Room.find({
            hotel: { $in: hotels },
            status: 'AVAILABLE'
        }).populate('hotel');

        return res.send({ availableRooms });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const getAvailableRoomsInCity = async (req, res) => {
    try {
        const { city } = req.params;

        if (typeof city !== 'string') {
            return res.status(400).send({ message: "City must be a text" });
        }

        const regex = new RegExp(city, 'i');

        const hotels = await Hotel.find({ city: regex }).select('_id');

        const availableRooms = await Room.find({
            hotel: { $in: hotels },
            status: 'AVAILABLE'
        }).populate('hotel');

        return res.send({ availableRooms });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const checkRoomAvailability = async (req, res) => {
    try {
        const { id, checkInDate, checkOutDate } = req.params;


        const room = await Room.findById(id);
        if (!room) {
            return res.status(400).send({ message: "Room not found" });
        }

        if (!isValidDate(checkInDate) || !isValidDate(checkOutDate)) {
            return res.status(400).send({ message: "Invalid date format" });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (checkOut <= checkIn) {
            return res.status(400).send({ message: "Check-out date must be after check-in date" });
        }

        const overlappingReservations = await Reservation.find({
            rooms: id,
            checkInDate: { $lt: checkOut },
            checkOutDate: { $gt: checkIn },
            status: 'CONFIRMED'
        });

        if (overlappingReservations.length > 0) {
            return res.send({ available: false });
        }

        return res.send({ available: true });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{1,2}-\d{1,2}$/;
    return regex.test(dateString);
}

export const getAvailableRoomsInDateRange = async (req, res) => {
    try {
      const { checkInDate, checkOutDate } = req.params;
  
      if (!isValidDate(checkInDate) || !isValidDate(checkOutDate)) {
        return res.status(400).send({ message: "Invalid date format" });
      }
  
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
  
      if (checkOut <= checkIn) {
        return res.status(400).send({ message: "Check-out date must be after check-in date" });
      }
  
      const overlappingReservations = await Reservation.find({
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gt: checkIn },
        status: 'CONFIRMED'
      }).distinct('rooms');
  
      const availableRooms = await Room.find({
        _id: { $nin: overlappingReservations },
        status: 'AVAILABLE'
      });
  
      return res.send({ availableRooms });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  // filtro main

  export const findAvailableRoomsMain = async (req, res) => {
    try {
        const { country, city, checkInDate, checkOutDate, quantityBeds, quantityPeople } = req.body;

        let query = {};

        if (country) {
            query.country = new RegExp(country, 'i');
        }

        if (city) {
            query.city = new RegExp(city, 'i');
        }

        const hotels = await Hotel.find(query);

        let availableRooms = [];

        for (const hotel of hotels) {
            let rooms = await Room.find({ hotel: hotel._id }).populate('hotel', 'name');

            for (const room of rooms) {
                let isAvailable = true;

                if (checkInDate && checkOutDate) {
                    const overlappingReservations = await Reservation.find({
                        hotel: hotel._id,
                        rooms: room._id,
                        $or: [
                            { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }, 
                            { checkInDate: { $gte: checkInDate, $lt: checkOutDate } }, 
                            { checkOutDate: { $gt: checkInDate, $lte: checkOutDate } } 
                        ]
                    });

                    if (overlappingReservations.length > 0) {
                        isAvailable = false;
                    }
                }

                if (isAvailable && (!quantityBeds || room.beds >= quantityBeds) && (!quantityPeople || room.amountOfPeople >= quantityPeople)) {
                    availableRooms.push(room);
                }
            }
        }

        return res.send({ availableRooms });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al buscar habitaciones disponibles', error });
    }
};

//función hecha por su servidor (el verdadero full stack 🥵)
export const searchRooms = async (req, res) =>{
try {
    const { city, checkIn, checkOut, people } = req.body;

    // Buscar reservas que se superpongan con las fechas proporcionadas
    const overlappingReservations = await Reservation.find({
        status: 'CONFIRMED',
        $or: [
            { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } },
            { checkInDate: checkIn, checkOutDate: checkOut },
            { checkInDate: { $gt: checkIn, $lt: checkOut } },
            { checkOutDate: { $gt: checkIn, $lt: checkOut } }
        ]
    });

    const occupiedRoomIds = overlappingReservations.flatMap(reservation => reservation.rooms);

    // Buscar hoteles en la ciudad especificada
    const hotels = await Hotel.find({ city: city });

    const hotelIds = hotels.map(hotel => hotel._id);

    // Buscar habitaciones disponibles en los hoteles encontrados
    const availableRooms = await Room.find({
        hotel: { $in: hotelIds },
        status: 'AVAILABLE',
        amountOfPeople: { $gte: people },
        _id: { $nin: occupiedRoomIds }
    })
    .populate('categoryRoom', ['nameCategoryRoom', 'descriptionCategoryRoom'])
    .populate('hotel', ['name', 'city']);

    return res.send({ availableRooms });
} catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error searching available rooms', error });
}
};
