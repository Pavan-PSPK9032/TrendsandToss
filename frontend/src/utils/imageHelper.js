export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return 'https://via.placeholder.com/300?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  
  // Use the backend URL from environment variable or fallback to production URL
  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://trendsandtoss.onrender.com';
  return `${backendUrl}${imagePath}`;
};