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
} from "@mui/material";
import ErrorPage from "./ErrorPage";
import { getAllCustomers } from "./ServerRequests";
import "./AllOrders.css";

const AllCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = async (page) => {
    setLoading(true);
    try {
      const response = await getAllCustomers(page);
      setCustomers(response.customers);
      setTotalPages(response.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setError("Failed to fetch customers.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage]);

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
        All Customers
      </Typography>

      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow className="MuiTableHead-root">
              <TableCell>Customer Name</TableCell>
              <TableCell>Customer Email</TableCell>
              <TableCell align="center">Number of Orders</TableCell>
              <TableCell align="center">Total Order Value</TableCell>
              <TableCell align="center">Last Order Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length > 0 ? (
              customers.map((customer, idx) => (
                <TableRow key={idx} className="MuiTableBody-root">
                  <TableCell>{customer.customerName}</TableCell>
                  <TableCell>{customer.customerEmail}</TableCell>
                  <TableCell align="center">{customer.numberOfOrders}</TableCell>
                  <TableCell align="center">${customer.customerTotalOrderValue.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" className="no-orders">
                  No Customers Available
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

export default AllCustomers;
