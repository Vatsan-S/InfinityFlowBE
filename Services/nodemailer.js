import nodemailer, { createTransport } from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = createTransport({
    host:'smtp.gmail.com',
    port:465,
    secure:true,
    auth:{
        user: process.env.PASSMAIL,
        pass: process.env.PASSKEY
    }
})

export default transporter