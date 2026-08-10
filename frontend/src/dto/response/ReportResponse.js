class ReportResponse {
    constructor(data = {}) {
        this.reportId = data.reportId || 0;

        this.reportName = data.reportName || "";

        this.reportType = data.reportType || "";

        this.startDate = data.startDate || "";

        this.endDate = data.endDate || "";

        this.totalCustomers = data.totalCustomers || 0;

        this.activeCustomers = data.activeCustomers || 0;

        this.inactiveCustomers = data.inactiveCustomers || 0;

        this.totalPayments = data.totalPayments || 0;

        this.successfulPayments = data.successfulPayments || 0;

        this.failedPayments = data.failedPayments || 0;

        this.pendingPayments = data.pendingPayments || 0;

        this.totalRevenue = data.totalRevenue || 0;

        this.averagePayment = data.averagePayment || 0;

        this.generatedBy = data.generatedBy || "";

        this.generatedDate =
            data.generatedDate || new Date().toISOString();

        this.data = data.data || [];
    }
}

export default ReportResponse;