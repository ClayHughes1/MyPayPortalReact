// dto/PaymentRequest.js

class PaymentRequest {
    constructor(data = {}) {

        this.loanType =
            data.loanType || "";

        this.loanName =
            data.loanName || "";

        this.lenderName =
            data.lenderName || "";

        this.accountNumber =
            data.accountNumber || "";


        this.originalLoanAmount =
            data.originalLoanAmount || 0;


        this.currentBalance =
            data.currentBalance || 0;


        this.interestRate =
            data.interestRate || 0;


        this.minimumPayment =
            data.minimumPayment || 0;


        this.paymentAmount =
            data.paymentAmount || 0;


        this.paymentFrequency =
            data.paymentFrequency || "Monthly";


        this.paymentDate =
            data.paymentDate || "";


        this.paymentMethod =
            data.paymentMethod || "ACH";


        this.routingNumber =
            data.routingNumber || "";


        this.bankAccountNumber =
            data.bankAccountNumber || "";


        this.cardLastFour =
            data.cardLastFour || "";


        this.isActive =
            data.isActive ?? true;

        this.customerId = data.customerId || 0;

    }
}


export default PaymentRequest;