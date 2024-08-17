import mongoose from "mongoose";
import User from "./UserSchema.js";
const { Types } = mongoose;
const boxSchema = new mongoose.Schema({
  boxName: {
    type: String,
    unique: true,
    required: true,
  },
  boxID: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      return `BOX-${Date.now().toString(36)}`;
    },
    immutable: true,
  },
  boxCategory: {
    type: String,
    enum: ["FE - Team", "BE - Team", "DB - Team", "Devops - Team"],
    required: true,
  },
  boxOwner: {
    type: String,
    ref: User,
    required: true,
    validate: {
      validator: async function (ID) {
        const user = await User.findById(ID);
        return (
          user &&
          user.userRole === "Team Lead" &&
          !(await this.constructor.exists({ boxOwner: ID }))
        );
      },
      message: "ID should be of a Team Lead and no box assigned already",
    },
  },
  manager: {
    type: String,
  },
  teamMembers: {
    type: [{ type: String, ref: User }],
  },
  tasks: {
    type: [{ type: String }],
  },
});

const BoxShell = mongoose.model("BoxShell", boxSchema);
export default BoxShell;
