import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyOtpPage } from "./pages/VerifyOtpPage";
import { CompleteProfilePage } from "./pages/CompleteProfilePage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { SetPasswordPage } from "./pages/SetPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { WalletPage } from "./pages/WalletPage";
import { InvestmentPage } from "./pages/InvestmentPage";
import { TransactionPage } from "./pages/TransactionPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) return null;

  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <PrivateRoute>
            <WalletPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/investment"
        element={
          <PrivateRoute>
            <InvestmentPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/transaction"
        element={
          <PrivateRoute>
            <TransactionPage />
          </PrivateRoute>
        }
      />

      {/* Default redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
