import { useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useWishlist } from '@/hooks/use-wishlist';
import { formatDate } from '@/lib/utils';
import { CalendarDaysIcon, MapPinIcon, HeartIcon, TrashIcon, TicketIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

  useEffect(() => {
    document.title = 'My Wishlist - TicketMaster';
  }, []);

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto my-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">My Wishlist</h1>
        <div className="max-w-md mx-auto text-center py-16 px-4">
          <HeartIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8">
            Save events you're interested in to keep track of them and get notified about updates.
          </p>
          <Link href="/">
            <Button>
              Explore Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-gray-600 border-gray-300">
              <TrashIcon className="w-4 h-4 mr-2" />
              Clear Wishlist
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Wishlist</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove all events from your wishlist? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearWishlist}>
                Yes, clear wishlist
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((event) => (
          <Card key={event.id} className="event-card h-full flex flex-col">
            <CardHeader className="p-0 overflow-hidden relative">
              <div 
                className="absolute top-0 right-0 p-2 z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFromWishlist(event.id);
                }}
              >
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="h-8 w-8 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
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
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;