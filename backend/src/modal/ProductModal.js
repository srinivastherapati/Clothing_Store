import { Schema,model } from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    brand:{
        type: String
    },

    rating:{
        type:Number
    },
    productVariants: [{
         type: Schema.Types.ObjectId, ref: 'ProductVariant'
         }],

});

const ProductModal = model("Product", productSchema);
export default ProductModal;