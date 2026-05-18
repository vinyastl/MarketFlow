import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [address, setAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: address,
        card,
      };
      const { data } = await api.post("/orders/checkout", payload);
      clearCart();
      navigate(`/orders/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Checkout</h1>
      <p className="info-box">
        💡 This is a mock payment flow. Use any card number ending in something other than 0000.
        Cards ending in 0000 will be declined. <br />
        Example: <code>4242 4242 4242 4242</code>
      </p>

      <form onSubmit={handleSubmit} className="checkout-form">
        <fieldset>
          <legend>Shipping address</legend>
          <input
            placeholder="Street"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
            required
          />
          <input
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            required
          />
          <input
            placeholder="Postal code"
            value={address.postalCode}
            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
            required
          />
          <input
            placeholder="Country"
            value={address.country}
            onChange={(e) => setAddress({ ...address, country: e.target.value })}
            required
          />
        </fieldset>

        <fieldset>
          <legend>Payment</legend>
          <input
            placeholder="Card number"
            value={card.number}
            onChange={(e) => setCard({ ...card, number: e.target.value })}
            required
          />
          <input
            placeholder="MM/YY"
            value={card.expiry}
            onChange={(e) => setCard({ ...card, expiry: e.target.value })}
            required
          />
          <input
            placeholder="CVC"
            value={card.cvc}
            onChange={(e) => setCard({ ...card, cvc: e.target.value })}
            required
          />
        </fieldset>

        <div className="order-summary">
          <h3>Order summary</h3>
          {items.map((i) => (
            <div key={i.productId} className="summary-row">
              <span>{i.name} x {i.quantity}</span>
              <span>${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn primary big" disabled={submitting}>
          {submitting ? "Processing..." : `Pay $${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
