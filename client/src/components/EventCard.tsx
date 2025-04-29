import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Event } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { CalendarDaysIcon, MapPinIcon, StarIcon, TicketIcon, HeartIcon } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(event.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(event.id);
    } else {
      addToWishlist(event);
    }
  };

  return (
    <Card className="event-card h-full flex flex-col">
      <CardHeader className="p-0 overflow-hidden relative">
        {event.isFeatured && (
          <div className="featured-badge">
            <StarIcon className="w-3 h-3" />
            <span>Featured</span>
          </div>
        )}
        <div 
          className="absolute top-2 right-2 z-10"
          onClick={handleWishlistToggle}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant={isWishlisted ? "default" : "outline"} 
                  className={`h-8 w-8 rounded-full ${isWishlisted ? 'bg-red-500 border-red-500 text-white hover:bg-red-600' : 'bg-white bg-opacity-80 hover:bg-opacity-100'}`}
                >
                  <HeartIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="h-48 overflow-hidden">
          <Link href={`/event/${event.id}`}>
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="mb-3">
          {event.genre && (
            <span className="badge-genre">
              {event.genre}
            </span>
          )}
        </div>
        <Link href={`/event/${event.id}`}>
          <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-blue-600">{event.title}</h3>
        </Link>
        <div className="flex items-center mb-2 text-gray-600">
          <CalendarDaysIcon className="w-4 h-4 mr-2 calendar-icon" />
          <span>{formatDate(event.date)} • {event.time}</span>
        </div>
        <div className="flex items-center mb-3 text-gray-600">
          <MapPinIcon className="w-4 h-4 mr-2 location-icon" />
          <span className="truncate">{event.location}</span>
        </div>
        <div className="text-sm text-gray-500 line-clamp-2 mb-3">
          {event.description.substring(0, 100)}...
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t">
        <div className="w-full flex justify-between items-center">
          <span className="price-tag">${Number(event.price).toFixed(2)}</span>
          <div className="flex space-x-2">
            <Link href={`/event/${event.id}`}>
              <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-400">
                Details
              </Button>
            </Link>
            <Link href={`/checkout/${event.id}`}>
              <Button size="sm" className="buy-tickets">
                <TicketIcon className="w-4 h-4 mr-1" />
                Buy
              </Button>
            </Link>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
