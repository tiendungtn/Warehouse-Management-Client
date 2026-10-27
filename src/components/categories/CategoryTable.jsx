import {
  Edit,
  Trash2,
  Tags,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function CategoryTable({
  categories,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  sortBy = "name",
  sortOrder = "asc",
  onSort,
}) {
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
            {renderSortHeader("ID", "id")}
            {renderSortHeader("Tên danh mục", "name")}
            <th>Mô tả</th>
            {renderSortHeader("Số sản phẩm", "count")}
            {(canEdit || canDelete) && (
              <th className="actions-column">Thao tác</th>
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
