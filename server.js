const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to database');
}).catch((error) => {
    console.log('Error connecting to database:', error);
});

// Define user schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});

// Define user model
const User = mongoose.model('User', userSchema);

// Define JWT secret key
const JWT_SECRET = 'mysecretkey';

// Define login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
  // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
  // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
  // Issue JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    res.json({ token });
    });

// Define signup route
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
  
  // Check if username already exists
    const existingUser = await User.findOne({ username });
  
    if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
    }
  
  // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
  // Create new user
  const newUser = new User({
    username,
    password: hashedPassword
  });
  // Save new user to database
    await newUser.save();
    res.json({ message: 'User created successfully' });
});

// Start server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
