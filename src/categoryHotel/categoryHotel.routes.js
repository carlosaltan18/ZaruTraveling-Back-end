'use strict'

import { Router } from "express"
import {validateJwt, isAdmin} from '../middlewares/validate-jwt.js'
import { addCategoryHotel, deleteCategoryHotel, getCategoryHotel, updateCategoryHotel } from "./categoryHotel.controller.js"

const api = Router()
api.post('/addCategory',[validateJwt, isAdmin], addCategoryHotel)
api.get('/getCategory', [validateJwt], getCategoryHotel)
api.put('/updateCategory/:id',[validateJwt, isAdmin], updateCategoryHotel )
api.delete('/deleteCategory/:id',[validateJwt, isAdmin], deleteCategoryHotel)

export default api