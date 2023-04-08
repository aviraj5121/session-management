const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 //connect with database 
mongoose.connect('mongodb://localhost:27017/session', {  
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:')); //


// Define user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
});


// Define user model
const User = mongoose.model('User', userSchema);

// Define JWT secret key
const JWT_SECRET = 'mysecretkey';

// Define admin user



// intial to login page 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


// Define login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  // Find user by username
  const user = await User.findOne({ username }, null, { maxTimeMS: 30000 });
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

app.get('/index.html', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Serve the new_user.html file when the URL "/new_user.html" is accessed
app.get('/new_user.html', (req, res) => {
  res.sendFile(__dirname + '/new_user.html');
});
app.post('/api/signup', async (req, res) => {
  const { name, email, username, password } = req.body;

  // Check if the email or username already exists in the database
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res.status(400).json({ message: 'Email or username already exists' });
  }

  // Hash the password using bcrypt
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create the new user
  const user = new User({
    name,
    email,
    username,
    password: hashedPassword
  });

  // Save the new user to the database
  await user.save();

  // Issue JWT token
  const token = jwt.sign({ id: user._id }, JWT_SECRET);
  res.json({ message: 'User created', token });
});
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get('/dashboard.html', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

app.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Retrieve the user information from the database
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decodedToken.id, { name: 1, email: 1, _id: 0 });
    // Render the dashboard HTML file and pass the user information as a parameter
    res.json({ name: user.name, email: user.email });
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

//Start server
app.listen(3002, () => {
  console.log('Server listening on port 3002...');
});
