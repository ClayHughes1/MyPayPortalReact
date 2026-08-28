// dto/PaymentRequest.js

class PaymentRequest {
    constructor(data = {}) {

        /*
         * -----------------------------------------------------
         * Customer
         * -----------------------------------------------------
         */

        this.customerId =
            data.customerId || 0;


        /*
         * -----------------------------------------------------
         * Loan Account
         * -----------------------------------------------------
         */

        this.loanType =
            data.loanType || "";

        this.loanName =
            data.loanName || "";

        this.lenderName =
            data.lenderName || "";

        this.loanAccountNumber =
            data.lnAccountNumber || "";

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


        /*
         * -----------------------------------------------------
         * Payment Source
         * -----------------------------------------------------
         */

        this.paymentType =
            data.paymentType || "ACH";

        this.routingNumber =
            data.routingNumber || "";

        this.bankAccountNumber =
            data.accountNumber || "";

        this.accountType =
            data.accountType || "Checking";

        this.cardNumber =
            data.creditcardnumber || "";

        this.cardExpirationDate =
            data.expdate || "";

        this.cardCvv =
            data.cvvcode || "";


        /*
         * -----------------------------------------------------
         * Payment
         * -----------------------------------------------------
         */

        this.paymentDescription =
            data.paymentDescription || "";

        this.paymentStatus =
            data.status || "Pending";

        this.confirmationNumber =
            data.confirmationNumber || "";

        this.paymentDate =
            data.paymentDate || "";

        this.cardType = 
            data.cardType || "";
    }
}


export default PaymentRequest;

