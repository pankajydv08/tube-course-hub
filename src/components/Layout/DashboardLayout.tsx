
import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  BookUser,
  Plus,
  Search,
  List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { stringToColor } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, isInstructor } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const userInitials = user.name
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  
  const avatarBgColor = stringToColor(user.name);

  const navItems = isInstructor
    ? [
        {
          label: "Dashboard",
          icon: <Home size={20} />,
          href: "/instructor/dashboard",
        },
        {
          label: "My Courses",
          icon: <BookOpen size={20} />,
          href: "/instructor/courses",
        },
        {
          label: "Create Course",
          icon: <Plus size={20} />,
          href: "/instructor/courses/create",
        }
      ]
    : [
        {
          label: "Dashboard",
          icon: <Home size={20} />,
          href: "/student/dashboard",
        },
        {
          label: "Browse Courses",
          icon: <Search size={20} />,
          href: "/student/browse",
        },
        {
          label: "My Learning",
          icon: <BookUser size={20} />,
          href: "/student/enrollments",
        }
      ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile header */}
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center md:hidden">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2"
          >
            <Menu size={24} />
          </Button>
          <Link to="/" className="font-bold text-xl text-purple-700">
            LearnTube
          </Link>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback style={{ backgroundColor: avatarBgColor }}>
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </header>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 transform md:relative md:translate-x-0 z-20 w-64 bg-white shadow-lg transition-transform duration-200 ease-in-out md:block`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/" className="font-bold text-xl text-purple-700">
              LearnTube
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <X size={20} />
            </Button>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback style={{ backgroundColor: avatarBgColor }}>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-sm text-gray-500">
                  {isInstructor ? "Instructor" : "Student"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-grow p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`flex items-center py-2 px-4 rounded-md transition-colors ${
                        isActive
                          ? "bg-purple-100 text-purple-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t mt-auto">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-start text-gray-700 hover:bg-gray-100"
              onClick={logout}
            >
              <LogOut size={20} className="mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <main className="flex-grow p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
