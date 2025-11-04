import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Loading from "./pages/Loading";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Forgot from "./pages/Forgot";
import { useAuth } from "./hooks/useAuth";
import { SocketProvider } from "./contexts/SocketContext";
import Messages from "./pages/Messages";

function App() {
  const { user } = useAuth();

  return (
    <SocketProvider userId={user?.data?.id} profileId={user?.data.id}>
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

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<Loading />} />
      </Routes>
    </SocketProvider>
  );
}

export default App;
