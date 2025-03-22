import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
  });

const WishlistModal = mongoose.model('Wishlist', wishlistSchema);

export default WishlistModal;
