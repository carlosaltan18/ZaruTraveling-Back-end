import {Schema, model} from "mongoose"

const invoiceSchema = Schema({
    reservation: {
        type: Schema.Types.ObjectId,
        ref: 'reservation',
        required: true
    },
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
    totalAmount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status:{
        type: String,
        upperCase: true,
        enum: ['CANCELLED', 'ACTIVE'],
        required: true,
        default: 'ACTIVE'   
    }
}, {
    versionKey: false
});
export default model('invoice', invoiceSchema)