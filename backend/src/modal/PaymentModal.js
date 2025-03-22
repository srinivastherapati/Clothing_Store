import { Schema,model } from "mongoose";

const paymentSchema = new Schema({
    orderId: {
        type: String,
        required: true
    },
    paymentDate: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
});
const PaymentModal = model("Payment", paymentSchema);
export default PaymentModal;