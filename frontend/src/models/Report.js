class Report {

    constructor(data = {}) {

        this.totalCustomers =
            data.totalCustomers || 0;

        this.activeCustomers =
            data.activeCustomers || 0;

        this.totalPayments =
            data.totalPayments || 0;

        this.successfulPayments =
            data.successfulPayments || 0;

        this.failedPayments =
            data.failedPayments || 0;

        this.totalRevenue =
            data.totalRevenue || 0;

        this.month =
            data.month || "";

        this.year =
            data.year || new Date().getFullYear();
    }
}

export default Report;