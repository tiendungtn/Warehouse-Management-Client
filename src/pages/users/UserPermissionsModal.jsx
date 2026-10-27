import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import {
  getUserPermissionsApi,
  updateUserPermissionsApi,
} from "../../api/userApi";

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

// Ma trận hiển thị theo role hiện được thống nhất trong kế hoạch.
// Đây là dữ liệu hiển thị ở frontend, không thay thế kiểm tra quyền backend.
const ROLE_BASELINES = {
  Admin: PERMISSION_GROUPS.flatMap((group) =>
    group.items.map(([code]) => code),
  ),

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

const emptyOverride = () => ({
  permissionCode: "",
  effect: "Grant",
  reason: "",
});

export default function UserPermissionsModal({ user, onClose, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [permissionMode, setPermissionMode] = useState("RoleBased");
  const [overrides, setOverrides] = useState([]);
  const [effectivePermissions, setEffectivePermissions] = useState([]);
  const [apiSupportsEditor, setApiSupportsEditor] = useState(false);

  const [rolePermissions, setRolePermissions] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        setNotice("");

        const data = await getUserPermissionsApi(user.id);
        if (!active) return;

        if (!data || !Array.isArray(data.rolePermissions)) {
          throw new Error(
            "API chưa trả về cấu hình phân quyền đúng định dạng.",
          );
        }
        setRolePermissions(data.rolePermissions);

        setPermissionMode(
          data.permissionMode === "Custom" ? "Custom" : "RoleBased",
        );

        setOverrides(
          Array.isArray(data.permissionOverrides)
            ? data.permissionOverrides.map((item) => ({
                permissionCode: item.permissionCode,
                effect: item.effect,
                reason: item.reason ?? "",
              }))
            : [],
        );

        setEffectivePermissions(
          Array.isArray(data.effectivePermissions)
            ? data.effectivePermissions
            : [],
        );

        setApiSupportsEditor(true);
        setNotice("");
      } catch (err) {
        if (!active) return;

        setError(
          err?.response?.data?.message || "Không thể tải cấu hình phân quyền.",
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

  const overrideCodes = useMemo(
    () => overrides.map((item) => item.permissionCode).filter(Boolean),
    [overrides],
  );

  const validationError = useMemo(() => {
    if (permissionMode === "RoleBased" && overrides.length > 0) {
      return "RoleBased không được chứa quyền ghi đè cá nhân.";
    }

    if (permissionMode === "Custom" && overrides.length > 2) {
      return "Chỉ được cấu hình tối đa 2 quyền ghi đè.";
    }

    const seen = new Set();

    for (const item of overrides) {
      const code = item.permissionCode.trim().toLowerCase();

      if (!code) return "Vui lòng chọn quyền cho mỗi override.";

      if (seen.has(code)) return "Không được chọn trùng một quyền.";

      seen.add(code);

      const roleHasPermission = rolePermissions.includes(item.permissionCode);

      if (
        (item.effect === "Grant" && roleHasPermission) ||
        (item.effect === "Deny" && !roleHasPermission)
      ) {
        return `${item.permissionCode} đã trùng với quyền cơ sở của vai trò.`;
      }
    }

    return "";
  }, [permissionMode, overrides, rolePermissions]);

  const previewPermissions = useMemo(() => {
    const result = new Set(rolePermissions);

    if (permissionMode === "Custom") {
      for (const item of overrides) {
        if (!item.permissionCode) continue;

        if (item.effect === "Deny") {
          result.delete(item.permissionCode);
        } else {
          result.add(item.permissionCode);
        }
      }
    }

    return result;
  }, [permissionMode, overrides, rolePermissions]);

  const addOverride = () => {
    setError("");
    setNotice("");

    if (overrides.length >= 2) {
      setError("Chỉ được cấu hình tối đa 2 quyền ghi đè.");
      return;
    }

    setPermissionMode("Custom");
    setOverrides((current) => [...current, emptyOverride()]);
  };

  const updateOverride = (index, field, value) => {
    setOverrides((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeOverride = (index) => {
    setOverrides((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleModeChange = (mode) => {
    setError("");
    setNotice("");
    setPermissionMode(mode);

    // Khi chuyển về RoleBased, xóa override khỏi bản nháp.
    // Chỉ thay đổi dữ liệu local; chưa lưu xuống server.
    if (mode === "RoleBased") {
      setOverrides([]);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!apiSupportsEditor) {
      setError(
        "Chưa thể lưu: API chưa trả về cấu hình phân quyền hiện tại. Hãy cập nhật hợp đồng GET permissions ở backend trước.",
      );
      return;
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      await updateUserPermissionsApi(user.id, {
        permissionMode,
        permissionOverrides:
          permissionMode === "Custom"
            ? overrides.map((item) => ({
                permissionCode: item.permissionCode,
                effect: item.effect,
                reason: item.reason.trim() || null,
              }))
            : [],
      });

      await onSaved?.();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể lưu cấu hình phân quyền.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="permission-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <section
        className="permission-modal"
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

              {notice && (
                <div className="permission-alert permission-alert-warning">
                  <AlertTriangle size={17} />
                  <span>{notice}</span>
                </div>
              )}

              <section className="permission-section">
                <div className="permission-section-heading">
                  <div>
                    <h3>Chế độ phân quyền</h3>
                    <p>Quyết định cách tính quyền hiệu lực của tài khoản.</p>
                  </div>
                </div>

                <div className="permission-mode-options">
                  <label
                    className={`permission-mode-card ${
                      permissionMode === "RoleBased" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="permissionMode"
                      value="RoleBased"
                      checked={permissionMode === "RoleBased"}
                      onChange={() => handleModeChange("RoleBased")}
                      disabled={!apiSupportsEditor}
                    />
                    <span className="permission-mode-copy">
                      <strong>Theo vai trò</strong>
                      <span>
                        Chỉ sử dụng quyền được gán cho role {user.role}.
                      </span>
                    </span>
                  </label>

                  <label
                    className={`permission-mode-card ${
                      permissionMode === "Custom" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="permissionMode"
                      value="Custom"
                      checked={permissionMode === "Custom"}
                      onChange={() => handleModeChange("Custom")}
                      disabled={!apiSupportsEditor}
                    />
                    <span className="permission-mode-copy">
                      <strong>Tùy chỉnh</strong>
                      <span>
                        Quyền cơ sở cộng tối đa 2 quyền override cá nhân.
                      </span>
                    </span>
                  </label>
                </div>
              </section>

              {permissionMode === "Custom" && (
                <section className="permission-section">
                  <div className="permission-section-heading permission-override-heading">
                    <div>
                      <h3>Quyền ghi đè cá nhân</h3>
                      <p>
                        {overrides.length}/2 quyền · Grant cấp thêm quyền, Deny
                        từ chối quyền cơ sở.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="permission-add-button"
                      onClick={addOverride}
                      disabled={overrides.length >= 2 || !apiSupportsEditor}
                    >
                      <Plus size={16} />
                      Thêm override
                    </button>
                  </div>

                  {overrides.length === 0 ? (
                    <div className="permission-empty-overrides">
                      Chưa có quyền ghi đè. Người dùng vẫn sử dụng quyền cơ sở
                      của vai trò.
                    </div>
                  ) : (
                    <div className="permission-override-list">
                      {overrides.map((item, index) => (
                        <div
                          className="permission-override-card"
                          key={`${index}-${item.permissionCode}`}
                        >
                          <div className="permission-override-top">
                            <span className="permission-override-number">
                              Override {index + 1}
                            </span>

                            <button
                              type="button"
                              className="permission-remove-button"
                              onClick={() => removeOverride(index)}
                              disabled={!apiSupportsEditor}
                              aria-label={`Xóa override ${index + 1}`}
                            >
                              <Trash2 size={15} />
                              Xóa
                            </button>
                          </div>

                          <div className="permission-override-fields">
                            <label>
                              <span>Quyền</span>
                              <select
                                value={item.permissionCode}
                                onChange={(event) =>
                                  updateOverride(
                                    index,
                                    "permissionCode",
                                    event.target.value,
                                  )
                                }
                                disabled={!apiSupportsEditor}
                                required
                              >
                                <option value="">Chọn quyền...</option>

                                {PERMISSION_GROUPS.map((group) => (
                                  <optgroup label={group.name} key={group.name}>
                                    {group.items.map(([code, label]) => (
                                      <option
                                        key={code}
                                        value={code}
                                        disabled={
                                          overrideCodes.includes(code) &&
                                          code !== item.permissionCode
                                        }
                                      >
                                        {label} ({code})
                                      </option>
                                    ))}
                                  </optgroup>
                                ))}
                              </select>
                            </label>

                            <label>
                              <span>Hiệu ứng</span>
                              <select
                                value={item.effect}
                                onChange={(event) =>
                                  updateOverride(
                                    index,
                                    "effect",
                                    event.target.value,
                                  )
                                }
                                disabled={!apiSupportsEditor}
                              >
                                <option value="Grant">Grant — Cấp quyền</option>
                                <option value="Deny">
                                  Deny — Từ chối quyền
                                </option>
                              </select>
                            </label>
                          </div>

                          <label className="permission-reason-field">
                            <span>Lý do (không bắt buộc)</span>
                            <input
                              type="text"
                              value={item.reason}
                              onChange={(event) =>
                                updateOverride(
                                  index,
                                  "reason",
                                  event.target.value,
                                )
                              }
                              maxLength={300}
                              placeholder=""
                              disabled={!apiSupportsEditor}
                            />
                            <small>{item.reason.length}/300 ký tự</small>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              <section className="permission-section">
                <div className="permission-section-heading">
                  <div>
                    <h3>Quyền hiệu lực dự kiến</h3>
                    <p>
                      {previewPermissions.size} quyền được phép theo cấu hình
                      đang chỉnh sửa.
                    </p>
                  </div>
                </div>

                <div className="permission-effective-groups">
                  {PERMISSION_GROUPS.map((group) => {
                    const items = group.items.filter(([code]) =>
                      previewPermissions.has(code),
                    );

                    return (
                      <div
                        className="permission-effective-group"
                        key={group.name}
                      >
                        <h4>{group.name}</h4>

                        {items.length === 0 ? (
                          <p className="permission-no-access">
                            Không có quyền trong nhóm này.
                          </p>
                        ) : (
                          <div className="permission-effective-list">
                            {items.map(([code, label]) => (
                              <span
                                className="permission-effective-chip"
                                key={code}
                                title={code}
                              >
                                <Check size={13} />
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                disabled={
                  saving ||
                  loading ||
                  !apiSupportsEditor ||
                  Boolean(validationError)
                }
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
