import express from "express";
import { createBox, createComment, createRequest, createSubtask, createTask, editBox, editRequest, editSubtask, editTask, getallbox, getAllComments, getBox, getRequest, getSubtasks } from "../Controllers/boxController.js";
import authMiddleware from "../Middlewares/authentication.js";



const router = express.Router()


// remove authMiddleware if no use

router.post('/getAllBox',authMiddleware(["Admin","Manager"]), getallbox)
router.post('/getBox', authMiddleware(["Admin","Manager","Team Lead","Member"]), getBox)

router.post('/createBox',authMiddleware(["Admin"]), createBox)
router.post('/createTask',authMiddleware(['Admin','Manager']), createTask)

router.post('/createSubtask',authMiddleware(['Team Lead','Admin']), createSubtask)
router.post('/createRequest',authMiddleware(['Admin','Team Lead','Member']), createRequest)

router.put('/editBox',authMiddleware(['Admin']), editBox)
router.put('/editTask',authMiddleware(['Admin','Manager','Team Lead']), editTask)
router.put('/editSubtask',authMiddleware(['Team Lead','Admin',"Member"]), editSubtask)

router.post('/createComment', createComment)

router.post('/getRequest',getRequest)
router.post('/editRequest', editRequest)
router.post('/getAllComments', getAllComments)
router.post('/getSubtasks', getSubtasks)
export default router