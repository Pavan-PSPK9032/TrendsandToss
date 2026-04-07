import Cart from '../models/Cart.js';

export const getCart = async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
  if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });
  res.json(cart);
};

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });

  const existing = cart.items.find(item => item.productId.toString() === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }
  await cart.save();
  res.json(await cart.populate('items.productId'));
};

export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ userId: req.user._id });
  const item = cart.items.find(i => i.productId.toString() === productId);
  if (quantity <= 0) cart.items = cart.items.filter(i => i.productId.toString() !== productId);
  else if (item) item.quantity = quantity;
  await cart.save();
  res.json(await cart.populate('items.productId'));
};

export const clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.user._id });
  await Cart.create({ userId: req.user._id, items: [] });
  res.json({ message: 'Cart cleared' });
};