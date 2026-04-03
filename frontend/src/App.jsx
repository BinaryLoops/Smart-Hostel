import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { Mess } from './pages/Mess'
import { Complaints } from './pages/Complaints'
import { Leave } from './pages/Leave'
import { Attendance } from './pages/Attendance'
import { Laundry } from './pages/Laundry'
import { Room } from './pages/Room'
import { Fees } from './pages/Fees'
import { LostFound } from './pages/LostFound'
import { Gym } from './pages/Gym'
import { Events } from './pages/Events'
import { AdminDashboard } from './pages/AdminDashboard'
import { Logs } from './pages/Logs'
import { Hospital } from './pages/Hospital'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="mess" element={<Mess />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="leave" element={<Leave />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="laundry" element={<Laundry />} />
              <Route path="logs" element={<Logs />} />
              <Route path="room" element={<Room />} />
              <Route path="fees" element={<Fees />} />
              <Route path="lost-found" element={<LostFound />} />
              <Route path="gym" element={<Gym />} />
              <Route path="events" element={<Events />} />
              <Route path="hospital" element={<Hospital />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
