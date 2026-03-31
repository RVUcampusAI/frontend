import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Dashboard from "./pages/Dashboard"
import Attendance from "./pages/Attendance"
import Results from "./pages/Results"
import Curriculum from "./pages/Curriculum"
import Timetable from "./pages/Timetable"
import Students from "./pages/Students"
import ProtectedRoute from "./components/auth/ProtectedRoute"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/results" element={<Results />} />
          <Route path="/curriculum" element={<Curriculum />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/students" element={<Students />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
