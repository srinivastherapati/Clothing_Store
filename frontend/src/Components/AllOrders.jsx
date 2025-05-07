import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import { getAllOrders, updateOrderStatus } from "./ServerRequests";
import ErrorPage from "./ErrorPage";
import "./AllOrders.css";

const deliveryStatusOptions = [
  "PLACED",
  "PREPARING",
  "SHIPPED",
  "OUT FOR DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "Cancelled (By User)",
  "Cancelled (By Admin)",
];

const pickupStatusOptions = [
  "PLACED",
  "PREPARING",
  "READY FOR PICKUP",
  "PICKED UP",
  "CANCELLED",
  "Cancelled (By User)",
  "Cancelled (By Admin)",
];

// Fallback if orderType is unknown or missing
const getStatusOptions = (type) => {
  if (type === "PICKUP") return pickupStatusOptions;
  if (type === "DELIVERY") return deliveryStatusOptions;
  return [];
};


const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      const response = await getAllOrders(page);
      setOrders(response.orders);
      setTotalPages(response.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError("Failed to fetch orders.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus)
      .then(() => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId ? { ...order, status: newStatus } : order
          )
        );
      })
      .catch((error) => {
        console.error("Failed to update order status:", error);
      });
  };

  if (isLoading) {
    return (
      <Box className="loading-spinner">
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  if (error) {
    return <ErrorPage title="Error" message={error} />;
  }

  return (
    <Box className="orders-container">
      <Typography variant="h4" gutterBottom textAlign="center">
        All Orders
      </Typography>

      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow className="MuiTableHead-root">
              <TableCell>Products</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Customer Email</TableCell>
              <TableCell align="center">Total Price</TableCell>
              <TableCell align="center">Order Date</TableCell>
              <TableCell>Order Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length > 0 ? (
              
              orders.map((order) => (
                <TableRow key={order.orderId} className="MuiTableBody-root">
                  <TableCell>
                    <Select className="select-dropdown" defaultValue={order.products[0]?.name || ""}>
                      {order.products.map((product) => (
                        <MenuItem key={product.productId} value={product.name}>
                          {`${product.name} (Qty: ${product.quantityBought} Size: ${product.size} Color: ${product.color})`}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>{order.customer.email}</TableCell>
                  <TableCell align="center">${order.totalPayment.toFixed(2)}</TableCell>
                  <TableCell align="center">{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>
  <Select
    className="select-dropdown"
    value={order.status}
    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
    disabled={
      order.status === "DELIVERED" ||
      order.status === "CANCELLED" ||
      order.status === "PICKED UP"
    }
  >
    {getStatusOptions(order.deliveryType).map((option) => (
      <MenuItem key={option} value={option}>
        {option}
      </MenuItem>
    ))}
  </Select>
</TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" className="no-orders">
                  No Orders Available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box className="pagination-container">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </Button>
        <Typography>
          Page {currentPage} of {totalPages}
        </Typography>
        <Button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default AllOrders;


