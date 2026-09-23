import { LogOut, UserCircle } from "lucide-react";

import { useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  const location = useLocation();

  const pageInfo = getPageInfo(location.pathname);

  return (
    <header className="header">
      <div>
        <h1 className="header-title">{pageInfo.title}</h1>

        <p className="header-subtitle">{pageInfo.subtitle}</p>
      </div>

      <div className="header-user">
        <UserCircle size={32} strokeWidth={1.7} />

        <div className="header-user-info">
          <span className="header-user-name">
            {user?.fullname || user?.username || "Người dùng"}
          </span>

          <span className="header-user-role">{user?.role || ""}</span>
        </div>

        <button type="button" className="logout-button" onClick={logout}>
          <LogOut size={17} />

          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}

function getPageInfo(pathname) {
  if (pathname === "/dashboard") {
    return {
      title: "Dashboard",
      subtitle: "Tổng quan hệ thống quản lý kho",
    };
  }

  if (pathname === "/products") {
    return {
      title: "Sản phẩm",
      subtitle: "Quản lý sản phẩm trong kho",
    };
  }

  if (pathname === "/categories") {
    return {
      title: "Danh mục",
      subtitle: "Quản lý danh mục sản phẩm",
    };
  }

  if (pathname === "/receipts") {
    return {
      title: "Phiếu nhập",
      subtitle: "Quản lý phiếu nhập kho",
    };
  }

  if (pathname === "/issues") {
    return {
      title: "Phiếu xuất",
      subtitle: "Quản lý phiếu xuất kho",
    };
  }

  if (pathname === "/invoices") {
    return {
      title: "Hóa đơn",
      subtitle: "Quản lý hóa đơn",
    };
  }

  if (pathname.startsWith("/reports")) {
    return {
      title: "Báo cáo",
      subtitle: "Báo cáo và thống kê kho",
    };
  }

  if (pathname === "/users") {
    return {
      title: "Người dùng",
      subtitle: "Quản lý tài khoản người dùng",
    };
  }

  return {
    title: "Quản lý kho",
    subtitle: "Warehouse Management System",
  };
}
