import express from 'express';
import Wishlist from '../modal/WishlistModal.js';

const wishlistRouter = express.Router();

wishlistRouter.post("/wishlist/add", async (req, res) => {
    try {
      const { userId, productId } = req.body;
      let wishlist = await Wishlist.findOne({ userId });
  
      if (!wishlist) {
        wishlist = new Wishlist({ userId, products: [] });
      }
  
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
  
      res.status(200).json({ message: "Added to wishlist!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  wishlistRouter.delete("/wishlist/remove/:userId/:productId", async (req, res) => {
    try {
      const { userId, productId } = req.params;
      let wishlist = await Wishlist.findOne({ userId });
  
      if (wishlist) {
        wishlist.products = wishlist.products.filter((id) => id !== productId);
        await wishlist.save();
        return res.status(200).json({ message: "Removed from wishlist!" });
      }
  
      res.status(404).json({ message: "Wishlist not found!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  wishlistRouter.get("/wishlist/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const wishlist = await Wishlist.findOne({ userId }).populate("products");
      
      if (!wishlist) return res.status(404).json({ message: "Wishlist is empty!" });
  
      res.status(200).json(wishlist.products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  export default wishlistRouter;
  
  