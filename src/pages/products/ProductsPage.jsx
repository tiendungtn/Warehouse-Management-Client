import { useEffect, useState } from "react";

import { Plus, Search, RefreshCw } from "lucide-react";

import {
  getProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from "../../api/productApi";

import { getCategoriesApi } from "../../api/categoryApi";

import ProductTable from "../../components/products/ProductTable";
import ProductForm from "../../components/products/ProductForm";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { useAuth } from "../../context/AuthContext";

export default function ProductsPage() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");

  const [searchError, setSearchError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [deletingProduct, setDeletingProduct] = useState(null);

  const canCreateOrEdit = user?.role === "Admin" || user?.role === "Manager";

  const canDelete = user?.role === "Admin";

  const loadProducts = async (keyword = search) => {
    try {
      setLoading(true);
      setSearchError("");

      const data = await getProductsApi(keyword);

      setProducts(data);
    } catch (err) {
      setSearchError(getErrorMessage(err, "Không thể tải danh sách sản phẩm."));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!canCreateOrEdit) {
      return;
    }

    try {
      const data = await getCategoriesApi();

      setCategories(data);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh mục sản phẩm."));
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadCategories();
  }, [canCreateOrEdit]);

  const handleSearch = (event) => {
    event.preventDefault();

    loadProducts(search);
  };

  const handleResetSearch = () => {
    setSearch("");

    loadProducts("");
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
    if (formLoading) {
      return;
    }

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

  const handleDeleteRequest = (product) => {
    setDeletingProduct(product);
  };

  const handleDelete = async () => {
    if (!deletingProduct) {
      return;
    }

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
    <div>
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
          <ErrorMessage
            message={error}
            onRetry={() => {
              setError("");
            }}
          />
        </div>
      )}

      <div className="content-card">
        <div className="toolbar">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <Search size={18} />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo mã hoặc tên sản phẩm..."
              />
            </div>

            <button type="submit" className="secondary-button">
              Tìm kiếm
            </button>

            <button
              type="button"
              className="icon-button"
              title="Đặt lại"
              onClick={handleResetSearch}
            >
              <RefreshCw size={18} />
            </button>
          </form>

          <div className="product-count">{products.length} sản phẩm</div>
        </div>

        {searchError ? (
          <ErrorMessage message={searchError} onRetry={() => loadProducts()} />
        ) : loading ? (
          <Loading text="Đang tải sản phẩm..." />
        ) : (
          <ProductTable
            products={products}
            userRole={user?.role}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteRequest}
          />
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
          if (!formLoading) {
            setDeletingProduct(null);
          }
        }}
      />
    </div>
  );
}

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}
