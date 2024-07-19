'use strict'

import Hotel from './hotel.model.js'
import CategoryHotel from '../categoryHotel/categoryHotel.model.js'
import Event from '../event/event.model.js'
import { checkUpdateHotel } from '../utils/validator.js'
import * as fs from 'fs'

export const addHotel = async (req, res) => {
    try {
        let data = req.body;
        let categoryHotel = await CategoryHotel.findOne({ _id: data.categoryHotel });
        if (!categoryHotel) return res.status(404).send({ message: 'Category of hotel not found' })

        if (req.files && req.files.length > 0) {
            data.imagesHotel = req.files.map(file => '/uploads/' + file.filename)
        }

        let hotel = new Hotel(data)
        await hotel.save()
        return res.send({ message: 'Hotel registered successfully', hotel })

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error registering hotel', error: error })
    }
}

export let updateHotel = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let update = checkUpdateHotel(data, false)

        let hotel = await Hotel.findOne({ _id: id })
        if (!hotel) return res.status(404).send({ message: 'Hotel not found' })

        if (req.files && req.files.length > 0) {
            data.imageHotel = req.files.map(file => '/uploads/' + file.filename);
        }

        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        let updateHotel = await Hotel.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    name: data.name,
                    country: data.country,
                    city: data.city,
                    address: data.address,
                    phone: data.phone,
                    categoryHotel: data.categoryHotel,
                    imagesHotel: data.imageHotel
                }
            },
            { new: true }
        ).populate('categoryHotel', ['nameCategoryHotel', 'descriptionCategoryHotel'])
        if (!updateHotel) return res.status(404).send({ message: 'Hotel not found and not updated' })
        return res.send({ message: 'Hotel updated successfully', updateHotel })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating hotel' })
    }
}

export let deleteHotel = async (req, res) => {
    try {
        let { id } = req.params

        let hotel = await Hotel.findOne({ _id: id })
        if (!hotel) return res.status(404).send({ message: 'Hotel not found' })

        let deletedHotel = await Hotel.deleteOne({ _id: id })
        if (deletedHotel.deletedCount === 0) return res.status(404).send({ message: 'Hotel not found and not deleted' })
        return res.send({ message: 'Deleted hotel successfully' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting hotel' })
    }
}

export const getHotels = async (req, res) => {
    try {
        let hotels = await Hotel.find().populate('categoryHotel', ['nameCategoryHotel', 'descriptionCategoryHotel'])
        return res.send({ hotels })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error fetching hotels', err: err })
    }
}

export const preferencesHotel = async (req, res) => {
    try {
        const { categoria, ubicacion, eventos } = req.body;

        const filtroHotel = {};

        if (categoria) {
            const categoriaHotel = await CategoryHotel.findOne({ nameCategoryHotel: categoria });
            if (categoriaHotel) {
                filtroHotel.categoryHotel = categoriaHotel._id;
            }
        }

        if (ubicacion) {
            filtroHotel.city = ubicacion; 
        }

        let hoteles = [];

        if (Object.keys(filtroHotel).length !== 0) {
            hoteles = await Hotel.find(filtroHotel).populate('categoryHotel', ['nameCategoryHotel', 'descriptionCategoryHotel']);
        } else {
            hoteles = await Hotel.find().populate('categoryHotel', ['nameCategoryHotel', 'descriptionCategoryHotel']);
        }

        if (eventos && eventos.length > 0) {
            const hotelesConEventos = await Event.find({ description: { $in: eventos } }).distinct('hotel');
            hoteles = hoteles.filter(hotel => hotelesConEventos.includes(hotel._id));
        }

        return res.send({ hotels: hoteles });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error fetching hotels', error });
    }
}


export const getCity = async (req, res) => {
    try {
        const hotel = await Hotel.find().select('city');
        return res.send( hotel.map(hotel => hotel.city) )
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error fetching hotels country', err: err })
    }
}