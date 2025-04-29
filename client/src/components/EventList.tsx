import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import EventCard from "./EventCard";
import { Event } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventListProps {
  searchQuery?: string;
  categoryFilter?: string;
}

const EventList = ({ searchQuery = "", categoryFilter = "" }: EventListProps) => {
  const [filter, setFilter] = useState<string>("all");
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", searchQuery, categoryFilter],
  });

  // Filter events based on search query and category
  const filteredEvents = events?.filter((event) => {
    const matchesSearch = searchQuery
      ? event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesCategory = filter === "all" ? true : filter === event.genre;
    
    return matchesSearch && matchesCategory;
  });

  // Extract unique genres for the filter
  const genres = events 
    ? [...new Set(events.map(event => event.genre).filter(Boolean))]
    : [];

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {searchQuery ? `Search Results for "${searchQuery}"` : "Featured Events"}
        </h2>
        <div className="flex items-center">
          <span className="mr-2">Filter by:</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredEvents && filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500">No events found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default EventList;
