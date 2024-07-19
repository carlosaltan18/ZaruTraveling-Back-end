'use strict'
import { Schema, model } from "mongoose";

const userSchema = Schema({
    nameUser: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        minLength: [8, 'Password must be 8 characters'],
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        minLength: 8,
        maxLength: 8,
        required: true
    }, 
    role: {
        type: String,
        uppercase: true,
        enum: ['ADMIN', 'CLIENT', 'ADMINHOTEL'],
        required: true
    }, 
    hotel: {
        type: Schema.Types.ObjectId,
        ref: 'hotel'
    }, 
    imagesUser: {
        type: [String],
        required: true    
    }

},{
    versionKey: false
})

export default model('user', userSchema)