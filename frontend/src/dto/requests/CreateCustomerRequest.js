class CustomerRequest {
    constructor(data = {}) {
        this.firstName = data.firstName || "";
        this.lastName = data.lastName || "";
        this.email = data.email || "";
        this.phone = data.phone || "";

        this.address = data.address || null;

        this.paymentType = data.paymentType || "ACH";
        this.routingNumber = data.routingNumber || "";
        this.accountNumber = data.accountNumber || "";

        this.loanNumber = data.loanNumber || "";
        this.paymentAmount = data.paymentAmount || 0;
        this.paymentDate = data.paymentDate || "";
    }
}

export default CustomerRequest;