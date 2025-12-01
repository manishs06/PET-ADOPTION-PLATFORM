// Default pet images by category
// Using high-quality Unsplash images for each pet type
const dogImage = 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
const catImage = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
const birdImage = 'https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
const rabbitImage = 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
const hamsterImage = 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
const fishImage = 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
const otherImage = 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

export const petImagesByCategory = {
  dogs: [
    'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  ],
  cats: [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  ],
  birds: [
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1497206365907-f5e630693df0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  ],
  rabbits: [
    'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516912481808-3406841bd33c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1598135753163-6167c1e1d65c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  ],
  hamsters: [
    'https://images.unsplash.com/photo-1591946614720-90a587da4a36?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511047103917-3f7b8f9e0b5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  ],
  fish: [
    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  ],
  other: [
    'https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  ]
};

export const getRandomPetImage = (category) => {
  const categoryLower = category?.toLowerCase();
  const images = petImagesByCategory[categoryLower];
  
  if (images && images.length > 0) {
    return images[Math.floor(Math.random() * images.length)];
  }
  
  // Fallback to any random pet image
  const allImages = Object.values(petImagesByCategory).flat();
  return allImages[Math.floor(Math.random() * allImages.length)] || dogImage;
};

export const getDefaultPetImage = (category) => {
  const categoryLower = category?.toLowerCase();
  
  switch (categoryLower) {
    case 'dogs':
    case 'dog':
      return dogImage;
    case 'cats':
    case 'cat':
      return catImage;
    case 'birds':
    case 'bird':
      return birdImage;
    case 'rabbits':
    case 'rabbit':
      return rabbitImage;
    case 'hamsters':
    case 'hamster':
      return hamsterImage;
    case 'fish':
      return fishImage;
    case 'other':
      return otherImage;
    default:
      return dogImage; // Default fallback
  }
};
