import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useWishlist } from "@/hooks/use-wishlist";
import { HeartIcon, CalendarIcon, TicketIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const WishlistPage = () => {
  const { wishlist, clearWishlist, removeFromWishlist } = useWishlist();
  
  useEffect(() => {
    document.title = "My Wishlist - TicketMaster";
  }, []);
  
  return (
    <div className="container mx-auto my-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          My Wishlist
        </h1>
        
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="sm">
              <TicketIcon className="h-4 w-4 mr-2" />
              Browse Events
            </Button>
          </Link>
          
          {wishlist.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearWishlist}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Clear Wishlist
            </Button>
          )}
        </div>
      </div>
      
      {wishlist.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <HeartIcon className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Save events you're interested in to your wishlist for easy access later.
            </p>
            <Link href="/">
              <Button>
                Browse Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(event => (
            <Card key={event.id} className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <img 
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => removeFromWishlist(event.id)}
                >
                  <HeartIcon className="h-4 w-4" fill="white" />
                </Button>
              </div>
              
              <CardContent className="p-4 flex-grow flex flex-col">
                <Badge className="w-fit mb-2">{event.genre}</Badge>
                <Link href={`/event/${event.id}`}>
                  <h3 className="text-lg font-semibold hover:text-blue-600 mb-2">{event.title}</h3>
                </Link>
                
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>{formatDate(event.date)} • {event.time}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {event.location}
                </p>
                
                <div className="mt-auto pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg">${Number(event.price).toFixed(2)}</span>
                  <Link href={`/event/${event.id}`}>
                    <Button size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;