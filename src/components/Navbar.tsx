
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
import { Home, Plus, User, LogOut, Menu } from "lucide-react";

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link 
            to="/" 
            className="font-bold text-xl flex items-center"
          >
            <span className="text-den">Diss</span><span>Den</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop navigation */}
        <nav className={`hidden md:flex items-center gap-4`}>
          <Link to="/" className="flex items-center gap-1 text-sm font-medium">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/create-den" 
                className="flex items-center gap-1 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Create Den</span>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 text-sm font-medium">
                    <User className="h-4 w-4" />
                    <span>{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/profile/${user?.id}`)}>
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
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
              >
                Log In
              </Button>
              <Button
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </div>
          )}
          <ModeToggle />
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-14 left-0 w-full bg-background border-b md:hidden p-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="flex items-center gap-1 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/create-den" 
                    className="flex items-center gap-1 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Den</span>
                  </Link>
                  <Link 
                    to={`/profile/${user?.id}`}
                    className="flex items-center gap-1 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-1 justify-start p-0 text-sm font-medium"
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
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/register");
                      setIsMenuOpen(false);
                    }}
                  >
                    Register
                  </Button>
                </div>
              )}
              <div className="flex justify-end">
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
