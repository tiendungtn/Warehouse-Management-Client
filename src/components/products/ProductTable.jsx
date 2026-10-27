import {
  Edit,
  Trash2,
  PackageOpen,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function ProductTable({
  products,
  userRole,
  onEdit,
  onDelete,
  sortBy = "name",
  sortOrder = "asc",
  onSort,
}) {
  const canEdit = userRole === "Admin" || userRole === "Manager";
  const canDelete = userRole === "Admin";

  const renderSortHeader = (label, key) => {
    const active = sortBy === key;

    return (
      <th
        key={key}
        aria-sort={
          active ? (sortOrder === "asc" ? "ascending" : "descending") : "none"
        }
      >
        <button
          type="button"
          className={`table-sort-button${active ? " active" : ""}`}
          onClick={() => onSort?.(key)}
          title={`Sắp xếp theo ${label}`}
        >
          <span>{label}</span>
          {active ? (
            sortOrder === "asc" ? (
              <ArrowUp size={14} />
            ) : (
              <ArrowDown size={14} />
            )
          ) : (
            <ArrowUpDown size={14} />
          )}
        </button>
      </th>
    );
  };

  if (!products.length) {
    return (
      <div className="empty-state">
        <PackageOpen size={42} />
        <h3>Không có sản phẩm</h3>
        <p>Chưa tìm thấy sản phẩm phù hợp.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {renderSortHeader("ID", "id")}
            {renderSortHeader("Mã sản phẩm", "code")}
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Đơn vị</th>
            {renderSortHeader("Đơn giá", "price")}
            {renderSortHeader("Tồn kho", "stock")}
            {(canEdit || canDelete) && (
              <th className="actions-column">Thao tác</th>
            )}
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>
                <strong>{product.productCode}</strong>
              </td>
              <td>{product.productName}</td>
              <td>{product.categoryName}</td>
              <td>{product.unit}</td>
              <td>{formatCurrency(product.price)}</td>
              <td>
                <StockBadge quantity={product.stockQuantity} />
              </td>

              {(canEdit || canDelete) && (
                <td>
                  <div className="table-actions">
                    {canEdit && (
                      <button
                        type="button"
                        className="icon-button edit"
                        title="Sửa"
                        onClick={() => onEdit(product)}
                      >
                        <Edit size={17} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        className="icon-button delete"
                        title="Xóa"
                        onClick={() => onDelete(product)}
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StockBadge({ quantity }) {
  if (quantity === 0) {
    return <span className="stock-badge out">Hết hàng</span>;
  }
  if (quantity <= 10) {
    return <span className="stock-badge low">{quantity} — Sắp hết</span>;
  }
  return <span className="stock-badge normal">{quantity}</span>;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}
