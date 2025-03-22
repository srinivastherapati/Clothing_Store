import express from 'express';
import Product from '../modal/ProductModal.js';
import ProductVariant from '../modal/ProductVarientModal.js';

const productRouter = express.Router();

productRouter.post('/product/add', async (req, res) => {
    try {
        console.log("Entered add product");
        const { name, description, imageUrl, category, productVariants } = req.body;

        if (!name) return res.status(400).json({ message: "Product name can't be null" });
        if (!description) return res.status(400).json({ message: "Product description can't be null" });
        if (!imageUrl) return res.status(400).json({ message: "Product image required" });

        let product = await Product.findOne({ name });
        if (product) {
            const savedVariants = productVariants ? await ProductVariant.insertMany(productVariants) : [];
            product.productVariants = [...product.productVariants, ...savedVariants.map(v => v._id)];
            await product.save();
            return res.json({ message: "Added new variants" });
        }

        // Save new variants first
        const savedVariants = productVariants ? await ProductVariant.insertMany(productVariants) : [];

        // Create and save new product with variant references
      
        product = new Product({ 
            name, 
            description, 
            imageUrl, 
            category:category.toUpperCase(),
            rating: 0, 
            productVariants: savedVariants.map(v => v._id) 
        });
        await product.save();

        res.status(201).json({ message: "Product added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

productRouter.get('/product/get', async (req, res) => {
  const { search, sort, category, type, page = 1, limit = 10 } = req.query;

  try {
    let filter = {};

    // Search by product name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Step 1: Get product names matching the type from variants
    let productNamesWithType = [];
    if (type) {
      const variantsWithType = await ProductVariant.find({ type });
      productNamesWithType = variantsWithType.map(v => v.productName);
    }

    // Step 2: Apply type filter to products
    if (type) {
      filter.$or = filter.$or || [];
      filter.$or.push({ type }); // Directly filter products with type
      if (productNamesWithType.length > 0) {
        filter.$or.push({ name: { $in: productNamesWithType } });
      }
    }

    let query = Product.find(filter);

    // Apply sorting
    if (sort === "A-Z") query = query.sort({ name: 1 });
    if (sort === "Z-A") query = query.sort({ name: -1 });
    if (sort === "price: low to high") query = query.sort({ price: 1 });
    if (sort === "price: high to low") query = query.sort({ price: -1 });

    // Get total count before pagination
    const totalProducts = await Product.countDocuments(filter);

    // Apply pagination
    const productsList = await query.skip((page - 1) * limit).limit(parseInt(limit));

    // Fetch variants for each product
    const updatedProducts = await Promise.all(
      productsList.map(async (p) => {
        const variants = await ProductVariant.find({ productName: p.name });
        return { ...p.toObject(), productVariants: variants };
      })
    );

    return res.status(200).json({
      products: updatedProducts,
      hasMore: page * limit < totalProducts // Check if more products are available
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});




export default productRouter;