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
    const { name, email, password, role, companyId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const allowedRoles = ["student", "company", "supervisor"];
    const assignedRole = allowedRoles.includes(role) ? role : "student";

    const userData = { 
      name, email, password, role: assignedRole,
      // Supervisors need company approval, companies need super admin approval
      isApproved: assignedRole === 'student',
    };

    // Save which company the supervisor applied to
    if (assignedRole === 'supervisor' && companyId) {
      userData.companyId = companyId;
    }

    const user = new User(userData);
    await user.save();

    const token = generateToken(user);

    const message = 
      assignedRole === "company"     ? "Company registered. Awaiting admin approval." :
      assignedRole === "supervisor"  ? "Supervisor request sent. Awaiting company approval." :
      "User registered successfully";

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

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ ALLOW admin and super_admin to login without approval
    // BLOCK unapproved companies AND supervisors (but NOT admins)
    if (!user.isApproved && user.role !== 'admin' && user.role !== 'super_admin') {
      let message = "Your account is pending approval. Please wait.";
      
      if (user.role === "company") {
        message = "Your company account is pending admin approval. Please wait.";
      } else if (user.role === "supervisor") {
        message = "Your supervisor account is pending company approval. Please wait.";
      }
      
      return res.status(403).json({ message });
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