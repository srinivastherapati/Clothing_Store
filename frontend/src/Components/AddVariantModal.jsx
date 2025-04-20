import React, { useState } from "react";
import { addProduct } from "./ServerRequests";

export default function AddVariantModal({ product, onClose }) {
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [stock, setStock] = useState("");
  const [attributes, setAttributes] = useState({});
  const [attributeKey, setAttributeKey] = useState("");
  const [attributeValue, setAttributeValue] = useState("");
  const productName = product.name;

  const handleAddAttribute = () => {
    if (attributeKey && attributeValue) {
      setAttributes((prev) => ({ ...prev, [attributeKey]: attributeValue }));
      setAttributeKey("");
      setAttributeValue("");
    }
  };

  const handleAddVariant = async () => {
    if (!size || !color || !price || !stock || !type) {
      alert("Please fill in all fields!");
      return;
    }

    const newVariant = {
      name: product.name,
      description: product.description,
      productId: product.id,
      imageUrl: product.imageUrl,
      category: product.category,
      productVariants: [
        {
          size,
          color,
          productName,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          type ,
          attributes,
        },
      ],
    };
    console.log(newVariant);

    try {
      const response = await addProduct(newVariant);
      if (response) {
        alert("Added Product Successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Variant for {product.name}</h2>
        <label>
          Size:
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="">Select Size</option>
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
              <option 
                key={sz} 
                value={sz} 
                disabled={product.productVariants.some((variant) => variant.size === sz)}>
                {sz}
              </option>
            ))}
          </select>
        </label>
        <label>
          Color:
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Enter Color"
          />
        </label>
        <label>
          Price:
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
          />
        </label>
        <label>
          Stock:
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Enter stock quantity"
          />
        </label>
        Type:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Select Type</option>
            {['Shirt', 'T-shirt', 'Track', 'Pant', 'Hoodie', 'Jacket'].map((tp) => (
              <option 
                key={tp} 
                value={tp.toLocaleUpperCase()} 
                disabled={product.productVariants.some((variant) => variant.type === tp)}>
                {tp}
              </option>
            ))}
          </select>
        <label>
          Attribute Key:
          <input
            type="text"
            value={attributeKey}
            onChange={(e) => setAttributeKey(e.target.value)}
            placeholder="Enter attribute name"
          />
        </label>
        <label>
          Attribute Value:
          <input
            type="text"
            value={attributeValue}
            onChange={(e) => setAttributeValue(e.target.value)}
            placeholder="Enter attribute value"
          />
        </label>
        <button onClick={handleAddAttribute}>Add Attribute</button>
        <div className="modal-actions">
          <button onClick={handleAddVariant}>Add Variant</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
