import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MusicIcon, TicketIcon, HomeIcon, UserIcon, HeartIcon, CalendarIcon } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { wishlist } = useWishlist();
  
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
          <li>
            <Link href="/login">
              <Button variant="outline" size="sm" className="bg-transparent border-white hover:bg-white hover:text-indigo-800">
                <UserIcon className="w-4 h-4 mr-1" />
                Sign In
              </Button>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
