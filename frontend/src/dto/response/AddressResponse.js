class AddressResponse {
    constructor(data = {}) {
        this.id = data.id || 0;
        this.address1 = data.address1 || "";
        this.address2 = data.address2 || "";
        this.city = data.city || "";
        this.state = data.state || "";
        this.zipCode = data.zipCode || "";
        this.country = data.country || "";
    }
}

export default AddressResponse;