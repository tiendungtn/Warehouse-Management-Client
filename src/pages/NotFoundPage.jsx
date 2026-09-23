import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found-code">404</div>

      <h2>Không tìm thấy trang</h2>

      <p>Đường dẫn bạn truy cập không tồn tại.</p>

      <Link to="/dashboard" className="login-button not-found-link">
        Về Dashboard
      </Link>
    </div>
  );
}
