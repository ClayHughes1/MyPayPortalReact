import { jsPDF } from "jspdf";


const API_URL =
    "http://localhost:5000/api/reports";


// =========================================================
// AUTH HEADERS
// =========================================================

const getAuthHeaders = () => {

    const token =
        localStorage.getItem("token");

    return {

        "Content-Type":
            "application/json",

        ...(token && {

            Authorization:
                `Bearer ${token}`

        })

    };
};


// =========================================================
// GENERIC REPORT DATA
// =========================================================

const getReportData = async (
    endpoint,
    customerId,
    dateFrom,
    dateTo
) => {

    const queryParams =
        new URLSearchParams({

            customerId,
            dateFrom,
            dateTo

        });


    const response =
        await fetch(

            `${API_URL}/${endpoint}/${customerId}?${queryParams}`,

            {
                method: "GET",
                headers: getAuthHeaders()
            }

        );


    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(

            errorText ||
            "Failed to retrieve report data."

        );
    }


    return await response.json();
};


// =========================================================
// PAYMENT REPORT
// =========================================================

const getPaymentReport = async (
    customerId,
    dateFrom,
    dateTo
) => {

    const queryParams =
        new URLSearchParams({

            customerId,
            dateFrom,
            dateTo

        });


    const response =
        await fetch(

            `${API_URL}/payments/${customerId}/range?${queryParams}`,

            {
                method: "GET",
                headers: getAuthHeaders()
            }

        );


    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(

            errorText ||
            "Failed to retrieve payment report."

        );
    }


    return await response.json();
};


// =========================================================
// PDF HEADER
// =========================================================

const addReportHeader = (
    doc,
    title,
    customerId,
    dateFrom,
    dateTo
) => {

    doc.setFontSize(18);

    doc.text(
        title,
        105,
        20,
        {
            align: "center"
        }
    );


    doc.setFontSize(10);

    doc.text(
        `Report Period: ${dateFrom} through ${dateTo}`,
        20,
        32
    );


    doc.text(
        `Customer ID: ${customerId}`,
        20,
        39
    );
};


// =========================================================
// PDF FOOTER
// =========================================================

const addReportFooter = (doc) => {

    const pageCount =
        doc.getNumberOfPages();


    for (
        let page = 1;
        page <= pageCount;
        page++
    ) {

        doc.setPage(page);

        doc.setFontSize(8);

        doc.text(
            `Page ${page} of ${pageCount}`,
            105,
            290,
            {
                align: "center"
            }
        );
    }
};


// =========================================================
// PAYMENT HISTORY
// =========================================================

const generatePaymentHistoryReport = async (
    customerId,
    dateFrom,
    dateTo
) => {

    const reportData =
        await getPaymentReport(
            customerId,
            dateFrom,
            dateTo
        );


    const doc =
        new jsPDF();


    addReportHeader(
        doc,
        "Payment History Report",
        customerId,
        dateFrom,
        dateTo
    );


    let yPosition = 55;


    doc.setFontSize(11);
    doc.setFont(undefined, "bold");


    doc.text(
        "Payment Date",
        20,
        yPosition
    );

    doc.text(
        "Loan Type",
        55,
        yPosition
    );

    doc.text(
        "Loan Name",
        90,
        yPosition
    );

    doc.text(
        "Amount",
        145,
        yPosition
    );

    doc.text(
        "Status",
        175,
        yPosition
    );


    doc.setFont(undefined, "normal");

    yPosition += 8;


    const payments =
        Array.isArray(reportData)

            ? reportData

            : reportData.payments || [];


    payments.forEach((payment) => {

        if (yPosition > 275) {

            doc.addPage();

            yPosition = 20;


            doc.setFontSize(11);
            doc.setFont(undefined, "bold");


            doc.text(
                "Payment Date",
                20,
                yPosition
            );

            doc.text(
                "Loan Type",
                55,
                yPosition
            );

            doc.text(
                "Loan Name",
                90,
                yPosition
            );

            doc.text(
                "Amount",
                145,
                yPosition
            );

            doc.text(
                "Status",
                175,
                yPosition
            );


            doc.setFont(undefined, "normal");

            yPosition += 8;
        }


        const paymentDate =
            payment.paymentDate

                ? new Date(
                    payment.paymentDate
                ).toLocaleDateString()

                : "";


        const loanType =
            payment.loanType || "";


        const loanName =
            payment.loanName || "";


        const amount =
            payment.paymentAmount != null

                ? `$${Number(
                    payment.paymentAmount
                ).toFixed(2)}`

                : "$0.00";


        const status =
            payment.status || "";


        doc.text(
            paymentDate,
            20,
            yPosition
        );

        doc.text(
            loanType,
            55,
            yPosition
        );

        doc.text(
            loanName,
            90,
            yPosition
        );

        doc.text(
            amount,
            145,
            yPosition
        );

        doc.text(
            status,
            175,
            yPosition
        );


        yPosition += 8;
    });


    addReportFooter(doc);


    return doc.output("blob");
};


// =========================================================
// PAYMENT TOTALS BY LOAN TYPE
// =========================================================

const generatePaymentTotalsByLoanTypeReport = async (
    customerId,
    dateFrom,
    dateTo
) => {

    const reportData =
        await getReportData(
            "payment-total-by-loan-type",
            customerId,
            dateFrom,
            dateTo
        );


    const doc =
        new jsPDF();


    addReportHeader(
        doc,
        "Payment Totals By Loan Type",
        customerId,
        dateFrom,
        dateTo
    );


    let yPosition = 55;


    doc.setFontSize(11);
    doc.setFont(undefined, "bold");


    doc.text(
        "Loan Type",
        25,
        yPosition
    );

    doc.text(
        "Payments",
        100,
        yPosition
    );

    doc.text(
        "Total Paid",
        150,
        yPosition
    );


    doc.setFont(undefined, "normal");

    yPosition += 8;


    const rows =
        Array.isArray(reportData)

            ? reportData

            : reportData.loanTypes || [];


    rows.forEach((row) => {

        if (yPosition > 275) {

            doc.addPage();

            yPosition = 20;
        }


        const loanType =
            row.loanType || "";


        const paymentCount =
            row.paymentCount ?? 0;


        const totalPaid =
            row.totalPaid != null

                ? `$${Number(
                    row.totalPaid
                ).toFixed(2)}`

                : "$0.00";


        doc.text(
            loanType,
            25,
            yPosition
        );

        doc.text(
            String(paymentCount),
            100,
            yPosition
        );

        doc.text(
            totalPaid,
            150,
            yPosition
        );


        yPosition += 8;
    });


    addReportFooter(doc);


    return doc.output("blob");
};


// =========================================================
// PAYMENT TOTALS BY STATUS
// =========================================================

const generatePaymentTotalsByStatusReport = async (
    customerId,
    dateFrom,
    dateTo
) => {

    const reportData =
        await getReportData(
            "payment-total-by-status",
            customerId,
            dateFrom,
            dateTo
        );


    const doc =
        new jsPDF();


    addReportHeader(
        doc,
        "Payment Totals By Status",
        customerId,
        dateFrom,
        dateTo
    );


    let yPosition = 55;


    doc.setFontSize(11);
    doc.setFont(undefined, "bold");


    doc.text(
        "Status",
        30,
        yPosition
    );

    doc.text(
        "Payments",
        100,
        yPosition
    );

    doc.text(
        "Total Amount",
        150,
        yPosition
    );


    doc.setFont(undefined, "normal");

    yPosition += 8;


    const rows =
        Array.isArray(reportData)

            ? reportData

            : reportData.statuses || [];


    rows.forEach((row) => {

        if (yPosition > 275) {

            doc.addPage();

            yPosition = 20;
        }


        const status =
            row.status || "";


        const paymentCount =
            row.paymentCount ?? 0;


        const totalAmount =
            row.totalAmount != null

                ? `$${Number(
                    row.totalAmount
                ).toFixed(2)}`

                : "$0.00";


        doc.text(
            status,
            30,
            yPosition
        );

        doc.text(
            String(paymentCount),
            100,
            yPosition
        );

        doc.text(
            totalAmount,
            150,
            yPosition
        );


        yPosition += 8;
    });


    addReportFooter(doc);


    return doc.output("blob");
};


// =========================================================
// PAYMENTS BY MONTH
// =========================================================

const generatePaymentsByMonthReport = async (
    customerId,
    dateFrom,
    dateTo
) => {

    const reportData =
        await getReportData(
            "payment-by-month",
            customerId,
            dateFrom,
            dateTo
        );


    const doc =
        new jsPDF();


    addReportHeader(
        doc,
        "Payments By Month",
        customerId,
        dateFrom,
        dateTo
    );


    let yPosition = 55;


    doc.setFontSize(11);
    doc.setFont(undefined, "bold");


    doc.text(
        "Month",
        30,
        yPosition
    );

    doc.text(
        "Payments",
        100,
        yPosition
    );

    doc.text(
        "Total Paid",
        150,
        yPosition
    );


    doc.setFont(undefined, "normal");

    yPosition += 8;


    const rows =
        Array.isArray(reportData)

            ? reportData

            : reportData.months || [];


    rows.forEach((row) => {

        if (yPosition > 275) {

            doc.addPage();

            yPosition = 20;
        }


        const month =
            row.month || "";


        const paymentCount =
            row.paymentCount ?? 0;


        const totalPaid =
            row.totalPaid != null

                ? `$${Number(
                    row.totalPaid
                ).toFixed(2)}`

                : "$0.00";


        doc.text(
            month,
            30,
            yPosition
        );

        doc.text(
            String(paymentCount),
            100,
            yPosition
        );

        doc.text(
            totalPaid,
            150,
            yPosition
        );


        yPosition += 8;
    });


    addReportFooter(doc);


    return doc.output("blob");
};


// =========================================================
// PAYMENTS BY MONTH - CHART DATA
// =========================================================
//
// IMPORTANT:
//
// getReportData() already calls response.json().
//
// Therefore DO NOT do:
//
// const response = await getReportData(...);
// const data = await response.json();
//
// getReportData() returns the parsed JSON object/array.
//
// =========================================================

const getPaymentsByMonthChart = async (
    customerId,
    dateFrom,
    dateTo
) => {

    const data =
        await getReportData(
            "payment-by-month",
            customerId,
            dateFrom,
            dateTo
        );


    return data;
};


// =========================================================
// PAYMENT SUMMARY
// =========================================================

const generatePaymentSummaryReport = async (
    customerId,
    dateFrom,
    dateTo
) => {

    const reportData =
        await getReportData(
            "payment-summary",
            customerId,
            dateFrom,
            dateTo
        );


    const doc =
        new jsPDF();


    addReportHeader(
        doc,
        "Payment Summary",
        customerId,
        dateFrom,
        dateTo
    );


    let yPosition = 60;


    doc.setFontSize(12);


    doc.text(
        `Total Payments: ${reportData.paymentCount ?? 0}`,
        30,
        yPosition
    );


    yPosition += 12;


    doc.text(
        `Total Amount Paid: $${Number(
            reportData.totalPaid ?? 0
        ).toFixed(2)}`,
        30,
        yPosition
    );


    yPosition += 12;


    doc.text(
        `Completed Payments: ${reportData.completedCount ?? 0}`,
        30,
        yPosition
    );


    yPosition += 12;


    doc.text(
        `Pending Payments: ${reportData.pendingCount ?? 0}`,
        30,
        yPosition
    );


    yPosition += 12;


    doc.text(
        `Failed Payments: ${reportData.failedCount ?? 0}`,
        30,
        yPosition
    );


    addReportFooter(doc);


    return doc.output("blob");
};


// =========================================================
// PAYMENTS BY LOAN ACCOUNT
// =========================================================

const generatePaymentsByLoanAccountReport = async (
    customerId,
    dateFrom,
    dateTo
) => {

    const reportData =
        await getReportData(
            "payment-by-loan-account",
            customerId,
            dateFrom,
            dateTo
        );


    const doc =
        new jsPDF();


    addReportHeader(
        doc,
        "Payments By Loan Account",
        customerId,
        dateFrom,
        dateTo
    );


    let yPosition = 55;


    doc.setFontSize(11);
    doc.setFont(undefined, "bold");


    doc.text(
        "Account",
        20,
        yPosition
    );

    doc.text(
        "Loan Type",
        65,
        yPosition
    );

    doc.text(
        "Payments",
        120,
        yPosition
    );

    doc.text(
        "Total Paid",
        160,
        yPosition
    );


    doc.setFont(undefined, "normal");

    yPosition += 8;


    const rows =
        Array.isArray(reportData)

            ? reportData

            : reportData.accounts || [];


    rows.forEach((row) => {

        if (yPosition > 275) {

            doc.addPage();

            yPosition = 20;
        }


        const account =
            row.loanAccountId != null

                ? String(
                    row.loanAccountId
                )

                : "";


        const loanType =
            row.loanType || "";


        const paymentCount =
            row.paymentCount ?? 0;


        const totalPaid =
            row.totalPaid != null

                ? `$${Number(
                    row.totalPaid
                ).toFixed(2)}`

                : "$0.00";


        doc.text(
            account,
            20,
            yPosition
        );

        doc.text(
            loanType,
            65,
            yPosition
        );

        doc.text(
            String(paymentCount),
            120,
            yPosition
        );

        doc.text(
            totalPaid,
            160,
            yPosition
        );


        yPosition += 8;
    });


    addReportFooter(doc);


    return doc.output("blob");
};

// =========================================================
// CSV HELPERS
// =========================================================

const escapeCsvValue = (value) => {

    if (value === null || value === undefined) {
        return "";
    }

    const stringValue =
        String(value);

    // Escape quotes by doubling them.
    const escaped =
        stringValue.replace(
            /"/g,
            '""'
        );

    // Wrap every value in quotes.
    return `"${escaped}"`;
};


const downloadCsv = (
    filename,
    headers,
    rows
) => {

    const csvRows = [];

    // Header row
    csvRows.push(
        headers
            .map(escapeCsvValue)
            .join(",")
    );


    // Data rows
    rows.forEach((row) => {

        csvRows.push(
            row
                .map(escapeCsvValue)
                .join(",")
        );

    });


    const csvContent =
        csvRows.join("\r\n");


    const blob =
        new Blob(
            [csvContent],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        window.URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    window.URL.revokeObjectURL(
        url
    );
};


// =========================================================
// GENERATE CSV REPORT
// =========================================================

const generateCsvReport = async (
    reportType,
    customerId,
    dateFrom,
    dateTo
) => {

    let reportData;

    let headers;

    let rows;

    let filename;


    switch (reportType) {

        // -------------------------------------------------
        // PAYMENT HISTORY
        // -------------------------------------------------

        case "payment-history":

            reportData =
                await getPaymentReport(
                    customerId,
                    dateFrom,
                    dateTo
                );


            {

                const payments =
                    Array.isArray(reportData)
                        ? reportData
                        : reportData.payments || [];


                headers = [
                    "Payment Date",
                    "Loan Type",
                    "Loan Name",
                    "Amount",
                    "Status"
                ];


                rows =
                    payments.map((payment) => {

                        const paymentDate =
                            payment.paymentDate
                                ? new Date(
                                    payment.paymentDate
                                ).toLocaleDateString()
                                : "";


                        const amount =
                            payment.paymentAmount != null
                                ? Number(
                                    payment.paymentAmount
                                ).toFixed(2)
                                : "0.00";


                        return [
                            paymentDate,
                            payment.loanType || "",
                            payment.loanName || "",
                            amount,
                            payment.status || ""
                        ];

                    });


                filename =
                    `payment-history-${dateFrom}-to-${dateTo}.csv`;
            }

            break;


        // -------------------------------------------------
        // TOTALS BY LOAN TYPE
        // -------------------------------------------------

        case "payment-total-by-loan-type":

            reportData =
                await getReportData(
                    "payment-total-by-loan-type",
                    customerId,
                    dateFrom,
                    dateTo
                );


            {

                const reportRows =
                    Array.isArray(reportData)
                        ? reportData
                        : reportData.loanTypes || [];


                headers = [
                    "Loan Type",
                    "Payments",
                    "Total Paid"
                ];


                rows =
                    reportRows.map((row) => {

                        return [
                            row.loanType || "",
                            row.paymentCount ?? 0,
                            row.totalPaid != null
                                ? Number(
                                    row.totalPaid
                                ).toFixed(2)
                                : "0.00"
                        ];

                    });


                filename =
                    `payment-totals-by-loan-type-${dateFrom}-to-${dateTo}.csv`;
            }

            break;


        // -------------------------------------------------
        // TOTALS BY STATUS
        // -------------------------------------------------

        case "payment-total-by-status":

            reportData =
                await getReportData(
                    "payment-total-by-status",
                    customerId,
                    dateFrom,
                    dateTo
                );


            {

                const reportRows =
                    Array.isArray(reportData)
                        ? reportData
                        : reportData.statuses || [];


                headers = [
                    "Status",
                    "Payments",
                    "Total Amount"
                ];


                rows =
                    reportRows.map((row) => {

                        return [
                            row.status || "",
                            row.paymentCount ?? 0,
                            row.totalAmount != null
                                ? Number(
                                    row.totalAmount
                                ).toFixed(2)
                                : "0.00"
                        ];

                    });


                filename =
                    `payment-totals-by-status-${dateFrom}-to-${dateTo}.csv`;
            }

            break;


        // -------------------------------------------------
        // PAYMENTS BY MONTH
        // -------------------------------------------------

        case "payment-by-month":

            reportData =
                await getReportData(
                    "payment-by-month",
                    customerId,
                    dateFrom,
                    dateTo
                );


            {

                const reportRows =
                    Array.isArray(reportData)
                        ? reportData
                        : reportData.months || [];


                headers = [
                    "Month",
                    "Payments",
                    "Total Paid"
                ];


                rows =
                    reportRows.map((row) => {

                        return [
                            row.month || "",
                            row.paymentCount ?? 0,
                            row.totalPaid != null
                                ? Number(
                                    row.totalPaid
                                ).toFixed(2)
                                : "0.00"
                        ];

                    });


                filename =
                    `payments-by-month-${dateFrom}-to-${dateTo}.csv`;
            }

            break;


        // -------------------------------------------------
        // PAYMENT SUMMARY
        // -------------------------------------------------

        case "payment-summary":

            reportData =
                await getReportData(
                    "payment-summary",
                    customerId,
                    dateFrom,
                    dateTo
                );


            headers = [
                "Metric",
                "Value"
            ];


            rows = [

                [
                    "Total Payments",
                    reportData.paymentCount ?? 0
                ],

                [
                    "Total Amount Paid",
                    Number(
                        reportData.totalPaid ?? 0
                    ).toFixed(2)
                ],

                [
                    "Completed Payments",
                    reportData.completedCount ?? 0
                ],

                [
                    "Pending Payments",
                    reportData.pendingCount ?? 0
                ],

                [
                    "Failed Payments",
                    reportData.failedCount ?? 0
                ]

            ];


            filename =
                `payment-summary-${dateFrom}-to-${dateTo}.csv`;

            break;


        // -------------------------------------------------
        // PAYMENTS BY LOAN ACCOUNT
        // -------------------------------------------------

        case "payment-by-loan-account":

            reportData =
                await getReportData(
                    "payment-by-loan-account",
                    customerId,
                    dateFrom,
                    dateTo
                );


            {

                const reportRows =
                    Array.isArray(reportData)
                        ? reportData
                        : reportData.accounts || [];


                headers = [
                    "Account",
                    "Loan Type",
                    "Payments",
                    "Total Paid"
                ];


                rows =
                    reportRows.map((row) => {

                        return [

                            row.loanAccountId != null
                                ? String(
                                    row.loanAccountId
                                )
                                : "",

                            row.loanType || "",

                            row.paymentCount ?? 0,

                            row.totalPaid != null
                                ? Number(
                                    row.totalPaid
                                ).toFixed(2)
                                : "0.00"

                        ];

                    });


                filename =
                    `payments-by-loan-account-${dateFrom}-to-${dateTo}.csv`;
            }

            break;


        default:

            throw new Error(
                "Invalid report type selected."
            );
    }


    downloadCsv(
        filename,
        headers,
        rows
    );
};


// =========================================================
// EXPORT SERVICE
// =========================================================

const reportService = {

    getPaymentReport,

    generatePaymentHistoryReport,

    generatePaymentTotalsByLoanTypeReport,

    generatePaymentTotalsByStatusReport,

    generatePaymentsByMonthReport,

    generatePaymentSummaryReport,

    generatePaymentsByLoanAccountReport,

    getPaymentsByMonthChart,

    generateCsvReport

};


export default reportService;
