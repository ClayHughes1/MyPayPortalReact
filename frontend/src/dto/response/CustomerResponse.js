class CustomerResponse {
    constructor(data = {}) {
        this.id = data.id || 0;

        this.firstName = data.firstName || "";
        this.lastName = data.lastName || "";
        this.email = data.email || "";
        this.phone = data.phone || "";

        this.address = data.address || null;

        this.paymentType = data.paymentType || "";
        this.loanNumber = data.loanNumber || "";
        this.paymentAmount = data.paymentAmount || 0;
        this.paymentDate = data.paymentDate || "";

        this.createdDate = data.createdDate || "";
        this.modifiedDate = data.modifiedDate || "";

        this.isActive = data.isActive ?? true;
    }
}

export default CustomerResponse;