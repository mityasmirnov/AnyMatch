import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Film, 
  Heart, 
  Users, 
  Bookmark, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home
} from "lucide-react";
import { APP_TITLE } from "@/const";

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
    setMobileMenuOpen(false);
  };

  const navigate = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: "/swipe", label: "Swipe", icon: Heart },
    { path: "/groups", label: "Groups", icon: Users },
    { path: "/saved", label: "Saved", icon: Bookmark },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path: string) => location === path;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigate("/swipe")}
              className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
            >
              <Film className="w-6 h-6" />
              <span className="text-xl font-bold">{APP_TITLE}</span>
            </button>

            {/* Nav Items */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={`gap-2 ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}

              {/* Logout */}
              <Button
                variant="ghost"
                className="gap-2 text-white/70 hover:text-white hover:bg-white/5"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Top Bar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <button
            onClick={() => navigate("/swipe")}
            className="flex items-center gap-2 text-white"
          >
            <Film className="w-6 h-6" />
            <span className="text-lg font-bold">{APP_TITLE}</span>
          </button>

          {/* Hamburger Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-xl">
            <div className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-12 ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                );
              })}

              <div className="border-t border-white/10 my-2" />

              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 text-white/70 hover:text-white hover:bg-white/5"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                  active ? "text-white" : "text-white/50"
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16" />
      {/* Bottom spacer for mobile */}
      <div className="md:hidden h-16" />
    </>
  );
}
