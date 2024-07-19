import { Schema, model } from "mongoose"

export const roomSchema = Schema({
    description: {
        type: String,
        required: true
    },
    beds: {
        type: Number,
        required: true
    },
    amountOfPeople: {
        type: Number,
        required: true
    },
    amenities: {
        type: [String],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        uppercase: true,
        enum: ['INABILITED', 'AVAILABLE'],
        required: true
    },
    hotel: {
        type: Schema.Types.ObjectId,
        ref: 'hotel',
        required: true
    },
    categoryRoom: {
        type: Schema.Types.ObjectId,
        ref: 'categoryRoom',
        required: true
    },
    imagesRoom: {
        type: [String],
        required: true    
    }
},{
    versionKey: false
})

export default model('room', roomSchema)