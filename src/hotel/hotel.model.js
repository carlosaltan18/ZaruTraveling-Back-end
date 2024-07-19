import { Schema, model} from "mongoose"

const hotelSchema = Schema({
    name: {
        type: String,
        required: true
    },   
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    categoryHotel: {
        type: Schema.Types.ObjectId,
        ref: 'categoryHotel',
        required: true
    },
    imagesHotel: {
        type: [String],
        required: true    
    }
},{
    versionKey: false
})

export default model('hotel', hotelSchema)