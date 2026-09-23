import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  Tags,
  Download,
  Upload,
  Receipt,
  BarChart3,
  Users,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();

  const isAdmin = user?.role === "Admin";

  const isManager = user?.role === "Manager";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Package size={22} />
        </div>

        <div>
          <div className="brand-title">Quản Lý Kho</div>

          <div className="brand-subtitle">Warehouse Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavItem
          to="/dashboard"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
        />

        <NavItem to="/products" icon={<Package size={18} />} label="Sản phẩm" />

        {(isAdmin || isManager) && (
          <NavItem
            to="/categories"
            icon={<Tags size={18} />}
            label="Danh mục"
          />
        )}

        <NavItem
          to="/receipts"
          icon={<Download size={18} />}
          label="Phiếu nhập"
        />

        <NavItem to="/issues" icon={<Upload size={18} />} label="Phiếu xuất" />

        <NavItem to="/invoices" icon={<Receipt size={18} />} label="Hóa đơn" />

        <div className="sidebar-section-title">BÁO CÁO</div>

        <NavItem
          to="/reports/stock"
          icon={<BarChart3 size={18} />}
          label="Tồn kho"
        />

        {(isAdmin || isManager) && (
          <NavItem
            to="/reports/revenue"
            icon={<BarChart3 size={18} />}
            label="Doanh thu"
          />
        )}

        {isAdmin && (
          <>
            <div className="sidebar-section-title">QUẢN TRỊ</div>

            <NavItem
              to="/users"
              icon={<Users size={18} />}
              label="Người dùng"
            />
          </>
        )}
      </nav>
    </aside>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
