
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://techyguides8:tCUYecjIdwGgP0Oo@cluster0.xnbcp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  youtubeId: { type: String, required: true }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  instructor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  videos: [videoSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const enrollmentSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course',
    required: true
  },
  progress: [Number], // Array of completed video indices
  enrolledAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Role Middleware
const checkRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: `Access denied. Must be ${role}` });
  }
  next();
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    console.log('Register request received:', { name, email, role });
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });
    
    await user.save();
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallbacksecret',
      { expiresIn: '30d' }
    );
    
    console.log('User registered successfully:', { id: user._id, name, email, role });
    
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallbacksecret',
      { expiresIn: '30d' }
    );
    
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/user', auth, async (req, res) => {
  res.json({ user: req.user });
});

// Course Routes
app.post('/api/courses', auth, checkRole('instructor'), async (req, res) => {
  try {
    const { title, description, category, videos } = req.body;
    
    const course = new Course({
      title,
      description,
      category,
      instructor: req.user._id,
      videos
    });
    
    await course.save();
    
    res.status(201).json({ 
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/courses/instructor', auth, checkRole('instructor'), async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('instructor', 'name')
      .sort({ createdAt: -1 });
    
    // Get enrollment count for each course
    const coursesWithEnrollments = await Promise.all(courses.map(async (course) => {
      const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
      return {
        ...course.toObject(),
        enrollmentCount
      };
    }));
    
    res.json({ courses: coursesWithEnrollments });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    let query = {};
    
    // Apply category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name');
      
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/courses/:id', auth, checkRole('instructor'), async (req, res) => {
  try {
    const { title, description, category, videos } = req.body;
    
    // Check if course exists and belongs to instructor
    const course = await Course.findOne({ 
      _id: req.params.id,
      instructor: req.user._id
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found or access denied' });
    }
    
    // Update course
    course.title = title;
    course.description = description;
    course.category = category;
    course.videos = videos;
    course.updatedAt = Date.now();
    
    await course.save();
    
    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/courses/:id', auth, checkRole('instructor'), async (req, res) => {
  try {
    // Check if course exists and belongs to instructor
    const course = await Course.findOne({ 
      _id: req.params.id,
      instructor: req.user._id
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found or access denied' });
    }
    
    // Delete course
    await Course.deleteOne({ _id: req.params.id });
    
    // Delete related enrollments
    await Enrollment.deleteMany({ course: req.params.id });
    
    res.json({ message: 'Course and related enrollments deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enrollment Routes
app.post('/api/enrollments', auth, checkRole('student'), async (req, res) => {
  try {
    const { courseId } = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Create enrollment
    const enrollment = new Enrollment({
      student: req.user._id,
      course: courseId,
      progress: []
    });
    
    await enrollment.save();
    
    // Populate course details for response
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' }
      })
      .populate('student', 'name');
    
    // Add calculated fields
    const enrollmentObj = populatedEnrollment.toObject();
    enrollmentObj.completedVideos = enrollmentObj.progress.length;
    enrollmentObj.totalVideos = course.videos.length;
    enrollmentObj.completionPercentage = Math.round(
      (enrollmentObj.progress.length / course.videos.length) * 100
    );
    
    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment: enrollmentObj
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/enrollments', auth, checkRole('student'), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' }
      })
      .sort({ enrolledAt: -1 });
    
    // Add calculated fields to each enrollment
    const processedEnrollments = enrollments.map(enrollment => {
      const enrollmentObj = enrollment.toObject();
      enrollmentObj.completedVideos = enrollmentObj.progress.length;
      enrollmentObj.totalVideos = enrollmentObj.course.videos.length;
      enrollmentObj.completionPercentage = Math.round(
        (enrollmentObj.progress.length / enrollmentObj.course.videos.length) * 100
      );
      return enrollmentObj;
    });
    
    res.json({ enrollments: processedEnrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/enrollments/:id/progress', auth, checkRole('student'), async (req, res) => {
  try {
    const { videoIndex } = req.body;
    
    // Check if enrollment exists and belongs to student
    const enrollment = await Enrollment.findOne({ 
      _id: req.params.id,
      student: req.user._id
    }).populate('course');
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found or access denied' });
    }
    
    // Check if video index is valid
    if (videoIndex < 0 || videoIndex >= enrollment.course.videos.length) {
      return res.status(400).json({ message: 'Invalid video index' });
    }
    
    // Add to progress if not already there
    if (!enrollment.progress.includes(videoIndex)) {
      enrollment.progress.push(videoIndex);
      await enrollment.save();
    }
    
    res.json({ 
      message: 'Progress updated successfully',
      completedVideos: enrollment.progress.length,
      totalVideos: enrollment.course.videos.length,
      completionPercentage: Math.round(
        (enrollment.progress.length / enrollment.course.videos.length) * 100
      )
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Category Routes
app.get('/api/categories', async (req, res) => {
  try {
    // Get distinct categories and count courses in each
    const categories = await Course.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export for serverless functions
module.exports = app;
