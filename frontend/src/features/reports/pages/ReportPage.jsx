import { useState } from "react";
import reportService from "../../../services/reportService";

const ReportPage = () => {
    const [reportType, setReportType] = useState("payment-history");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGenerateReport = async (e) => {
        e.preventDefault();

        setError("");

        const user = JSON.parse(localStorage.getItem("user"));
        const customerId = user?.id;

        if (!customerId) {
            setError("Unable to determine the logged-in customer.");
            return;
        }

        if (!dateFrom || !dateTo) {
            setError("Please select both a start date and an end date.");
            return;
        }

        if (new Date(dateFrom) > new Date(dateTo)) {
            setError("The start date cannot be after the end date.");
            return;
        }

        try {
            setLoading(true);

            let pdfBlob;

            switch (reportType) {

                case "payment-history":
                    pdfBlob =
                        await reportService.generatePaymentHistoryReport(
                            customerId,
                            dateFrom,
                            dateTo
                        );
                    break;

                case "payment-total-by-loan-type":
                    pdfBlob =
                        await reportService.generatePaymentTotalsByLoanTypeReport(
                            customerId,
                            dateFrom,
                            dateTo
                        );
                    break;

                case "payment-total-by-status":
                    pdfBlob =
                        await reportService.generatePaymentTotalsByStatusReport(
                            customerId,
                            dateFrom,
                            dateTo
                        );
                    break;

                case "payment-by-month":
                    pdfBlob =
                        await reportService.generatePaymentsByMonthReport(
                            customerId,
                            dateFrom,
                            dateTo
                        );
                    break;

                case "payment-summary":
                    pdfBlob =
                        await reportService.generatePaymentSummaryReport(
                            customerId,
                            dateFrom,
                            dateTo
                        );
                    break;

                case "payment-by-loan-account":
                    pdfBlob =
                        await reportService.generatePaymentsByLoanAccountReport(
                            customerId,
                            dateFrom,
                            dateTo
                        );
                    break;

                default:
                    throw new Error("Invalid report type selected.");
            }

            const pdfUrl = window.URL.createObjectURL(pdfBlob);

            window.open(pdfUrl, "_blank");

            setTimeout(() => {
                window.URL.revokeObjectURL(pdfUrl);
            }, 1000);
        }
        catch (err) {
            console.error("Error generating report:", err);

            setError(
                err.message ||
                "An error occurred while generating the report."
            );
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">

            <div className="row justify-content-center">

                <div className="col-md-8 col-lg-6">

                    <div className="card shadow-sm">

                        <div className="card-header">
                            <h3 className="mb-0">
                                Generate Report
                            </h3>
                        </div>

                        <div className="card-body">

                            {error && (
                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleGenerateReport}>

                                {/* Report Type */}
                                <div className="mb-3">

                                    <label
                                        htmlFor="reportType"
                                        className="form-label"
                                    >
                                        Report Type
                                    </label>

                                    <select
                                        id="reportType"
                                        className="form-select"
                                        value={reportType}
                                        onChange={(e) =>
                                            setReportType(e.target.value)
                                        }
                                    >
                                        <option value="payment-history">
                                            Payment History
                                        </option>

                                        <option value="payment-total-by-loan-type">
                                            Payment Totals By Loan Type
                                        </option>

                                        <option value="payment-total-by-status">
                                            Payment Totals By Status
                                        </option>

                                        <option value="payment-by-month">
                                            Payments By Month
                                        </option>

                                        <option value="payment-summary">
                                            Payment Summary
                                        </option>

                                        <option value="payment-by-loan-account">
                                            Payments By Loan Account
                                        </option>
                                    </select>

                                </div>

                                {/* From Date */}
                                <div className="mb-3">

                                    <label
                                        htmlFor="dateFrom"
                                        className="form-label"
                                    >
                                        From Date
                                    </label>

                                    <input
                                        id="dateFrom"
                                        type="date"
                                        className="form-control"
                                        value={dateFrom}
                                        onChange={(e) =>
                                            setDateFrom(e.target.value)
                                        }
                                    />

                                </div>

                                {/* To Date */}
                                <div className="mb-3">

                                    <label
                                        htmlFor="dateTo"
                                        className="form-label"
                                    >
                                        To Date
                                    </label>

                                    <input
                                        id="dateTo"
                                        type="date"
                                        className="form-control"
                                        value={dateTo}
                                        onChange={(e) =>
                                            setDateTo(e.target.value)
                                        }
                                    />

                                </div>

                                {/* Generate */}
                                <div className="d-grid">

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Generating Report..."
                                            : "Generate Report"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ReportPage;