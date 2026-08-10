// dto/PaymentResponse.js


class PaymentResponse {


    constructor(data = {}) {


        this.id =
            data.id || 0;


        this.loanType =
            data.loanType || "";


        this.loanName =
            data.loanName || "";


        this.lenderName =
            data.lenderName || "";


        this.maskedAccountNumber =
            data.maskedAccountNumber || "";


        this.currentBalance =
            data.currentBalance || 0;


        this.paymentAmount =
            data.paymentAmount || 0;


        this.paymentFrequency =
            data.paymentFrequency || "";


        this.paymentDate =
            data.paymentDate || "";


        this.paymentMethod =
            data.paymentMethod || "";


        this.status =
            data.status || "Active";


        this.createdDate =
            data.createdDate || "";


    }

}


export default PaymentResponse;