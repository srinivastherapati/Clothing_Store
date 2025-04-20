import { createContext, useContext } from "react";
import Modal from "./UI/Modal";
import CartContext from "./Store/CartContext";
import Buttons from "./UI/Buttons";
import UserProgressContext from "./Store/UserProgressContext";
import CartItem from "./CartItem";

export default function Cart(){
    let random=Math.random(0,1)*1000;
   const crtCntxt= useContext(CartContext);

   const cartTotal=crtCntxt.items.reduce((totalPrice,item)=>{
    return totalPrice+item.quantity * item.price
   },0)

   const userProgressctxt=useContext(UserProgressContext);

   function handleHideCart(){
    userProgressctxt.hideCart();
   }

   function handleGoToCart(){
    userProgressctxt.showCheckout();
   }

    return <Modal className="cart" open={userProgressctxt.progress==='cart'}>
        <h2>Your Cart</h2>
      <ul>
    {crtCntxt.items.map((item)=>{
        
       return (
        <CartItem key={`${item.id}-${item.size}-${item.color}`} 
        name={item.name}
         quantity={item.quantity}
          price={item.price}
          size = {item.size}
          dimension = {item.color}
       onDecrease={()=>crtCntxt.removeItem(item.id,item.size,item.color)}
       onIncrease={()=>crtCntxt.addItems(item)} />
       )
})}
        </ul>
<p className="cart-total">${Math.round(cartTotal*100)/100}</p>
<p className="modal-actions">
    <Buttons textOnly  onClick={handleHideCart} >Close</Buttons>
    {crtCntxt.items.length>0 && <Buttons onClick={handleGoToCart}>Go to Checkout</Buttons>}
</p>
    </Modal>
}