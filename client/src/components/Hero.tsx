import { useState } from "react";
import SearchBar from "./SearchBar";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CalendarDaysIcon, MapPinIcon, MusicIcon, TicketIcon, TrendingUpIcon } from "lucide-react";
import { Link } from "wouter";

const Hero = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section className="hero">
      <div className="container mx-auto hero-content">
        <h1 className="hero-title">Discover Amazing Live Events</h1>
        <p className="hero-subtitle">
          Find the best concerts, festivals, theater performances, and more happening near you
        </p>
        
        <div className="max-w-xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <SearchBar 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search events by keyword, artist, or city"
            />
          </form>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link href="/?category=Concert">
            <div className="category-pill category-pill-concert">
              <MusicIcon className="w-4 h-4" />
              <span>Concerts</span>
            </div>
          </Link>
          <Link href="/?category=Festival">
            <div className="category-pill category-pill-festival">
              <TrendingUpIcon className="w-4 h-4" />
              <span>Festivals</span>
            </div>
          </Link>
          <Link href="/?category=Theater">
            <div className="category-pill category-pill-theater">
              <TicketIcon className="w-4 h-4" />
              <span>Theater</span>
            </div>
          </Link>
          <Link href="/?category=Comedy">
            <div className="category-pill category-pill-comedy">
              <TicketIcon className="w-4 h-4" />
              <span>Comedy</span>
            </div>
          </Link>
          <Link href="/?category=Classical">
            <div className="category-pill category-pill-classical">
              <MusicIcon className="w-4 h-4" />
              <span>Classical</span>
            </div>
          </Link>
        </div>
        
        <div className="flex justify-center gap-5 mt-10">
          <div className="flex items-center text-white/80">
            <CalendarDaysIcon className="w-5 h-5 mr-2 text-blue-300" />
            <span>Daily Updates</span>
          </div>
          <div className="flex items-center text-white/80">
            <MapPinIcon className="w-5 h-5 mr-2 text-blue-300" />
            <span>Venues Nationwide</span>
          </div>
          <div className="flex items-center text-white/80">
            <TicketIcon className="w-5 h-5 mr-2 text-blue-300" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
