import { Schema,model } from "mongoose";
const customerSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    isAdmin:{
        type: Boolean,
        default:false
    },
    cartItems: [
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product", 
      required: true
    },
    size: String,
    color: String,
    quantity: {
      type: Number,
      default: 1
    },
    price: Number
  }
]


});

const CustomerModal=model("Customer",customerSchema);
export default CustomerModal;