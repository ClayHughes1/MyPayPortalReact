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
// Get payment report data from API
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

    // const response = await fetch(
    //     `${API_URL}/payments/${customerId}?${queryParams}`,
    //     {
    //         method: "GET",
    //         headers: getAuthHeaders()
    //     }
    // );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            errorText || "Failed to retrieve payment report."
        );
    }

    return await response.json();
};


// ---------------------------------------------------------
// Generate Payment History PDF
// ---------------------------------------------------------

const generatePaymentHistoryReport = async (
    customerId,
    dateFrom,
    dateTo
) => {
    // Get report data from API
    const reportData = await getPaymentReport(
        customerId,
        dateFrom,
        dateTo
    );

    // Create PDF document
    const doc = new jsPDF();

    // -----------------------------------------------------
    // Report Header
    // -----------------------------------------------------

    doc.setFontSize(18);
    doc.text("Payment History Report", 105, 20, {
        align: "center"
    });

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

    // -----------------------------------------------------
    // Report Data
    // -----------------------------------------------------

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

    // -----------------------------------------------------
    // Payments
    // -----------------------------------------------------

    const payments = Array.isArray(reportData)
        ? reportData
        : reportData.payments || [];

    payments.forEach((payment) => {

        // Add another page when necessary
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

    // -----------------------------------------------------
    // Footer
    // -----------------------------------------------------

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

    // -----------------------------------------------------
    // Return PDF as Blob
    // -----------------------------------------------------

    return doc.output("blob");
};


// ---------------------------------------------------------
// Export service
// ---------------------------------------------------------

const reportService = {
    getPaymentReport,
    generatePaymentHistoryReport
};

export default reportService;