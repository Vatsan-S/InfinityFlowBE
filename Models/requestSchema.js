import mongoose from "mongoose";

const reqSchema = new mongoose.Schema({
    reqDescription:{
        type:String,
        required:true
    },
    reqResponse:{
        type:String,
        enum:["Resolved", "Rejected",  "Pending"],
        default: "Pending",
        required: true
    },
    id:{
        type:String,
        required:true
    },
    boxID:{
        type:String,
        required: true
    }
},{timestamps:true})

const Req = mongoose.model("Req",reqSchema)
export default Req