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
import GroupExpenses from "./pages/GroupExpenses";
import ExpenseDetail from "./pages/ExpenseDetail";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<AppLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <Groups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId"
          element={
            <ProtectedRoute>
              <GroupExpenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId/expense/:expenseId"
          element={
            <ProtectedRoute>
              <ExpenseDetail />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
