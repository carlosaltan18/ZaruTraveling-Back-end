import {Router} from 'express'
import { add, deleted, find, getAdditionals, test, update } from './additionals.controller.js'
import{isAdmin, validateJwt, isClient, idAdminHotel} from '../middlewares/validate-jwt.js'

const api = Router()

api.get('/test', test)
api.post('/add', [validateJwt],add)
api.put('/update/:id',[validateJwt], update)
api.get('/find', [validateJwt],find)
api.delete('/delete/:id', [validateJwt],deleted)
api.get('/getAdditionals', getAdditionals)

export default api