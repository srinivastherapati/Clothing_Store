import { Schema,model } from "mongoose";

const orderItemSchema = new Schema({
    productId: {
        type: String,
        required: true
    },
    orderId:{
        type: String,
        required: true
    },
    productName:{
        type: String,
        required: true
    },
    priceAtOrder:{
        type: Number,
        required: true
    },
    size:{
        type: String,
        required: true
    },
    quantity:{
        type: Number,
        required: true
    },
});

const OrderItemModal = model("OrderItem", orderItemSchema);
export default OrderItemModal;