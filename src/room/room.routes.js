import { Router } from "express"
import { addRoom, checkRoomAvailability, deleteRoom, findAvailableRooms, findAvailableRoomsMain, getAvailableRooms, getAvailableRoomsBeds, getAvailableRoomsByHotelId, getAvailableRoomsByHotelName, getAvailableRoomsInCity, getAvailableRoomsInCountry, getAvailableRoomsInDateRange, getAvailableRoomsPeople, roomsByHotel, searchRooms, updateRoom } from "./room.controller.js"
import { validateImage } from "../middlewares/storage.js"
import{isAdmin, validateJwt, isClient, idAdminHotel} from '../middlewares/validate-jwt.js'

const api = Router()

api.post('/addRoom', validateImage.array('imageRoom', 10),[validateJwt, idAdminHotel], addRoom)
api.put('/updateRoom/:id', validateImage.array('imageRoom', 10),[validateJwt, idAdminHotel], updateRoom)
api.delete('/deleteRoom/:id',[validateJwt, idAdminHotel], deleteRoom)
api.get('/getAvailableRooms', [validateJwt], getAvailableRooms)
api.post('/getAvaRoomsHotelName', [validateJwt],  getAvailableRoomsByHotelName)
api.get('/RoomsByIdHotel/:id', [validateJwt], roomsByHotel)
api.get('/getAvailableRoomsByHotelId/:id', [validateJwt], getAvailableRoomsByHotelId)
api.post('/findFilter', findAvailableRooms)
api.get('/getAvailableRoomsPeople/:capacity', [validateJwt], getAvailableRoomsPeople)
api.get('/getAvailableRoomsBeds/:beds', [validateJwt], getAvailableRoomsBeds)
api.get('/getAvailableRoomsInCountry/:country', [validateJwt], getAvailableRoomsInCountry)
api.get('/getAvailableRoomsInCity/:city', [validateJwt], getAvailableRoomsInCity)
//api.get('/checkRoomAvailability/:id/:checkInDate/:checkOutDate', [validateJwt], checkRoomAvailability)
//api.get('/getAvailableRoomsInDateRange/:checkInDate/:checkOutDate', [validateJwt], getAvailableRoomsInDateRange)
api.get('/findAvailableRoomsMain', [validateJwt], findAvailableRoomsMain)

//pampichi método 
api.post('/searchRooms', [validateJwt], searchRooms)

export default api