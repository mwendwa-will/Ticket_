import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface WishlistContextType {
  wishlist: Event[];
  addToWishlist: (event: Event) => void;
  removeFromWishlist: (eventId: number) => void;
  isInWishlist: (eventId: number) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<Event[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Failed to load wishlist from localStorage:', error);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (error) {
      console.error('Failed to save wishlist to localStorage:', error);
    }
  }, [wishlist]);

  const addToWishlist = (event: Event) => {
    if (!isInWishlist(event.id)) {
      setWishlist((prev) => [...prev, event]);
      toast({
        title: 'Added to Wishlist',
        description: `"${event.title}" has been added to your wishlist.`,
      });
    }
  };

  const removeFromWishlist = (eventId: number) => {
    setWishlist((prev) => {
      const newWishlist = prev.filter((event) => event.id !== eventId);
      const removedEvent = prev.find((event) => event.id === eventId);
      
      if (removedEvent) {
        toast({
          title: 'Removed from Wishlist',
          description: `"${removedEvent.title}" has been removed from your wishlist.`,
          variant: 'destructive',
        });
      }
      
      return newWishlist;
    });
  };

  const isInWishlist = (eventId: number) => {
    return wishlist.some((event) => event.id === eventId);
  };

  const clearWishlist = () => {
    setWishlist([]);
    toast({
      title: 'Wishlist Cleared',
      description: 'All events have been removed from your wishlist.',
      variant: 'destructive',
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
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}