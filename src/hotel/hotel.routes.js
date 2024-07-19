import { Router } from "express"
import { addHotel, deleteHotel, getCity, getHotels, preferencesHotel, updateHotel } from './hotel.controller.js'
import { validateImage } from "../middlewares/storage.js"
import{isAdmin, validateJwt, isClient, idAdminHotel} from '../middlewares/validate-jwt.js'

const api = Router()

api.post('/addHotel', validateImage.array('imageHotel', 10), [validateJwt, isAdmin], addHotel)
api.put('/updateHotel/:id', validateImage.array('imageHotel', 10), [validateJwt, isAdmin], updateHotel)
api.delete('/deleteHotel/:id',[validateJwt, isAdmin], deleteHotel)
api.get('/getHotels', [validateJwt], getHotels)
api.post('/preferencesHotel', [validateJwt], preferencesHotel)
api.get('/getCity', [validateJwt], getCity)

export default api
