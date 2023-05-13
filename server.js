const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwt_decode =require('jwt-decode')
const googleAuth = require('google-auth-library');
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
  password: { type: String, required: false },
  isAdmin: { type: Boolean, default: false }
});


// Define user model
const User = mongoose.model('User', userSchema);

// Define JWT secret key
const JWT_SECRET = 'mysecretkey';  //mysecretkey is a string that is being used as a secret key to encode and decode JSON Web Tokens (JWTs) in this particular code snippet.


// configure the Google authentication strategy


// define the Google authentication routes

// intial to login page 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/index.css', (req, res) => {
  res.sendFile(__dirname + '/index.css');
});
app.get('/user.css', (req, res) => {
  res.sendFile(__dirname + '/user.css');
});
app.get('/script.js', (req, res) => {
  res.sendFile(__dirname + '/script.js');
});
app.get('/dashboard.css', (req, res) => {
  res.sendFile(__dirname + '/dashboard.css');
});
app.get('/dashboard.html', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});
app.get('/new_user.html', (req, res) => {
  res.sendFile(__dirname + '/new_user.html');
});
// Serve the new_user.html file when the URL "/new_user.html" is accessed
app.get('/login.js', (req, res) => {
  res.sendFile(__dirname + '/login.js');
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

// define the dashboard route 
app.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    console.log('User authenticated'); // Log authentication success

    // Retrieve the user information from the database
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Token:', token); // Log the received token
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decodedToken); // Log the decoded token
    
    // Check if the user is an admin
    const user = await User.findById(decodedToken.id);
    if (user.isAdmin) {
      console.log('User is an admin'); // Log admin status
      // Fetch all user details from the database
      const allUsers = await User.find({}, { name: 1, email: 1, username: 1, _id: 0 });
      console.log('All users:', allUsers); // Log all user data

      // Send all user details as a response
      res.json(allUsers);
    } else {
      // If user is not an admin, send only the user's own details as a response
      const user = await User.findById(decodedToken.id, { name: 1, email: 1, _id: 0 });
      console.log('User:', user); // Log the user data
      res.json(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});
app.post('/api/google', async (req, res) => {
  console.log("working the api");
  const token = req.body.token;
  console.log(token);
  const decoded = jwt_decode(token);
  console.log(decoded);
  const email = decoded.email;
  const name = decoded.name;
  const username = decoded.given_name;
  console.log(email, name, username);
  let user = await User.findOne({ email });
  if (!user) {
    console.log("creating new user");
    user = new User({
      name,
      email,
      username,
    });
    await user.save();
  }
  const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET);
  res.json({ message: 'User authenticated', token: jwtToken });
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

// Start server
app.listen(3002, () => {
  console.log('Server listening on port 3002...');
});
