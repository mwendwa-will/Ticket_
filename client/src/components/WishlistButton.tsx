import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeartIcon } from 'lucide-react';
import { Event } from '@shared/schema';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  event: Event;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

const WishlistButton = ({ 
  event, 
  size = 'default', 
  variant = 'outline',
  className 
}: WishlistButtonProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const inWishlist = isInWishlist(event.id);
  
  const handleToggleWishlist = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    
    if (inWishlist) {
      removeFromWishlist(event.id);
    } else {
      addToWishlist(event);
    }
  };
  
  return (
    <Button
      variant={inWishlist ? 'default' : variant}
      size={size}
      onClick={handleToggleWishlist}
      className={cn(
        'group transition-all',
        inWishlist ? 'bg-pink-500 hover:bg-pink-600 text-white border-pink-500' : 'text-gray-600',
        className
      )}
    >
      <HeartIcon 
        className={cn(
          'mr-2 h-4 w-4 transition-transform',
          isAnimating && inWishlist ? 'scale-150' : '',
          isAnimating && !inWishlist ? 'scale-75' : '',
          inWishlist ? 'text-white fill-current' : 'group-hover:text-pink-500'
        )} 
      />
      {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    </Button>
  );
};

export default WishlistButton;