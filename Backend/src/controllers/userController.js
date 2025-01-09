const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Sign up user
const signup = async (req, res) => {
  const { fullName, email, phoneNumber, password, farmName, farmLocation, userType } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      fullName,
      email,
      phoneNumber,
      password,
      farmName,
      farmLocation,
      userType,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, 'jesish_secret', { expiresIn: '1h' });

    res.status(201).json({
      msg: 'User created successfully',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, 'jesish_secret', { expiresIn: '1h' });

    res.json({
      msg: 'Login successful',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { signup, login };
