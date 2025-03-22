import { Schema,model } from "mongoose";

const orderSchema = new Schema({
    orderId: {
        type: String,
        required: true
    },
    customerId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
     orderItemIds: [{
        type: Schema.Types.ObjectId, ref: 'OrderItem'}],

});
const OrderModal = model("Order", orderSchema);
export default OrderModal;