import { useState } from "react";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login"; // Add this line
import ManageProduct from "./Pages/ManageProduct";
import Order from "./Pages/Order";
import Profile from "./Pages/Profile";
import LandingPage from "./Pages/ConsumerLandingaPage";
import FarmProfilePage from "./Pages/FarmDetails";
import ConsumerProfile from "./Pages/ConsumerProfile";
import Product from "./Pages/ProductPage";  


function App() {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        {/* <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route> */}
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/ManageProducts" element={<ManageProduct />} />
        <Route path="/order" element={<Order />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/farmdescription/:id" element={<FarmProfilePage />} />
        <Route path="/consumerprofile" element={<ConsumerProfile />} />
        <Route path="/ProductPage" element={<Product/>} />
      </Routes>
      {/* <Signup />
      <Login /> */}
    </>
  );
}

export default App;
