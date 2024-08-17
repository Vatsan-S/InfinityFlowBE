import express from "express";
import dotenv from "dotenv"
import connectDB from "./Database/Config.js";
import UserRouter from "./Routes/UserRouter.js";
import boxRouter from "./Routes/boxRouter.js";
import cors from 'cors'
dotenv.config()
const app = express()
const PORT = process.env.PORT

// Middleware
app.use(express.json())

app.use(cors())

// DB connection
connectDB()

// Routes
app.use('/api/users',UserRouter)
app.use('/api/box', boxRouter)

// Server initiation
app.listen(PORT,()=>{

    console.log("Server Initiated")
})