import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function IssueForm({ products, onSubmit, onClose, submitting }) {
  const [reason, setReason] = useState("");

  const [items, setItems] = useState([
    {
      productId: "",
      quantity: 1,
    },
  ]);

  const availableProducts = useMemo(() => {
    return products || [];
  }, [products]);

  useEffect(() => {
    if (availableProducts.length === 0) {
      return;
    }

    setItems((current) =>
      current.map((item) => {
        if (item.productId) {
          return item;
        }

        return {
          ...item,
          productId: String(availableProducts[0].id),
        };
      }),
    );
  }, [availableProducts]);

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        productId:
          availableProducts.length > 0 ? String(availableProducts[0].id) : "",
        quantity: 1,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((_, i) => i !== index);
    });
  };

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!reason.trim()) {
      return;
    }

    const validItems = items
      .map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      }))
      .filter((item) => item.productId > 0 && item.quantity > 0);

    if (validItems.length === 0) {
      return;
    }

    await onSubmit({
      reason: reason.trim(),
      items: validItems,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <div>
            <h2>Tạo phiếu xuất</h2>
            <p>Nhập thông tin phiếu xuất kho</p>
          </div>

          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="issue-reason">Lý do xuất kho</label>

            <textarea
              id="issue-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập lý do xuất kho..."
              maxLength={255}
              rows={3}
              required
            />
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div>
                <h3>Sản phẩm xuất kho</h3>
                <p>Kiểm tra tồn kho trước khi tạo phiếu</p>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={addItem}
              >
                <Plus size={17} />
                Thêm sản phẩm
              </button>
            </div>

            <div className="issue-items">
              {items.map((item, index) => {
                const product = products.find(
                  (x) => Number(x.id) === Number(item.productId),
                );

                return (
                  <div className="issue-item-row" key={index}>
                    <div className="form-group">
                      <label>Sản phẩm</label>

                      <select
                        value={item.productId}
                        onChange={(event) =>
                          updateItem(index, "productId", event.target.value)
                        }
                        required
                      >
                        <option value="">-- Chọn sản phẩm --</option>

                        {availableProducts.map((productItem) => (
                          <option key={productItem.id} value={productItem.id}>
                            {productItem.productCode} -{" "}
                            {productItem.productName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>SL tồn</label>

                      <input
                        type="text"
                        value={product?.stockQuantity ?? 0}
                        readOnly
                      />
                    </div>

                    <div className="form-group">
                      <label>Số lượng</label>

                      <input
                        type="number"
                        min="1"
                        max={product?.stockQuantity ?? undefined}
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(index, "quantity", event.target.value)
                        }
                        required
                      />
                    </div>

                    <button
                      type="button"
                      className="icon-button danger"
                      title="Xóa sản phẩm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Đang tạo..." : "Tạo phiếu xuất"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
