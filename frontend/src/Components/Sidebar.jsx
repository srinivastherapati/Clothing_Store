// import React from "react";
// import "./Sidebar.css";
// import Buttons from "./UI/Buttons";

// const Sidebar = ({ userData, onLogout, currentPage, setCurrentPage }) => {
//   const isActive = (page) => currentPage === page;

//   return (
//     <div className="sidebar">
//       <h2 className="sidebar-title">Hello, {userData.userName}</h2>
//       <div>
//         <ul className="sidebar-categories">
//           <li
//             className={isActive("food") ? "active" : ""}
//             onClick={() => setCurrentPage("food")}
//           >
//             FOOD
//           </li>
//           <li
//             className={isActive("beverages") ? "active" : ""}
//             onClick={() => setCurrentPage("beverages")}
//           >
//             BEVERAGES
//           </li>
//           <li
//             className={isActive("grocery") ? "active" : ""}
//             onClick={() => setCurrentPage("grocery")}
//           >
//             GROCERY
//           </li>
//           <li
//             className={isActive("dairy") ? "active" : ""}
//             onClick={() => setCurrentPage("dairy")}
//           >
//             DAIRY
//           </li>
//           <li
//             className={isActive("snacks") ? "active" : ""}
//             onClick={() => setCurrentPage("snacks")}
//           >
//             SNACKS
//           </li>
//           <li
//             className={isActive("gas") ? "active" : ""}
//             onClick={() => setCurrentPage("gas")}
//           >
//             GAS
//           </li>
//           {userData.role !== "admin" && (
//             <li
//               className={isActive("your-orders") ? "active" : ""}
//               onClick={() => setCurrentPage("your-orders")}
//             >
//               YOUR ORDERS
//             </li>
//           )}
//           {userData.role === "admin" && (
//             <li
//               className={isActive("all-orders") ? "active" : ""}
//               onClick={() => setCurrentPage("all-orders")}
//             >
//               ORDERS
//             </li>
//           )}
//           {userData.role === "admin" && (
//             <li
//               className={isActive("all-users") ? "active" : ""}
//               onClick={() => setCurrentPage("all-users")}
//             >
//               USERS
//             </li>
//           )}
//         </ul>
//       </div>
//       <div className="sidebar-footer">
//         <p className="user-details">{userData.userEmail}</p>
//         <Buttons onClick={onLogout}>Logout</Buttons>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
