import { createContext, useContext, useEffect } from "react";
import Modal from "./UI/Modal";
import CartContext from "./Store/CartContext";
import Buttons from "./UI/Buttons";
import UserProgressContext from "./Store/UserProgressContext";
import CartItem from "./CartItem";

export default function Cart() {
  const crtCntxt = useContext(CartContext);
  const userProgressctxt = useContext(UserProgressContext);

  const cartTotal = crtCntxt.items.reduce((totalPrice, item) => {
    return totalPrice + item.quantity * item.price;
  }, 0);

  function handleHideCart() {
    userProgressctxt.hideCart();
  }

  function handleGoToCart() {
    userProgressctxt.showCheckout();
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userDetails"));
    if (user && user.userId && crtCntxt.items.length === 0) {
      fetch(`http://localhost:3001/cart/${user.userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.cartItems && Array.isArray(data.cartItems)) {
            data.cartItems.forEach((item) => {
              crtCntxt.addItems({
                id: item.productId._id,
                name: item.productId.name,
                imageUrl: item.productId.imageUrl,
                description: item.productId.description,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                price: item.price
              });
            });
          }
        })
        .catch((err) => console.error("Error fetching cart:", err));
    }
  }, []);

  return (
    <Modal className="cart" open={userProgressctxt.progress === "cart"}>
      <h2>Your Cart</h2>
      <ul>
        {crtCntxt.items.map((item) => (
          <CartItem
            key={`${item.id}-${item.size}-${item.color}`}
            name={item.name}
            quantity={item.quantity}
            price={item.price}
            size={item.size}
            dimension={item.color}
            onDecrease={() => crtCntxt.removeItem(item.id, item.size, item.color)}
            onIncrease={() => crtCntxt.addItems(item)}
          />
        ))}
      </ul>
      <p className="cart-total">${Math.round(cartTotal * 100) / 100}</p>
      <p className="modal-actions">
        <Buttons textOnly onClick={handleHideCart}>
          Close
        </Buttons>
        {crtCntxt.items.length > 0 && (
          <Buttons onClick={handleGoToCart}>Go to Checkout</Buttons>
        )}
      </p>
    </Modal>
  );
}
