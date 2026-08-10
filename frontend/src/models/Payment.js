class Payment {
    constructor(data = {}) {

        this.id = data.id || 0;

        this.customerId = data.customerId || 0;

        this.paymentType = data.paymentType || "ACH";

        this.amount = data.amount || 0;

        this.status = data.status || "Pending";

        this.confirmationNumber =
            data.confirmationNumber || "";

        this.transactionDate =
            data.transactionDate || new Date().toISOString();

        this.routingNumber = data.routingNumber || "";
        this.accountNumber = data.accountNumber || "";

        this.cardNumber = data.cardNumber || "";
        
        this.cvv = data.cvv || "";

        this.expdate = data.expdate || "";


        this.notes = data.notes || "";
    }
}

export default Payment;