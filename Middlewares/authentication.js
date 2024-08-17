import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const authMiddleware = (role) => (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  // console.log(token);
  // console.log("role",role)
  if (!token) {
    return res.status(400).json({ message: "No token found" });
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log(decodedData);
    req.user = decodedData;
    if (role.includes(decodedData.role)) {
      // console.log("next")
      next();
    } else {
      return res.status(400).json({ message: "Invalid permission" });
    }
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(400).json({ message: "Token is invalid or expired" });
  }
};

export default authMiddleware;
