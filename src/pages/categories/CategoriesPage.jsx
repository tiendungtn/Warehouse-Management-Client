import { useEffect, useState } from "react";
import { Plus, RefreshCw, Search, Tags } from "lucide-react";

import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "../../api/categoryApi";

import CategoryTable from "../../components/categories/CategoryTable";
import CategoryForm from "../../components/categories/CategoryForm";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { useAuth } from "../../context/AuthContext";

export default function CategoriesPage() {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);

  const [deletingCategory, setDeletingCategory] = useState(null);

  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCategoriesApi();

      setCategories(data);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh sách danh mục."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    if (formLoading) {
      return;
    }

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

  const handleDeleteRequest = (category) => {
    setDeletingCategory(category);
  };

  const handleDelete = async () => {
    if (!deletingCategory) {
      return;
    }

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

  const filteredCategories = categories.filter((category) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return (
      category.categoryName?.toLowerCase().includes(keyword) ||
      category.description?.toLowerCase().includes(keyword)
    );
  });

  if (loading) {
    return <Loading text="Đang tải danh mục..." />;
  }

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h2>Quản lý danh mục</h2>

          <p>Quản lý các danh mục sản phẩm trong kho.</p>
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
          <ErrorMessage
            message={error}
            onRetry={() => {
              setError("");
              loadCategories();
            }}
          />
        </div>
      )}

      <div className="content-card">
        <div className="toolbar">
          <div className="search-form">
            <div className="search-input-wrapper">
              <Search size={18} />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên hoặc mô tả..."
              />
            </div>

            <button
              type="button"
              className="icon-button"
              title="Đặt lại"
              onClick={() => setSearch("")}
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="product-count">
            {filteredCategories.length} danh mục
          </div>
        </div>

        <CategoryTable
          categories={filteredCategories}
          canEdit={canManage}
          canDelete={canManage}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteRequest}
        />
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
              <strong>{deletingCategory.categoryName}</strong>
              ?
              <br />
              <br />
              Nếu danh mục đang có sản phẩm liên kết, hệ thống sẽ không cho phép
              xóa.
            </>
          }
          confirmText={formLoading ? "Đang xóa..." : "Xóa danh mục"}
          cancelText="Hủy"
          loading={formLoading}
          onConfirm={handleDelete}
          onCancel={() => {
            if (!formLoading) {
              setDeletingCategory(null);
            }
          }}
        />
      )}
    </div>
  );
}

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.message ||
    error.response?.data?.title ||
    error.message ||
    fallback
  );
}
