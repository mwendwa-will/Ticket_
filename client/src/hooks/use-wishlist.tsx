import { createContext, useContext, useEffect, useState } from "react";
import { Event } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  wishlist: Event[];
  addToWishlist: (event: Event) => void;
  removeFromWishlist: (eventId: number) => void;
  isInWishlist: (eventId: number) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "event-wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Event[]>([]);
  const { toast } = useToast();
  
  // Load wishlist from localStorage on initial render
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error("Error loading wishlist from localStorage:", error);
    }
  }, []);
  
  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error("Error saving wishlist to localStorage:", error);
    }
  }, [wishlist]);
  
  const addToWishlist = (event: Event) => {
    if (!isInWishlist(event.id)) {
      setWishlist(prev => [...prev, event]);
      toast({
        title: "Added to Wishlist",
        description: `${event.title} was added to your wishlist.`,
      });
    }
  };
  
  const removeFromWishlist = (eventId: number) => {
    setWishlist(prev => {
      const filtered = prev.filter(item => item.id !== eventId);
      const removedEvent = prev.find(item => item.id === eventId);
      
      if (removedEvent) {
        toast({
          title: "Removed from Wishlist",
          description: `${removedEvent.title} was removed from your wishlist.`,
        });
      }
      
      return filtered;
    });
  };
  
  const isInWishlist = (eventId: number) => {
    return wishlist.some(item => item.id === eventId);
  };
  
  const clearWishlist = () => {
    setWishlist([]);
    toast({
      title: "Wishlist Cleared",
      description: "All events have been removed from your wishlist.",
    });
  };
  
  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}