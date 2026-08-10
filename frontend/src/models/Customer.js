class Customer {
    constructor(data = {}) {
        this.id = data.id || 0;

        // Customer
        this.firstName = data.firstName || "";
        this.lastName = data.lastName || "";
        this.email = data.email || "";
        this.phone = data.phone || "";

        // Address
        this.address1 = data.address1 || "";
        this.address2 = data.address2 || "";
        this.city = data.city || "";
        this.state = data.state || "";
        this.zipCode = data.zipCode || "";

        // Login
        this.username = data.username || "";

        // Payment
        this.paymentType = data.paymentType || "ACH";

        this.routingNumber = data.routingNumber || "";
        this.accountNumber = data.accountNumber || "";

        this.cardNumber = data.cardNumber || "";
        this.expiration = data.expiration || "";
        this.cvv = data.cvv || "";

        // Auto Pay
        this.loanNumber = data.loanNumber || "";
        this.paymentAmount = data.paymentAmount || "";
        this.paymentDate = data.paymentDate || "";

        this.isActive = data.isActive ?? true;

        this.createdDate = data.createdDate || new Date().toISOString();
    }
}

export default Customer;



// import Customer from "../models/Customer";

// const customer = new Customer();

// customer.firstName = "John";
// customer.lastName = "Doe";
// customer.email = "john@company.com";

// await customerService.create(customer);
//axios.post("/customers", customer);