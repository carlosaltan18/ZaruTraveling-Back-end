'use strict'

import { Router } from "express"
import {validateJwt, isAdmin, idAdminHotel} from '../middlewares/validate-jwt.js'
import { addCategoryRoom, deleteCategoryRoom, getCategoryRoom, updateCategoryRoom } from "./categoryRoom.controller.js"

const api = Router()
api.post('/addCategory',[validateJwt, idAdminHotel], addCategoryRoom)
api.get('/getCategory', [validateJwt], getCategoryRoom)
api.put('/updateCategory/:id',[validateJwt, idAdminHotel], updateCategoryRoom )
api.delete('/deleteCategory/:id',[validateJwt, idAdminHotel], deleteCategoryRoom)

export default api