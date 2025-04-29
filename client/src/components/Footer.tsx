import { Link } from "wouter";
import { 
  CalendarDaysIcon, 
  CreditCardIcon, 
  MapPinIcon, 
  MusicIcon, 
  TicketIcon,
  HeadphonesIcon, 
  ThumbsUpIcon,
  MailIcon,
  PhoneCallIcon,
  HelpCircleIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="footer pt-12 pb-8 mt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <TicketIcon className="h-6 w-6 text-blue-300 mr-2" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 text-transparent bg-clip-text">
                TicketMaster
              </h2>
            </div>
            <p className="text-gray-300 max-w-xs mb-6">
              Your one-stop destination for discovering and booking tickets to the most exciting events.
            </p>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="icon" className="bg-transparent border-gray-600 hover:bg-gray-700 text-gray-300">
                <FacebookIcon className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="bg-transparent border-gray-600 hover:bg-gray-700 text-gray-300">
                <InstagramIcon className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="bg-transparent border-gray-600 hover:bg-gray-700 text-gray-300">
                <TwitterIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-5 text-white border-b border-gray-700 pb-2">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/">
                  <div className="flex items-center text-gray-400 hover:text-blue-300 cursor-pointer">
                    <TicketIcon className="h-4 w-4 mr-2" />
                    <span>All Events</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/?category=Concert">
                  <div className="flex items-center text-gray-400 hover:text-blue-300 cursor-pointer">
                    <MusicIcon className="h-4 w-4 mr-2" />
                    <span>Concerts</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/?category=Festival">
                  <div className="flex items-center text-gray-400 hover:text-blue-300 cursor-pointer">
                    <HeadphonesIcon className="h-4 w-4 mr-2" />
                    <span>Festivals</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/?category=Theater">
                  <div className="flex items-center text-gray-400 hover:text-blue-300 cursor-pointer">
                    <ThumbsUpIcon className="h-4 w-4 mr-2" />
                    <span>Theater</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/login">
                  <div className="flex items-center text-gray-400 hover:text-blue-300 cursor-pointer">
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    <span>My Tickets</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-5 text-white border-b border-gray-700 pb-2">Help Center</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/faq">
                  <div className="flex items-center text-gray-400 hover:text-blue-300 cursor-pointer">
                    <HelpCircleIcon className="h-4 w-4 mr-2" />
                    <span>FAQ</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <div className="flex items-center text-gray-400 hover:text-blue-300 cursor-pointer">
                    <MailIcon className="h-4 w-4 mr-2" />
                    <span>Contact Us</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <div className="flex items-center text-gray-400 hover:text-blue-300 cursor-pointer">
                    <PhoneCallIcon className="h-4 w-4 mr-2" />
                    <span>Terms of Service</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <div className="flex items-center text-gray-400 hover:text-blue-300 cursor-pointer">
                    <PhoneCallIcon className="h-4 w-4 mr-2" />
                    <span>Privacy Policy</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-5 text-white border-b border-gray-700 pb-2">Subscribe</h3>
            <p className="text-gray-400 mb-4 text-sm">
              Get the latest updates on events, special offers, and more directly to your inbox.
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="Your email address" 
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button>
                Subscribe
              </Button>
            </div>
            <div className="mt-6">
              <h4 className="text-white font-medium mb-2">Contact Info</h4>
              <div className="flex items-center text-gray-400 mb-2">
                <MapPinIcon className="h-4 w-4 mr-2 text-blue-300" />
                <span className="text-sm">123 Event St, Music City</span>
              </div>
              <div className="flex items-center text-gray-400">
                <PhoneCallIcon className="h-4 w-4 mr-2 text-blue-300" />
                <span className="text-sm">(123) 456-7890</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} TicketMaster. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-blue-300">Terms</a>
            <a href="#" className="hover:text-blue-300">Privacy</a>
            <a href="#" className="hover:text-blue-300">Cookies</a>
            <a href="#" className="hover:text-blue-300">Legal</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
