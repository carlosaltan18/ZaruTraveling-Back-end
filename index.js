//Ejecutar el sevidor 
import { initServer } from "./configs/app.js"
import { connect } from "./configs/mongo.js"
import {createUserDefault} from './src/user/user.controller.js'
import {addCategoryHotelDefault, addDefaultCategoriesHotel} from './src/categoryHotel/categoryHotel.controller.js'
import {addCategoriesRoomDefault} from './src/categoryRoom/categoryRoom.controller.js'
import {addAdditionalDefault} from './src/additionals/additionals.controller.js'

initServer()
connect()
createUserDefault()
addCategoryHotelDefault()
addDefaultCategoriesHotel()
addCategoriesRoomDefault()
addAdditionalDefault()