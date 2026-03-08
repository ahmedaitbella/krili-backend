import User from "../models/User.js";

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;

    const query = {};
    if (role) query.role = role;

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    return res.json({
      data: users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -otp -otpExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only the user themselves or an admin may update a user record
    if (req.user.id.toString() !== id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updates = req.body;

    // Remove sensitive fields from updates (including role to prevent privilege escalation)
    delete updates.password;
    delete updates.otp;
    delete updates.otpExpiry;
    delete updates.googleId;
    delete updates.role;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password -otp -otpExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User updated successfully", data: user });
  } catch (err) {
    next(err);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only the user themselves or an admin may delete a user record
    if (req.user.id.toString() !== id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get user profile (current user)
const getUserProfile = async (req, res, next) => {
  try {
    // req.user should be set by auth middleware
    const user = await User.findById(req.user.id).select(
      "-password -otp -otpExpiry",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

// Update user profile (current user)
const updateUserProfile = async (req, res, next) => {
  try {
    const updates = req.body;

    // Remove sensitive fields
    delete updates.password;
    delete updates.email;
    delete updates.otp;
    delete updates.otpExpiry;
    delete updates.googleId;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password -otp -otpExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Profile updated successfully", data: user });
  } catch (err) {
    next(err);
  }
};

// Search users
const searchUsers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const query = {
      $or: [
        { name: new RegExp(q, "i") },
        { firstName: new RegExp(q, "i") },
        { lastName: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
      ],
    };

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select("-password -otp -otpExpiry")
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    return res.json({
      data: users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  searchUsers,
};

export default {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  searchUsers,
};
