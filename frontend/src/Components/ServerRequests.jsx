import axios from "axios";

export const API_BASE_URL = "http://localhost:3001/";
// Register user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}register`,
      userData
    );
    return await response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error registering user");
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}customer/login`,
      credentials
    );
    return await response.data;
  } catch (error) {
    throw new Error(
      error.response.data || "Error logging in, Please try again"
    );
  }
};

export const getCustomerOrders = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}orders/customer/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return await response.data;
  } catch (e) {
    console.error(e);
  }
};
export const getAllOrders = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}orders/getAllOrders`, {
      params: { page, limit }, 
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
export const getAllCustomers = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}customer/get`, {
      params: { page, limit },
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return await response.data;
  } catch (e) {
    console.error(e);
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}orders/update-status/${orderId}/${newStatus}`
    );
    return response.data; // Return the response data if needed
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error; // Propagate the error to the caller
  }
};
export const cancelOrder = async (id) => {
  try {
    const response = await axios.post(`${API_BASE_URL}orders/cancel-order/${id}`);
    return response.data; // No need to `await` again for `.data`
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error canceling order");
  }
};


export const updateQuantity = async (productId, type) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}order-items/update-quantity/${productId}`,
      { type: type }
    );
    return response.data; // Return the response data if needed
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error; // Propagate the error to the caller
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}products/delete/${productId}`
    );
    return response.data; // Return the response data if needed
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error; // Propagate the error to the caller
  }
};

export const addProduct = async (product) => {
  try {
    
    const response = await axios.post(`${API_BASE_URL}product/add`, product);
    return response; // Return the response data if needed
  } catch (error) {
    console.error("Error adding product:", error);
    throw error; // Propagate the error to the caller
  }
};

export const updateProduct = async (productId, product) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}products/update/${productId}`,
      product
    );
    return response; // Return the response data if needed
  } catch (error) {
    console.error("Error updating order status:", error.message);
    throw error; // Propagate the error to the caller
  }
};

export const updateProductRating = async (userId, productId, rating) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}review/add/${userId}/${productId}?rating=${rating}`
    );
    return response; // Return the response data if needed
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};



export async function addToWishlist(productId, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}wishlist/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    });

    if (!response.ok) {
      throw new Error("Failed to add product to wishlist");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding to wishlist:", error);
  }
}

export async function removeFromWishlist(productId, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}wishlist/remove/${userId}/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to remove product from wishlist");
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing from wishlist:", error);
  }
}

// 🔍 Check if Product is in Wishlist
export async function checkWishlist(productId, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}wishlist/${userId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch wishlist");
    }

    const wishlist = await response.json();
    return wishlist.some((item) => item._id === productId);
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
}
