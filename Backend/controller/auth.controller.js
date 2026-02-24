import User from "../models/user.model.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export const SignupController = async (req, res) => {
  try {
    const { username, email, password} = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await argon2.hash(password);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const LoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
        
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Login failed", error });
  }
};
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      data: user,
      success: true 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};