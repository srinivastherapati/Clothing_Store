import React from "react";
import "./VariantsDialog.css"; // Add CSS for styling

export default function VariantsDialog({ product, onClose }) {
  return (
    <div className="variants-modal">
      <div className="variants-content">
        <h2>{product.name} - Variants</h2>
        <table className="variants-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Color</th>
              <th>Type</th>
              <th>Stock</th>
              <th>Price ($)</th>
              <th>Attributes</th>
            </tr>
          </thead>
          <tbody>
            {product.productVariants.map((variant, index) => (
              <tr key={index}>
                <td>{variant.size}</td>
                <td>{variant.color}</td>
                <td>{variant.type}</td>
                <td>{variant.stock}</td>
                <td>$ {variant.price.toFixed(2)}</td>
                <td>
                  {variant.attributes ? (
                    <ul className="attributes-list">
                      {Object.entries(variant.attributes).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={onClose} className="close-modal-button">Close</button>
      </div>
    </div>
  );
}
