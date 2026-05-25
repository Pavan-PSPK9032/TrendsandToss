export const getImageUrl = (imagePath, width) => {
  if (!imagePath || typeof imagePath !== 'string') return '';
  if (imagePath.startsWith('http')) {
    if (width && imagePath.includes('res.cloudinary.com')) {
      return imagePath.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
    }
    return imagePath;
  }
  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://trendsandtoss.onrender.com';
  return `${backendUrl}${imagePath}`;
};
