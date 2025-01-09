import { useState } from "react";
import React from "react";
import { Route, Routes } from "react-router-dom";

import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";

import Login from "./Pages/Login"; // Add this line

function App() {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
      {/* <Signup />
      <Login /> */}
    </>
  );
}

export default App;
