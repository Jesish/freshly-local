// import React, { useState } from "react";
// import { ShoppingCart, X, Plus, Minus } from "lucide-react";

// const CartModal = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const [cartItems, setCartItems] = useState([
//     {
//       product: {
//         _id: "1",
//         name: "Organic Carrots",
//         image: "/api/placeholder/80/80",
//       },
//       quantity: 2,
//       price: 2.99,
//     },
//     {
//       product: {
//         _id: "2",
//         name: "Fresh Tomatoes",
//         image: "/api/placeholder/80/80",
//       },
//       quantity: 1,
//       price: 3.45,
//     },
//   ]);

//   const updateQuantity = (productId, change) => {
//     setCartItems((items) =>
//       items
//         .map((item) =>
//           item.product._id === productId
//             ? { ...item, quantity: Math.max(0, item.quantity + change) }
//             : item
//         )
//         .filter((item) => item.quantity > 0)
//     );
//   };

//   const getTotal = () => {
//     return cartItems.reduce(
//       (total, item) => total + item.price * item.quantity,
//       0
//     );
//   };

//   return (
//     <div>
//       {/* Cart Icon Button */}
//       <button
//         onClick={() => setIsOpen(true)}
//         className="fixed top-4 right-4 p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700"
//       >
//         <ShoppingCart size={24} />
//         {cartItems.length > 0 && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//             {cartItems.length}
//           </span>
//         )}
//       </button>

//       {/* Modal Overlay */}
//       {isOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           {/* Modal Content */}
//           <div className="bg-white rounded-lg w-full max-w-md mx-4">
//             {/* Modal Header */}
//             <div className="flex items-center justify-between p-4 border-b">
//               <h2 className="text-xl font-semibold">Your Cart</h2>
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="p-1 hover:bg-gray-100 rounded"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             {/* Cart Items */}
//             <div className="p-4 max-h-96 overflow-y-auto">
//               {cartItems.length === 0 ? (
//                 <p className="text-center text-gray-500 py-8">
//                   Your cart is empty
//                 </p>
//               ) : (
//                 cartItems.map((item) => (
//                   <div
//                     key={item.product._id}
//                     className="flex items-center gap-4 py-4 border-b last:border-0"
//                   >
//                     <img
//                       src={item.product.image}
//                       alt={item.product.name}
//                       className="w-16 h-16 object-cover rounded"
//                     />
//                     <div className="flex-1">
//                       <h3 className="font-medium">{item.product.name}</h3>
//                       <p className="text-gray-600">${item.price.toFixed(2)}</p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => updateQuantity(item.product._id, -1)}
//                         className="p-1 hover:bg-gray-100 rounded"
//                       >
//                         <Minus size={16} />
//                       </button>
//                       <span className="w-8 text-center">{item.quantity}</span>
//                       <button
//                         onClick={() => updateQuantity(item.product._id, 1)}
//                         className="p-1 hover:bg-gray-100 rounded"
//                       >
//                         <Plus size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>

//             {/* Cart Footer */}
//             {cartItems.length > 0 && (
//               <div className="p-4 border-t">
//                 <div className="flex justify-between mb-4">
//                   <span className="font-semibold">Total:</span>
//                   <span className="font-semibold">
//                     ${getTotal().toFixed(2)}
//                   </span>
//                 </div>
//                 <button
//                   className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
//                   onClick={() => {
//                     // Handle checkout
//                     console.log("Proceeding to checkout...");
//                   }}
//                 >
//                   Proceed to Checkout
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CartModal;
