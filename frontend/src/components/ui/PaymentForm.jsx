export default function PaymentSettings({ formData, handleChange }) {

    return (
        <div className="container-fluid px-0">
            <section>
                <h2 className="mb-4 text-center text-sm-start">Payment Information</h2>
                
                {/* Row 1: Street Address */}

                <div className="row mb-3">
                    <div className="col-md-4 text-sm-end text-start">
                        <label className="form-label mb-sm-0 fw-semibold">Acount Information</label>
                    </div>
                    {formData.paymentType === "ACH" && (
                        <div className="row">
                            <div className="col-md-6 offset-md-4 mb-4">
                                <select
                                className="form-select"
                                    name="paymentType"
                                    value={formData.paymentType}
                                    onChange={handleChange}>
                                    <option value="ACH">ACH</option>
                                    <option value="Card">Credit Card</option>
                                    required
                                </select>                   
                            </div> 
                            <div className="col-md-6 offset-md-4">
                                <input
                                    className="form-control mb-4"
                                    type="text"
                                    name="routingNumber"
                                    placeholder="Routing Number"
                                    value={formData.routingNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>                
                            <div className="col-md-6 offset-md-4">
                                <input
                                    className="form-control mb-4"
                                    type="text"
                                    name="accountNumber"
                                    placeholder="Account Number"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-6 offset-md-4 mb-4">
                                <input
                                    className="form-control"
                                    type="text"
                                    name="confirmAccountNumber"
                                    placeholder="Confirm Account Number"
                                    value={formData.confirmAccountNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-6 offset-md-4 mb-4">
                                <select className="form-select" name="accountType"
                                value={formData.accountType}onChange={handleChange}>
                                    <option value="Checking">
                                        Checking
                                    </option>

                                    <option value="Savings">
                                        Savings
                                    </option>
                                    required
                                </select>
                            </div>

                            <div className="col-md-6 offset-md-4 mb-4">
                                <input
                                    className="form-control"
                                    type="text"
                                    name="creditcardnumber"
                                    placeholder="Credit Card #"
                                    value={formData.creditcardnumber}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 offset-md-4 mb-4">
                                <input
                                    className="form-control"
                                    type="date"
                                    name="expdate"
                                    placeholder="Expiration Date"
                                    value={formData.expdate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-2 offset-md-4 mb-4">
                                <input
                                    className="form-control"
                                    type="text"
                                    name="cvv"
                                    placeholder="CVV Codw"
                                    value={formData.cvvcode}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}