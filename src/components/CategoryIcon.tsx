import React from 'react';
import { Apple, Beef, Carrot, Drumstick, Fish, Package } from 'lucide-react';
import type { CategoryId } from '../types/shopping';

interface CategoryIconProps {
  category: CategoryId;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  className = 'h-4 w-4',
}) => {
  switch (category) {
    case 'fruits':
      return <Apple className={className} aria-hidden="true" />;
    case 'vegetables':
      return <Carrot className={className} aria-hidden="true" />;
    case 'meats':
      return <Beef className={className} aria-hidden="true" />;
    case 'poultry':
      return <Drumstick className={className} aria-hidden="true" />;
    case 'fish':
      return <Fish className={className} aria-hidden="true" />;
    default:
      return <Package className={className} aria-hidden="true" />;
  }
};
