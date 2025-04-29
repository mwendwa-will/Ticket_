import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, TicketIcon } from "lucide-react";
import { Event } from "@shared/schema";
import { formatDate, truncateText } from "@/lib/utils";
import WishlistButton from "./WishlistButton";

interface EventCardProps {
  event: Event;
  variant?: "default" | "compact";
}

const EventCard = ({ event, variant = "default" }: EventCardProps) => {
  const isCompact = variant === "compact";
  
  return (
    <Card className={`overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow`}>
      <div className="relative">
        <img
          src={event.imageUrl}
          alt={event.title}
          className={`w-full object-cover ${isCompact ? 'h-40' : 'h-48'}`}
        />
        <div className="absolute top-2 right-2">
          <WishlistButton event={event} size="icon" className="h-8 w-8 shadow-md" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
          <Badge className="mb-1 bg-blue-500 hover:bg-blue-600">{event.genre}</Badge>
          <h3 className={`font-bold ${isCompact ? 'text-base' : 'text-lg'}`}>
            {event.title}
          </h3>
        </div>
      </div>
      
      <CardContent className={`p-4 flex-grow flex flex-col ${isCompact ? 'space-y-1' : 'space-y-2'}`}>
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{formatDate(event.date)}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm">
          <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{event.time}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        
        {!isCompact && (
          <p className="text-gray-700 text-sm mt-2 line-clamp-2">
            {truncateText(event.description, 100)}
          </p>
        )}
        
        <div className="mt-auto pt-4 flex justify-between items-center">
          <div className="font-bold text-lg">
            ${Number(event.price).toFixed(2)}
          </div>
          
          <Link href={`/event/${event.id}`}>
            <Button size="sm">
              <TicketIcon className="w-4 h-4 mr-2" />
              View Event
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;