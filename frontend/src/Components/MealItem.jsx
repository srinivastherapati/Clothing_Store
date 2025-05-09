import { useContext, useState, useEffect } from "react";
import Buttons from "./UI/Buttons";
import CartContext from "./Store/CartContext";
import AddVariantModal from "./AddVariantModal";
import VariantsDialog from "./VariantsDialog";
import EditIcon from "@mui/icons-material/Edit";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { deleteProduct, addToWishlist, removeFromWishlist, checkWishlist } from "./ServerRequests";
import { use } from "react";

import "../index.css";

export default function MealItem({
  product,
  isAdmin,
  onEdit,
  isLoggedIn,
  setCurrentPage,
  onAddVariant,
}) {
  const cartContxt = useContext(CartContext);
  const [selectedSize, setSelectedSize] = useState(""); 
  const [selectColor, setSelectColor] = useState(""); 
  const [showModal, setShowModal] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedVariantKey, setSelectedVariantKey] = useState("");

  console.log(localStorage.getItem("userDetails"))
  const userId=localStorage.getItem("userDetails")?.userId;

  // useEffect(() => {
  //   if (isLoggedIn) {
  //     checkWishlist(product.id,userId).then((inWishlist) => setIsInWishlist(inWishlist));
  //   }
  // }, [product.id, isLoggedIn]);

  const variantOptions = product.productVariants.map(
    (variant) => ({
      key: `${variant.size}__${variant.color}`, // internal value
      label: `${variant.size} / ${variant.color}`, // displayed label
      ...variant,
    })
  );

  function handleAddMeal() {
    const [size, color] = selectedVariantKey.split("__");
  
    const matchingVariant = product.productVariants.find(
      (variant) => variant.size === size && variant.color === color
    );
  
    if (!matchingVariant) {
      alert("Please select a valid size/color combination.");
      return;
    }
  
    cartContxt.addItems({
      ...product,
      size: matchingVariant.size,
      color: matchingVariant.color,
      price: matchingVariant.price,
    });
  
    alert("Product Added to Cart");
  }
  

  function handleWishlistToggle() {
    if (isInWishlist) {
      removeFromWishlist(product.id,userId);
      setIsInWishlist(false);
      alert("Removed from Wishlist");
    } else {
      addToWishlist(product.id,userId);
      setIsInWishlist(true);
      alert("Added to Wishlist");
    }
  }

  function handleDelete() {
    try {
      let val = confirm("Are you sure you want to delete?");
      if (!val) return;
      deleteProduct(product.id);
      alert("Deleted Product Successfully!");
      window.location.reload();
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  return (
    <>
      <li className="meal-item">
        <article>
          <img src={`${product.imageUrl}`} alt={product.name} />
          <div>
            <h3>{product.name}</h3>
            <p className="meal-item-description">{product.description}</p>

            {product.productVariants.length > 0 && (
              <button onClick={() => setShowVariants(true)} className="view-variants-button">
                View Variants
              </button>
            )}

<div className="price-and-options">
  {!isAdmin && product.productVariants.length > 0 && (
    <select
      value={selectedVariantKey}
      onChange={(e) => setSelectedVariantKey(e.target.value)}
      className="dropdown"
    >
      <option value="">Select Size / Color</option>
      {variantOptions.map((option) => (
        <option key={option.key} value={option.key}>
          {option.label}
        </option>
      ))}
    </select>
  )}
</div>
          </div>

          <p className="meal-item-actions">
            {!isAdmin && (
              <Buttons onClick={handleAddMeal}>
                {product.stock <= 0 ? "Out of Stock" : "+ Add to Cart"}
              </Buttons>
            )}
            {isAdmin && (
              <div className="admin-actions">
                <EditIcon sx={{ color: "#ffc404" }} onClick={() => onEdit(product)} />
                <button onClick={() => setShowModal(true)} className="add-variant-button">
                  Add Variant
                </button>
              </div>
            )}
            {isLoggedIn && !isAdmin && (
              <button onClick={handleWishlistToggle} className="wishlist-button">
                <FavoriteIcon sx={{ color: isInWishlist ? "red" : "gray" }} />
              </button>
            )}
          </p>
        </article>
      </li>

      {showModal && (
        <AddVariantModal product={product} onClose={() => setShowModal(false)} onAddVariant={onAddVariant} />
      )}

      {showVariants && (
        <VariantsDialog product={product} onClose={() => setShowVariants(false)} />
      )}
    </>
  );
}
