import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

const STATUS_LABELS = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/orders")
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err.response?.data?.error || "Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><p>Loading orders...</p></div>;

  if (error) return <div className="container"><p className="error">{error}</p></div>;

  if (orders.length === 0) {
    return (
      <div className="container">
        <h1>No orders yet</h1>
        <p>When you place an order it will show up here.</p>
        <Link to="/" className="btn primary">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Your orders</h1>
      <div className="orders-list">
        {orders.map((o) => (
          <Link to={`/orders/${o._id}`} key={o._id} className="order-card">
            <div>
              <strong>Order #{o._id.toString().slice(-6)}</strong>
              <p>{new Date(o.createdAt).toLocaleDateString()}</p>
              <p>{o.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)</p>
            </div>
            <div className="order-total">
              <p className="price">${Number(o.total).toFixed(2)}</p>
              <span className={`status status-${o.status}`}>
                {STATUS_LABELS[o.status] || o.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}