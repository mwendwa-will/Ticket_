import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Clock, Tag, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventDetailsProps {
  eventId: string;
}

const EventDetails = ({ eventId }: EventDetailsProps) => {
  const [quantity, setQuantity] = useState("1");
  const [, setLocation] = useLocation();

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });

  const handleBuyTickets = () => {
    setLocation(`/checkout/${eventId}?quantity=${quantity}`);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!event) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-xl text-gray-500">Event not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-3xl font-bold">{event.title}</CardTitle>
            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mt-2">
              {event.genre}
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${event.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500">per ticket</p>
          </div>
        </div>
      </CardHeader>
      <div className="h-72 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Event Details</h3>
            <p className="text-gray-700 mb-4">{event.description}</p>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                <span>{event.location}</span>
              </div>
              {event.genre && (
                <div className="flex items-center">
                  <Tag className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{event.genre}</span>
                </div>
              )}
              {event.capacity && (
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  <span>Capacity: {event.capacity}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Purchase Tickets</h3>
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Tickets
                  </label>
                  <Select value={quantity} onValueChange={setQuantity}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "ticket" : "tickets"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Price per ticket:</span>
                    <span>${Number(event.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Quantity:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${(Number(event.price) * parseInt(quantity)).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-100 p-4 flex flex-col space-y-2">
                <Button 
                  className="w-full buy-tickets" 
                  onClick={handleBuyTickets}
                >
                  <TicketIcon className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                </Button>
                
                <WishlistButton event={event} />
              </CardFooter>
            </Card>
            
            <div className="mt-6 text-sm text-gray-600">
              <p><strong>Note:</strong> Tickets are non-refundable and non-transferable.</p>
              <p className="mt-2">Please arrive 30 minutes before the event starts.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventDetails;
