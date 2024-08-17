import jwt from "jsonwebtoken";
import User from "../Models/UserSchema.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import transporter from "../Services/nodemailer.js";
import BoxShell from "../Models/boxSchema.js";
dotenv.config();

export const createMember = async (req, res) => {
  try {
    const {
      userName,
      userEmail,
      userRole,
      roleSpecialization,
      userSupervisor,
      teamList,
      boxID,
      userPassword,
    } = req.body;

    // validation
    if (userRole !== "Member") {
      return res
        .status(400)
        .json({ message: "Invalid User role for creating a member" });
    }

    if (teamList || boxID) {
      return res
        .status(400)
        .json({ message: "Members should not have teamlist and boxID" });
    }

    if (!userSupervisor || userSupervisor == "") {
      return res.status(400).json({ message: "Member must need supervisor" });
    }

    let existingUser = await User.findOne({ userEmail: userEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exist or change email" });
    }
    let existingUsername = await User.findOne({ userName: userName });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already Exist" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const newMember = new User({
      userName,
      userPassword: hashedPassword,
      userEmail,
      userRole,
      roleSpecialization,
      userSupervisor,
      teamList: [],
      boxID,
    });
    const createdMember = await newMember.save();
    const updatedTeamLead = await User.findByIdAndUpdate(
      userSupervisor,
      { $push: { teamList: createdMember._id } },
      { new: true }
    );
    const teamMembers = await BoxShell.findOneAndUpdate(
      { boxOwner: userSupervisor },
      { $push: { teamMembers: createdMember._id } },
      { new: true }
    );
    console.log(teamMembers)
    res.status(201).json({ message: "Member Created Successfully" });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Internal Server error in Creating Member",
    });
  }
};

export const createTeamlead = async (req, res) => {
  try {
    const {
      userName,
      userEmail,
      userPassword,
      userRole,
      roleSpecialization,
      userSupervisor,
      teamList,
      boxID,
    } = req.body;

    // Validation
    let existingUsername = await User.findOne({ userName: userName });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already Exist" });
    }

    if (userRole !== "Team Lead") {
      return res
        .status(400)
        .json({ message: "Invalid User role for creating a Team Lead" });
    }

    let existingUser = await User.findOne({ userEmail: userEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User Exists already or change email" });
    }
    // hashing password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const newLead = new User({
      userName,
      userEmail,
      userPassword: hashedPassword,
      roleSpecialization,
      userRole,
      userSupervisor,
      teamList,
      boxID,
    });

    const createdTeamLead = await newLead.save();
    const updatedManager = await User.findByIdAndUpdate(
      userSupervisor,
      { $push: { teamList: createdTeamLead._id } },
      { new: true }
    );
    // console.log(updatedManager)

    res.status(201).json({ message: "Lead Created Successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server error in creating Team Lead",
      error: error.message,
    });
  }
};

export const createManager = async (req, res) => {
  try {
    const {
      userName,
      userEmail,
      userRole,
      roleSpecialization,
      userPassword,
      teamList,
    } = req.body;

    // Validation
    let existingUsername = await User.findOne({ userName: userName });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already Exist" });
    }

    if (userRole != "Manager") {
      return res
        .status(400)
        .json({ message: "Invalid user role for creating manager" });
    }

    let existingUser = await User.findOne({ userEmail: userEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already Exist or change email" });
    }

    // Hasing Password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const newManager = new User({
      userName,
      userEmail,
      userPassword: hashedPassword,
      userRole,
      roleSpecialization,
      teamList,
    });

    await newManager.save();
    res.status(201).json({ message: "Manager Created Sucessfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error in creating manager",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Validation

    // User validation
    const userCheck = await User.findOne({ userName: userName });
    // console.log("user",userCheck)
    if (!userCheck) {
      return res.status(404).json({ message: "Invalid Credentials" });
    }

    // Password match
    const comparePassword = await bcrypt.compare(
      password,
      userCheck.userPassword
    );

    if (!comparePassword) {
      return res.status(404).json({ message: "Invalid Credentials" });
    }

    // Generate Token using JWT

    const payload = {
      userName: userName,
      role: userCheck.userRole,
      id: userCheck._id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
    if (!token) {
      return res.status(400).json({ message: "Error in generating token" });
    }
    let boxIdentification = "";
    if (userCheck.userRole === "Team Lead") {
      const box = await BoxShell.findOne({ boxOwner: userCheck._id });

      boxIdentification = box._id;
    } else if (userCheck.userRole === "Member") {
      const box = await BoxShell.findOne({
        boxOwner: userCheck.userSupervisor,
      });
      boxIdentification = box._id;
    }
    console.log("working");

    console.log("boxId", boxIdentification);
    console.log("role", userCheck.userRole);
    console.log("token", token);
    res
      .status(200)
      .json({
        message: "Login Successfull",
        token,
        boxID: boxIdentification,
        role: userCheck.userRole,
      });
  } catch (error) {
    res.status(500).json({ message: "Internal server error in login" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { userName } = req.body;
    // console.log(userName)
    // Validation
    const userCheck = await User.findOne({ userName: userName });
    // console.log(userCheck)
    if (!userCheck) {
      return res.status(404).json({ message: "User not found" });
    }
    const randomString = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();
    const updateRandomString = await User.findOneAndUpdate(
      { userName: userName },
      { $set: { randomString: randomString } },
      { new: true }
    );
    // console.log(updateRandomString)
    const mailoptions = {
      from: "vatsan.designs@gmail.com",
      to: updateRandomString.userEmail,
      subject: "Password reset Link",
      html: `<a href="http://localhost:5173..../${randomString}"> Click Here to reset your Password</a>`,
    };
    transporter.sendMail(mailoptions);
    res.status(200).json({ message: "Email sent to the emailID" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error to reset Password" });
  }

  // write a reset password route after front end
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const teamListPromises = user.teamList.map(async (ele) => {
      return await User.findById(ele);
    });
    const teamList = await Promise.all(teamListPromises);
    res.status(200).json({ message: "User found", teamList: teamList });
  } catch (error) {
    res.status(500).json({ message: "Internal server error in getting user" });
  }
};
