import { Edit, Trash2, PackageOpen } from "lucide-react";

export default function ProductTable({ products, userRole, onEdit, onDelete }) {
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
            <th>ID</th>
            <th>Mã sản phẩm</th>
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Đơn vị</th>
            <th>Đơn giá</th>
            <th>Tồn kho</th>

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
