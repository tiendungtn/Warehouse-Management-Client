import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  categoryName: "",
  description: "",
};

export default function CategoryForm({ category, loading, onSubmit, onClose }) {
  const [form, setForm] = useState(initialForm);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setForm({
        categoryName: category.categoryName || "",
        description: category.description || "",
      });
    } else {
      setForm(initialForm);
    }

    setErrors({});
  }, [category]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.categoryName.trim()) {
      nextErrors.categoryName = "Vui lòng nhập tên danh mục.";
    } else if (form.categoryName.trim().length > 100) {
      nextErrors.categoryName = "Tên danh mục không được vượt quá 100 ký tự.";
    }

    if (form.description.trim().length > 500) {
      nextErrors.description = "Mô tả không được vượt quá 500 ký tự.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      categoryName: form.categoryName.trim(),
      description: form.description.trim() || null,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="category-modal">
        <div className="modal-header">
          <div>
            <h3>{category ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</h3>

            <p>
              {category
                ? "Cập nhật thông tin danh mục."
                : "Tạo danh mục sản phẩm mới."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form className="category-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="categoryName">
              Tên danh mục <span className="required">*</span>
            </label>

            <input
              id="categoryName"
              name="categoryName"
              type="text"
              value={form.categoryName}
              onChange={handleChange}
              placeholder=""
              disabled={loading}
              autoFocus
            />

            {errors.categoryName && (
              <span className="field-error">{errors.categoryName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder=""
              rows={5}
              disabled={loading}
            />

            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>

            <button type="submit" className="primary-button" disabled={loading}>
              {loading
                ? "Đang lưu..."
                : category
                  ? "Lưu thay đổi"
                  : "Thêm danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
