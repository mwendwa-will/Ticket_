import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MusicIcon, TicketIcon, HomeIcon, UserIcon, HeartIcon, CalendarIcon, PlusCircleIcon, LogOut } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const { wishlist } = useWishlist();
  const { user, logoutMutation } = useAuth();
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "?";
    
    if (user.fullName) {
      return user.fullName
        .split(" ")
        .map(name => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    
    return user.username.substring(0, 2).toUpperCase();
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <TicketIcon className="text-primary-foreground" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 text-transparent bg-clip-text">
              TicketMaster
            </span>
          </div>
        </Link>
        
        <ul className="flex space-x-6 items-center">
          <li>
            <Link href="/">
              <div className="flex items-center hover:text-blue-300 cursor-pointer">
                <HomeIcon className="w-4 h-4 mr-1" />
                <span>Home</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/?category=all">
              <div className="flex items-center hover:text-blue-300 cursor-pointer">
                <TicketIcon className="w-4 h-4 mr-1" />
                <span>Events</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/calendar">
              <div className="flex items-center hover:text-blue-300 cursor-pointer">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>Calendar</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/?category=Concert">
              <div className="flex items-center hover:text-blue-300 cursor-pointer">
                <MusicIcon className="w-4 h-4 mr-1" />
                <span>Concerts</span>
              </div>
            </Link>
          </li>
          
          {/* Show wishlist and create event for authenticated users */}
          {user && (
            <>
              <li>
                <Link href="/wishlist">
                  <div className="flex items-center hover:text-blue-300 cursor-pointer relative">
                    <HeartIcon className="w-4 h-4 mr-1" />
                    <span>Wishlist</span>
                    {wishlist.length > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                        {wishlist.length}
                      </Badge>
                    )}
                  </div>
                </Link>
              </li>
              
              {/* Show create event button for organizers and admins */}
              {(user.role === 'admin' || user.role === 'organizer') && (
                <li>
                  <Link href="/create-event">
                    <Button variant="secondary" size="sm">
                      <PlusCircleIcon className="w-4 h-4 mr-1" />
                      Create Event
                    </Button>
                  </Link>
                </li>
              )}
            </>
          )}
          
          {/* Authentication */}
          <li>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage} alt={user.username} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-800">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === 'admin' || user.role === 'organizer') && (
                    <DropdownMenuItem asChild>
                      <Link href="/my-events">
                        <TicketIcon className="mr-2 h-4 w-4" />
                        <span>My Events</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="text-red-600 focus:text-red-600"
                  >
                    {logoutMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent mr-2"></div>
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm" className="bg-transparent border-white hover:bg-white hover:text-indigo-800">
                  <UserIcon className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
