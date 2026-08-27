class MakePaymentRequest {
    constructor(data = {}) {

        this.customerId =
            data.customerId || 0;

        this.loanAccountId =
            data.loanAccountId || 0;

        this.paymentAmount =
            data.paymentAmount || 0;

        this.loanName = 
              data.loanName || "";

        this.paymentDate =
            data.paymentDate ||
            new Date().toISOString();

        this.cardType = 
            data.cardType || "";

    }
}

export default MakePaymentRequest;