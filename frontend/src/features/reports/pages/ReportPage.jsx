import { useState } from "react";
import reportService from "../../../services/reportService";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";


const ReportPage = () => {

    // ---------------------------------------------------------
    // Report state
    // ---------------------------------------------------------

    const [reportType, setReportType] =
        useState("payment-history");

    const [outputType, setOutputType] =
        useState("pdf");

    const [dateFrom, setDateFrom] =
        useState("");

    const [dateTo, setDateTo] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // ---------------------------------------------------------
    // Chart state
    // ---------------------------------------------------------

    const [chartData, setChartData] =
        useState([]);

    const [chartLoading, setChartLoading] =
        useState(false);

    const [showChart, setShowChart] =
        useState(false);


    // ---------------------------------------------------------
    // Pie chart colors
    // ---------------------------------------------------------

    const PIE_COLORS = [
        "#0d6efd",
        "#198754",
        "#dc3545",
        "#ffc107",
        "#6f42c1",
        "#20c997",
        "#fd7e14",
        "#0dcaf0",
        "#6c757d",
        "#d63384",
        "#6610f2",
        "#146c43"
    ];


    // =========================================================
    // Get logged-in customer
    // =========================================================

    const getCustomerId = () => {

        const user =
            JSON.parse(
                localStorage.getItem("user")
            );

        return user?.id;
    };


    // =========================================================
    // Validate dates
    // =========================================================

    const validateDates = () => {

        if (!dateFrom || !dateTo) {

            setError(
                "Please select both a start date and an end date."
            );

            return false;
        }

        if (new Date(dateFrom) > new Date(dateTo)) {

            setError(
                "The start date cannot be after the end date."
            );

            return false;
        }

        return true;
    };


    // =========================================================
    // Sort chart data chronologically
    // =========================================================

    const sortChartDataByMonth = (data) => {

        const monthOrder = {
            January: 0,
            February: 1,
            March: 2,
            April: 3,
            May: 4,
            June: 5,
            July: 6,
            August: 7,
            September: 8,
            October: 9,
            November: 10,
            December: 11
        };

        return [...data].sort((a, b) => {

            const monthA =
                monthOrder[a.month] ?? 99;

            const monthB =
                monthOrder[b.month] ?? 99;

            return monthA - monthB;
        });
    };


    // =========================================================
    // Generate PDF
    // =========================================================

    const handleGeneratePdf = async () => {

        setError("");

        const customerId =
            getCustomerId();

        if (!customerId) {

            setError(
                "Unable to determine the logged-in customer."
            );

            return;
        }

        if (!validateDates()) {
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

                    throw new Error(
                        "Invalid report type selected."
                    );
            }


            const pdfUrl =
                window.URL.createObjectURL(
                    pdfBlob
                );

            window.open(
                pdfUrl,
                "_blank"
            );


            setTimeout(() => {

                window.URL.revokeObjectURL(
                    pdfUrl
                );

            }, 1000);

        }
        catch (err) {

            console.error(
                "Error generating PDF:",
                err
            );

            setError(
                err.message ||
                "An error occurred while generating the report."
            );
        }
        finally {

            setLoading(false);

        }
    };


    // =========================================================
    // Generate chart
    // =========================================================

    const handleGenerateChart = async () => {

        setError("");

        const customerId =
            getCustomerId();

        if (!customerId) {

            setError(
                "Unable to determine the logged-in customer."
            );

            return;
        }

        if (!validateDates()) {
            return;
        }

        try {

            setChartLoading(true);

            const data =
                await reportService.getPaymentsByMonthChart(
                    customerId,
                    dateFrom,
                    dateTo
                );


            // -------------------------------------------------
            // API may return an array OR { months: [...] }
            // -------------------------------------------------

            const rows =
                Array.isArray(data)
                    ? data
                    : data?.months || [];


            // -------------------------------------------------
            // Sort months chronologically
            // -------------------------------------------------

            const sortedData =
                sortChartDataByMonth(rows);


            // -------------------------------------------------
            // Convert numeric values to numbers
            // -------------------------------------------------

            const formattedData =
                sortedData.map((row) => ({

                    ...row,

                    paymentCount:
                        Number(
                            row.paymentCount ?? 0
                        ),

                    totalPaid:
                        Number(
                            row.totalPaid ?? 0
                        )
                }));


            setChartData(
                formattedData
            );

            setShowChart(true);

        }
        catch (err) {

            console.error(
                "Error loading chart:",
                err
            );

            setError(
                err.message ||
                "Unable to generate chart."
            );

            setShowChart(false);

        }
        finally {

            setChartLoading(false);

        }
    };


    // =========================================================
    // Generate selected output
    // =========================================================

    const handleGenerate = async (e) => {

        e.preventDefault();

        if (outputType === "pdf") {

            await handleGeneratePdf();

            return;
        }

            if (outputType === "csv") {

                await handleGenerateCsv();

                return;
            }
        
        await handleGenerateChart();
    };

    // =========================================================
    // Generate CSV
    // =========================================================

    const handleGenerateCsv = async () => {

        setError("");

        const customerId =
            getCustomerId();

        if (!customerId) {

            setError(
                "Unable to determine the logged-in customer."
            );

            return;
        }

        if (!validateDates()) {
            return;
        }

        try {

            setLoading(true);

            await reportService.generateCsvReport(
                reportType,
                customerId,
                dateFrom,
                dateTo
            );

        }
        catch (err) {

            console.error(
                "Error generating CSV:",
                err
            );

            setError(
                err.message ||
                "An error occurred while generating the CSV report."
            );

        }
        finally {

            setLoading(false);

        }
    };



    // =========================================================
    // Render chart
    // =========================================================

    const renderChart = () => {

        if (!showChart) {
            return null;
        }


        // -----------------------------------------------------
        // Line Chart
        // -----------------------------------------------------

        if (outputType === "line") {

            return (

                <ResponsiveContainer
                    width="100%"
                    height={400}
                >

                    <LineChart
                        data={chartData}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="month"
                        />

                        <YAxis />

                        <Tooltip
                            formatter={(value) =>
                                `$${Number(value).toFixed(2)}`
                            }
                        />

                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="totalPaid"
                            name="Total Paid"
                            stroke="#0d6efd"
                            strokeWidth={3}
                            dot={{
                                r: 5
                            }}
                            activeDot={{
                                r: 7
                            }}
                        />

                    </LineChart>

                </ResponsiveContainer>
            );
        }


        // -----------------------------------------------------
        // Bar Chart
        // -----------------------------------------------------

        if (outputType === "bar") {

            return (

                <ResponsiveContainer
                    width="100%"
                    height={400}
                >

                    <BarChart
                        data={chartData}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="month"
                        />

                        <YAxis />

                        <Tooltip
                            formatter={(value) =>
                                `$${Number(value).toFixed(2)}`
                            }
                        />

                        <Legend />

                        <Bar
                            dataKey="totalPaid"
                            name="Total Paid"
                            fill="#0d6efd"
                        />

                    </BarChart>

                </ResponsiveContainer>
            );
        }


        // -----------------------------------------------------
        // Pie Chart
        // -----------------------------------------------------

        if (outputType === "pie") {

            return (

                <ResponsiveContainer
                    width="100%"
                    height={400}
                >

                    <PieChart>

                        <Pie
                            data={chartData}
                            dataKey="totalPaid"
                            nameKey="month"
                            cx="50%"
                            cy="50%"
                            outerRadius={130}
                            label={({ month }) => month}
                        >

                            {chartData.map(
                                (entry, index) => (

                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            PIE_COLORS[
                                                index %
                                                PIE_COLORS.length
                                            ]
                                        }
                                    />

                                )
                            )}

                        </Pie>

                        <Tooltip
                            formatter={(value) =>
                                `$${Number(value).toFixed(2)}`
                            }
                        />

                        <Legend />

                    </PieChart>

                </ResponsiveContainer>
            );
        }


        return null;
    };


    // =========================================================
    // Component
    // =========================================================

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


                            <form
                                onSubmit={
                                    handleGenerate
                                }
                            >


                                {/* ---------------------------------
                                    Output Type
                                ---------------------------------- */}

                                <div className="mb-3">

                                    <label
                                        htmlFor="outputType"
                                        className="form-label"
                                    >
                                        Report Format
                                    </label>


                                    <select
                                        id="outputType"
                                        className="form-select"
                                        value={outputType}
                                        onChange={(e) => {

                                            setOutputType(
                                                e.target.value
                                            );

                                            setShowChart(false);

                                        }}
                                    >

                                        <option value="pdf">
                                            PDF Report
                                        </option>

                                        <option value="csv">
                                            CSV Report
                                        </option>

                                        <option value="line">
                                            Line Chart
                                        </option>

                                        <option value="bar">
                                            Bar Chart
                                        </option>

                                        <option value="pie">
                                            Pie Chart
                                        </option>

                                    </select>

                                </div>


                                {/* ---------------------------------
                                    PDF And CSV Report Type
                                ---------------------------------- */}

                                {(outputType === "pdf" || outputType === "csv") && (
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
                                                setReportType(
                                                    e.target.value
                                                )
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

                                )}


                                {/* ---------------------------------
                                    From Date
                                ---------------------------------- */}

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
                                            setDateFrom(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                {/* ---------------------------------
                                    To Date
                                ---------------------------------- */}

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
                                            setDateTo(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                {/* ---------------------------------
                                    Generate Button
                                ---------------------------------- */}

                                <div className="d-grid">


                                    <button
                                        type="submit"
                                        className={
                                            outputType === "pdf"
                                                ? "btn btn-primary"
                                                : outputType === "csv"
                                                    ? "btn btn-success"
                                                    : "btn btn-success"
                                        }
                                        disabled={
                                            loading ||
                                            chartLoading
                                        }
                                    >
                                        {outputType === "pdf"
                                            ? (
                                                loading
                                                    ? "Generating PDF..."
                                                    : "Generate PDF"
                                            )
                                            : outputType === "csv"
                                                ? (
                                                    loading
                                                        ? "Generating CSV..."
                                                        : "Generate CSV"
                                                )
                                                : (
                                                    chartLoading
                                                        ? "Generating Chart..."
                                                        : "Generate Chart"
                                                )
                                        }
                                    </button>



                                    {/* <button
                                        type="submit"
                                        className={
                                            outputType === "pdf"
                                                ? "btn btn-primary"
                                                : "btn btn-success"
                                        }
                                        disabled={
                                            loading ||
                                            chartLoading
                                        }
                                    >

                                        {outputType === "pdf"

                                            ? (
                                                loading
                                                    ? "Generating PDF..."
                                                    : "Generate PDF"
                                            )

                                            : (
                                                chartLoading
                                                    ? "Generating Chart..."
                                                    : "Generate Chart"
                                            )
                                        }

                                    </button> */}

                                </div>

                            </form>

                        </div>

                    </div>


                    {/* =================================================
                        Chart Display
                    ================================================= */}

                    {showChart && (

                        <div className="row justify-content-center mt-4">

                            <div className="col-md-12">

                                <div className="card shadow-sm">


                                    <div className="card-header">

                                        <h4 className="mb-0">

                                            {outputType === "line" &&
                                                "Payments By Month - Line Chart"
                                            }

                                            {outputType === "bar" &&
                                                "Payments By Month - Bar Chart"
                                            }

                                            {outputType === "pie" &&
                                                "Payments By Month - Pie Chart"
                                            }

                                        </h4>

                                    </div>


                                    <div className="card-body">

                                        {renderChart()}

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};


export default ReportPage;
