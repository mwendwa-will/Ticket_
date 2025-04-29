import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import EventCard from "./EventCard";
import { Event } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { FilterIcon, GridIcon, ListIcon, SlidersHorizontalIcon, BookmarkIcon, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventListProps {
  searchQuery?: string;
  categoryFilter?: string;
}

const EventList = ({ searchQuery = "", categoryFilter = "" }: EventListProps) => {
  const [filter, setFilter] = useState<string>(categoryFilter || "all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "price-asc" | "price-desc">("date");
  const [, setLocation] = useLocation();
  
  // Update filter when categoryFilter prop changes
  useEffect(() => {
    if (categoryFilter) {
      setFilter(categoryFilter);
    }
  }, [categoryFilter]);
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", searchQuery, categoryFilter],
  });

  // Filter events based on search query and category
  const filteredEvents = events?.filter((event) => {
    const matchesSearch = searchQuery
      ? event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    
    const matchesCategory = filter === "all" ? true : filter === event.genre;
    
    return matchesSearch && matchesCategory;
  });

  // Sort events based on the selected option
  const sortedEvents = filteredEvents ? [...filteredEvents].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "price-asc") {
      return Number(a.price) - Number(b.price);
    } else {
      return Number(b.price) - Number(a.price);
    }
  }) : [];

  // Extract unique genres for the filter
  const genres: string[] = events 
    ? Array.from(new Set(events.map(event => event.genre).filter(Boolean) as string[]))
    : [];

  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    if (newFilter !== "all") {
      setLocation(`/?category=${encodeURIComponent(newFilter)}`);
    } else {
      setLocation("/");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex flex-col space-y-3">
            <Skeleton className="h-48 w-full rounded-md" />
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent inline-block mb-2">
          {searchQuery ? `Search Results for "${searchQuery}"` : filter !== "all" ? `${filter} Events` : "Featured Events"}
        </h2>
        {filteredEvents && (
          <p className="text-gray-500">Showing {filteredEvents.length} events</p>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="category-pills">
          <div 
            className={`category-pill category-pill-all ${filter === "all" ? "active" : ""}`}
            onClick={() => handleFilterChange("all")}
          >
            <FilterIcon className="w-4 h-4" />
            <span>All Events</span>
          </div>
          
          {genres.map((genre) => {
            let pillClass = "category-pill-";
            
            switch(genre?.toLowerCase()) {
              case "concert": pillClass += "concert"; break;
              case "festival": pillClass += "festival"; break;
              case "theater": pillClass += "theater"; break;
              case "comedy": pillClass += "comedy"; break;
              case "classical": pillClass += "classical"; break;
              default: pillClass += "all";
            }
            
            return (
              <div 
                key={genre} 
                className={`category-pill ${pillClass} ${filter === genre ? "active" : ""}`}
                onClick={() => handleFilterChange(genre)}
              >
                <span>{genre}</span>
              </div>
            );
          })}
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center bg-gray-100 rounded-md p-1">
            <Button 
              size="sm" 
              variant={viewMode === "grid" ? "default" : "ghost"}
              className={viewMode === "grid" ? "" : "text-gray-500"}
              onClick={() => setViewMode("grid")}
            >
              <GridIcon className="w-4 h-4 mr-1" />
              Grid
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === "list" ? "default" : "ghost"}
              className={viewMode === "list" ? "" : "text-gray-500"}
              onClick={() => setViewMode("list")}
            >
              <ListIcon className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SlidersHorizontalIcon className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedEvents && sortedEvents.length > 0 ? (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "flex flex-col gap-4"
        }>
          {sortedEvents.map((event) => (
            <div key={event.id} className={viewMode === "list" ? "w-full" : ""}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <div className="text-center max-w-md mx-auto">
            <BookmarkIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">We couldn't find any events matching your criteria. Try adjusting your filters or search term.</p>
            <Button onClick={() => {
              setFilter("all");
              setLocation("/");
            }}>
              View All Events
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
