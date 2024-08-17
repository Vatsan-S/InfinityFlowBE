import mongoose, { Types } from "mongoose";
import User from "./UserSchema.js";

const taskSchema = new mongoose.Schema({
    taskID:{
        type: String,
        required: true,
        unique: true,
        default: function(){
            return `MT-${Math.random().toString(36).substring(2,8).toUpperCase()}`
        }
    },
    taskName:{
        type: String,
        required: true,
        unique:true
    },
    taskObjective:{
        type: String,
        requried: true
    },
    assignedTo:{
        type: String,
        required: true
    },
    deadline:{
        type: Date,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now,
        immutable: true
    },
    createdBy:{
        type: String,
        ref: User,
        required: true,
        immutable: true,

    },
    request:{
        type:[{type:String}]
    },
    comments:{
        type:[{type:String}]
    },
    subtasks:{
        type:[{type:String}]
    },
    taskStatus:{
        type: String,
        enum:["Assigned", "In Progress","Requested", "Completed"],
        default:"Assigned",
        required: true
    },
    approvalStatus:{
        type: String,
        enum:["Approved","Rejected","Pending"],
        default:"Pending",
        required: true
    },
    boxID:{
        type: String,
        required: true,
        
    },
    priority:{
        type:String,
        required: true,
        enum:["High","Medium","Low","Undefined"],
        default:"Undefined"
    },
    searchTerm:{
        type: String,
        require:true
    }


})


const Task = mongoose.model("Task",taskSchema)
export default Task