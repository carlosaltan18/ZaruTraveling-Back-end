import { Schema, model } from "mongoose"

const reservationSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    hotel: {
        type: Schema.Types.ObjectId,
        ref: 'hotel',
        required: true
    },
    rooms: [{
        type: Schema.Types.ObjectId,
        ref: 'room',
        required: true
    }],
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    numberOfGuests:{
        type: Number,
        required: true
    },
    total:{
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        uppercase: true,
        enum: ['CONFIRMED', 'PENDING', 'CANCELLED'],
        default: 'PENDING'
    }
}, {
    versionKey: false
});

export default model('reservation', reservationSchema)