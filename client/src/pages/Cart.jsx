import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container">
        <h1>Your cart is empty</h1>
        <Link to="/" className="btn primary">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Your cart</h1>
      <div className="cart">
        {items.map((item) => (
          <div key={item.productId} className="cart-row">
            <img src={item.image} alt={item.name} />
            <div className="cart-info">
              <h3>{item.name}</h3>
              <p>${item.price.toFixed(2)}</p>
            </div>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(item.productId, parseInt(e.target.value) || 1)
              }
            />
            <p className="line-total">${(item.price * item.quantity).toFixed(2)}</p>
            <button className="link-btn" onClick={() => removeFromCart(item.productId)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h2>Total: ${total.toFixed(2)}</h2>
        <button
          className="btn primary big"
          onClick={() => {
            if (!user) navigate("/login?redirect=/checkout");
            else navigate("/checkout");
          }}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
