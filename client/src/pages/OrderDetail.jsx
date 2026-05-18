import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.error || err.message));
  }, [id]);

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!order) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <h1>🎉 Thank you for your order!</h1>
      <p>Order #{order._id.toString().slice(-6)}</p>
      <p>Status: <span className={`status status-${order.status}`}>{order.status}</span></p>

      <div className="order-detail">
        <h3>Items</h3>
        {order.items.map((item, idx) => (
          <div key={idx} className="summary-row">
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="summary-row total">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>

        {order.shippingAddress && (
          <>
            <h3>Shipping to</h3>
            <p>
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </p>
          </>
        )}

        <p><small>Payment ref: {order.paymentRef}</small></p>
      </div>

      <Link to="/" className="btn primary">Continue shopping</Link>
    </div>
  );
}
