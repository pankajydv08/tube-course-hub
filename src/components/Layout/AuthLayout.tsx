
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  type: "login" | "register";
}

export function AuthLayout({ children, title, subtitle, type }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Image and branding */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">LearnTube</h1>
          <p className="text-xl mb-6">
            The platform where knowledge meets video, curated by experts for learners worldwide.
          </p>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4">Why LearnTube?</h2>
              <ul className="space-y-3 text-left">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Learn from YouTube's best educational content</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Track your progress across courses</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Curated by experts in the field</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-600 mt-2">{subtitle}</p>
          </div>

          {children}

          <div className="text-center mt-8">
            {type === "login" ? (
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-purple-600 hover:text-purple-800 font-medium">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-600 hover:text-purple-800 font-medium">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
