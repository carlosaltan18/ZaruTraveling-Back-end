import Event from '../event/event.model.js'
import Additional from '../additionals/additionals.model.js'
import Hotel from '../hotel/hotel.model.js'

export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'test good' })
}

export const add = async (req, res) => {
    try {
        const { hotel, description, date, time, additional } = req.body; // Obtiene los datos del cuerpo de la solicitud

        if (!hotel || !description || !date || !time) {
            return res.status(400).send({ message: 'All fields are required' });
        }

        if (additional) {
            const additionalExists = await Additional.findById(additional);
            if (!additionalExists) {
                return res.status(400).send({ message: 'Invalid additional ID' });
            }
        }

        const existingEvent = await Event.findOne({
            hotel: hotel,
            date: { $gte: new Date(date).setHours(0, 0, 0), $lt: new Date(date).setHours(23, 59, 59) },
            $or: [
                { time: time },
                { $and: [{ time: { $lt: time } }, { end_time: { $gte: time } }] },
                { $and: [{ time: { $lte: time } }, { end_time: { $gt: time } }] }
            ]
        });

        if (existingEvent) {
            return res.status(400).send({ message: 'An event already exists at the same date and time or with a period of less than two hours' });
        }

        const nuevoEvento = new Event({
            hotel: hotel,
            description: description,
            date: date,
            time: time,
            additional: additional
        });

        await nuevoEvento.save();

        return res.send({ message: 'Event created successfully', data: nuevoEvento });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error adding event' });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params; // Obtiene el ID del evento a actualizar
        const data = req.body; // Obtiene los nuevos datos del cuerpo de la solicitud
        
        // Verifica si ya existe un evento con el ID proporcionado
        const eventoExistente = await Event.findById(id);
        if (!eventoExistente) {
            return res.status(404).send({ message: 'Event not found' });
        }
        // Verifica si los additionals existen y tienen datos válidos
        if (data.additional) {
            const additionalExists = await Additional.findById(data.additional);
            if (!additionalExists) {
                return res.status(400).send({ message: 'Invalid additional ID' });
            }
        }
        let updateEvent = await Event.findOneAndUpdate(
            { _id: id },
            data,
            {new: true} 
        )
        if (!updateEvent) return res.status(401).send({ message: 'Event not found' })

        // Devuelve el evento actualizado
        return res.send({ message: 'Event updated successfully', data: updateEvent });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Update error' });
    }
};

export const find = async (req, res) => {
    try {
        let events = await Event.find()
            .populate('additional', ['description', 'price'])
            .populate('hotel', ['name', 'address'])
        return res.send({ events })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error fetching hotels', err: err })
    }
}

export const deleted = async (req, res) => {
    try {
        let { id } = req.params
        let deleteEvent = await Event.findOneAndDelete({ _id: id })
        if (!deleteEvent) return res.status(404).send({ message: 'the event does not exist' })
        return res.send({ message: `event with description ${deleteEvent.description} deleted successfully` })
    } catch (error) {
        console.error(error)
        return res.status(404).send({ message: 'error when deleting check' })
    }
}

export const getEventsHotel = async (req, res) =>{
    try {
        let {id} = req.params
        let hotel = await Hotel.findById(id)
        if(!hotel) return res.status(404).send({message: 'Hotel not found'})
        let evetns = await Event.find({hotel: hotel}).populate('hotel', ['name'])
        if(!evetns) return res.status(404).send({message: 'Events not found'})
        return res.send({message:  evetns})
        
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error fetching Events ', err: err })
    }
}