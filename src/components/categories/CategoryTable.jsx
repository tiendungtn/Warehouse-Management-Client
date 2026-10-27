import { Edit, Trash2, Tags, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export default function CategoryTable({
  categories,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}) {
  if (!categories.length) {
    return (
      <div className="empty-state">
        <Tags size={42} />

        <h3>Chưa có danh mục</h3>

        <p>Hiện tại chưa có danh mục sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <SortableHeader label="ID" field="id" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
            <SortableHeader label="TÊN DANH MỤC" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
            <th>MÔ TẢ</th>
            <SortableHeader label="SỐ SẢN PHẨM" field="count" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />

            {(canEdit || canDelete) && (
              <th className="actions-column">THAO TÁC</th>
            )}
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.id}</td>

              <td>
                <strong>{category.categoryName}</strong>
              </td>

              <td>
                {category.description || (
                  <span className="muted-text">Chưa có mô tả</span>
                )}
              </td>

              <td>
                <span className="category-count-badge">
                  {category.productCount ?? 0}
                </span>
              </td>

              {(canEdit || canDelete) && (
                <td>
                  <div className="table-actions">
                    {canEdit && (
                      <button
                        type="button"
                        className="icon-button edit"
                        title="Chỉnh sửa"
                        onClick={() => onEdit(category)}
                      >
                        <Edit size={16} />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        className="icon-button delete"
                        title="Xóa"
                        onClick={() => onDelete(category)}
                      >
                        <Trash2 size={16} />
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
