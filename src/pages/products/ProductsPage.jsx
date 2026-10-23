import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../../styles/product-search.css";
import {
  Plus,
  Search,
  RefreshCw,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  searchProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from "../../api/productApi";

import { getCategoriesApi } from "../../api/categoryApi";
import useSearchFilters from "../../hooks/useSearchFilters";

import ProductTable from "../../components/products/ProductTable";
import ProductForm from "../../components/products/ProductForm";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";

import { useAuth } from "../../context/AuthContext";
import "../../styles/pagination.css";

const DEFAULT_FILTERS = {
  search: "",
  categoryId: "",
  minPrice: "",
  maxPrice: "",
  minStock: "",
  maxStock: "",
  stockFilter: "all",
  sortBy: "name",
  sortOrder: "asc",
};

export default function ProductsPage() {
  const { user } = useAuth();
  const { filters, updateFilters, resetFilters } = useSearchFilters();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const [draft, setDraft] = useState({
    ...DEFAULT_FILTERS,
    ...filters,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const canCreateOrEdit = user?.role === "Admin" || user?.role === "Manager";
  const canDelete = user?.role === "Admin";

  const currentPage = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.max(1, Number(filters.pageSize) || 10);

  useEffect(() => {
    setDraft({
      ...DEFAULT_FILTERS,
      ...filters,
    });
  }, [filters]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = Object.fromEntries(searchParams.entries());

      const result = await searchProductsApi({
        ...params,
        page: Number(params.page) || 1,
        pageSize: Number(params.pageSize) || 10,
      });

      setProducts(result.items ?? []);
      setTotalItems(result.totalItems ?? 0);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh sách sản phẩm."));
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const loadCategories = useCallback(async () => {
    if (!canCreateOrEdit) return;

    try {
      const result = await getCategoriesApi();
      setCategories(result ?? []);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh mục sản phẩm."));
    }
  }, [canCreateOrEdit]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const setField = (name, value) => {
    setDraft((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (
      (draft.minPrice !== "" && Number(draft.minPrice) < 0) ||
      (draft.maxPrice !== "" && Number(draft.maxPrice) < 0) ||
      (draft.minStock !== "" && Number(draft.minStock) < 0) ||
      (draft.maxStock !== "" && Number(draft.maxStock) < 0)
    ) {
      setError("Giá và số lượng tồn không được âm.");
      return;
    }

    if (
      draft.minPrice !== "" &&
      draft.maxPrice !== "" &&
      Number(draft.minPrice) > Number(draft.maxPrice)
    ) {
      setError("Giá tối thiểu không được lớn hơn giá tối đa.");
      return;
    }

    if (
      draft.minStock !== "" &&
      draft.maxStock !== "" &&
      Number(draft.minStock) > Number(draft.maxStock)
    ) {
      setError("Tồn kho tối thiểu không được lớn hơn tồn kho tối đa.");
      return;
    }

    setError("");

    updateFilters({
      search: draft.search.trim(),
      categoryId: draft.categoryId,
      minPrice: draft.minPrice,
      maxPrice: draft.maxPrice,
      minStock: draft.minStock,
      maxStock: draft.maxStock,
      stockFilter: draft.stockFilter,
      sortBy: draft.sortBy,
      sortOrder: draft.sortOrder,
      page: 1,
    });
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_FILTERS });
    setError("");
    resetFilters();
  };

  const handlePageChange = (page) => {
    updateFilters({ page }, { resetPage: false });
  };

  const handlePageSizeChange = (size) => {
    updateFilters({ pageSize: size, page: 1 }, { resetPage: false });
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    if (formLoading) return;
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (data) => {
    try {
      setFormLoading(true);
      setError("");

      if (editingProduct) {
        await updateProductApi(editingProduct.id, data);
      } else {
        await createProductApi(data);
      }

      setShowForm(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      setError(getErrorMessage(err, "Không thể lưu sản phẩm."));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      setFormLoading(true);
      setError("");

      await deleteProductApi(deletingProduct.id);
      setDeletingProduct(null);
      await loadProducts();
    } catch (err) {
      setError(getErrorMessage(err, "Không thể xóa sản phẩm."));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header page-header-row">
        <div>
          <h2>Quản lý sản phẩm</h2>
          <p>Quản lý thông tin và số lượng sản phẩm trong kho.</p>
        </div>

        {canCreateOrEdit && (
          <button
            type="button"
            className="primary-button"
            onClick={handleOpenCreate}
          >
            <Plus size={18} />
            Thêm sản phẩm
          </button>
        )}
      </div>

      {error && (
        <div className="page-alert">
          <ErrorMessage message={error} onRetry={loadProducts} />
        </div>
      )}

      <div className="content-card">
        <form className="product-search-panel" onSubmit={handleSearch}>
          <div className="product-search-main">
            <div className="search-input-wrapper product-keyword">
              <Search size={18} />
              <input
                type="search"
                value={draft.search}
                onChange={(event) => setField("search", event.target.value)}
                placeholder="Tìm theo mã, tên hoặc đơn vị sản phẩm..."
                aria-label="Tìm kiếm sản phẩm"
              />
            </div>

            <button type="submit" className="primary-button">
              <Search size={16} />
              Tìm kiếm
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowAdvanced((value) => !value)}
              aria-expanded={showAdvanced}
            >
              <SlidersHorizontal size={16} />
              Bộ lọc
              {showAdvanced ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              Đặt lại
            </button>
          </div>

          {showAdvanced && (
            <div className="product-advanced-filters">
              <div className="product-filter-field">
                <label htmlFor="product-category">Danh mục</label>
                <select
                  id="product-category"
                  value={draft.categoryId}
                  onChange={(event) =>
                    setField("categoryId", event.target.value)
                  }
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="product-filter-field">
                <label htmlFor="product-stock-filter">Tình trạng tồn kho</label>
                <select
                  id="product-stock-filter"
                  value={draft.stockFilter}
                  onChange={(event) =>
                    setField("stockFilter", event.target.value)
                  }
                >
                  <option value="all">Tất cả</option>
                  <option value="outofstock">Hết hàng (0)</option>
                  <option value="lowstock">Sắp hết hàng (1–5)</option>
                  <option value="instock">Còn hàng (&gt; 5)</option>
                </select>
              </div>

              <div className="product-filter-field">
                <label htmlFor="product-min-price">Giá từ (₫)</label>
                <input
                  id="product-min-price"
                  type="number"
                  min="0"
                  value={draft.minPrice}
                  onChange={(event) => setField("minPrice", event.target.value)}
                  placeholder="Không giới hạn"
                />
              </div>

              <div className="product-filter-field">
                <label htmlFor="product-max-price">Giá đến (₫)</label>
                <input
                  id="product-max-price"
                  type="number"
                  min="0"
                  value={draft.maxPrice}
                  onChange={(event) => setField("maxPrice", event.target.value)}
                  placeholder="Không giới hạn"
                />
              </div>

              <div className="product-filter-field">
                <label htmlFor="product-min-stock">Tồn kho từ</label>
                <input
                  id="product-min-stock"
                  type="number"
                  min="0"
                  value={draft.minStock}
                  onChange={(event) => setField("minStock", event.target.value)}
                  placeholder="Không giới hạn"
                />
              </div>

              <div className="product-filter-field">
                <label htmlFor="product-max-stock">Tồn kho đến</label>
                <input
                  id="product-max-stock"
                  type="number"
                  min="0"
                  value={draft.maxStock}
                  onChange={(event) => setField("maxStock", event.target.value)}
                  placeholder="Không giới hạn"
                />
              </div>

              <div className="product-filter-field">
                <label htmlFor="product-sort-by">Sắp xếp theo</label>
                <select
                  id="product-sort-by"
                  value={draft.sortBy}
                  onChange={(event) => setField("sortBy", event.target.value)}
                >
                  <option value="name">Tên sản phẩm</option>
                  <option value="code">Mã sản phẩm</option>
                  <option value="price">Giá</option>
                  <option value="stock">Số lượng tồn</option>
                </select>
              </div>

              <div className="product-filter-field">
                <label htmlFor="product-sort-order">Thứ tự</label>
                <select
                  id="product-sort-order"
                  value={draft.sortOrder}
                  onChange={(event) =>
                    setField("sortOrder", event.target.value)
                  }
                >
                  <option value="asc">Tăng dần</option>
                  <option value="desc">Giảm dần</option>
                </select>
              </div>

              <div className="product-filter-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleReset}
                >
                  Xóa bộ lọc
                </button>
                <button type="submit" className="primary-button">
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="toolbar">
          <div className="product-count">{totalItems} sản phẩm</div>
          <button
            type="button"
            className="icon-button"
            title="Làm mới danh sách"
            onClick={loadProducts}
            disabled={loading}
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <Loading text="Đang tải sản phẩm..." />
        ) : (
          <>
            <ProductTable
              products={products}
              userRole={user?.role}
              onEdit={handleOpenEdit}
              onDelete={setDeletingProduct}
            />

            <Pagination
              totalItems={totalItems}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          loading={formLoading}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
        />
      )}

      <ConfirmDialog
        open={!!deletingProduct}
        title="Xóa sản phẩm"
        message={
          deletingProduct
            ? `Bạn có chắc muốn xóa sản phẩm "${deletingProduct.productName}" không?`
            : ""
        }
        confirmText={formLoading ? "Đang xóa..." : "Xóa sản phẩm"}
        cancelText="Hủy"
        danger
        onConfirm={handleDelete}
        onCancel={() => {
          if (!formLoading) setDeletingProduct(null);
        }}
      />
    </div>
  );
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}
