import Review from '../models/Review.js';
import Product from '../models/Product.js';

// GET all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    
    res.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE a review
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });
    
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }
    
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      comment
    });
    
    // Update product's average rating
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews: allReviews.length
    });
    
    const populatedReview = await Review.findById(review._id).populate('user', 'name email');
    
    res.status(201).json({ review: populatedReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }
    
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();
    
    // Update product's average rating
    const allReviews = await Review.find({ product: review.product });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await Product.findByIdAndUpdate(review.product, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews: allReviews.length
    });
    
    const updatedReview = await Review.findById(review._id).populate('user', 'name email');
    
    res.json({ review: updatedReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }
    
    await review.deleteOne();
    
    // Update product's average rating
    const allReviews = await Review.find({ product: review.product });
    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Product.findByIdAndUpdate(review.product, {
        rating: Math.round(avgRating * 10) / 10,
        numReviews: allReviews.length
      });
    } else {
      await Product.findByIdAndUpdate(review.product, {
        rating: 0,
        numReviews: 0
      });
    }
    
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
