# Tube Course Hub

A full-stack web application for managing and accessing online courses with YouTube video integration.

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn-ui (UI Components)
- React Router DOM
- React Query
- React Hook Form
- Zod (Form Validation)

### Backend
- Node.js
- Express.js
- MongoDB (Database)
- Mongoose (ODM)
- JWT (Authentication)
- bcryptjs (Password Hashing)
- CORS

## Database Models

### User
```typescript
{
  name: string;
  email: string;
  password: string;
  role: 'student' | 'instructor';
  createdAt: Date;
}
```

### Course
```typescript
{
  title: string;
  description: string;
  category: string;
  instructor: ObjectId (ref: User);
  videos: [{
    title: string;
    youtubeId: string;
  }];
  createdAt: Date;
  updatedAt: Date;
}
```

### Enrollment
```typescript
{
  student: ObjectId (ref: User);
  course: ObjectId (ref: Course);
  progress: number[];
  enrolledAt: Date;
}
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get current user info

### Courses
- `POST /api/courses` - Create a new course (Instructor only)
- `GET /api/courses/instructor` - Get instructor's courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (Instructor only)
- `DELETE /api/courses/:id` - Delete course (Instructor only)

### Enrollments
- `POST /api/enrollments` - Enroll in a course
- `GET /api/enrollments/student` - Get student's enrollments
- `PUT /api/enrollments/:id/progress` - Update course progress

## Working Mechanism

1. **Authentication Flow**
   - Users register/login with email and password
   - JWT token is generated and stored
   - Protected routes require valid JWT token

2. **Course Management**
   - Instructors can create courses with YouTube video links
   - Courses are categorized and searchable
   - Students can browse and enroll in courses

3. **Learning Progress**
   - Students can track their progress through course videos
   - Progress is saved per video
   - Instructors can view enrollment statistics

## Setup and Installation

1. Clone the repository:
```sh
git clone <repository-url>
cd tube-course-hub
```

2. Install dependencies:
```sh
npm install
```

3. Set up environment variables:
Create a `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/ecourse
JWT_SECRET=your_jwt_secret
```

4. Start the development server:
```sh
npm run dev:all
```

## Development

- Frontend runs on `http://localhost:8080`
- Backend runs on `http://localhost:3000`

## Features

- User authentication (Student/Instructor roles)
- Course creation and management
- YouTube video integration
- Progress tracking
- Responsive design
- Modern UI with shadcn-ui components
- Form validation with Zod
- Type safety with TypeScript

## How can I edit this code?



If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://raw.githubusercontent.com/pankajydv08/tube-course-hub/main/src/components/hub-course-tube-Hallstattian.zip)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.
