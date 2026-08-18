import { jsPDF } from "jspdf";

const API_URL = "http://localhost:5000/api/reports";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        ...(token && {
            Authorization: `Bearer ${token}`
        })
    };
};


// ---------------------------------------------------------
// Get report data from API
// ---------------------------------------------------------

const getReportData = async (
    endpoint,
    customerId,
    dateFrom,
    dateTo
) => {

    const queryParams = new URLSearchParams({
        customerId,
        dateFrom,
        dateTo
    });

    const response = await fetch(
        `${API_URL}/${endpoint}/${customerId}?${queryParams}`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            errorText || "Failed to retrieve report data."
        );
    }

    return await response.json();
};


// ---------------------------------------------------------
// Existing Payment Report API call
// ---------------------------------------------------------

const getPaymentReport = async (
    customerId,
    dateFrom,
    dateTo
) => {

    const queryParams = new URLSearchParams({
        customerId,
        dateFrom,
        dateTo
    });

    const response = await fetch(
        `${API_URL}/payments/${customerId}/range?${queryParams}`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            errorText || "Failed to retrieve payment report."
        );
    }

    return await response.json();
};


// ---------------------------------------------------------
// PDF Header
// ---------------------------------------------------------

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


// ---------------------------------------------------------
// PDF Footer
// ---------------------------------------------------------

const addReportFooter = (doc) => {

    const pageCount = doc.getNumberOfPages();

    for (let page = 1; page <= pageCount; page++) {

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

    const reportData = await getPaymentReport(
        customerId,
        dateFrom,
        dateTo
    );

    const doc = new jsPDF();

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

    doc.text("Payment Date", 20, yPosition);
    doc.text("Loan Type", 55, yPosition);
    doc.text("Loan Name", 90, yPosition);
    doc.text("Amount", 145, yPosition);
    doc.text("Status", 175, yPosition);

    doc.setFont(undefined, "normal");

    yPosition += 8;

    const payments = Array.isArray(reportData)
        ? reportData
        : reportData.payments || [];

    payments.forEach((payment) => {

        if (yPosition > 275) {

            doc.addPage();

            yPosition = 20;

            doc.setFontSize(11);
            doc.setFont(undefined, "bold");

            doc.text("Payment Date", 20, yPosition);
            doc.text("Loan Type", 55, yPosition);
            doc.text("Loan Name", 90, yPosition);
            doc.text("Amount", 145, yPosition);
            doc.text("Status", 175, yPosition);

            doc.setFont(undefined, "normal");

            yPosition += 8;
        }

        const paymentDate = payment.paymentDate
            ? new Date(payment.paymentDate).toLocaleDateString()
            : "";

        const loanType = payment.loanType || "";

        const loanName = payment.loanName || "";

        const amount = payment.paymentAmount != null
            ? `$${Number(payment.paymentAmount).toFixed(2)}`
            : "$0.00";

        const status = payment.status || "";

        doc.text(paymentDate, 20, yPosition);
        doc.text(loanType, 55, yPosition);
        doc.text(loanName, 90, yPosition);
        doc.text(amount, 145, yPosition);
        doc.text(status, 175, yPosition);

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

    const reportData = await getReportData(
        "payment-total-by-loan-type",
        customerId,
        dateFrom,
        dateTo
    );

    const doc = new jsPDF();

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

    doc.text("Loan Type", 25, yPosition);
    doc.text("Payments", 100, yPosition);
    doc.text("Total Paid", 150, yPosition);

    doc.setFont(undefined, "normal");

    yPosition += 8;

    const rows = Array.isArray(reportData)
        ? reportData
        : reportData.loanTypes || [];

    rows.forEach((row) => {

        if (yPosition > 275) {
            doc.addPage();
            yPosition = 20;
        }

        const loanType = row.loanType || "";

        const paymentCount = row.paymentCount ?? 0;

        const totalPaid = row.totalPaid != null
            ? `$${Number(row.totalPaid).toFixed(2)}`
            : "$0.00";

        doc.text(loanType, 25, yPosition);
        doc.text(String(paymentCount), 100, yPosition);
        doc.text(totalPaid, 150, yPosition);

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

    const reportData = await getReportData(
        "payment-total-by-status",
        customerId,
        dateFrom,
        dateTo
    );

    const doc = new jsPDF();

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

    doc.text("Status", 30, yPosition);
    doc.text("Payments", 100, yPosition);
    doc.text("Total Amount", 150, yPosition);

    doc.setFont(undefined, "normal");

    yPosition += 8;

    const rows = Array.isArray(reportData)
        ? reportData
        : reportData.statuses || [];

    rows.forEach((row) => {

        if (yPosition > 275) {
            doc.addPage();
            yPosition = 20;
        }

        const status = row.status || "";

        const paymentCount = row.paymentCount ?? 0;

        const totalAmount = row.totalAmount != null
            ? `$${Number(row.totalAmount).toFixed(2)}`
            : "$0.00";

        doc.text(status, 30, yPosition);
        doc.text(String(paymentCount), 100, yPosition);
        doc.text(totalAmount, 150, yPosition);

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

    const reportData = await getReportData(
        "payment-by-month",
        customerId,
        dateFrom,
        dateTo
    );

    const doc = new jsPDF();

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

    doc.text("Month", 30, yPosition);
    doc.text("Payments", 100, yPosition);
    doc.text("Total Paid", 150, yPosition);

    doc.setFont(undefined, "normal");

    yPosition += 8;

    const rows = Array.isArray(reportData)
        ? reportData
        : reportData.months || [];

    rows.forEach((row) => {

        if (yPosition > 275) {
            doc.addPage();
            yPosition = 20;
        }

        const month = row.month || "";

        const paymentCount = row.paymentCount ?? 0;

        const totalPaid = row.totalPaid != null
            ? `$${Number(row.totalPaid).toFixed(2)}`
            : "$0.00";

        doc.text(month, 30, yPosition);
        doc.text(String(paymentCount), 100, yPosition);
        doc.text(totalPaid, 150, yPosition);

        yPosition += 8;
    });

    addReportFooter(doc);

    return doc.output("blob");
};


// =========================================================
// PAYMENT SUMMARY
// =========================================================

const generatePaymentSummaryReport = async (
    customerId,
    dateFrom,
    dateTo
) => {

    const reportData = await getReportData(
        "payment-summary",
        customerId,
        dateFrom,
        dateTo
    );

    const doc = new jsPDF();

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

    const reportData = await getReportData(
        "payment-by-loan-account",
        customerId,
        dateFrom,
        dateTo
    );

    const doc = new jsPDF();

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

    doc.text("Account", 20, yPosition);
    doc.text("Loan Type", 65, yPosition);
    doc.text("Payments", 120, yPosition);
    doc.text("Total Paid", 160, yPosition);

    doc.setFont(undefined, "normal");

    yPosition += 8;

    const rows = Array.isArray(reportData)
        ? reportData
        : reportData.accounts || [];

    rows.forEach((row) => {

        if (yPosition > 275) {
            doc.addPage();
            yPosition = 20;
        }

        const account = row.loanAccountId != null
            ? String(row.loanAccountId)
            : "";

        const loanType = row.loanType || "";

        const paymentCount = row.paymentCount ?? 0;

        const totalPaid = row.totalPaid != null
            ? `$${Number(row.totalPaid).toFixed(2)}`
            : "$0.00";

        doc.text(account, 20, yPosition);
        doc.text(loanType, 65, yPosition);
        doc.text(String(paymentCount), 120, yPosition);
        doc.text(totalPaid, 160, yPosition);

        yPosition += 8;
    });

    addReportFooter(doc);

    return doc.output("blob");
};


// ---------------------------------------------------------
// Export service
// ---------------------------------------------------------

const reportService = {
    getPaymentReport,
    generatePaymentHistoryReport,
    generatePaymentTotalsByLoanTypeReport,
    generatePaymentTotalsByStatusReport,
    generatePaymentsByMonthReport,
    generatePaymentSummaryReport,
    generatePaymentsByLoanAccountReport
};

export default reportService;

















































// import { jsPDF } from "jspdf";

// const API_URL = "http://localhost:5000/api/reports";

// const getAuthHeaders = () => {
//     const token = localStorage.getItem("token");

//     return {
//         "Content-Type": "application/json",
//         ...(token && {
//             Authorization: `Bearer ${token}`
//         })
//     };
// };


// // ---------------------------------------------------------
// // Get payment report data from API
// // ---------------------------------------------------------

// const getPaymentReport = async (
//     customerId,
//     dateFrom,
//     dateTo
// ) => {
//     const queryParams = new URLSearchParams({
//         customerId,
//         dateFrom,
//         dateTo
//     });

//     const response = await fetch(
//         `${API_URL}/payments/${customerId}/range?${queryParams}`,
//         {
//             method: "GET",
//             headers: getAuthHeaders()
//         }
//     );

//     // const response = await fetch(
//     //     `${API_URL}/payments/${customerId}?${queryParams}`,
//     //     {
//     //         method: "GET",
//     //         headers: getAuthHeaders()
//     //     }
//     // );

//     if (!response.ok) {
//         const errorText = await response.text();

//         throw new Error(
//             errorText || "Failed to retrieve payment report."
//         );
//     }

//     return await response.json();
// };


// // ---------------------------------------------------------
// // Generate Payment History PDF
// // ---------------------------------------------------------

// const generatePaymentHistoryReport = async (
//     customerId,
//     dateFrom,
//     dateTo
// ) => {
//     // Get report data from API
//     const reportData = await getPaymentReport(
//         customerId,
//         dateFrom,
//         dateTo
//     );

//     // Create PDF document
//     const doc = new jsPDF();

//     // -----------------------------------------------------
//     // Report Header
//     // -----------------------------------------------------

//     doc.setFontSize(18);
//     doc.text("Payment History Report", 105, 20, {
//         align: "center"
//     });

//     doc.setFontSize(10);

//     doc.text(
//         `Report Period: ${dateFrom} through ${dateTo}`,
//         20,
//         32
//     );

//     doc.text(
//         `Customer ID: ${customerId}`,
//         20,
//         39
//     );

//     // -----------------------------------------------------
//     // Report Data
//     // -----------------------------------------------------

//     let yPosition = 55;

//     doc.setFontSize(11);
//     doc.setFont(undefined, "bold");

//     doc.text("Payment Date", 20, yPosition);
//     doc.text("Loan Type", 55, yPosition);
//     doc.text("Loan Name", 90, yPosition);
//     doc.text("Amount", 145, yPosition);
//     doc.text("Status", 175, yPosition);

//     doc.setFont(undefined, "normal");

//     yPosition += 8;

//     // -----------------------------------------------------
//     // Payments
//     // -----------------------------------------------------

//     const payments = Array.isArray(reportData)
//         ? reportData
//         : reportData.payments || [];

//     payments.forEach((payment) => {

//         // Add another page when necessary
//         if (yPosition > 275) {
//             doc.addPage();

//             yPosition = 20;

//             doc.setFontSize(11);
//             doc.setFont(undefined, "bold");

//             doc.text("Payment Date", 20, yPosition);
//             doc.text("Loan Type", 55, yPosition);
//             doc.text("Loan Name", 90, yPosition);
//             doc.text("Amount", 145, yPosition);
//             doc.text("Status", 175, yPosition);

//             doc.setFont(undefined, "normal");

//             yPosition += 8;
//         }

//         const paymentDate = payment.paymentDate
//             ? new Date(payment.paymentDate).toLocaleDateString()
//             : "";

//         const loanType = payment.loanType || "";

//         const loanName = payment.loanName || "";

//         const amount = payment.paymentAmount != null
//             ? `$${Number(payment.paymentAmount).toFixed(2)}`
//             : "$0.00";

//         const status = payment.status || "";

//         doc.text(paymentDate, 20, yPosition);
//         doc.text(loanType, 55, yPosition);
//         doc.text(loanName, 90, yPosition);
//         doc.text(amount, 145, yPosition);
//         doc.text(status, 175, yPosition);

//         yPosition += 8;
//     });

//     // -----------------------------------------------------
//     // Footer
//     // -----------------------------------------------------

//     const pageCount = doc.getNumberOfPages();

//     for (let page = 1; page <= pageCount; page++) {

//         doc.setPage(page);

//         doc.setFontSize(8);

//         doc.text(
//             `Page ${page} of ${pageCount}`,
//             105,
//             290,
//             {
//                 align: "center"
//             }
//         );
//     }

//     // -----------------------------------------------------
//     // Return PDF as Blob
//     // -----------------------------------------------------

//     return doc.output("blob");
// };


// // ---------------------------------------------------------
// // Export service
// // ---------------------------------------------------------

// const reportService = {
//     getPaymentReport,
//     generatePaymentHistoryReport
// };

// export default reportService;