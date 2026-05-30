import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Plans from '../pages/Plans';
import Dashboard from '../pages/Dashboard';
import AdminSubscriptions from '../pages/AdminSubscriptions';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/plans" element={<Plans />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        </Route>

        <Route path="/" element={<Navigate to="/plans" replace />} />
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
