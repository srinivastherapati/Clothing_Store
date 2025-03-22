
import express from 'express';
import Orders from '../modal/Orders.js';
import OrderItems from '../modal/OrderItems.js';
import Products from '../modal/ProductModal.js';
import ProductVariant from '../modal/ProductVarientModal.js';
import Customer from '../modal/CustomerModal.js';
import Payments from '../modal/PaymentModal.js';
import { v4 as uuidv4 } from 'uuid';




const ordersRouter = express.Router();
// 1. Place an order (from cart items)
ordersRouter.post('/orders/place/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const { order } = req.body;
        const items = order.items;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        let totalAmount = 0.0;
        let orderItemList = [];  // Store order item IDs
        let outOfStockItems = [];
        const orderId = uuidv4();

        for (let itemData of items) {
            const { name: productName, quantity: requestedQuantity, size } = itemData;
            const product = await Products.findOne({ name: productName });
            const productVariant = await ProductVariant.findOne({ productName, size });

            if (!productVariant) {
                return res.status(400).json({ message: `Product not found: ${productName}` });
            }

            const availableStock = productVariant.stock;
            if (availableStock === 0) {
                outOfStockItems.push(`${productName} (Out of Stock) for ${productVariant.size}`);
                continue;
            }

            const fulfilledQuantity = Math.min(requestedQuantity, availableStock);
            totalAmount += productVariant.price * fulfilledQuantity;

            // Update stock
            productVariant.stock -= fulfilledQuantity;
            await productVariant.save();
            // Create and save order item
            const orderItem = new OrderItems({
                orderId,
                productId: product._id,
                productName: product.name,
                quantity: fulfilledQuantity,
                size: productVariant.size,
                priceAtOrder: productVariant.price
            });
            const savedOrderItem = await orderItem.save(); 
            orderItemList.push(savedOrderItem._id);

            if (fulfilledQuantity < requestedQuantity) {
                outOfStockItems.push(`${productName} (Only ${fulfilledQuantity} fulfilled, ${requestedQuantity - fulfilledQuantity} out of stock)`);
            }
        }

        if (orderItemList.length === 0) {
            return res.status(400).json({ message: "No items could be fulfilled due to stock unavailability." });
        }

        console.log("Order Items List before saving Order:", orderItemList);  // Debugging log

        // Save the order
        const newOrder = new Orders({
            orderId,
            customerId,
            orderDate: new Date(),
            status: "PLACED",
            totalAmount,
            orderItemIds: orderItemList  // Ensure this contains data
        });

        await newOrder.save();

        // Save the payment
        const payment = new Payments({
            userId: customerId,
            orderId,
            paymentMethod: "CARD",
            paymentStatus: "COMPLETED",
            totalAmount,
            paymentDate: new Date(),
        });

        await payment.save();

        let responseMessage = `Order placed successfully with ID: ${orderId}`;
        if (outOfStockItems.length > 0) {
            responseMessage += "\nNote: Some items were partially or not fulfilled:\n" + outOfStockItems.join("\n");
        }

        return res.status(200).json({ message: responseMessage });
    } catch (error) {
        console.error("Error placing order:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

ordersRouter.get('/orders/customer/:customerId', async (req, res) => {
    const { customerId } = req.params;
    
    // Fetch all orders for the customer
    const orders = await Orders.find({ customerId });

    if (orders.length === 0) {
        return res.status(404).json([]);
    }

    // Fetch order details with associated products
    const response = await Promise.all(orders.map(async (order) => {
        const orderDetails = {
            orderId: order.orderId, 
            totalPayment: order.totalAmount,
            orderDate: order.orderDate,
            status: order.status,
            products: []
        };

        // Fetch all order items for this order
        const items = await OrderItems.find({ orderId: order.orderId });

        // Fetch all related products in one query
        const productIds = items.map(item => item.productId);
        const products = await Products.find({ _id: { $in: productIds } });

        // Create a Map for quick lookup
        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        // Populate products in orderDetails
        orderDetails.products = items.map(item => {
            const product = productMap.get(item.productId.toString());
            return product ? {
                productId: product._id,
                name: product.name,
                quantityBought: item.quantity
            } : null;
        }).filter(p => p !== null); // Remove any null values in case of missing products

        return orderDetails;
    }));

    return res.status(200).json(response);
});

ordersRouter.get('/orders/getAllOrders', async (req, res) => {
    try {
        console.log("Fetching orders...");

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch total order count for pagination
        const totalOrders = await Orders.countDocuments();

        // Fetch paginated orders
        const ordersList = await Orders.find().skip(skip).limit(limit);

        if (!ordersList.length) {
            return res.status(404).json({ error: "No orders found" });
        }

        // Extract customer and order IDs for batch fetching
        const customerIds = [...new Set(ordersList.map(order => order.customerId))];
        const orderIds = ordersList.map(order => order.orderId);

        // Fetch customers in a single query
        const customers = await Customer.find({ _id: { $in: customerIds } });
        const customerMap = new Map(customers.map(cust => [cust._id.toString(), cust]));

        // Fetch order items for all orders
        const orderItems = await OrderItems.find({ orderId: { $in: orderIds } });

        // Extract product IDs for batch fetching
        const productIds = [...new Set(orderItems.map(item => item.productId))];
        const products = await Products.find({ _id: { $in: productIds } });
        const productMap = new Map(products.map(prod => [prod._id.toString(), prod]));

        // Construct the response
        const response = ordersList.map(order => {
            const customer = customerMap.get(order.customerId.toString()) || {};
            const items = orderItems.filter(item => item.orderId.toString() === order.orderId.toString());

            return {
                orderId: order.orderId,
                totalPayment: order.totalAmount,
                orderDate: order.orderDate,
                status: order.status,
                customer: {
                    name: `${customer.firstName || "Unknown"} ${customer.lastName || ""}`.trim(),
                    email: customer.email || "Unknown"
                },
                products: items.map(item => {
                    const product = productMap.get(item.productId.toString());
                    return product ? {
                        productId: product._id,
                        name: product.name,
                        quantityBought: item.quantity,
                        size: item.size,
                        priceAtOrder: item.priceAtOrder
                    } : null;
                }).filter(p => p !== null)  // Remove null values
            };
        });

        return res.status(200).json({
            currentPage: page,
            totalOrders,
            totalPages: Math.ceil(totalOrders / limit),
            orders: response
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

ordersRouter.put('/orders/update-status/:orderId/:status', async (req, res) => {
    const { orderId, status } = req.params;

    const order = await Orders.findOne({orderId: orderId});
    if (!order || order.status === "CANCELLED") {
        return res.status(404).json("Order not found");
    }

    order.status = status;
    await order.save();

    return res.status(200).json(`Order status updated to ${status}`);
});



// Get order details
ordersRouter.get('/orders/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const order = await Orders.findById(orderId);

    if (!order) {
        return res.status(404).json("Order not found");
    }

    // Fetch items in the order
    const items = await OrderItems.find({ orderId });
    return res.status(200).json(items);
});

// Cancel order
ordersRouter.post('/orders/cancel-order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find payment for the order
        const payment = await Payments.findOne({ orderId });
        if (!payment) {
            return res.status(404).json({ error: "Payment not found for this order" });
        }

        // Refund payment
        payment.status = "REFUNDED";
        await payment.save();
        console.log(`Refund of amount ${payment.totalAmount} processed successfully`);

        // Find the order
        const order = await Orders.findOne({orderId});
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Update order status
        order.status = "CANCELLED";
        await order.save();

        // Update product quantities
        const orderItems = await OrderItems.find({ orderId });
        console.log("Order Items:", orderItems);

        for (let item of orderItems) {
            const product = await Products.findById(item.productId);
            if (!product) continue; // If product not found, skip to next

            const productVariant = await ProductVariant.findOne({
                productName: product.name,
                size: item.size
            });

            if (!productVariant) {
                console.warn(`Product variant not found for ${product.name} - Size: ${item.size}`);
                continue;
            }

            productVariant.stock += item.quantity;
            await productVariant.save();
        }

        return res.status(200).json({ message: "Order cancelled and refund processed successfully" ,status:"ok"});

    } catch (error) {
        console.error("Error cancelling order:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


// Update order status


export default ordersRouter;

