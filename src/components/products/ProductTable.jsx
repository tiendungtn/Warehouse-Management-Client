import { Edit, Trash2, PackageOpen, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export default function ProductTable({ products, userRole, onEdit, onDelete, sortBy, sortOrder, onSort }) {
  const canEdit = userRole === "Admin" || userRole === "Manager";

  const canDelete = userRole === "Admin";

  if (products.length === 0) {
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
            <SortableHeader label="ID" field="id" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
            <SortableHeader label="Mã sản phẩm" field="code" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Đơn vị</th>
            <SortableHeader label="Đơn giá" field="price" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
            <SortableHeader label="Tồn kho" field="stock" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />

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

function SortableHeader({ label, field, sortBy, sortOrder, onSort }) {
  const active = sortBy === field;
  const Icon = active ? (sortOrder === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th aria-sort={active ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" className="table-sort-button" onClick={() => onSort(field)}
        title={`Sắp xếp theo ${label}`} aria-label={`Sắp xếp theo ${label}`}>
        <span>{label}</span><Icon size={14} aria-hidden="true" />
      </button>
    </th>
  );
}
