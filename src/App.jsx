import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/AdminDashboard'
import AdminHouses from './pages/AdminHouses'
import AdminHouseDetail from './pages/AdminHouseDetail'
import AdminAnnouncements from './pages/AdminAnnouncements'
import AdminResidents from './pages/AdminResidents'
import AdminPaymentHistory from './pages/AdminPaymentHistory'
import ResidentDashboard from './pages/ResidentDashboard'
import ResidentPayments from './pages/ResidentPayments'
import ResidentAnnouncements from './pages/ResidentAnnouncements'
import Layout from './components/Layout'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()

  // Mientras carga, mostrar spinner sin redirigir
  if (loading) return <div className="loading-screen"><div className="spinner"/></div>
  
  // Si no hay usuario, ir al login
  if (!user) return <Navigate to="/login" replace />
  
  // Si es adminOnly, esperar el profile antes de decidir
  if (adminOnly && !profile) return <div className="loading-screen"><div className="spinner"/></div>
  if (adminOnly && profile.role !== 'admin') return <Navigate to="/login" replace />
  
  return children
}

function AppRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading && !user) return <div className="loading-screen"><div className="spinner"/></div>

  return (
    <Routes>
      <Route path="/login" element={
        !user
          ? <Login />
          : <Navigate to={profile?.role === 'admin' ? '/admin' : '/residente'} replace />
      } />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/admin" element={<ProtectedRoute adminOnly><Layout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="casas" element={<AdminHouses />} />
        <Route path="casas/:id" element={<AdminHouseDetail />} />
        <Route path="anuncios" element={<AdminAnnouncements />} />
        <Route path="residentes" element={<AdminResidents />} />
        <Route path="historial" element={<AdminPaymentHistory />} />
      </Route>

      <Route path="/residente" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<ResidentDashboard />} />
        <Route path="pagos" element={<ResidentPayments />} />
        <Route path="anuncios" element={<ResidentAnnouncements />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px' },
          success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
          error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
