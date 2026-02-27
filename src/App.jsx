import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import Citas from './pages/Citas'
import Historial from './pages/Historial'

function ProtectedRoute({ children }) {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { isAuth } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="citas" element={<Citas />} />
        <Route path="historial" element={<Historial />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
