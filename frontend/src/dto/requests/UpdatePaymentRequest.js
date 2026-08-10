class UpdatePaymentRequest {
    constructor(data = {}) {
        this.id = data.id || 0;

        this.customerId = data.customerId || 0;

        this.paymentType = data.paymentType || "ACH";

        this.routingNumber = data.routingNumber || "";

        this.accountNumber = data.accountNumber || "";

        this.cardNumber = data.cardNumber || "";

        this.expirationDate = data.expirationDate || "";

        this.cvv = data.cvv || "";

        this.paymentAmount = data.paymentAmount || 0;

        this.paymentDate = data.paymentDate || "";

        this.loanNumber = data.loanNumber || "";

        this.notes = data.notes || "";
    }
}

export default UpdatePaymentRequest;