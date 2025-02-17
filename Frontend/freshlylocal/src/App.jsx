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

function App() {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/ManageProducts" element={<ManageProduct />} />
        <Route path="/order" element={<Order />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/LandingPage" element={<LandingPage />} />
      </Routes>
      {/* <Signup />
      <Login /> */}
    </>
  );
}

export default App;
