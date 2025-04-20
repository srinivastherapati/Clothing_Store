import { useContext } from "react";
import logoImg from "../assets/logo.jpg";
import Buttons from "./UI/Buttons";
import CartContext from "./Store/CartContext.jsx";
import UserProgressContext from "./Store/UserProgressContext.jsx";
import "./Header.css";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Header({
  isAdmin,
  isLoggedIn,
  userData,
  onLogout,
  setCurrentPage,
}) {
  const crtCntxt = useContext(CartContext);

  const cartValue = crtCntxt.items.reduce((totalItems, item) => {
    return totalItems + item.quantity;
  }, 0);

  const userProgressCtx = useContext(UserProgressContext);

  function handleShowCart() {
    if (!isLoggedIn) {
      alert("Please login to continue !");
      setCurrentPage("products");
      return;
    }
    userProgressCtx.showCart();
  }

  return (
    <header id="main-header" className="header">
      {/* Left section with logo and title */}
      <div id="title" className="header-title">
        <img src={logoImg} alt="Store Logo" />
        <h1 className="header-link" onClick={() => setCurrentPage("products")}>
          Clothing Store
        </h1>
      </div>

      {/* Right section with navigation links and user info */}
      <nav className="header-nav">
        {/* Navigation links */}
        <div className="header-links">
          {isAdmin && (
            <span
              className="header-link strong-link"
              onClick={() => setCurrentPage("all-orders")}
            >
              ORDERS
            </span>
          )}
          {isAdmin && (
            <span
              className="header-link strong-link"
              onClick={() => setCurrentPage("all-users")}
            >
              USERS
            </span>
          )}
          {isLoggedIn && !isAdmin && (
            <span
              className="header-link strong-link"
              onClick={() => setCurrentPage("your-orders")}
            >
              YOUR ORDERS
            </span>
          )}
        </div>

        {/* Cart button (not visible for admins) */}
        {!isAdmin && (
          <Buttons
            onClick={handleShowCart}
            style={{ display: "flex", alignItems: "center" }}
          >
            Cart ({cartValue}){" "}
            <span>
              <ShoppingCartIcon sx={{ marginLeft: "8px", padding: "0px" }} />{" "}
            </span>
          </Buttons>
        )}

        {/* User info and logout */}
        <div className="header-user">
          {!isLoggedIn && (
            <button
              className="logout-button"
              onClick={() => setCurrentPage("login")}
            >
              Login
            </button>
          )}
          {isLoggedIn && (
            <>
              <span>{userData != null ? userData.emailId : ""}</span>
              <button
                className="logout-button"
                onClick={onLogout}
                style={{ display: "flex", alignItems: "center" }}
              >
                Logout
                <LogoutIcon sx={{ marginLeft: "8px" }} />
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
