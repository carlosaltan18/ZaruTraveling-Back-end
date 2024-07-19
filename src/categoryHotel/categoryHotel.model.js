'use strict'
import { Schema, model } from "mongoose"

const categoryHotelSchema = Schema({
    nameCategoryHotel: {
        type: String, 
        required: true,
        unique: true,
    },
    descriptionCategoryHotel: {
        type: String, 
        required: true
    }
},{
    versionKey: false
})

export default model('categoryHotel', categoryHotelSchema)