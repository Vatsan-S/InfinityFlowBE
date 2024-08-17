import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true
    },
    userEmail: {
      type: String,
      required: true,
      unique: true,
    },
    userPassword: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      enum: ["Manager", "Team Lead", "Member"],
      required: true,
    },
    roleSpecialization: {
      type: String,
      required: true,
    },
    userSupervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: async function(value) {
          if (this.userRole === "Member") {
            const supervisor = await this.constructor.findById(value);
            return supervisor && supervisor.userRole === "Team Lead";
          } else if (this.userRole === "Team Lead") {
            const supervisor = await this.constructor.findById(value);
            return supervisor && supervisor.userRole === "Manager";
          } else {
            return !value;
          }
         
        },
      },
      message: function () {
        if (this.userRole === "Member") {
          return "A member must have a Team Lead as a supervisor.";
        } else if (this.userRole === "Team Lead") {
          return "A Team Lead must have a Manager as a supervisor.";
        }
        return "Invalid supervisor assignment.";
      },
      required: function(){
        return this.userRole != "Manager"
      }
    },
    teamList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    boxID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Box",
      validate: {
        validator: (value) => {
          return this.userRole === "Team Lead";
        },
      },
    },
    randomString:{
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

// Middleware to validate the data before saving

userSchema.pre("save", function (next) {
  if (this.userRole === "Member" && (this.teamList && this.teamList.length > 0)) {
    return next(new Error("Members should not have team list"));
  }
  if (this.userRole === "Manager" && (this.userSupervisor)) {
    return next(new Error("Manager should not have supervisors"));
  }
  next();
});

// Save and export
const User = mongoose.model("User", userSchema);
export default User;
