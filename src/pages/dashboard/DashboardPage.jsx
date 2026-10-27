import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Boxes,
  ChartColumnIncreasing,
  ChartPie,
  Download,
  Package,
  RefreshCw,
  Tags,
  TrendingUp,
  Upload,
  Users,
  Warehouse,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getDashboardApi,
  getDashboardAnalyticsApi,
} from "../../api/dashboardApi";

import { getStockReportApi } from "../../api/reportApi";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

import { useAuth } from "../../context/AuthContext";

import "../../styles/dashboard.css";

const STOCK_COLORS = ["#ef4444", "#f59e0b", "#10b981"];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [stockData, setStockData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [summary, trends, stockReport] = await Promise.all([
        getDashboardApi(),
        getDashboardAnalyticsApi(),
        getStockReportApi(),
      ]);

      setDashboard(summary);
      setAnalytics(trends);

      const products = stockReport.products || [];

      setStockData([
        {
          name: "Hết hàng",
          value: products.filter((product) => product.status === "OutOfStock")
            .length,
          filter: "outofstock",
        },
        {
          name: "Sắp hết",
          value: products.filter((product) => product.status === "LowStock")
            .length,
          filter: "lowstock",
        },
        {
          name: "Còn hàng",
          value: products.filter((product) => product.status === "InStock")
            .length,
          filter: "instock",
        },
      ]);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải dữ liệu dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading && !dashboard) {
    return <Loading text="Đang tải dashboard..." />;
  }

  if (error && !dashboard) {
    return <ErrorMessage message={error} onRetry={loadDashboard} />;
  }

  if (!dashboard) {
    return null;
  }

  const stats = [
    {
      title: "Tổng sản phẩm",
      value: formatNumber(dashboard.totalProducts),
      icon: Package,
      path: "/products",
    },
    {
      title: "Tổng danh mục",
      value: formatNumber(dashboard.totalCategories),
      icon: Tags,
      path: "/categories",
    },
    {
      title: "Tổng người dùng",
      value: formatNumber(dashboard.totalUsers),
      icon: Users,
      path: "/users",
    },
    {
      title: "Phiếu nhập chờ duyệt",
      value: formatNumber(dashboard.pendingReceipts),
      icon: Download,
      path: "/receipts",
    },
    {
      title: "Phiếu xuất chờ duyệt",
      value: formatNumber(dashboard.pendingIssues),
      icon: Upload,
      path: "/issues",
    },
    {
      title: "Giá trị tồn kho",
      value: formatCurrency(dashboard.inventoryValue),
      icon: Warehouse,
      path: "/reports/stock",
    },
    {
      title: "Doanh thu",
      value: formatCurrency(dashboard.revenue),
      icon: TrendingUp,
      path: "/reports/revenue",
    },
  ];

  const trends = (analytics?.trends || []).map((item) => ({
    ...item,
    dayLabel: String(item.day),
  }));

  const currentMonthLabel = formatMonth(analytics?.currentMonth);

  const previousMonthLabel = formatMonth(analytics?.previousMonth);

  const totalStockItems = stockData.reduce((sum, item) => sum + item.value, 0);

  const goToRevenueReport = () => {
    navigate("/reports/revenue");
  };

  const goToWarehouseActivity = (entry) => {
    // Nếu người dùng nhấp vào cột phiếu xuất, mở danh sách phiếu xuất.
    if (
      entry?.dataKey === "issueCount" ||
      entry?.dataKey === "previousIssueCount"
    ) {
      navigate("/issues");
      return;
    }

    // Mặc định mở danh sách phiếu nhập.
    navigate("/receipts");
  };

  const handleStockChartClick = (entry) => {
    if (entry?.filter) {
      navigate(`/reports/stock?stockFilter=${entry.filter}`);
    } else {
      navigate("/reports/stock");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div className="page-header">
          <h2>Xin chào, {user?.fullname || "bạn"}</h2>

          <p>Tổng quan hoạt động và tình hình kinh doanh của kho.</p>

          <div className="dashboard-period">
            Dữ liệu tháng {currentMonthLabel}
          </div>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {error && (
        <div className="page-alert">
          <ErrorMessage message={error} onRetry={loadDashboard} />
        </div>
      )}

      <section className="dashboard-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <button
              key={stat.title}
              type="button"
              className="dashboard-stat-card"
              onClick={() => navigate(stat.path)}
              aria-label={`Mở mục ${stat.title}`}
            >
              <div className="dashboard-stat-icon">
                <Icon size={22} />
              </div>

              <div className="dashboard-stat-content">
                <div className="dashboard-stat-title">{stat.title}</div>

                <div className="dashboard-stat-value">{stat.value}</div>

                <div className="dashboard-stat-hint">Xem chi tiết →</div>
              </div>
            </button>
          );
        })}
      </section>

      <section className="dashboard-charts-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>So sánh doanh thu</h3>

              <p>Doanh thu theo ngày trong tháng hiện tại và tháng trước.</p>

              <div className="dashboard-chart-legend">
                <span className="dashboard-legend-item">
                  <span className="dashboard-legend-dot" />
                  {currentMonthLabel}
                </span>

                <span className="dashboard-legend-item">
                  <span className="dashboard-legend-dot previous" />
                  {previousMonthLabel}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/reports/revenue")}
            >
              Chi tiết
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="dashboard-chart-wrap">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trends}
                  margin={{
                    top: 8,
                    right: 10,
                    left: 8,
                    bottom: 4,
                  }}
                  onClick={goToRevenueReport}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={Math.max(0, Math.ceil(trends.length / 10) - 1)}
                  />

                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={65}
                    tickFormatter={formatCompactCurrency}
                  />

                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                    labelFormatter={(label) => `Ngày ${label}`}
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name={currentMonthLabel}
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      r: 5,
                      cursor: "pointer",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="previousRevenue"
                    name={previousMonthLabel}
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="dashboard-empty">
                Chưa có dữ liệu doanh thu để hiển thị.
              </div>
            )}
          </div>

          <p className="dashboard-chart-note"></p>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Tình trạng tồn kho</h3>

              <p>Phân loại theo số lượng sản phẩm.</p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={goToRevenueReport}
            >
              Chi tiết
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="dashboard-chart-wrap compact">
            {totalStockItems > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={3}
                    onClick={(entry) => handleStockChartClick(entry)}
                    style={{ cursor: "pointer" }}
                  >
                    {stockData.map((entry, index) => (
                      <Cell key={entry.name} fill={STOCK_COLORS[index]} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [
                      `${formatNumber(value)} sản phẩm`,
                      "Số lượng",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="dashboard-empty">Chưa có dữ liệu tồn kho.</div>
            )}
          </div>

          <div className="dashboard-chart-legend">
            {stockData.map((item, index) => (
              <button
                type="button"
                key={item.name}
                className="dashboard-legend-item"
                onClick={() => handleStockChartClick(item)}
                style={{
                  border: 0,
                  padding: 0,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <span
                  className="dashboard-legend-dot"
                  style={{
                    background: STOCK_COLORS[index],
                  }}
                />
                {item.name}: {formatNumber(item.value)}
              </button>
            ))}
          </div>

          <p className="dashboard-chart-note"></p>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <div>
            <h3>Hoạt động kho</h3>

            <p>
              Số phiếu nhập và phiếu xuất đã duyệt theo ngày, so với tháng
              trước.
            </p>
          </div>
        </div>

        <div className="dashboard-chart-wrap">
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trends}
                margin={{
                  top: 8,
                  right: 12,
                  left: 0,
                  bottom: 4,
                }}
                onClick={(state) => {
                  const activeEntry = state?.activePayload?.[0]?.payload;

                  if (activeEntry) {
                    goToWarehouseActivity(state.activePayload[0]);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="dayLabel"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.max(0, Math.ceil(trends.length / 10) - 1)}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip labelFormatter={(label) => `Ngày ${label}`} />

                <Legend />

                <Bar
                  dataKey="receiptCount"
                  name={`Phiếu nhập · ${currentMonthLabel}`}
                  fill="#2563eb"
                  radius={[3, 3, 0, 0]}
                  cursor="pointer"
                  onClick={() => navigate("/receipts")}
                />

                <Bar
                  dataKey="previousReceiptCount"
                  name={`Phiếu nhập · ${previousMonthLabel}`}
                  fill="#93c5fd"
                  radius={[3, 3, 0, 0]}
                  cursor="pointer"
                  onClick={() => navigate("/receipts")}
                />

                <Bar
                  dataKey="issueCount"
                  name={`Phiếu xuất · ${currentMonthLabel}`}
                  fill="#10b981"
                  radius={[3, 3, 0, 0]}
                  cursor="pointer"
                  onClick={() => navigate("/issues")}
                />

                <Bar
                  dataKey="previousIssueCount"
                  name={`Phiếu xuất · ${previousMonthLabel}`}
                  fill="#a7f3d0"
                  radius={[3, 3, 0, 0]}
                  cursor="pointer"
                  onClick={() => navigate("/issues")}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="dashboard-empty">Chưa có dữ liệu hoạt động.</div>
          )}
        </div>

        <p className="dashboard-chart-note"></p>
      </section>
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

function formatCompactCurrency(value) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)} tr`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)} k`;
  }

  return String(value ?? 0);
}

function formatMonth(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}
