import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [cardErrors, setCardErrors] = useState({});
  const [addressErrors, setAddressErrors] = useState({});

  const [address, setAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });

  function validateAddress() {
    const errors = {};
    for (const field of ["street", "city", "postalCode", "country"]) {
      if (!address[field].trim()) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    }
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateCard() {
    const errors = {};
    const digits = card.number.replace(/\s+/g, "");
    if (!card.number.trim()) errors.number = "Card number is required";
    else if (!/^\d{12,19}$/.test(digits)) {
      errors.number = "Card number must contain 12 to 19 digits";
    }
    if (!card.expiry.trim()) errors.expiry = "Expiry is required";
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry.trim())) {
      errors.expiry = "Use MM/YY format";
    }
    if (!card.cvc.trim()) errors.cvc = "CVC is required";
    else if (!/^\d{3,4}$/.test(card.cvc.trim())) errors.cvc = "CVC must be 3 or 4 digits";
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const addressOk = validateAddress();
    const cardOk = validateCard();
    if (!addressOk || !cardOk) return;

    setSubmitting(true);
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
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <Link to="/" className="btn primary">Start shopping</Link>
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

      <form onSubmit={handleSubmit} className="checkout-form" noValidate>
        <fieldset>
          <legend>Shipping address</legend>
          {["street", "city", "postalCode", "country"].map((field) => (
            <div className="field" key={field}>
              <label htmlFor={`address-${field}`} className="sr-only">
                {field}
              </label>
              <input
                id={`address-${field}`}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={address[field]}
                onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                aria-invalid={!!addressErrors[field]}
              />
              {addressErrors[field] && (
                <small className="field-error">{addressErrors[field]}</small>
              )}
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend>Payment</legend>
          <div className="field">
            <label htmlFor="card-number" className="sr-only">Card number</label>
            <input
              id="card-number"
              name="cardNumber"
              autoComplete="cc-number"
              inputMode="numeric"
              placeholder="Card number"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value })}
              aria-invalid={!!cardErrors.number}
            />
            {cardErrors.number && <small className="field-error">{cardErrors.number}</small>}
          </div>
          <div className="field">
            <label htmlFor="card-expiry" className="sr-only">Expiry</label>
            <input
              id="card-expiry"
              name="cardExpiry"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={(e) => setCard({ ...card, expiry: e.target.value })}
              aria-invalid={!!cardErrors.expiry}
            />
            {cardErrors.expiry && <small className="field-error">{cardErrors.expiry}</small>}
          </div>
          <div className="field">
            <label htmlFor="card-cvc" className="sr-only">CVC</label>
            <input
              id="card-cvc"
              name="cardCvc"
              autoComplete="cc-csc"
              inputMode="numeric"
              placeholder="CVC"
              value={card.cvc}
              onChange={(e) => setCard({ ...card, cvc: e.target.value })}
              aria-invalid={!!cardErrors.cvc}
            />
            {cardErrors.cvc && <small className="field-error">{cardErrors.cvc}</small>}
          </div>
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

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" className="btn primary big" disabled={submitting}>
          {submitting ? "Processing..." : `Pay $${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}