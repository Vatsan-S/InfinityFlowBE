import BoxShell from "../Models/boxSchema.js";
import Comment from "../Models/commentSchema.js";

import Req from "../Models/requestSchema.js";
import Subtask from "../Models/subtaskSchema.js";
import Task from "../Models/taskSchema.js";
import User from "../Models/UserSchema.js";

export const createBox = async (req, res) => {
  try {
    const { boxName, boxCategory, boxOwner, manager } = req.body;
    // console.log(req.body);
    const newBox = new BoxShell({ boxName, boxCategory, boxOwner, manager });
    // console.log("before", newBox);
    await newBox.save();
    // console.log("after", newBox);
    res.status(201).json({ message: "Box created Successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error in creating Box",
      error: error.message,
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const {
      taskName,
      taskObjective,
      assignedTo,
      deadline,
      createdBy,
      boxID,
      priority,
      
    } = req.body;

    // Validation assigned To
    const assignedUser = await User.findById(assignedTo);
    if (assignedUser.userRole !== "Team Lead") {
      return res
        .status(404)
        .json({ message: "Only a Team lead should be assigned for a task" });
    }

    //Validation created By
    const createdUser = await User.findById(createdBy);
    if (createdUser.userRole !== "Manager") {
      return res
        .status(404)
        .json({ message: "Only a manager can create a task" });
    }

    // retreiving the box & Validation Box ID
    const currentBox = await BoxShell.findById(boxID);
    if (!currentBox) {
      return res.status(404).json({ message: "There is no box identified" });
    }

    const existingTask = await Task.findOne({ taskName: taskName });
    if (existingTask) {
      return res.status(401).json({ message: "Task name already present" });
    }
    // creating a task

    const createTask = new Task({
      taskName,
      taskObjective,
      assignedTo,
      deadline,
      createdBy,
      boxID,
      priority,
      searchTerm: `${taskName},${deadline},${priority}`,
      // comments: [{ user: createdBy, commentDescription: "Task created" }],
    });

    const createdTask = await createTask.save();
    //  console.log("createdTask,", createdTask)
    const updateBox = await BoxShell.findOneAndUpdate(
      { _id: boxID },
      { $push: { tasks: createdTask._id } }
    );
    // const updatedBox = await BoxShell.findByIdAndUpdate(
    //   boxID,
    //   { $push: { tasks: newTask } },
    //   { new: true }
    // );

    // console.log(updatedBox)
    res.status(201).json({ message: "Task Created Successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error in creating task",
      error: error.message,
    });
  }
};

export const createSubtask = async (req, res) => {
  try {
    const {
      subtaskTitle,
      subtaskObjective,
      subtaskAssignedTo,
      subtaskDeadline,
      subtaskCreatedBy,
      boxID,
      maintaskID,
      subtaskPriority,
    } = req.body;

    // Validation on subtask assigned to
    const assignedUser = await User.findById(subtaskAssignedTo);
    if (assignedUser.userRole !== "Member" || !assignedUser) {
      return res
        .status(404)
        .json({ message: "Subtasks can only be assigned to Members" });
    }

    // Validation to subtask created by
    const createdUser = await User.findById(subtaskCreatedBy);
    if (createdUser.userRole !== "Team Lead" || !createdUser) {
      return res
        .status(404)
        .json({ message: "Only team leads can create subtasks" });
    }

    // Validating box ID and maintaskID
    const currentBox = await BoxShell.findById(boxID);

    const existingSubtask = await Subtask.findOne({
      subtaskTitle: subtaskTitle,
    });
    if (existingSubtask) {
      return res.status(401).json({ message: "Title aready created" });
    }
    if (!currentBox) {
      return res.status(404).json({ message: "There is no such box" });
    }

    // Creating the subtask
    const createSubtask = new Subtask({
      subtaskTitle,
      subtaskObjective,
      subtaskAssignedTo,
      subtaskDeadline,
      subtaskCreatedBy,
      boxID,
      maintaskID,
      subtaskPriority,
      searchTerm: `${subtaskTitle},${subtaskDeadline},${subtaskPriority},${maintaskID}`,
    });
    const createdSubtask = await createSubtask.save();

    const updateMaintask = await Task.findOneAndUpdate(
      { taskID: maintaskID },
      { $push: { subtasks: createdSubtask._id } },
      { new: true }
    );
    // console.log(updatedSubtaskArray);
    res.status(200).json({ message: "Subtask created" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error in creating subtask",
      error: error.message,
    });
  }
};

export const createRequest = async (req, res) => {
  try {
    const { reqDescription, reqResponse, ID, boxID } = req.body;

    // Differentiate Request
    const diff = ID.slice(0, 1);
    if (diff === "M") {
      const existingRequest = await Req.findOne({ id: ID });
      if (existingRequest) {
        return res
          .status(401)
          .json({ message: "Already a request in the task" });
      }
    } else {
      const existingRequest = await Req.findOne({ id: ID });
      if (existingRequest) {
        return res
          .status(401)
          .json({ message: "Already a request in subtask" });
      }
    }
    const newRequest = new Req({
      reqDescription,
      reqResponse,
      id: ID,
      boxID,
    });

    const createdRequest = await newRequest.save();
    // console.log(createdRequest);

    if (diff === "M") {
      const updateTask = await Task.findOneAndUpdate(
        { taskID: ID },
        { $set: { request: createdRequest._id } },
        { new: true }
      );

      if (!updateTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res
        .status(200)
        .json({
          message: "Request created Successfully",
          taskDetails: updateTask,
        });
      // find the updated task and send the taskdetails to get updated in the redux
    } else {
      const updateSubtask = await Subtask.findOneAndUpdate(
        { subtaskID: ID },
        { $set: { request: createdRequest._id } },
        { new: true }
      );

      if (!updateSubtask) {
        return res.status(404).json({ message: "Subtask not found" });
      }
      return res
        .status(200)
        .json({
          message: "Request created Successfully",
          taskDetails: updateSubtask,
        });
      // find the updated task and send the taskdetails to get updated in the redux
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the request" });
  }
};

export const editRequest = async (req, res) => {
  try {
    const { id, status, ID, boxID } = req.body;
    // console.log(req.body)
    const initial = ID.slice(0, 1);

    if (status !== "Pending") {
      // --------------deleteRequest---------------
      const changeReq = await Req.findByIdAndDelete(id);
      if (initial === "M") {
        // --------------update in main task-----------------
        const clearTask = await Task.findOneAndUpdate(
          { taskID: ID },
          { $set: { request: [] } }
        );
        // ---------------create a new comment----------------
        const comment = new Comment({
          commentDescription: `Request ${status}`,
          id: ID,
          boxID: boxID,
        });
        console.log(comment);
        const updatedComment = await comment.save();

        //  ---------------update in main task------------------
        const updateInTask = await Task.findOneAndUpdate(
          { taskID: ID },
          { $push: { comments: updatedComment._id } },
          { new: true }
        );
        //  console.log(updateInTask)
      } else {
        const clearTask = await Subtask.findOneAndUpdate(
          { subtaskID: ID },
          { $set: { request: [] } }
        );
        const createdComment = new Comment({
          commentDescription: `Request ${status}`,
          id: ID,
          boxID: boxID,
        });
        const updatedComment = await createdComment.save();
        // console.log(updatedComment);
        //  ---------------update in subtask------------------
        const updateInTask = await Subtask.findOneAndUpdate(
          { subtaskID: ID },
          { $push: { comments: updatedComment._id } },
          { new: true }
        );
      }
    } else {
      return res.json();
    }

    res.status(201).json({ message: "Request edited" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error in editing request",
      error: error.message,
    });
  }
};

export const editBox = async (req, res) => {
  try {
    const { boxName, boxCategory, boxID } = req.body;
    const data = {};
    if (boxName) data["boxName"] = boxName;
    if (boxCategory) data["boxCategory"] = boxCategory;
    const updatedBox = await Box.findOneAndUpdate(
      { _id: boxID },
      { $set: data },
      { new: true }
    );
    // console.log(updatedBox)
    res.status(200).json({ message: "Box edited Successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error in editing the box" });
  }
};

export const editTask = async (req, res) => {
  try {
    const {
      taskName,
      taskObjective,
      assignedTo,
      deadline,
      taskStatus,
      approvalStatus,
      priority,
      taskID,
      boxID,
    } = req.body;

    const data = {};
    if (taskName) data["taskName"] = taskName;
    if (taskObjective) data["taskObjective"] = taskObjective;
    if (assignedTo) data["assignedTo"] = assignedTo;
    if (deadline) data["deadline"] = deadline;
    if (approvalStatus) data["approvalStatus"] = approvalStatus;
    if (priority) data["priority"] = priority;
    if (taskStatus) data["taskStatus"] = taskStatus;
    if(searchTerm) data["searchTerm"] = `${taskName},${deadline},${priority}`
    console.log(data);
    const updatedTask = await Task.findOneAndUpdate(
      { taskID: taskID },
      {
        $set: data,
        // $push: { "tasks.$.comments": { commentDescription: "Task Edited" } },
      },

      { new: true }
    );

    const newComment = new Comment({
      commentDescription: "Task Edited",
      id: taskID,
      boxID: boxID,
    });

    const updatedComment = await newComment.save();
    console.log("new", updatedComment);
    if (!updatedTask) {
      return res.status(404).json({ message: "There is no task found" });
    }
    console.log(updatedTask);
    res
      .status(200)
      .json({ message: "Task edited Successfully", taskDetails: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error in editing task", error:error });
  }
};

export const editSubtask = async (req, res) => {
  try {
    const {
      subtaskTitle,
      subtaskObjective,
      subtaskAssignedTo,
      subtaskDeadline,
      subtaskPriority,
      boxID,
      subtaskID,
      subtaskStatus,
      subtaskApprovalStatus,
      searchTerm,
      maintaskID
    } = req.body;
    // option to transfer subtask to another main task in future updates
    const data = {};
    if (subtaskTitle) data["subtaskTitle"] = subtaskTitle;
    if (subtaskObjective) data["subtaskObjective"] = subtaskObjective;
    if (subtaskAssignedTo) data["subtaskAssignedTo"] = subtaskAssignedTo;
    if (subtaskDeadline) data["subtaskDeadline"] = subtaskDeadline;
    if (subtaskPriority) data["subtaskPriority"] = subtaskPriority;
    if (subtaskStatus) data["subtaskStatus"] = subtaskStatus;
    if (subtaskApprovalStatus)
      data["subtaskApprovalStatus"] = subtaskApprovalStatus;
    if(searchTerm) data["searchTerm"] = `${subtaskTitle},${subtaskDeadline},${subtaskPriority},${maintaskID}`
    // console.log("data", data);
    const updatedSubtask = await Subtask.findOneAndUpdate(
      { subtaskID: subtaskID },
      {
        $set: data,
      },

      {
        new: true,
      }
    );

    // console.log(updatedSubtask);
    res.status(200).json({
      message: "Subtask edited Successfully",
      taskDetails: updatedSubtask,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error in editing subtask" });
  }
};

export const createComment = async (req, res) => {
  try {
    const { commentDescription, ID, boxID } = req.body;

    const diff = ID.slice(0, 1);

    const createComment = new Comment({
      commentDescription,
      id: ID,
      boxID,
    });
    const createdComment = await createComment.save();
    // console.log(createdComment)
    if (diff === "M") {
      const updateTask = await Task.findOneAndUpdate(
        { taskID: ID },
        { $push: { comments: createdComment._id } },
        { new: true }
      );

      if (!updateTask) {
        return res.status(404).json({ message: "Task not found" });
      }
    } else {
      const updateSubtask = await Subtask.findOneAndUpdate(
        { subtaskID: ID },
        { $push: { comments: createdComment._id } },
        { new: true }
      );

      if (!updateSubtask) {
        return res.status(404).json({ message: "Subtask not found" });
      }
    }
    res.status(200).json({ message: "Commented successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error in commenting" });
  }
};

export const getallbox = async (req, res) => {
  try {
    const userDetails = req.user;
    // console.log("User",userDetails)
    const username = userDetails.userName;

    const user = await User.findOne({ userName: username });
    // console.log("user",user);
    if (user.userRole === "Manager") {
      const boxlist = await BoxShell.find({ manager: user._id });
      // console.log(boxlist)
      res.status(200).json({ allBox: boxlist });
    } else {
      const boxlist = await BoxShell.find();
      res.status(200).json({ allBox: boxlist });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error in getting all box",
      error: error.message,
    });
  }
};

export const getBox = async (req, res) => {
  try {
    const { boxID } = req.body;

    // Validate box
    const box = await BoxShell.findById(boxID);
    // console.log(box)
    if (!box) {
      return res.status(404).json({ message: "There is no box Identified" });
    }
    //getUsers
    const users = await User.find();

    // get Tasks
    const tasks = await Task.find({ boxID: boxID });

    // getSubtasks
    const subtasks = await Subtask.find({ boxID: boxID });

    // getReq
    const requests = await Req.find({ boxID: boxID });

    // get Comments
    const comments = await Comment.find({ boxID: boxID });

    res.status(200).json({
      tasks: tasks,
      subtasks: subtasks,
      requests: requests,
      comments: comments,
      box: box,
      users: users,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error in getting box details" });
  }
};

export const getRequest = async (req, res) => {
  try {
    const { id } = req.body;
    // console.log(req.body)
    if (!id) {
      return res.status(201).json({ message: "No request" });
    }
    const request = await Req.findById(id);
    if (!request) {
      return res.status(404).json({ message: "No request Found" });
    }
    res.status(200).json({ request: request });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error in getting request",
      error: error.message,
    });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const { id } = req.body;
    // console.log(id);
    const comments = await Comment.find({ id: id });
    // console.log("comments", comments);
    res.status(200).json({ message: "All Comments", commentsList:comments });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error in getting all comments" });
  }
};

export const getSubtasks = async(req,res)=>{
  try {
    const{taskID} = req.body
    // console.log("taskID", taskID)
    const subtasks = await Subtask.find({maintaskID:taskID})
    
    res.status(200).json({subtaskData: subtasks})
  } catch (error) {
    res.status(500).json({message:"Internal server error in getting subtask"})
  }
}
