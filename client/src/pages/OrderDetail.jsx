import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";

const STATUS_LABELS = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.error || "Could not load order."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!order) return null;

  return (
    <div className="container">
      <h1>🎉 Thank you for your order!</h1>
      <p>Order #{order._id.toString().slice(-6)}</p>
      <p>
        Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
        {new Date(order.createdAt).toLocaleTimeString()}
      </p>
      <p>
        Status:{" "}
        <span className={`status status-${order.status}`}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </p>

      <div className="order-detail">
        <h3>Items</h3>
        {order.items.map((item, idx) => (
          <div key={idx} className="summary-row">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="summary-row total">
          <span>Total</span>
          <span>${Number(order.total).toFixed(2)}</span>
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