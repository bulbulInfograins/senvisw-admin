const mongoose = require("mongoose")
const schema = mongoose.Schema
const contactus = new schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        // trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phone: {
        type: Number,
    },
    subject:{
        type:String
    },
    message:{
        type:String
    },
    is_delete:{
        type:Boolean,
        default:false
    }  
    
},{ timestamps: true }, { strict: false });
var detail = mongoose.model("contactus", contactus)
module.exports = detail