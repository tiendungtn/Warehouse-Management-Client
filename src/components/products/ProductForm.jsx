import { useEffect, useState } from "react";

export default function ProductForm({
  product,
  categories,
  loading,
  onSubmit,
  onCancel,
}) {
  const isEditing = !!product;

  const [form, setForm] = useState({
    productCode: "",
    productName: "",
    categoryId: "",
    unit: "",
    price: "",
    stockQuantity: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setForm({
        productCode: product.productCode ?? "",

        productName: product.productName ?? "",

        categoryId: product.categoryId ?? "",

        unit: product.unit ?? "",

        price: product.price ?? "",

        stockQuantity: product.stockQuantity ?? "",
      });
    } else {
      setForm({
        productCode: "",
        productName: "",
        categoryId: "",
        unit: "",
        price: "",
        stockQuantity: "",
      });
    }

    setErrors({});
  }, [product]);

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
    const newErrors = {};

    if (!form.productCode.trim()) {
      newErrors.productCode = "Vui lòng nhập mã sản phẩm.";
    }

    if (!form.productName.trim()) {
      newErrors.productName = "Vui lòng nhập tên sản phẩm.";
    }

    if (!form.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục.";
    }

    if (!form.unit.trim()) {
      newErrors.unit = "Vui lòng nhập đơn vị.";
    }

    if (form.price === "" || Number(form.price) < 0) {
      newErrors.price = "Giá phải lớn hơn hoặc bằng 0.";
    }

    if (
      form.stockQuantity === "" ||
      Number(form.stockQuantity) < 0 ||
      !Number.isInteger(Number(form.stockQuantity))
    ) {
      newErrors.stockQuantity = "Tồn kho phải là số nguyên không âm.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const data = {
      productCode: form.productCode.trim(),

      productName: form.productName.trim(),

      categoryId: Number(form.categoryId),

      unit: form.unit.trim(),

      price: Number(form.price),

      stockQuantity: Number(form.stockQuantity),
    };

    onSubmit(data);
  };

  return (
    <div className="modal-overlay">
      <div className="product-modal">
        <div className="modal-header">
          <div>
            <h3>{isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</h3>

            <p>
              {isEditing
                ? "Cập nhật thông tin sản phẩm."
                : "Nhập thông tin sản phẩm mới."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onCancel}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormField
              label="Mã sản phẩm"
              name="productCode"
              value={form.productCode}
              onChange={handleChange}
              error={errors.productCode}
              placeholder="VD: SP001"
              disabled={loading}
            />

            <FormField
              label="Tên sản phẩm"
              name="productName"
              value={form.productName}
              onChange={handleChange}
              error={errors.productName}
              placeholder="Nhập tên sản phẩm"
              disabled={loading}
            />

            <div className="form-group">
              <label htmlFor="categoryId">Danh mục</label>

              <select
                id="categoryId"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">-- Chọn danh mục --</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>

              {errors.categoryId && (
                <span className="field-error">{errors.categoryId}</span>
              )}
            </div>

            <FormField
              label="Đơn vị"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              error={errors.unit}
              placeholder="VD: Cái, Hộp, Kg"
              disabled={loading}
            />

            <FormField
              label="Đơn giá"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              error={errors.price}
              placeholder="0"
              min="0"
              step="0.01"
              disabled={loading}
            />

            <FormField
              label="Số lượng tồn kho"
              name="stockQuantity"
              type="number"
              value={form.stockQuantity}
              onChange={handleChange}
              error={errors.stockQuantity}
              placeholder="0"
              min="0"
              step="1"
              disabled={loading}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
              disabled={loading}
            >
              Hủy
            </button>

            <button type="submit" className="primary-button" disabled={loading}>
              {loading
                ? "Đang lưu..."
                : isEditing
                  ? "Lưu thay đổi"
                  : "Thêm sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  disabled,
  min,
  step,
}) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
      />

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
