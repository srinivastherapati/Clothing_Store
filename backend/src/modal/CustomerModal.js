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

});

const CustomerModal=model("Customer",customerSchema);
export default CustomerModal;