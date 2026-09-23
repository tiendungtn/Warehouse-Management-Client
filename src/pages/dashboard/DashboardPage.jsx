import {
  Package,
  Tags,
  Users,
  Download,
  Upload,
  Warehouse,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Xin chào, {user?.fullname}</h2>

          <p>Chào mừng bạn đến với hệ thống quản lý kho.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<Package size={22} />}
          title="Tổng sản phẩm"
          value="—"
        />

        <StatCard icon={<Tags size={22} />} title="Danh mục" value="—" />

        <StatCard icon={<Users size={22} />} title="Người dùng" value="—" />

        <StatCard
          icon={<Warehouse size={22} />}
          title="Giá trị tồn kho"
          value="—"
        />

        <StatCard
          icon={<Download size={22} />}
          title="Phiếu nhập chờ duyệt"
          value="—"
        />

        <StatCard
          icon={<Upload size={22} />}
          title="Phiếu xuất chờ duyệt"
          value="—"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <div className="stat-title">{title}</div>

        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}
