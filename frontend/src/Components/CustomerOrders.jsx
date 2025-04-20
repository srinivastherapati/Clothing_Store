import React, { useState, useEffect, useCallback } from "react";
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
  IconButton,
  Collapse,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Star,
  StarBorder,
} from "@mui/icons-material";
import {
  cancelOrder,
  getCustomerOrders,
  updateProductRating,
} from "./ServerRequests.jsx";
import "./CustomerOrders.css";
import Buttons from "./UI/Buttons.jsx";

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openRow, setOpenRow] = useState({});
  const [ratings, setRatings] = useState({}); // Track product ratings.
  const userData = JSON.parse(localStorage.getItem("userDetails"));
  const handleCancelOrder = useCallback(async (id, status) => {
    if (status === "READY" || status === "READY FOR PICKUP" || status === "DELIVERED") {
      alert("Order cannot be canceled. Refund cannot be issued.");
      return; // Prevent further execution
    }
  
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;
  
    try {
      const response = await cancelOrder(id);
      if (response.status==="ok") {
        alert("Order Cancelled, Refund Initiated");
  
        // Update the UI without refreshing
        setOrders((prevOrders) =>
          prevOrders.map(order =>
            order.orderId === id ? { ...order, status: "CANCELLED" } : order
          )
        );
      } else {
        alert("Failed to cancel order: " + response.message);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  }, []);
  

  useEffect(() => {
    getCustomerOrders(userData.userId)
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch past orders.");
        console.error("Error fetching orders:", error);
        setLoading(false);
      });
  }, []);

  

  const handleRatingChange = (productId, rating) => {
    console.log("Came Here " + productId);
    try {
      updateProductRating(userData.userId, productId, rating);
      alert("Rating updated successfully");
    } catch (error) {
      alert("Error : " + error);
    }
    setRatings((prev) => ({ ...prev, [productId]: rating }));
  };

  const toggleRow = (orderId) => {
    setOpenRow((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  const renderStars = (productId) => {
    const currentRating = ratings[productId] || 0;
    return (
      <Box>
        {[1, 2, 3, 4, 5].map((value) => (
          <IconButton
            key={value}
            onClick={() => handleRatingChange(productId, value)}
            size="small"
            style={{ color: value <= currentRating ? "#FFD700" : "#ccc" }} // Gold for filled stars
          >
            {value <= currentRating ? <Star /> : <StarBorder />}
          </IconButton>
        ))}
      </Box>
    );
  };

  const renderTable = (orders, title) => {
    return (
      <>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        {orders ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Order ID</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Order Status</TableCell>
                  <TableCell>Cancel Order</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <React.Fragment key={order.orderId}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleRow(order.orderId)}
                        >
                          {openRow[order.orderId] ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${order.totalPayment.toFixed(2)}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      
                      
                      <TableCell>
                        {order.status === "PLACED" ||
                        order.status === "READY" ||
                        order.status === "READY FOR PICKUP" ||
                        order.status === "PREPARING" ? (
                          <Buttons
                            onClick={() => handleCancelOrder(order.orderId,order.status)}
                          >
                            Cancel
                          </Buttons>
                        ) : (
                          "Cancel"
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={6}
                      >
                        <Collapse
                          in={openRow[order.orderId]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box margin={2}>
                            <Typography variant="subtitle1" gutterBottom>
                              Order Items
                            </Typography>
                            <Table size="small" aria-label="order items">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Product Name</TableCell>
                                  <TableCell>Quantity Bought</TableCell>
                                  <TableCell>Rate Product</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {order.products.map((product, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>
                                      {product.quantityBought}
                                    </TableCell>
                                    <TableCell>
                                      {renderStars(product.productId)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <div style={{ display: "flex", width: "100%" }}>
            <p
              style={{
                justifyContent: "space-around",
              }}
            >
              No Orders at this time
            </p>
          </div>
        )}
      </>
    );
  };

  return renderTable(orders, "Your Orders");
};

export default CustomerOrders;
