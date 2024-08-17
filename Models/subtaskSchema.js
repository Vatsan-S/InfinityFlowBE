import mongoose from "mongoose";


const subtaskSchema = new mongoose.Schema({
    subtaskID:{
        type: String,
        unique: true,
        required: true,
        default: function(){
            return `ST-${Math.random().toString(36).substring(2,8).toUpperCase()}`
        }
    },
    subtaskTitle:{
        type:String,
        required: true,
        unique:true
    },
    subtaskObjective:{
        type: String,
        required: true
    },
    subtaskAssignedTo:{
        type: String,
        
        required: true
    },
    subtaskDeadline:{
        type: Date,
        required: true
    },
    subtaskCreatedAt:{
        type: Date,
        required: true,
        default: Date.now
    },
    subtaskCreatedBy:{
        type: String,
        
        required: true
    },
    request:{
        type:[{type:String}]
    },
    comments:{
        type:[{type:String}]
    },
    boxID:{
            type: String,
            
            required:true
    },
    maintaskID:{
        type: String,
        required: true
    },
    subtaskPriority:{
        type:String,
        required: true,
        enum:["High","Medium","Low", "Undefined"],
        default:"Undefined",
    },
    subtaskStatus:{
        type: String,
        enum:["Assigned", "In Progress","Requested", "Completed"],
        default:"Assigned",
        required: true

    },
    subtaskApprovalStatus:{
        type:String,
        enum:["Pending", "Approved", "Rejected"],
        default:'Pending',
        required: true
    },
    searchTerm:{
        type: String,
        require:true
    }
})

const Subtask = mongoose.model("Subtask",subtaskSchema)
export default Subtask