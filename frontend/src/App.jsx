import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import  ProtectedRoute from './components/ProtectedRoute';
//import  Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Categories from './pages/Categories';
import Profile from './pages/Profile';
import AppLayout from './components/AppLayout';


const App = () => {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path = "/login" element={<Login/>} />
        <Route path = "/register" element={<Register/>} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path = "/dashboard" element={<Dashboard />} />
            <Route path = "/expenses" element={<Expenses />} />
            <Route path = "/categories" element={<Categories />} />
            <Route path = "/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
    </BrowserRouter>
  );
};

export default App;