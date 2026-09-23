import { useEffect, useState } from "react";

import {
  Package,
  Tags,
  Users,
  Download,
  Upload,
  Warehouse,
  TrendingUp,
} from "lucide-react";

import { getDashboardApi } from "../../api/dashboardApi";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboardApi();

      setDashboard(data);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải dữ liệu dashboard."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <Loading text="Đang tải dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadDashboard} />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Xin chào, {user?.fullname}</h2>

          <p>Tổng quan hoạt động của kho.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<Package size={22} />}
          title="Tổng sản phẩm"
          value={formatNumber(dashboard.totalProducts)}
        />

        <StatCard
          icon={<Tags size={22} />}
          title="Tổng danh mục"
          value={formatNumber(dashboard.totalCategories)}
        />

        <StatCard
          icon={<Users size={22} />}
          title="Tổng người dùng"
          value={formatNumber(dashboard.totalUsers)}
        />

        <StatCard
          icon={<Download size={22} />}
          title="Phiếu nhập chờ duyệt"
          value={formatNumber(dashboard.pendingReceipts)}
        />

        <StatCard
          icon={<Upload size={22} />}
          title="Phiếu xuất chờ duyệt"
          value={formatNumber(dashboard.pendingIssues)}
        />

        <StatCard
          icon={<Warehouse size={22} />}
          title="Giá trị tồn kho"
          value={formatCurrency(dashboard.inventoryValue)}
        />

        <StatCard
          icon={<TrendingUp size={22} />}
          title="Doanh thu"
          value={formatCurrency(dashboard.revenue)}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div className="stat-content">
        <div className="stat-title">{title}</div>

        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}
