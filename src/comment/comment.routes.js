import { Router } from "express"
import { addComment, deleteComment, getComments, getCommentsByHotel, updateCommetn } from './comment.controller.js'
import {validateJwt, isClient} from '../middlewares/validate-jwt.js'

const api = Router()

api.post('/addComment', [validateJwt], addComment)
api.put('/updateComment/:id', [validateJwt], updateCommetn)
api.delete('/deleteComment/:id',[validateJwt], deleteComment)
api.get('/getComments', [validateJwt],getComments)
api.get('/getCommentsByHotel/:hotelId', [validateJwt], getCommentsByHotel)


export default api	