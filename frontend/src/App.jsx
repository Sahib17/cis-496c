import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import Groups from "./pages/Groups";
import AppLayout from "./components/ui/AppLayout";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/register" element={<Register />}></Route>

      <Route element={<AppLayout />}>
        <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/groups/*"
        element={
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        }
      ></Route>
      </Route>

      
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/Navbar" element={<Navbar />}></Route>

      <Route path="/*" element={<NotFound />}></Route>
    </Routes>
  );
};

export default App;
