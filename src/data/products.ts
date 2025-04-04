

/*
import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium sound quality with active noise cancellation and 30-hour battery life.',
    price: 249.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    rating: 4.8,
    stock: 25,
    featured: true
  },
  {
    id: '2',
    name: 'Ultra HD Smart TV - 55"',
    description: 'Immersive viewing experience with 4K resolution and advanced smart features.',
    price: 799.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    rating: 4.6,
    stock: 12
  },
  {
    id: '3',
    name: 'Professional DSLR Camera',
    description: '24.1 megapixel sensor with 4K video recording and interchangeable lenses.',
    price: 1299.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    rating: 4.9,
    stock: 8,
    featured: true
  },
  {
    id: '4',
    name: 'Ergonomic Office Chair',
    description: 'Designed for comfort during long work hours with adjustable settings.',
    price: 199.99,
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1505843490701-5be69677aed8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    rating: 4.5,
    stock: 20
  },
  {
    id: '5',
    name: 'Coffee Maker with Grinder',
    description: 'Freshly ground coffee with programmable brewing and thermal carafe.',
    price: 149.99,
    category: 'Kitchen',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    rating: 4.7,
    stock: 15
  },
  {
    id: '6',
    name: 'Fitness Smartwatch',
    description: 'Track your health metrics and workouts with GPS and heart rate monitoring.',
    price: 179.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    rating: 4.6,
    stock: 30
  },
  {
    id: '7',
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof design with 360-degree sound and 20-hour playback.',
    price: 89.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    rating: 4.4,
    stock: 40
  },
  {
    id: '8',
    name: 'Designer Leather Wallet',
    description: 'Genuine leather with multiple card slots and RFID protection.',
    price: 59.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    rating: 4.5,
    stock: 35
  }
];

export const categories = [...new Set(products.map(product => product.category))];

export const getFeaturedProducts = () => products.filter(product => product.featured);

export const getProductsByCategory = (category: string) => {
  if (category === 'All') return products;
  return products.filter(product => product.category === category);
};

export const getProductById = (id: string) => products.find(product => product.id === id);

export const searchProducts = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    product => 
      product.name.toLowerCase().includes(lowercaseQuery) || 
      product.description.toLowerCase().includes(lowercaseQuery)
  );
};
*/