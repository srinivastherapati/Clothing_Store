import { useContext, useState } from "react";
import axios from "axios";
import Modal from "./UI/Modal";
import CartContext from "./Store/CartContext";
import Buttons from "./UI/Buttons";
import Input from "./UI/Input";
import UserProgressContext from "./Store/UserProgressContext";
import ErrorPage from "./ErrorPage";
import { API_BASE_URL } from "./ServerRequests";

export default function Checkout() {
  const crtCntxt = useContext(CartContext);
  const userPrgrs = useContext(UserProgressContext);
  const userId = JSON.parse(localStorage.getItem("userDetails")).userId;

  const [isOrderPlaced, setIsOrderPlaced] = useState({
    placed: false,
    message: "",
  }); // Track if the order is placed successfully.
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("");
  const [useShippingAddress, setUseShippingAddress] = useState(false);

  const cartTotal = crtCntxt.items.reduce((totalPrice, item) => {
    return totalPrice + item.quantity * item.price;
  }, 0);

  function handleHideCheckout() {
    userPrgrs.hideCheckout();
  }
  const handleChange = (e) => {
    const value = e.target.value;

    if (/^\d*$/.test(value) && value.length <= 16) {
      setCardNumber(value);
      setError("");
    } else {
      setError("Card Number must contain only up to 16 digits.");
    }
  };

  function handleFinish() {
    setIsOrderPlaced({ status: false, message: "" }); // Reset state for future use.
    userPrgrs.hideCheckout();
    crtCntxt.clearCart();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const fd = new FormData(event.target);
    const customerData = Object.fromEntries(fd.entries());

    try {
      const response = await axios.post(
        `${API_BASE_URL}orders/place/${userId}`,
        {
          order: {
            items: crtCntxt.items,
            customer: customerData,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setIsOrderPlaced({ status: true, message: response.data.message }); // Show success modal.
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  }

  let actions = (
    <>
      <Buttons type="button" textOnly onClick={handleHideCheckout}>
        Close
      </Buttons>
      <Buttons>Place Order</Buttons>
    </>
  );

  if (isLoading) {
    actions = <span>Placing your order...</span>;
  }

  if (isOrderPlaced.status) {
    return (
      <Modal open={userPrgrs.progress === "checkout"}>
        <h2>Success!</h2>
        <p>Your Order Placed Successfully</p>
        <p>We will get back to you with more details via email.</p>
        {isOrderPlaced.message.trim().length != 0 ? (
          <p>{isOrderPlaced.message}</p>
        ) : (
          <></>
        )}
        <p className="modal-actions">
          <Buttons onClick={handleFinish}>Okay</Buttons>
        </p>
      </Modal>
    );
  }
  const handleDeliveryOptionChange = (e) => {
    setDeliveryOption(e.target.value);
    setUseShippingAddress(false); // Reset checkbox selection when delivery option changes
  };

  const handleCheckboxChange = (e) => {
    setUseShippingAddress(e.target.checked);
  };

  if (error) {
    return <ErrorPage title="Failed to place order" message={error} />;
  }

  return (
    <Modal open={userPrgrs.progress === "checkout"}>
      <form onSubmit={handleSubmit}>
        <h2>Checkout</h2>
        <p>Total Amount: {Math.round(cartTotal * 100) / 100}</p>
        <Input id="name" type="text" label="Full Name" />
        <Input id="email" type="email" label="Email" />
        <Input id="street" type="text" label="Street" />
        <div className="control-row">
          <Input id="city" type="text" label="City" />
          <Input id="postal-code" type="text" label="Postal Code" />
        </div>
        <p>Delivery Options</p>
        <div className="control-row">
          <label>
            <input
              type="radio"
              name="deliveryOption"
              value="pickup"
              onChange={handleDeliveryOptionChange}
              required
            />
            Pickup (everyDay 10am-10pm)
          </label>
          <label>
            <input
              type="radio"
              name="deliveryOption"
              value="delivery"
              onChange={handleDeliveryOptionChange}
              required
            />
            Delivery
          </label>
        </div>

        {/* Conditional Address Options for Delivery */}
        {deliveryOption === "delivery" && (
          <div>
            <p>Address Options</p>
            <label>
              <input
                type="checkbox"
                checked={useShippingAddress}
                onChange={handleCheckboxChange}
              />
              Same as Shipping Address
            </label>
            <label>
              <input
                type="checkbox"
                checked={!useShippingAddress}
                onChange={() => setUseShippingAddress(false)}
              />
              Add New Address
            </label>
            {!useShippingAddress && (
              <div>
                <Input id="new-street" type="text" label="Street" />
                <div className="control-row">
                  <Input id="new-city" type="text" label="City" />
                  <Input id="new-state" type="text" label="State" />
                  <Input id="new-zip" type="text" label="Zip Code" />
                </div>
              </div>
            )}
          </div>
        )}
        <p>Card Details</p>
        <Input
          id="cardNumber"
          type="text"
          value={cardNumber}
          onChange={handleChange}
          placeholder="Enter your card number"
        />
        <Input id="Name on Card" type="text" label="Name On Card" />
        <Input id="CVV" type="text" label="CVV" maxLength={3} />
        <Input
          id="expiry"
          type="text"
          label="Expiry"
          placeholder="MM/YYYY"
          pattern="(0[1-9]|1[0-2])\/\d{4}"
          title="Enter expiry date in MM/YYYY format"
        />
        <p className="modal-actions">{actions}</p>
      </form>
    </Modal>
  );
}
