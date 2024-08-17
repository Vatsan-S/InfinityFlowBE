import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()
const mongoDB_URL = process.env.URI
const connectDB = async(req,res)=>{
    try {
        const connection = await mongoose.connect(mongoDB_URL)
        console.log("DB connection successfull")
        return connection
    } catch (error) {
        console.log("DB connection error")
    }
}

export default connectDB