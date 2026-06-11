import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Welcome from "../pages/Welcome";
import Register from "../pages/Register";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import HomePage from "../pages/HomePage";
import CategoriesPage from "../pages/CategoriesPage";
import AccountPage from "../pages/AccountPage";
import TransactionsPage from "../pages/TransactionsPage";
import GoalsPage from "../pages/GoalsPage";
import StatisticsPage from "../pages/StatisticsPage";
import ProfilePage from "../pages/ProfilePage";
import AdminDashboard from "../pages/AdminDashboard";
import AIAssistant from "../components/AIAssistant/AIAssistant";

export default function AppRoutes() {
  const location = useLocation();
  
  // Danh sách các trang không hiển thị AI Assistant
  const hideAIRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
  const shouldShowAI = !hideAIRoutes.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/accounts" element={<AccountPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

      {/* AI Assistant - chỉ hiển thị trên các trang đã đăng nhập */}
      {shouldShowAI && <AIAssistant />}
    </>
  );
}
