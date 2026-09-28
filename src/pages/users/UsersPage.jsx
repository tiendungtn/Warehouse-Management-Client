import { useEffect, useState } from "react";
import { Edit, Plus, Search, Trash2, UserRound, X } from "lucide-react";

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

const initialForm = {
  username: "",
  password: "",
  fullname: "",
  role: "Staff",
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
        await createUserApi({
          username: form.username,
          password: form.password,
          fullname: form.fullname,
          role: form.role,
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
