const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const allowedRoles = ["student", "company", "supervisor"];
    const assignedRole = allowedRoles.includes(role) ? role : "student";

    const user = new User({ name, email, password, role: assignedRole });
    await user.save();

    const token = generateToken(user);

    const message = assignedRole === "company"
      ? "Company registered successfully. Awaiting admin approval before you can post offers."
      : "User registered successfully";

    res.status(201).json({
      message,
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('=== LOGIN DEBUG ===');
    console.log('Email:', email);
    console.log('Password received:', password);

    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'YES' : 'NO');

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log('Hash in DB:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('bcrypt result:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role === "company" && !user.isApproved) {
      return res.status(403).json({
        message: "Your company account is pending admin approval. Please wait.",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { register, login, getMe };