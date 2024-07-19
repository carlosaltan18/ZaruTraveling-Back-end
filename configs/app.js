'use strict'

//importaciones
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from "dotenv"
import { apiLimiter } from './apilLimiter.js'
import { updateRoomStatus } from '../src/room/room.controller.js'

//Importaciones de routes
import userRoutes from '../src/user/user.routes.js'
import categoryHotelRoutes from '../src/categoryHotel/categoryHotel.routes.js'
import categoryRoomRoutes from '../src/categoryRoom/categoryRoom.routes.js'
import commentRoutes from '../src/comment/comment.routes.js'
import reservationRoutes from '../src/reservation/reservation.routes.js'
import eventRoutes from '../src/event/event.routes.js'
import invoiceRoutes from '../src/invoice/invoice.routes.js'
import additionalsRoutes from '../src/additionals/additionals.routes.js'
import hotelRoutes from '../src/hotel/hotel.routes.js'
import roomRoutes from '../src/room/room.routes.js'

//configuraciones
const app = express()
config()
const port = process.env.PORT || 3056

//configuración del servidor 
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev')) 
app.use(apiLimiter)
app.use('/uploads', express.static('src/uploads'));

//declaracion de rutas
app.use('/user', userRoutes)
app.use('/categoryHotel', categoryHotelRoutes)
app.use('/categoryRoom', categoryRoomRoutes)
app.use('/comment', commentRoutes)
app.use('/reservation', reservationRoutes)
app.use('/invoice', invoiceRoutes)
app.use('/event', eventRoutes)
app.use('/additionals', additionalsRoutes)
app.use('/hotel', hotelRoutes)
app.use('/room', roomRoutes)

//levantar el servidor 
export const initServer = ()=>{
    setInterval(updateRoomStatus, 86400000);

    app.listen(port)
    console.log(`Server HTTP running in port ${port}`)
}