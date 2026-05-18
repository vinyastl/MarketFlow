import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders")
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><p>Loading orders...</p></div>;

  if (orders.length === 0) {
    return (
      <div className="container">
        <h1>No orders yet</h1>
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
              <p>{o.items.length} item(s)</p>
            </div>
            <div className="order-total">
              <p className="price">${o.total.toFixed(2)}</p>
              <span className={`status status-${o.status}`}>{o.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
