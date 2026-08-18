class MakePaymentRequest {
    constructor(data = {}) {

        this.customerId =
            data.customerId || 0;

        this.loanAccountId =
            data.loanAccountId || 0;

        this.paymentAmount =
            data.paymentAmount || 0;

        this.paymentDate =
            data.paymentDate ||
            new Date().toISOString();

    }
}

export default MakePaymentRequest;