import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import "../../styles/invoices.css";
import "../../styles/pagination.css";

import {
  getInvoicesApi,
  getInvoiceApi,
  downloadInvoicePdfApi,
} from "../../api/invoiceApi";

import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Pagination from "../../components/common/Pagination";

import InvoiceTable from "../../components/invoices/InvoiceTable";
import InvoiceDetailModal from "../../components/invoices/InvoiceDetailModal";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [downloadingId, setDownloadingId] = useState(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getInvoicesApi();

      setInvoices(data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải danh sách hóa đơn.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredInvoices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return invoices;
    }

    return invoices.filter((invoice) => {
      return [invoice.invoiceCode, invoice.issueCode, invoice.customerName]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [invoices, search]);

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleView = async (id) => {
    try {
      setError("");

      const data = await getInvoiceApi(id);

      setSelectedInvoice(data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Không thể tải chi tiết hóa đơn.",
      );
    }
  };

  const handleDownload = async (invoice) => {
    try {
      setDownloadingId(invoice.id);
      setError("");

      const response = await downloadInvoicePdfApi(invoice.id);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `Invoice_${invoice.invoiceCode}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải hóa đơn PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="page-container">
      <div className="page-toolbar">
        <div>
          <h2>Hóa đơn</h2>

          <p>Quản lý hóa đơn được tạo từ phiếu xuất đã duyệt</p>
        </div>

        <div className="page-toolbar-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={loadInvoices}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Làm mới
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError("")} />}

      <div className="content-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã hóa đơn, phiếu xuất, khách hàng..."
            />
          </div>

          <div className="table-count">{filteredInvoices.length} hóa đơn</div>
        </div>

        <InvoiceTable
          invoices={paginatedInvoices}
          onView={handleView}
          onDownload={handleDownload}
          downloadingId={downloadingId}
        />
        <Pagination
          totalItems={filteredInvoices.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onDownload={handleDownload}
          downloading={downloadingId === selectedInvoice.id}
        />
      )}
    </div>
  );
}
