'use strict'
import { Schema, model } from "mongoose"

const categoryRoomSchema = Schema({
    nameCategoryRoom: {
        type: String, 
        required: true,
        unique: true,
    },
    descriptionCategoryRoom: {
        type: String, 
        required: true
    }
},{
    versionKey: false
})

export default model('categoryRoom', categoryRoomSchema)