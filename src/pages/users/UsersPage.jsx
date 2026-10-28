import { useEffect, useState } from "react";
import {
  Edit,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
  ShieldCheck,
} from "lucide-react";

import UserPermissionsModal from "./UserPermissionsModal";
import PermissionCheckboxTable from "./PermissionCheckboxTable";

import {
  createUserApi,
  deleteUserApi,
  getUsersApi,
  updateUserApi,
} from "../../api/userApi";

import { useAuth } from "../../context/AuthContext";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

import "../../styles/users.css";

const PERMISSION_OPTIONS = [
  ["products.view", "Xem sản phẩm"],
  ["products.create", "Tạo sản phẩm"],
  ["products.edit", "Sửa sản phẩm"],
  ["products.delete", "Xóa sản phẩm"],
  ["categories.view", "Xem danh mục"],
  ["categories.create", "Tạo danh mục"],
  ["categories.edit", "Sửa danh mục"],
  ["categories.delete", "Xóa danh mục"],
  ["receipts.view", "Xem phiếu nhập"],
  ["receipts.create", "Tạo phiếu nhập"],
  ["receipts.edit", "Sửa phiếu nhập"],
  ["receipts.delete", "Xóa phiếu nhập"],
  ["receipts.approve", "Duyệt phiếu nhập"],
  ["issues.view", "Xem phiếu xuất"],
  ["issues.create", "Tạo phiếu xuất"],
  ["issues.edit", "Sửa phiếu xuất"],
  ["issues.delete", "Xóa phiếu xuất"],
  ["issues.approve", "Duyệt phiếu xuất"],
  ["invoices.view", "Xem hóa đơn"],
  ["invoices.create", "Tạo hóa đơn"],
  ["invoices.edit", "Sửa hóa đơn"],
  ["invoices.delete", "Xóa hóa đơn"],
  ["invoices.download", "Tải hóa đơn"],
  ["reports.stock.view", "Xem báo cáo tồn kho"],
  ["reports.stock.export", "Xuất báo cáo tồn kho"],
  ["reports.revenue.view", "Xem báo cáo doanh thu"],
  ["users.view", "Xem người dùng"],
  ["users.create", "Tạo người dùng"],
  ["users.edit", "Sửa người dùng"],
  ["users.lock", "Khóa người dùng"],
  ["users.permissions.manage", "Quản lý phân quyền"],
  ["roles.view", "Xem vai trò"],
  ["roles.create", "Tạo vai trò"],
  ["roles.edit", "Sửa vai trò"],
  ["roles.delete", "Xóa vai trò"],
  ["audit.view", "Xem nhật ký kiểm toán"],
];

const PERMISSION_GROUPS = [
  {
    name: "Sản phẩm",
    items: PERMISSION_OPTIONS.slice(0, 4),
  },
  {
    name: "Danh mục",
    items: PERMISSION_OPTIONS.slice(4, 8),
  },
  {
    name: "Phiếu nhập",
    items: PERMISSION_OPTIONS.slice(8, 13),
  },
  {
    name: "Phiếu xuất",
    items: PERMISSION_OPTIONS.slice(13, 18),
  },
  {
    name: "Hóa đơn",
    items: PERMISSION_OPTIONS.slice(18, 23),
  },
  {
    name: "Báo cáo",
    items: PERMISSION_OPTIONS.slice(23, 26),
  },
  {
    name: "Người dùng",
    items: PERMISSION_OPTIONS.slice(26, 31),
  },
  {
    name: "Vai trò và kiểm toán",
    items: PERMISSION_OPTIONS.slice(31),
  },
];

const ROLE_BASELINES = {
  Admin: PERMISSION_OPTIONS.map(([code]) => code),

  Manager: [
    "products.view",
    "products.create",
    "products.edit",
    "categories.view",
    "categories.create",
    "categories.edit",
    "receipts.view",
    "receipts.create",
    "receipts.edit",
    "receipts.approve",
    "issues.view",
    "issues.create",
    "issues.edit",
    "issues.approve",
    "invoices.view",
    "invoices.create",
    "invoices.download",
    "reports.stock.view",
    "reports.stock.export",
    "reports.revenue.view",
  ],

  Staff: [
    "products.view",
    "categories.view",
    "receipts.view",
    "receipts.create",
    "issues.view",
    "issues.create",
    "invoices.view",
    "reports.stock.view",
  ],
};

const getBasePermissions = (role) =>
  ROLE_BASELINES[role] ?? ROLE_BASELINES.Staff;

const getPermissionOverrides = (role, selectedPermissions) => {
  const baseline = new Set(getBasePermissions(role));
  const selected = new Set(selectedPermissions);

  return PERMISSION_OPTIONS.flatMap(([permissionCode]) => {
    const roleAllows = baseline.has(permissionCode);
    const shouldAllow = selected.has(permissionCode);

    if (roleAllows === shouldAllow) {
      return [];
    }

    return [
      {
        permissionCode,
        effect: shouldAllow ? "Grant" : "Deny",
        reason: null,
      },
    ];
  });
};

const emptyPermissionOverride = () => ({
  permissionCode: "",
  effect: "Grant",
  reason: "",
});

const initialForm = {
  username: "",
  password: "",
  fullname: "",
  role: "Staff",
  permissionMode: "RoleBased",
  permissionOverrides: [],
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [permissionUser, setPermissionUser] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsersApi();

      setUsers(data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải danh sách người dùng.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);

    setForm({
      ...initialForm,
    });

    setError("");
    setSelectedPermissions(getBasePermissions("Staff"));
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      username: user.username,
      password: "",
      fullname: user.fullname,
      role: user.role,
    });

    setError("");

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);

    setEditingUser(null);

    setForm({
      ...initialForm,
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "role" && !editingUser) {
      setSelectedPermissions(getBasePermissions(value));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingUser) {
        await updateUserApi(editingUser.id, {
          fullname: form.fullname,
          role: form.role,
          newPassword: form.password || null,
        });
      } else {
        const permissionOverrides = getPermissionOverrides(
          form.role,
          selectedPermissions,
        );

        await createUserApi({
          username: form.username,
          password: form.password,
          fullname: form.fullname,
          role: form.role,
          permissionMode:
            permissionOverrides.length > 0 ? "Custom" : "RoleBased",
          permissionOverrides,
        });
      }

      closeModal();

      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể lưu người dùng.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) {
      alert("Bạn không thể tự xóa tài khoản đang đăng nhập.");

      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa tài khoản "${user.username}" không?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user.id);

      setError("");

      await deleteUserApi(user.id);

      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể xóa người dùng.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return (
      user.username?.toLowerCase().includes(keyword) ||
      user.fullname?.toLowerCase().includes(keyword) ||
      user.role?.toLowerCase().includes(keyword)
    );
  });

  const [selectedPermissions, setSelectedPermissions] = useState(
    getBasePermissions("Staff"),
  );

  const handlePermissionToggle = (permissionCode, checked) => {
    setSelectedPermissions((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(permissionCode);
      } else {
        next.delete(permissionCode);
      }

      return [...next];
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="page-content users-page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Người dùng</h2>

            <p>Quản lý tài khoản và phân quyền người dùng</p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={openCreateModal}
          >
            <Plus size={17} />
            Thêm người dùng
          </button>
        </div>
      </div>

      {error && (
        <div className="page-alert">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="content-card">
        <div className="users-toolbar">
          <div className="users-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Tìm username, họ tên hoặc role..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="users-count">{filteredUsers.length} người dùng</div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <UserRound size={42} />

            <h3>Không có người dùng</h3>

            <p>Không tìm thấy tài khoản phù hợp.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table users-table">
              <thead>
                <tr>
                  <th>STT</th>

                  <th>Tài khoản</th>

                  <th>Họ tên</th>

                  <th>Vai trò</th>

                  <th>Ngày tạo</th>

                  <th className="actions-column">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{user.username}</strong>
                    </td>

                    <td>{user.fullname}</td>

                    <td>
                      <span
                        className={`user-role-badge ${getRoleClass(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>{formatDate(user.createdAt)}</td>

                    <td className="actions-column">
                      <div className="table-actions">
                        <button
                          type="button"
                          className="icon-button"
                          title="Phân quyền"
                          aria-label={`Phân quyền cho ${user.username}`}
                          onClick={() => setPermissionUser(user)}
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-button edit"
                          title="Chỉnh sửa"
                          onClick={() => openEditModal(user)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          className="icon-button delete"
                          title="Xóa"
                          disabled={
                            deletingId === user.id ||
                            user.id === currentUser?.id
                          }
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="user-modal-backdrop">
          <div className="user-modal">
            <div className="user-modal-header">
              <div>
                <h3>
                  {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
                </h3>

                <p>
                  {editingUser
                    ? "Cập nhật thông tin và quyền tài khoản"
                    : "Tạo tài khoản mới cho hệ thống"}
                </p>
              </div>

              <button
                type="button"
                className="user-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={19} />
              </button>
            </div>

            <form className="user-form" onSubmit={handleSubmit}>
              {!editingUser && (
                <div className="form-group">
                  <label htmlFor="username">Tên đăng nhập</label>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    maxLength={50}
                    required
                  />
                </div>
              )}

              {editingUser && (
                <div className="form-group">
                  <label>Tên đăng nhập</label>

                  <input type="text" value={form.username} disabled />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="fullname">Họ và tên</label>

                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={form.fullname}
                  onChange={handleChange}
                  maxLength={200}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Vai trò</label>

                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="Staff">Staff</option>

                  <option value="Manager">Manager</option>

                  <option value="Admin">Admin</option>
                </select>
              </div>
              {!editingUser && (
                <section className="create-permissions">
                  <div className="permission-section-heading">
                    <div>
                      <h3>Phân quyền tài khoản mới</h3>
                      <p>
                        Đánh dấu để cấp quyền, bỏ đánh dấu để thu hồi quyền.
                        Quyền mặc định được xác định theo vai trò đã chọn.
                      </p>
                    </div>
                  </div>

                  <div className="permission-selection-summary">
                    <strong>{selectedPermissions.length}</strong>
                    <span>/ {PERMISSION_OPTIONS.length} quyền được chọn</span>
                  </div>

                  <PermissionCheckboxTable
                    groups={PERMISSION_GROUPS}
                    selectedPermissions={selectedPermissions}
                    onToggle={handlePermissionToggle}
                    disabled={saving}
                  />
                </section>
              )}

              <div className="form-group">
                <label htmlFor="password">
                  {editingUser ? "Mật khẩu mới" : "Mật khẩu"}
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={editingUser ? undefined : 6}
                  placeholder={
                    editingUser ? "Để trống nếu không đổi" : "Tối thiểu 6 ký tự"
                  }
                  required={!editingUser}
                />
              </div>

              <div className="user-form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editingUser
                      ? "Lưu thay đổi"
                      : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {permissionUser && (
        <UserPermissionsModal
          user={permissionUser}
          onClose={() => setPermissionUser(null)}
          onSaved={loadUsers}
        />
      )}
    </div>
  );
}

function getRoleClass(role) {
  switch (role) {
    case "Admin":
      return "admin";

    case "Manager":
      return "manager";

    default:
      return "staff";
  }
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
