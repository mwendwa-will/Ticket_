import { useState } from "react";
import SearchBar from "./SearchBar";
import { useLocation } from "wouter";

const Hero = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section className="hero">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6">Discover Live Events Near You</h1>
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSearch}>
            <SearchBar 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search events by keyword or city"
            />
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
