import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema({
    size: { type: String },
    color: { type: String, },
    price: { type: Number,},
    stock: { type: Number,  },
    productName: { type: String,  },
    attributes: { type: Map, of: String },
    type: { type: String },
}, { timestamps: true });

const ProductVarientModal = mongoose.model('ProductVariant', productVariantSchema);

export default ProductVarientModal;
