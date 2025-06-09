import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { AuthContext } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, Plus, User, LogOut, Menu, MessageCircle, Sparkles } from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-800/20 shadow-lg">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-3 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">
            <span className="text-gradient">Diss</span><span className="text-gray-800 dark:text-white">Den</span>
          </span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/create-den" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Den</span>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <span>{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl">
                  <DropdownMenuItem onClick={() => navigate(`/profile/${user?.id}`)} className="rounded-lg">
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-red-600 dark:text-red-400">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Log In
              </Button>
              <Button
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Register
              </Button>
            </div>
          )}
          <ModeToggle />
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-white/20 md:hidden shadow-xl">
            <div className="flex flex-col space-y-2 p-4">
              <Link 
                to="/" 
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/create-den" 
                    className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Den</span>
                  </Link>
                  <Link 
                    to={`/profile/${user?.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-3 justify-start p-3 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                    className="justify-start rounded-xl"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/register");
                      setIsMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
                  >
                    Register
                  </Button>
                </div>
              )}
              <div className="flex justify-center pt-2">
                <ModeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
