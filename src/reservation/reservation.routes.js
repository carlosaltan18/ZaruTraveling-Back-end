import {Router} from 'express'
import { add, deleted, getUserReservations, test, update, cancelReservation, getReservationsByHotel, getReservationMyUser, getReservationUser } from './reservation.controller.js'
import{isAdmin, validateJwt, isClient, idAdminHotel} from '../middlewares/validate-jwt.js'

const api = Router()

api.post('/add', [validateJwt, isClient],add)
api.get('/test', test)
api.put('/update/:reservationId', [validateJwt],update)
api.get('/getReservation', [validateJwt], getUserReservations)
api.delete('/delete/:reservationId', [validateJwt], deleted)
api.delete('/cancelled/:reservationId', [validateJwt], cancelReservation)
api.get('/getReservationsByHotel/:id',  getReservationsByHotel)
api.get('/getReservationUser/:id', [validateJwt],  getReservationUser)
api.get('/getReservationMyUser', [validateJwt, isClient],  getReservationMyUser)


export default api