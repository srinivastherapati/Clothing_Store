import React, { useEffect, useState } from "react";
import useHttp from "../hooks/useHttp.jsx";
import ErrorPage from "./ErrorPage.jsx";
import MealItem from "./MealItem.jsx";
import AddMealModal from "./AddMealModal.jsx";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { API_BASE_URL } from "./ServerRequests.jsx";

export default function Meals({ isAdmin, isLoggedIn, setCurrentPage }) {
  const [isAdd, setIsAdd] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const[error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [availableproducts, setAvailableProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchData(1, true);
  }, []);

  async function fetchData(pageNumber, isNewSearch = false) {
    if (!hasMore && !isNewSearch) return;
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}product/get?page=${pageNumber}&limit=10&search=${searchQuery}&sort=${sortOption}&category=${selectedCategories.join(",")}&type=${selectedTypes.join(",")}`
      );
      const data = await response.json();

      if (data.products) {
        setAvailableProducts((prevProducts) =>
          isNewSearch ? data.products : [...prevProducts, ...data.products]
        );
        setHasMore(data.hasMore);
        setPage(pageNumber + 1);
      }
    } catch (error) {
      setError(error);
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleApplyFilters = () => {
    setPage(1);
    setHasMore(true);
    fetchData(1, true);
    setShowFilterModal(false);
  };

  const handleAddProduct = () => {
    setCurrentProduct({
      name: "",
      imageUrl: "",
      description: "",
      category: "",
      productVariants: {
        size: "",
        color: "",
        type: "",
        price:1,
        stock:1
      },
    });
    setIsAdd(true);
    setShowAddModal(true);
  };

  const handleAddProductSuccess = () => {
    setIsAdd(false);
    setShowAddModal(false);
    window.location.reload();
  };

  const handleEditProduct = (product) => {
    console.log(product);
    setCurrentProduct(product);
    setIsAdd(false);
    setShowAddModal(true); // Open modal for editing
  };

  if (loading) {
    return <p className="center">Fetching Items....</p>;
  }
  if (error) {
    return <ErrorPage title="Failed to Fetch Items" message={error.message} />;
  }

  const handleSearch = (query) => {
    setSearchQuery(query);
  setPage(1);
  setHasMore(true);
  
  if(query.length==0 || query.length>2) fetchData(1, true, query, sortOption, selectedCategories, selectedTypes);
  };

  return (
    <Box  sx={{ padding: "20px" }}>

<h3>Search</h3>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          sx={{ width: "10%",position:"sticky" }}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
        />
     <span> <Button variant="contained" onClick={() => setShowFilterModal(true)}>
        Filters & Sort
      </Button> </span>
      {isAdmin && (
        <Button
          variant="contained"
          sx={{ marginLeft: "10px" }}
          onClick={handleAddProduct}
        >
          Add New Item
        </Button>
      )}
       <AddMealModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddSuccess={() => {
            handleAddProductSuccess;
          }}
          currentProduct={currentProduct}
          isAdd={isAdd}
        />
     

      <Dialog open={showFilterModal} onClose={() => setShowFilterModal(false)}>
        <DialogTitle >Filters & Sorting</DialogTitle>
        <DialogContent>
          <h4>Sort By</h4>
          <Select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            fullWidth
          >
            <MenuItem value="A-Z">A-Z</MenuItem>
            <MenuItem value="Z-A">Z-A</MenuItem>
            <MenuItem value="price: low to high">Price: Low to High</MenuItem>
            <MenuItem value="price: high to low">Price: High to Low</MenuItem>
          </Select>
          <h4>Category</h4>
          <FormGroup>
            {["MEN", "WOMEN", "GIRLS","BOYS", "KIDS"].map((category) => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    checked={selectedCategories.includes(category.toUpperCase())}
                    onChange={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(category.toUpperCase())
                          ? prev.filter((c) => c !== category.toUpperCase())
                          : [...prev, category.toUpperCase()]
                      )
                    }
                  />
                }
                label={category}
              />
            ))}
          </FormGroup>
          <h4>Type</h4>
          <FormGroup>
            {["SHIRT", "T-SHIRT", "TRACKS", "PANTS", "SHORTS", "JACKET", "HOODIE"].map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={selectedTypes.includes(type.toUpperCase())}
                    onChange={() =>
                      setSelectedTypes((prev) =>
                        prev.includes(type.toUpperCase())
                          ? prev.filter((t) => t !== type.toUpperCase())
                          : [...prev, type.toUpperCase()]
                      )
                    }
                  />
                }
                label={type}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFilterModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleApplyFilters}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <ul id="meals">
        {availableproducts.map((product) => (
          <MealItem
            setCurrentPage={setCurrentPage}
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            key={product.id}
            product={product}
            onEdit={handleEditProduct}
          />
        ))}
        {loading && <p>Loading more products...</p>}
      </ul>
    </Box>
    
  );
}
