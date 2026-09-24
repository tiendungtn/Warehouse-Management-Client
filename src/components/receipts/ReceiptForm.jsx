import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

export default function ReceiptForm({
  open,
  products,
  onClose,
  onSubmit,
  submitting,
}) {
  const [supplierName, setSupplierName] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [items, setItems] = useState([
    {
      productId: "",
      quantity: 1,
      importPrice: 0,
    },
  ]);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const now = new Date();

    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setSupplierName("");
    setReceiptDate(localDate);
    setItems([
      {
        productId: "",
        quantity: 1,
        importPrice: 0,
      },
    ]);
    setError("");
  }, [open]);

  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => {
      return total + Number(item.quantity || 0) * Number(item.importPrice || 0);
    }, 0);
  }, [items]);

  if (!open) {
    return null;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        productId: "",
        quantity: 1,
        importPrice: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!supplierName.trim()) {
      setError("Vui lòng nhập tên nhà cung cấp.");
      return;
    }

    if (!receiptDate) {
      setError("Vui lòng chọn ngày nhập.");
      return;
    }

    if (items.length === 0) {
      setError("Phiếu nhập phải có ít nhất một sản phẩm.");
      return;
    }

    const normalizedItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
      importPrice: Number(item.importPrice),
    }));

    const invalidItem = normalizedItems.some(
      (item) => !item.productId || item.quantity <= 0 || item.importPrice < 0,
    );

    if (invalidItem) {
      setError("Vui lòng kiểm tra sản phẩm, số lượng và giá nhập.");
      return;
    }

    const duplicateProduct = normalizedItems.some(
      (item, index) =>
        normalizedItems.findIndex((x) => x.productId === item.productId) !==
        index,
    );

    if (duplicateProduct) {
      setError("Không được chọn trùng sản phẩm trong cùng một phiếu.");
      return;
    }

    const payload = {
      supplierName: supplierName.trim(),
      receiptDate: new Date(receiptDate).toISOString(),
      items: normalizedItems,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Không thể tạo phiếu nhập.",
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <div>
            <h2>Thêm phiếu nhập</h2>
            <p>Tạo phiếu nhập kho mới</p>
          </div>

          <button type="button" className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="supplierName">
                Nhà cung cấp <span>*</span>
              </label>

              <input
                id="supplierName"
                type="text"
                value={supplierName}
                maxLength={200}
                onChange={(event) => setSupplierName(event.target.value)}
                placeholder="Nhập tên nhà cung cấp"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="receiptDate">
                Ngày nhập <span>*</span>
              </label>

              <input
                id="receiptDate"
                type="datetime-local"
                value={receiptDate}
                onChange={(event) => setReceiptDate(event.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="receipt-items-header">
            <div>
              <h3>Danh sách sản phẩm</h3>
              <span>{items.length} sản phẩm</span>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={addItem}
              disabled={submitting}
            >
              <Plus size={16} />
              Thêm sản phẩm
            </button>
          </div>

          <div className="receipt-items-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "45%" }}>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Giá nhập</th>
                  <th>Thành tiền</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => {
                  const amount =
                    Number(item.quantity || 0) * Number(item.importPrice || 0);

                  return (
                    <tr key={index}>
                      <td>
                        <select
                          value={item.productId}
                          onChange={(event) =>
                            updateItem(index, "productId", event.target.value)
                          }
                          disabled={submitting}
                        >
                          <option value="">-- Chọn sản phẩm --</option>

                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.productCode} - {product.productName}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(index, "quantity", event.target.value)
                          }
                          disabled={submitting}
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.importPrice}
                          onChange={(event) =>
                            updateItem(index, "importPrice", event.target.value)
                          }
                          disabled={submitting}
                        />
                      </td>

                      <td className="currency-cell">
                        {formatCurrency(amount)}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="icon-button danger-button"
                          title="Xóa sản phẩm"
                          onClick={() => removeItem(index)}
                          disabled={submitting || items.length === 1}
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {error && <div className="page-alert error-alert">{error}</div>}

          <div className="receipt-total">
            <span>Tổng tiền nhập</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting ? "Đang lưu..." : "Tạo phiếu nhập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
