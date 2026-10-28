import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  LoaderCircle,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  getUserPermissionsApi,
  updateUserPermissionsApi,
} from "../../api/userApi";
import PermissionCheckboxTable from "./PermissionCheckboxTable";
import "../../styles/users.css";

const PERMISSION_GROUPS = [
  {
    name: "Sản phẩm",
    items: [
      ["products.view", "Xem sản phẩm"],
      ["products.create", "Thêm sản phẩm"],
      ["products.edit", "Sửa sản phẩm"],
      ["products.delete", "Xóa sản phẩm"],
    ],
  },
  {
    name: "Danh mục",
    items: [
      ["categories.view", "Xem danh mục"],
      ["categories.create", "Thêm danh mục"],
      ["categories.edit", "Sửa danh mục"],
      ["categories.delete", "Xóa danh mục"],
    ],
  },
  {
    name: "Phiếu nhập",
    items: [
      ["receipts.view", "Xem phiếu nhập"],
      ["receipts.create", "Tạo phiếu nhập"],
      ["receipts.edit", "Sửa phiếu nhập"],
      ["receipts.delete", "Xóa phiếu nhập"],
      ["receipts.approve", "Duyệt phiếu nhập"],
    ],
  },
  {
    name: "Phiếu xuất",
    items: [
      ["issues.view", "Xem phiếu xuất"],
      ["issues.create", "Tạo phiếu xuất"],
      ["issues.edit", "Sửa phiếu xuất"],
      ["issues.delete", "Xóa phiếu xuất"],
      ["issues.approve", "Duyệt phiếu xuất"],
    ],
  },
  {
    name: "Hóa đơn",
    items: [
      ["invoices.view", "Xem hóa đơn"],
      ["invoices.create", "Tạo hóa đơn"],
      ["invoices.edit", "Sửa hóa đơn"],
      ["invoices.delete", "Xóa hóa đơn"],
      ["invoices.download", "Tải hóa đơn"],
    ],
  },
  {
    name: "Báo cáo",
    items: [
      ["reports.stock.view", "Xem báo cáo tồn kho"],
      ["reports.stock.export", "Xuất báo cáo tồn kho"],
      ["reports.revenue.view", "Xem báo cáo doanh thu"],
    ],
  },
  {
    name: "Người dùng",
    items: [
      ["users.view", "Xem người dùng"],
      ["users.create", "Tạo người dùng"],
      ["users.edit", "Sửa người dùng"],
      ["users.lock", "Khóa người dùng"],
      ["users.permissions.manage", "Quản lý phân quyền"],
    ],
  },
  {
    name: "Vai trò và kiểm toán",
    items: [
      ["roles.view", "Xem vai trò"],
      ["roles.create", "Tạo vai trò"],
      ["roles.edit", "Sửa vai trò"],
      ["roles.delete", "Xóa vai trò"],
      ["audit.view", "Xem nhật ký kiểm toán"],
    ],
  },
];

export default function UserPermissionsModal({ user, onClose, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [rolePermissions, setRolePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [apiSupportsEditor, setApiSupportsEditor] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getUserPermissionsApi(user.id);

        if (!active) return;

        if (
          !data ||
          !Array.isArray(data.rolePermissions) ||
          !Array.isArray(data.effectivePermissions)
        ) {
          throw new Error(
            "API chưa trả về rolePermissions và effectivePermissions đúng định dạng.",
          );
        }

        setRolePermissions(data.rolePermissions);
        setSelectedPermissions(data.effectivePermissions);
        setApiSupportsEditor(true);
      } catch (err) {
        if (!active) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Không thể tải cấu hình phân quyền.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [user.id]);

  const handleToggle = (code, checked) => {
    setSelectedPermissions((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(code);
      } else {
        next.delete(code);
      }

      return [...next];
    });
  };

  const permissionOverrides = useMemo(() => {
    const roleSet = new Set(rolePermissions);
    const selectedSet = new Set(selectedPermissions);

    return PERMISSION_GROUPS.flatMap((group) =>
      group.items.flatMap(([permissionCode]) => {
        const roleAllows = roleSet.has(permissionCode);
        const shouldAllow = selectedSet.has(permissionCode);

        if (roleAllows === shouldAllow) return [];

        return [
          {
            permissionCode,
            effect: shouldAllow ? "Grant" : "Deny",
            reason: null,
          },
        ];
      }),
    );
  }, [rolePermissions, selectedPermissions]);

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");

    if (!apiSupportsEditor) {
      setError("Không thể lưu vì chưa tải được cấu hình quyền hiện tại.");
      return;
    }

    try {
      setSaving(true);

      await updateUserPermissionsApi(user.id, {
        permissionMode: permissionOverrides.length > 0 ? "Custom" : "RoleBased",
        permissionOverrides,
      });

      await onSaved?.();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể lưu cấu hình phân quyền.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="permission-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        className="permission-modal permission-matrix-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="permission-modal-title"
      >
        <header className="permission-modal-header">
          <div className="permission-heading-icon">
            <ShieldCheck size={22} />
          </div>

          <div className="permission-heading-text">
            <h2 id="permission-modal-title">Phân quyền người dùng</h2>
            <p>
              {user.fullname} · @{user.username} · {user.role}
            </p>
          </div>

          <button
            type="button"
            className="permission-icon-button"
            aria-label="Đóng"
            onClick={onClose}
            disabled={saving}
          >
            <X size={19} />
          </button>
        </header>

        {loading ? (
          <div className="permission-loading">
            <LoaderCircle className="permission-spinner" size={22} />
            Đang tải cấu hình phân quyền...
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="permission-modal-body">
              {error && (
                <div className="permission-alert permission-alert-error">
                  <AlertTriangle size={17} />
                  <span>{error}</span>
                </div>
              )}

              <section className="permission-section">
                <div className="permission-section-heading">
                  <div>
                    <h3>Quyền truy cập</h3>
                    <p>
                      Bật checkbox để cấp quyền, bỏ chọn để thu hồi quyền. Thay
                      đổi chỉ được áp dụng sau khi lưu.
                    </p>
                  </div>
                </div>

                <div className="permission-selection-summary">
                  <strong>{selectedPermissions.length}</strong>
                  <span>
                    /{" "}
                    {PERMISSION_GROUPS.reduce(
                      (total, group) => total + group.items.length,
                      0,
                    )}{" "}
                    quyền được chọn
                  </span>
                </div>

                <PermissionCheckboxTable
                  groups={PERMISSION_GROUPS}
                  selectedPermissions={selectedPermissions}
                  onToggle={handleToggle}
                  disabled={saving || !apiSupportsEditor}
                />
              </section>
            </div>

            <footer className="permission-modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
                disabled={saving}
              >
                Đóng
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving || loading || !apiSupportsEditor}
              >
                {saving ? (
                  <>
                    <LoaderCircle size={16} className="permission-spinner" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Lưu phân quyền
                  </>
                )}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}
