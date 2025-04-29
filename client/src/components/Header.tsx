import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MusicIcon, TicketIcon, HomeIcon, UserIcon } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <TicketIcon className="text-primary-foreground" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 text-transparent bg-clip-text">
              TicketMaster
            </span>
          </div>
        </Link>
        <ul className="flex space-x-6">
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
            <Link href="/?category=Concert">
              <div className="flex items-center hover:text-blue-300 cursor-pointer">
                <MusicIcon className="w-4 h-4 mr-1" />
                <span>Concerts</span>
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
