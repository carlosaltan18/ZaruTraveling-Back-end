import {Router} from 'express'
import { add, deleted, find, getEventsHotel, test, update } from './event.controller.js'
import{isAdmin, validateJwt, isClient, idAdminHotel} from '../middlewares/validate-jwt.js'
const api = Router()

api.get('/test', test)
api.post('/add', [validateJwt, idAdminHotel], add)
api.put('/update/:id', [validateJwt, idAdminHotel], update)
api.get('/find', [validateJwt], find)
api.delete('/delete/:id', [validateJwt, idAdminHotel], deleted)
api.get('/getEventsHotel/:id', [validateJwt], getEventsHotel)

export default api