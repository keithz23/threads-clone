import { Routes, Route } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Loading from "./pages/Loading";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Forgot from "./pages/Forgot";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot"
        element={
          <PublicRoute>
            <Forgot />
          </PublicRoute>
        }
      />

      <Route
        path="/reset"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* 404 fallback */}
      <Route path="*" element={<Loading />} />
    </Routes>
  );
}

export default App;
