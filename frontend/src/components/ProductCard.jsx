import { Link } from 'react-router-dom';
import { useState } from 'react';
import { getImageUrl } from '../utils/imageHelper';

export default function ProductCard({ product }) {
  const [currentImg, setCurrentImg] = useState(0);

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-xl transition relative group">
      <div className="relative h-48 mb-2 overflow-hidden">
        {product.images.map((img, i) => (
          <img key={i} src={getImageUrl(img)} className={`absolute inset-0 w-full h-full object-contain transition-opacity ${i === currentImg ? 'opacity-100' : 'opacity-0 group-hover:opacity-0'}`} />
        ))}
        {/* Hover dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
          {product.images.map((_, i) => (
            <button key={i} onClick={() => setCurrentImg(i)} className={`w-2 h-2 rounded-full ${i === currentImg ? 'bg-white' : 'bg-gray-400'}`} />
          ))}
        </div>
      </div>
      <h3 className="font-semibold truncate">{product.name}</h3>
      <p className="text-lg font-bold text-gray-700">${product.price}</p>
      <div className="mt-3 flex gap-2">
        <Link to={`/product/${product._id}`} className="flex-1 bg-gray-800 text-white py-2 rounded text-center text-sm hover:bg-gray-700">Details</Link>
        <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">Add to Cart</button>
      </div>
    </div>
  );
}