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

  const [step, setStep] = useState(1);
  const [isOrderPlaced, setIsOrderPlaced] = useState({ status: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [cardNumber, setCardNumber] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("");
  const [useShippingAddress, setUseShippingAddress] = useState(false);

  const [customerData, setCustomerData] = useState({});
  const [paymentData, setPaymentData] = useState({});


  const cartTotal = crtCntxt.items.reduce((total, item) => total + item.quantity * item.price, 0);

  const handleHideCheckout = () => {
    userPrgrs.hideCheckout();
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const customer = Object.fromEntries(fd.entries());
    setCustomerData(customer);
    setStep(2);
  };

  const handleCardChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 16) {
      setCardNumber(value);
      setError(null);
    } else {
      setError("Card Number must contain only up to 16 digits.");
    }
  };

  const handleFinish = () => {
    setIsOrderPlaced({ status: false, message: "" });
    userPrgrs.hideCheckout();
    crtCntxt.clearCart();
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const fd = new FormData(e.target);
    const payment = Object.fromEntries(fd.entries());
    setPaymentData(payment);

    try {
      const response = await axios.post(
        `${API_BASE_URL}orders/place/${userId}`,
        {
          order: {
            items: crtCntxt.items,
            customer: customerData,
            payment: { ...payment, cardNumber },
            deliveryType:deliveryOption
          },
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setIsOrderPlaced({ status: true, message: response.data.message });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliveryOptionChange = (e) => {
    setDeliveryOption(e.target.value);
    setUseShippingAddress(false);
  };

  const handleCheckboxChange = (e) => {
    setUseShippingAddress(e.target.checked);
  };

  if (error) {
    return <ErrorPage title="Failed to place order" message={error} />;
  }

  if (isOrderPlaced.status) {
    return (
      <Modal open={userPrgrs.progress === "checkout"}>
        <h2>Success! </h2> <span>🎇</span>
        <p>Your Order Placed Successfully</p>
        {isOrderPlaced.message && <p>{isOrderPlaced.message}</p>}
        <p className="modal-actions">
          <Buttons onClick={handleFinish}>Okay</Buttons>
        </p>
      </Modal>
    );
  }

  return (
    <Modal open={userPrgrs.progress === "checkout"}>
      {step === 1 ? (
        <form onSubmit={handleNextStep}>
          <h2>Customer Info</h2>
          <p>Total Amount: {Math.round(cartTotal * 100) / 100}</p>
          <Input id="name" type="text" label="Full Name" required />
          <Input id="email" type="email" label="Email" required />
          <Input id="street" type="text" label="Street" required />
          <div className="control-row">
            <Input id="city" type="text" label="City" required />
            <Input id="postal-code" type="text" label="Postal Code" required />
          </div>

          <p>Delivery Options</p>
          <div className="control-row">
            <label>
              <input type="radio" name="deliveryOption" value="pickup" onChange={handleDeliveryOptionChange} required />
              Pickup (10am-10pm)
            </label>
            <label>
              <input type="radio" name="deliveryOption" value="delivery" onChange={handleDeliveryOptionChange} required />
              Delivery
            </label>
          </div>

          {deliveryOption === "delivery" && (
            <>
              <p>Address Options</p>
              <label>
                <input type="checkbox" checked={useShippingAddress} onChange={handleCheckboxChange} />
                Same as Shipping Address
              </label>
              <label>
                <input type="checkbox" checked={!useShippingAddress} onChange={() => setUseShippingAddress(false)} />
                Add New Address
              </label>

              {!useShippingAddress && (
                <>
                  <Input id="new-street" type="text" label="Street" />
                  <div className="control-row">
                    <Input id="new-city" type="text" label="City" />
                    <Input id="new-state" type="text" label="State" />
                    <Input id="new-zip" type="text" label="Zip Code" />
                  </div>
                </>
              )}
            </>
          )}

          <div className="modal-actions">
            <Buttons type="button" textOnly onClick={handleHideCheckout}>Cancel</Buttons>
            <Buttons type="submit">Next</Buttons>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmitPayment}>
          <h2>Payment Details</h2>
          <Input
            id="cardNumber"
            type="text"
            value={cardNumber}
            onChange={handleCardChange}
            placeholder="Enter your card number"
            required
          />
          <Input id="nameOnCard" type="text" label="Name On Card" required />
          <Input id="CVV" type="text" label="CVV" maxLength={3} required />
          <Input
            id="expiry"
            type="text"
            label="Expiry"
            placeholder="MM/YYYY"
            pattern="(0[1-9]|1[0-2])\/\d{4}"
            title="Enter expiry date in MM/YYYY format"
            required
          />
          <div className="modal-actions">
            <Buttons type="button" textOnly onClick={() => setStep(1)}>Back</Buttons>
            {isLoading ? <span>Placing your order...</span> : <Buttons type="submit">Place Order</Buttons>}
          </div>
        </form>
      )}
    </Modal>
  );
}
