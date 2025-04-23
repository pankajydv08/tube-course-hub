import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LandingPage() {
  const { user, isStudent, isInstructor } = useAuth();
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    if (user) {
      if (isStudent) {
        navigate("/student/dashboard");
      } else if (isInstructor) {
        navigate("/instructor/dashboard");
      }
    } else {
      navigate("/register");
    }
  };

  // If user is logged in, show role-specific dashboard
  if (user) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {isInstructor 
                ? "Manage your courses and help students learn"
                : "Continue your learning journey with curated courses"}
            </p>
            <div className="flex gap-4 justify-center">
              {isInstructor ? (
                <>
                  <Button size="lg" onClick={() => navigate("/instructor/courses")}>
                    View My Courses
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/instructor/courses/create")}>
                    Create New Course
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate("/student/enrollments")}>
                    My Learning
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/student/browse")}>
                    Browse Courses
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="font-bold text-xl text-purple-700">
            LearnTube
          </Link>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link to="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-20">
        <div className="container mx-auto px-4 md:flex items-center">
          <div className="md:w-1/2 text-center md:text-left md:pr-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Learn from <span className="text-purple-600">curated</span> YouTube content
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              LearnTube transforms scattered YouTube videos into structured learning experiences.
              Join thousands of students or create your own curated courses.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <Button size="lg" onClick={handleGetStarted} className="bg-purple-600 hover:bg-purple-700">
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/student/browse")}>
                Browse Courses
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-100 rounded-lg -z-10"></div>
              <div className="bg-purple-200 h-72 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 h-full flex items-center justify-center text-purple-700 text-center">
                  <p className="font-bold">Structured Learning Experience</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-100 rounded-lg -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats Section */}
      <section className="py-10 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-purple-600">10,000+</p>
              <p className="text-gray-600">Active Students</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600">500+</p>
              <p className="text-gray-600">Expert Instructors</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600">1,200+</p>
              <p className="text-gray-600">Curated Courses</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600">25,000+</p>
              <p className="text-gray-600">Hours of Content</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Type Tabs Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">LearnTube is for Everyone</h2>
          
          <Tabs defaultValue="students" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="students">For Students</TabsTrigger>
              <TabsTrigger value="instructors">For Instructors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="students" className="p-6 bg-white rounded-xl shadow-sm">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Elevate Your Learning</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p><span className="font-semibold">Structured Pathways:</span> Follow expertly curated learning paths instead of random videos</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p><span className="font-semibold">Track Progress:</span> Never lose your place with built-in progress tracking</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p><span className="font-semibold">Community:</span> Connect with other learners pursuing similar goals</p>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Button onClick={() => navigate("/student/browse")}>
                      Find Courses
                    </Button>
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="aspect-video rounded-md bg-purple-100 mb-4 overflow-hidden flex items-center justify-center">
                    <div className="text-purple-600 font-semibold">Student Learning Experience</div>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-600 italic">"Thanks to LearnTube, I was able to organize my learning and finally complete a full programming course that helped me land my dream job."</p>
                    <p className="font-medium mt-2">— Alex Chen, Software Developer</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="instructors" className="p-6 bg-white rounded-xl shadow-sm">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Share Your Knowledge</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p><span className="font-semibold">Curate Don't Create:</span> Leverage existing high-quality YouTube content instead of creating videos from scratch</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p><span className="font-semibold">Grow Your Audience:</span> Reach students eager to learn from your expertise</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p><span className="font-semibold">Simple Tools:</span> User-friendly course builder to organize content meaningfully</p>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Button onClick={() => navigate("/register?role=instructor")}>
                      Become an Instructor
                    </Button>
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="aspect-video rounded-md bg-purple-100 mb-4 overflow-hidden flex items-center justify-center">
                    <div className="text-purple-600 font-semibold">Instructor Dashboard Preview</div>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-600 italic">"I've been able to help hundreds of students by curating the best YouTube content into structured courses. The platform makes it easy to organize videos in a way that truly supports learning."</p>
                    <p className="font-medium mt-2">— Dr. Sarah Johnson, Data Science Instructor</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose LearnTube?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-purple-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Curated Content</h3>
              <p className="text-gray-600">
                Expert instructors select and organize the best educational videos from YouTube into coherent learning paths.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-purple-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
              <p className="text-gray-600">
                Keep track of your learning journey with progress tracking and completion metrics for each course.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-purple-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Learning</h3>
              <p className="text-gray-600">
                Learn at your own pace, on any device, with organized video courses that fit into your schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How LearnTube Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 relative">
                <span className="text-2xl font-bold text-purple-600">1</span>
                <div className="absolute w-full h-0.5 bg-purple-200 right-0 top-1/2 -z-10 md:w-full"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find or Create</h3>
              <p className="text-gray-600">
                Browse curated courses or become an instructor and create your own learning paths
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 relative">
                <span className="text-2xl font-bold text-purple-600">2</span>
                <div className="absolute w-full h-0.5 bg-purple-200 right-0 top-1/2 -z-10 md:w-full"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Learn or Teach</h3>
              <p className="text-gray-600">
                Follow structured content as a student or guide others as an instructor
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your learning journey or see how your students are progressing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Community Says</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full mr-4 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">MT</span>
                </div>
                <div>
                  <h4 className="font-semibold">Michael T.</h4>
                  <p className="text-sm text-gray-500">Web Development Student</p>
                </div>
              </div>
              <p className="text-gray-600">
                "LearnTube helped me organize my learning journey. Instead of jumping between random tutorials, I now follow a structured path that makes sense."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full mr-4 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">LK</span>
                </div>
                <div>
                  <h4 className="font-semibold">Prof. Lisa K.</h4>
                  <p className="text-sm text-gray-500">Computer Science Instructor</p>
                </div>
              </div>
              <p className="text-gray-600">
                "As an educator, I love that I can curate the best YouTube content into organized courses for my students without having to create videos myself."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full mr-4 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">DR</span>
                </div>
                <div>
                  <h4 className="font-semibold">David R.</h4>
                  <p className="text-sm text-gray-500">Data Science Enthusiast</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The progress tracking feature is a game-changer. I can see exactly where I left off and what I need to complete next."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your learning experience?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join LearnTube today as a student to start learning or as an instructor to share your knowledge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=student">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Join as Student
              </Button>
            </Link>
            <Link to="/register?role=instructor">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-700 w-full sm:w-auto">
                Join as Instructor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="font-bold text-xl text-white">
                LearnTube
              </Link>
              <p className="text-gray-400 mt-2">
                The smarter way to learn from YouTube
              </p>
            </div>
            <div className="flex gap-8">
              <div>
                <h3 className="font-semibold mb-2">Platform</h3>
                <ul className="space-y-1 text-gray-400">
                  <li><Link to="/student/browse" className="hover:text-white">Browse Courses</Link></li>
                  <li><Link to="/register?role=instructor" className="hover:text-white">Become an Instructor</Link></li>
                  <li><Link to="#" className="hover:text-white">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Account</h3>
                <ul className="space-y-1 text-gray-400">
                  <li><Link to="/login" className="hover:text-white">Log In</Link></li>
                  <li><Link to="/register" className="hover:text-white">Sign Up</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>© {new Date().getFullYear()} LearnTube. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
