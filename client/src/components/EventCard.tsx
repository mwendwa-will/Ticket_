import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Event } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Card className="event-card h-full flex flex-col">
      <CardHeader className="p-0">
        <div className="h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
        <p className="text-gray-700 mb-2">Date: {formatDate(event.date)}</p>
        <p className="text-gray-700 mb-2">Location: {event.location}</p>
        {event.genre && (
          <div className="mb-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {event.genre}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="w-full flex justify-between items-center">
          <span className="font-bold">${event.price.toFixed(2)}</span>
          <div className="flex space-x-2">
            <Link href={`/event/${event.id}`}>
              <Button variant="outline" size="sm">
                Details
              </Button>
            </Link>
            <Link href={`/checkout/${event.id}`}>
              <Button size="sm" className="buy-tickets">
                Buy Tickets
              </Button>
            </Link>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
