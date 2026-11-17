const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new admin account
 * @route   POST /api/auth/register
 * @access  Restricted (Initial Setup or Invitation Code Required)
 */
const registerAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword, adminInviteCode } = req.body;

    // 1. Check required fields
    if (!fullName || !email || !password) {
      res.status(400);
      throw new Error('Please provide fullName, email, and password.');
    }

    // 2. Validate passwords match if confirmPassword was passed
    if (confirmPassword !== undefined && password !== confirmPassword) {
      res.status(400);
      throw new Error('Passwords do not match.');
    }

    // 3. Password minimum length check
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long.');
    }

    const cleanEmail = email.toString().toLowerCase().trim();

    // 4. Check for duplicate email
    const existingAdmin = await Admin.findOne({ email: cleanEmail });
    if (existingAdmin) {
      res.status(409);
      throw new Error('An administrator account with this email address already exists.');
    }

    // 5. Restrict admin registration using initial setup or invitation code
    const adminCount = await Admin.countDocuments();
    const isFirstAdmin = adminCount === 0;
    const requiredCode = process.env.ADMIN_INVITE_CODE || 'SMS-ADMIN-2026';

    if (!isFirstAdmin) {
      if (!adminInviteCode || adminInviteCode.trim() !== requiredCode) {
        res.status(403);
        throw new Error('Invalid or missing admin invitation code. Registration is restricted.');
      }
    }

    // 6. Create the admin user
    const admin = await Admin.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      password,
      role: isFirstAdmin ? 'superadmin' : 'admin',
      isInitialAdmin: isFirstAdmin,
      lastLogin: new Date()
    });

    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: isFirstAdmin
        ? 'Initial Administrator account successfully set up.'
        : 'Administrator account registered successfully.',
      data: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        isInitialAdmin: admin.isInitialAdmin,
        phone: admin.phone,
        department: admin.department,
        designation: admin.designation,
        avatar: admin.avatar,
        status: admin.status,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate admin and retrieve JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter both email and password.');
    }

    const cleanEmail = email.toString().toLowerCase().trim();

    // Find admin by email including the password hash
    const admin = await Admin.findOne({ email: cleanEmail }).select('+password');

    if (!admin || !(await admin.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    // Update lastLogin timestamp
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
        department: admin.department,
        designation: admin.designation,
        avatar: admin.avatar,
        status: admin.status,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Retrieve currently logged-in admin profile
 * @route   GET /api/auth/me
 * @access  Private (Requires valid JWT)
 */
const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user._id).select('-password');
    if (!admin) {
      res.status(404);
      throw new Error('Administrator account not found.');
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update logged-in admin's profile information
 * @route   PUT /api/auth/profile
 * @access  Private (Requires valid JWT)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, department, designation, avatar } = req.body;

    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      res.status(404);
      throw new Error('Administrator account not found.');
    }

    if (fullName !== undefined) {
      if (fullName.trim().length < 2) {
        res.status(400);
        throw new Error('Full name must be at least 2 characters long.');
      }
      admin.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      admin.phone = phone.trim();
    }

    if (department !== undefined) {
      admin.department = department.trim();
    }

    if (designation !== undefined) {
      admin.designation = designation.trim();
    }

    if (avatar !== undefined) {
      admin.avatar = avatar; // Supports data URI or empty string for removal
    }

    await admin.save();

    const updatedAdmin = await Admin.findById(req.user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile information updated successfully.',
      data: updatedAdmin
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change logged-in admin's password
 * @route   PUT /api/auth/change-password
 * @access  Private (Requires valid JWT)
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Please provide both current password and new password.');
    }

    if (confirmNewPassword !== undefined && newPassword !== confirmNewPassword) {
      res.status(400);
      throw new Error('New password and confirm password do not match.');
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters long.');
    }

    // Retrieve admin with password field to verify current password
    const admin = await Admin.findById(req.user._id).select('+password');
    if (!admin) {
      res.status(404);
      throw new Error('Administrator account not found.');
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(400);
      throw new Error('Current password is incorrect.');
    }

    // Update password (pre-save hook will hash it with bcrypt)
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out admin / invalidate client session
 * @route   POST /api/auth/logout
 * @access  Public / Private
 */
const logoutAdmin = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getMe,
  updateProfile,
  changePassword,
  logoutAdmin
};
