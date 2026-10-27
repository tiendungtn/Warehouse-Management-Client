import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import "../../styles/categories.css";
import "../../styles/pagination.css";
import "../../styles/category-search.css";

import {
  searchCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "../../api/categoryApi";

import useSearchFilters from "../../hooks/useSearchFilters";

import CategoryTable from "../../components/categories/CategoryTable";
import CategoryForm from "../../components/categories/CategoryForm";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";

import { useAuth } from "../../context/AuthContext";

const DEFAULT_FILTERS = {
  search: "",
  hasProducts: "",
  minProductCount: "",
  maxProductCount: "",
  sortBy: "name",
  sortOrder: "asc",
};

export default function CategoriesPage() {
  const { user } = useAuth();
  const { filters, updateFilters, resetFilters } = useSearchFilters();
  const [searchParams] = useSearchParams();

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
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const currentPage = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.max(1, Number(filters.pageSize) || 10);

  useEffect(() => {
    setDraft({
      ...DEFAULT_FILTERS,
      ...filters,
    });
  }, [filters]);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = Object.fromEntries(searchParams.entries());

      const result = await searchCategoriesApi({
        ...params,
        page: Number(params.page) || 1,
        pageSize: Number(params.pageSize) || 10,
      });

      setCategories(result.items ?? []);
      setTotalItems(result.totalItems ?? 0);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh sách danh mục."));
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

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
      (draft.minProductCount !== "" && Number(draft.minProductCount) < 0) ||
      (draft.maxProductCount !== "" && Number(draft.maxProductCount) < 0)
    ) {
      setError("Số lượng sản phẩm không được âm.");
      return;
    }

    if (
      draft.minProductCount !== "" &&
      draft.maxProductCount !== "" &&
      Number(draft.minProductCount) > Number(draft.maxProductCount)
    ) {
      setError("Số lượng sản phẩm tối thiểu không được lớn hơn tối đa.");
      return;
    }

    setError("");

    updateFilters({
      search: draft.search.trim(),
      hasProducts: draft.hasProducts,
      minProductCount: draft.minProductCount,
      maxProductCount: draft.maxProductCount,
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

  const handleSort = (field) => {
    const currentSortBy = String(filters.sortBy || "name");
    const currentSortOrder = String(filters.sortOrder || "asc");

    const nextSortOrder =
      currentSortBy === field && currentSortOrder === "asc" ? "desc" : "asc";

    updateFilters({
      sortBy: field,
      sortOrder: nextSortOrder,
      page: 1,
    });
  };

  const handlePageChange = (page) => {
    updateFilters({ page }, { resetPage: false });
  };

  const handlePageSizeChange = (size) => {
    updateFilters({ pageSize: size, page: 1 }, { resetPage: false });
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    if (formLoading) return;

    setShowForm(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (data) => {
    try {
      setFormLoading(true);
      setError("");

      if (editingCategory) {
        await updateCategoryApi(editingCategory.id, data);
      } else {
        await createCategoryApi(data);
      }

      setShowForm(false);
      setEditingCategory(null);

      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err, "Không thể lưu danh mục."));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      setFormLoading(true);
      setError("");

      await deleteCategoryApi(deletingCategory.id);
      setDeletingCategory(null);

      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err, "Không thể xóa danh mục."));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h2>Quản lý danh mục</h2>
          <p>Quản lý danh mục và các sản phẩm liên kết.</p>
        </div>

        {canManage && (
          <button
            type="button"
            className="primary-button"
            onClick={handleOpenCreate}
          >
            <Plus size={18} />
            Thêm danh mục
          </button>
        )}
      </div>

      {error && (
        <div className="page-alert">
          <ErrorMessage message={error} onRetry={loadCategories} />
        </div>
      )}

      <div className="content-card">
        <form className="category-search-panel" onSubmit={handleSearch}>
          <div className="category-search-main">
            <div className="search-input-wrapper category-keyword">
              <Search size={18} />
              <input
                type="search"
                value={draft.search}
                onChange={(event) => setField("search", event.target.value)}
                placeholder="Tìm theo tên hoặc mô tả danh mục..."
                aria-label="Tìm kiếm danh mục"
              />
            </div>

            <button type="submit" className="primary-button">
              <Search size={16} />
              Tìm kiếm
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowAdvanced((previous) => !previous)}
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
            <div className="category-advanced-filters">
              <div className="category-filter-field">
                <label htmlFor="category-has-products">Sản phẩm liên kết</label>
                <select
                  id="category-has-products"
                  value={draft.hasProducts}
                  onChange={(event) =>
                    setField("hasProducts", event.target.value)
                  }
                >
                  <option value="">Tất cả danh mục</option>
                  <option value="true">Có sản phẩm</option>
                  <option value="false">Chưa có sản phẩm</option>
                </select>
              </div>

              <div className="category-filter-field">
                <label htmlFor="category-min-count">Số sản phẩm từ</label>
                <input
                  id="category-min-count"
                  type="number"
                  min="0"
                  value={draft.minProductCount}
                  onChange={(event) =>
                    setField("minProductCount", event.target.value)
                  }
                  placeholder="Không giới hạn"
                />
              </div>

              <div className="category-filter-field">
                <label htmlFor="category-max-count">Số sản phẩm đến</label>
                <input
                  id="category-max-count"
                  type="number"
                  min="0"
                  value={draft.maxProductCount}
                  onChange={(event) =>
                    setField("maxProductCount", event.target.value)
                  }
                  placeholder="Không giới hạn"
                />
              </div>

              <div className="category-filter-field">
                <label htmlFor="category-sort-by">Sắp xếp theo</label>
                <select
                  id="category-sort-by"
                  value={draft.sortBy}
                  onChange={(event) => setField("sortBy", event.target.value)}
                >
                  <option value="name">Tên danh mục</option>
                  <option value="count">Số lượng sản phẩm</option>
                </select>
              </div>

              <div className="category-filter-field">
                <label htmlFor="category-sort-order">Thứ tự</label>
                <select
                  id="category-sort-order"
                  value={draft.sortOrder}
                  onChange={(event) =>
                    setField("sortOrder", event.target.value)
                  }
                >
                  <option value="asc">Tăng dần</option>
                  <option value="desc">Giảm dần</option>
                </select>
              </div>

              <div className="category-filter-actions">
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
          <div className="product-count">{totalItems} danh mục</div>

          <button
            type="button"
            className="icon-button"
            title="Làm mới danh sách"
            onClick={loadCategories}
            disabled={loading}
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <Loading text="Đang tải danh mục..." />
        ) : (
          <>
            <CategoryTable
              categories={categories}
              canEdit={canManage}
              canDelete={canManage}
              onEdit={handleOpenEdit}
              onDelete={setDeletingCategory}
              sortBy={String(filters.sortBy || "name")}
              sortOrder={String(filters.sortOrder || "asc")}
              onSort={handleSort}
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
        <CategoryForm
          category={editingCategory}
          loading={formLoading}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}

      {deletingCategory && (
        <ConfirmDialog
          title="Xóa danh mục?"
          message={
            <>
              Bạn có chắc muốn xóa danh mục{" "}
              <strong>{deletingCategory.categoryName}</strong>? Nếu danh mục
              đang có sản phẩm liên kết, hệ thống sẽ không cho phép xóa.
            </>
          }
          confirmText={formLoading ? "Đang xóa..." : "Xóa danh mục"}
          cancelText="Hủy"
          loading={formLoading}
          onConfirm={handleDelete}
          onCancel={() => {
            if (!formLoading) setDeletingCategory(null);
          }}
        />
      )}
    </div>
  );
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.message ||
    fallback
  );
}
