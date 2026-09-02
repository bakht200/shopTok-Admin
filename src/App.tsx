import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RequireAdmin } from './components/RequireAdmin';
import { AuthProvider } from './context/AuthContext';
import { AdminsPage } from './pages/AdminsPage';
import { ContentPage } from './pages/ContentPage';
import { DashboardPage } from './pages/DashboardPage';
import { DeliveriesPage } from './pages/DeliveriesPage';
import { LoginPage } from './pages/LoginPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { OrdersPage } from './pages/OrdersPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { UsersPage } from './pages/UsersPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/shopTok-Admin">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAdmin>
                <DashboardPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/users"
            element={
              <RequireAdmin>
                <UsersPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/users/:id"
            element={
              <RequireAdmin>
                <UserDetailPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admins"
            element={
              <RequireAdmin>
                <AdminsPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAdmin>
                <OrdersPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <RequireAdmin>
                <OrderDetailPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/deliveries"
            element={
              <RequireAdmin>
                <DeliveriesPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/content"
            element={
              <RequireAdmin>
                <ContentPage />
              </RequireAdmin>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
