export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return 'https://via.placeholder.com/300?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:5000${imagePath}`;
};