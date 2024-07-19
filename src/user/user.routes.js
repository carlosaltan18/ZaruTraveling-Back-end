'use strict'

import { Router } from "express"
import { validateImage } from "../middlewares/storage.js"
import { deleteById, deleteUser, getUsers, getUsersID, login, register, updateById, updatePassword, updateRole, updateUser } from "./user.controller.js"
import{isAdmin, validateJwt} from '../middlewares/validate-jwt.js'
const api = Router()


api.post('/register',validateImage.array('imageHotel', 10), register)
api.post('/login', login)
api.put('/updateUser',validateImage.array('imageHotel', 10),[validateJwt], updateUser)
api.delete('/deleteUser',[validateJwt], deleteUser)
api.put('/updateRole/:username',[validateJwt, isAdmin] ,updateRole)
api.put('/updatePassword', [validateJwt], updatePassword)
api.delete('/deleteUserID/:id', [validateJwt, isAdmin], deleteById)
api.put('/updateUserId/:id', [validateJwt, isAdmin], updateById)
api.get('/getUsers', getUsers)
api.get('/getUsersID',[validateJwt], getUsersID)

export default api