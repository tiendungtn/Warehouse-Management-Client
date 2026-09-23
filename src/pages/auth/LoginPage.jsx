import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, Package } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");

      return;
    }

    try {
      setLoading(true);

      await login(username.trim(), password, rememberMe);

      window.location.href = "/dashboard";
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Tên đăng nhập hoặc mật khẩu không đúng.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background" />

      <div className="login-card">
        <div className="login-logo">
          <Package size={34} />
        </div>

        <div className="login-heading">
          <h1>Quản Lý Kho</h1>
          <p>Đăng nhập vào hệ thống</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>

            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                disabled={loading}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              disabled={loading}
            />

            <span>Ghi nhớ đăng nhập</span>
          </label>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
