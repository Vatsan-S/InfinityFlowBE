import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    commentDescription:{
        type:String,
        required:true
    },
    commentCreatedAt:{
        type:Date,
        default: Date.now,
        required:true,
        immutable:true
    },
    id:{
        type:String,
        required:true
    },
    boxID:{
        type:String,
        required: true
    }
})

const Comment = mongoose.model("Comment", commentSchema)
export default Comment