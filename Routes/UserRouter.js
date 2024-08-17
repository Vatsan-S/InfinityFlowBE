import express from "express";
import { createManager, createMember, createTeamlead, forgotPassword, getUser, loginUser } from "../Controllers/UserController.js";
import authMiddleware from "../Middlewares/authentication.js";


const router = express.Router()


router.post('/createMember',authMiddleware(["Admin"]),createMember)
router.post('/createTeamlead',authMiddleware(["Admin"]), createTeamlead)
router.post("/createManager",authMiddleware(["Admin"]), createManager)

router.get('/getuser/:id', authMiddleware(["Admin","Manager","Team Lead"]), getUser)

router.post('/login', loginUser)
router.post('/forgotPassword', forgotPassword)
export default router