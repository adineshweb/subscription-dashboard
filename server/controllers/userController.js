const User = require('../models/User');
const { updateProfileSchema } = require('../validators/zodSchemas');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (validatedData.email && validatedData.email !== user.email) {
      const emailExists = await User.findOne({ email: validatedData.email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use.' });
      }
      user.email = validatedData.email;
    }

    if (validatedData.name) {
      user.name = validatedData.name;
    }

    if (validatedData.newPassword) {
      const isMatch = await bcrypt.compare(validatedData.currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password.' });
      }
      user.password = validatedData.newPassword;
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
