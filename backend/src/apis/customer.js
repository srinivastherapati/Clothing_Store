
import express from 'express';
import Customer from '../modal/CustomerModal.js';
import Orders from '../modal/Orders.js';

const customerRouter=express.Router();

customerRouter.get('/customer/get', async (req, res) => {

    try {

         const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
        
                // Fetch total customer count for pagination
                const totalCustomers = await Customer.countDocuments();
        const customers = await Customer.find({ firstName: { $ne: 'admin' } });

        if (!customers.length) {
            return res.status(404).json([]);
        }

        const customerDetails = await Promise.all(customers.map(async (customer) => {
            const customerOrders = await Orders.find({ customerId: customer._id });

            const totalOrderValue = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            const lastOrderDate = customerOrders.length ? customerOrders.sort((a, b) => b.orderDate - a.orderDate)[0].orderDate : null;

            return {
                customerName: customer.firstName,
                customerEmail: customer.email,
                numberOfOrders: customerOrders.length,
                customerTotalOrderValue: totalOrderValue,
                lastOrderDate
            };
        }));

        return res.status(200).json({
            currentPage: page,
            totalCustomers,
            totalPages: Math.ceil(totalCustomers / limit),
            customers: customerDetails
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Add to Cart
customerRouter.post("/cart/add-to-cart", async (req, res) => {
  try {
    const { userId, productId, size, color, quantity, price } = req.body;

    const user = await Customer.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if item with same variant already exists
    const existingItem = user.cartItems.find(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cartItems.push({ productId, size, color, quantity, price });
    }

    await user.save();
    res.status(200).json({ message: "Added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
customerRouter.get("/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Customer.findById(userId).populate("cartItems.productId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ cartItems: user.cartItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




export default customerRouter;

