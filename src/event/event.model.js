import {Schema, model} from "mongoose"

const eventSchema = Schema({
    hotel:{
        type: Schema.Types.ObjectId,
        ref: 'hotel',
        required: [true, 'hotel is required.']
    },
    description:{
        type: String,
        require: [true, "Description is require"]
    },
    date:{
        type: Date,
        required: [true, 'Date is required']
    },
    time:{
        type: String,
        required: [true, 'Time is required']

    },
    additional:{
        type: Schema.Types.ObjectId,
        ref: 'additionals',
        required: false
    }
},{
    versionKey: false
})

export default model('event', eventSchema)