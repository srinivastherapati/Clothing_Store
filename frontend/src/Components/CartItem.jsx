
export default function CartItem({name,quantity,price,onIncrease,onDecrease, size, dimension}){
    return( <li className="cart-item">
        <p>
            {name }- {quantity}  X {price}- {size} - {dimension}
        </p>
        <p className="cart-item-actions">
            <button onClick={onDecrease}>-</button>
            <span>{quantity}</span>
            <button onClick={onIncrease}>+</button>
        </p>
    </li>
    )
}