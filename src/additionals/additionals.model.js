import {Schema, model} from "mongoose"

const additionalsSchema = Schema({
    description:{
        type: String,
        required: [true, "Description is require"]
    },
    price:{
        type: Number,
        required: true,
        default: 0
    }
},{
    versionKey: false
})

export default model('additionals', additionalsSchema)