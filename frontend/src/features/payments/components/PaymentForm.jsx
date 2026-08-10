// components/PaymentForm.jsx

import { useState } from "react";


const initialState = {


    loanType:"Auto Loan",

    loanName:"",

    lenderName:"",

    accountNumber:"",


    originalLoanAmount:"",

    currentBalance:"",

    interestRate:"",


    minimumPayment:"",

    paymentAmount:"",

    paymentFrequency:"Monthly",

    paymentDate:"",


    paymentMethod:"ACH",


    routingNumber:"",

    bankAccountNumber:""

};



export default function PaymentForm({
    onSubmit
}) {


const [formData,setFormData] = useState(initialState);



const handleChange=(e)=>{
    const {name,value}=e.target;


    setFormData(prev=>({
        ...prev,
        [name]:value
    }));

};



const handleSubmit=(e)=>{

    e.preventDefault();

    onSubmit(formData);

    setFormData(initialState);

};



    return (

    <form onSubmit={handleSubmit}>


        <h4>
            Loan Information
        </h4>


        <select
            className="form-select mb-3"
            name="loanType"
            value={formData.loanType}
            onChange={handleChange}
            required
        >
            <option value="">Select Loan Type</option>
            <option value="Auto Loan">Auto Loan</option>
            <option value="Mortgage">Mortgage</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Student Loan">Student Loan</option>
            <option value="Personal Loan">Personal Loan</option>
        </select>

        <input
            type="text"
            className="form-control mb-3"
            name="loanName"
            value={formData.loanName}
            placeholder="Loan Name"
            onChange={handleChange}
            required
        />

        <input
            type="text"
            className="form-control mb-3"
            name="lenderName"
            value={formData.lenderName}
            placeholder="Lender Name"
            onChange={handleChange}
            required
        />

        <input
            type="password"
            className="form-control mb-3"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            placeholder="Account Number"
            required
        />

        <input
            type="password"
            className="form-control mb-3"
            name="confirmAccountNumber"
            value={formData.confirmAccountNumber}
            onChange={handleChange}
            placeholder="Confirm Account Number"
            required
        />

        <h4>Loan Amounts</h4>

        <input
            type="number"
            step="0.01"
            className="form-control mb-3"
            name="currentBalance"
            value={formData.currentBalance}
            placeholder="Current Balance"
            onChange={handleChange}
            required
        />

        <input
            type="number"
            step="0.01"
            className="form-control mb-3"
            name="interestRate"
            value={formData.interestRate}
            placeholder="Interest Rate"
            onChange={handleChange}
            required
        />

        <h4>Auto Pay Settings</h4>

        <input
            type="number"
            step="0.01"
            className="form-control mb-3"
            name="paymentAmount"
            value={formData.paymentAmount}
            placeholder="Payment Amount"
            onChange={handleChange}
            required
        />

        <select
            className="form-select mb-3"
            name="paymentFrequency"
            value={formData.paymentFrequency}
            onChange={handleChange}
            required
        >
            <option value="">Select Frequency</option>
            <option value="Monthly">Monthly</option>
            <option value="Bi-Weekly">Bi-Weekly</option>
            <option value="Weekly">Weekly</option>
        </select>

        <input
            type="date"
            className="form-control mb-3"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            required
        />


        <button className="btn btn-primary" type="submit">
            Create AutoPay
        </button>
    </form>

    );


}