import { useReducer } from "react";
import { createContext } from "react"

const CartContext= createContext({
    items:[],
    addItems:(item)=>{},
    removeItem:(id)=>{},
    clearCart:()=>{}
})

function cartReducer(state,action){
    if(action.type==='ADD_ITEM'){
        const existingItemIndex=state.items.findIndex((item)=>item.id===action.item.id && item.size === action.item.size &&
        item.color === action.item.color);
        const updatedItems=[...state.items];
        if(existingItemIndex>-1){
            const existingItem=state.items[existingItemIndex];
            const updatedItem={
                ...existingItem,
                quantity: existingItem.quantity+1
            }
            updatedItems[existingItemIndex]=updatedItem;
        }
        else{
            updatedItems.push({...action.item,quantity:1});
        }
        return {...state, items:updatedItems}
    }


    if(action.type==='REMOVE_ITEM'){
        const existingItemIndex=state.items.findIndex((item)=>item.id===action.id && item.size === action.size &&
        item.color === action.color);
        const existingItem=state.items[existingItemIndex];
        const updatedItems=[...state.items];
        if(existingItem.quantity===1){
             updatedItems.splice(existingItemIndex,1);
        }
        else{
            const updatedItem={
                ...existingItem,
                quantity:existingItem.quantity-1
            }
            updatedItems[existingItemIndex]=updatedItem;
        }
        return {...state, items:updatedItems}
    }

    if(action.type==="CLEAR_CART"){
        return {...state,items:[]}
    }
}

export function CartContextProvider({children}){
    const [cart,dispatcherCartAction]=useReducer(cartReducer,{items:[]});

    function addItems(item){
        console.log("adding item" + item);
        dispatcherCartAction({type:'ADD_ITEM',item:item})
    }
    function removeItem(id,size,color){
        console.log("rewmoving item" + id);
        dispatcherCartAction({type:'REMOVE_ITEM',id,size,color});
    }
    function clearCart(){
        dispatcherCartAction({type:"CLEAR_CART"});
    }

    const createContext={
        items:cart.items,
        addItems,
        removeItem,
        clearCart
    }
    return <CartContext.Provider value={createContext}>{children}</CartContext.Provider>
}
export default CartContext;