// components/PaymentForm.jsx

import { useEffect, useState } from "react";
import paymentService from "../../../services/paymentService";

import usePayments from "../hooks/usePayments";


const initialState = {


    loanType:"Auto Loan",

    loanName:"",

    lenderName:"",

    accountNumber:"",

    lnAccountNumber: "",

    lnConfirmAccountNumber:"",

    originalLoanAmount:"",

    currentBalance:"",

    interestRate:"",

    minimumPayment:"",

    paymentAmount:"",

    paymentFrequency:"Monthly",

    paymentDate:"",

    paymentMethod:"ACH",

    routingNumber:"",

    bankAccountNumber:"",

    paymentType:"ACH",

    accountType: "",

    expdate: "",

    cvvcode: "",

    accountNumber:"",

    confirmAccountNumber:""
};



export default function PaymentForm({
    customerId,
    onSubmit
}) {


    const [formData,setFormData] = useState(initialState);

    const [showPaymentInformation, setShowPaymentInformation] =
        useState(false);

    const [currentPayment, setCurrentPayment] =
        useState(null);

    const [currentPaymentSouirce, setCurrentPaymentSouirce] =
        useState(null);


    const [loadingPayment, setLoadingPayment] =
        useState(false);

    // useEffect(() => {

    //     async function loadPaymentInformation() {

    //         try {

    //             setLoadingPayment(true);

    //             const data =
    //                 await paymentService.getAll();

    //             if (data && data.length > 0) {

    //                 setCurrentPayment(data[0]);

    //             }
    //             else {

    //                 setCurrentPayment(null);

    //             }

    //         }
    //         catch (error) {

    //             console.error(
    //                 "Unable to load payment information:",
    //                 error
    //             );

    //             setCurrentPayment(null);

    //         }
    //         finally {

    //             setLoadingPayment(false);

    //         }

    //     }

    //     loadPaymentInformation();

    // }, []);


    useEffect(() => {

        // async function loadPaymentInformation() {

        //     try {

        //         setLoadingPayment(true);

        //         const data =
        //             await paymentService.getAll(customerId);

        //         if (data && data.length > 0) {

        //             setCurrentPayment(data[0]);

        //         }
        //         else {

        //             setCurrentPayment(null);

        //         }

        //     }
        //     catch (error) {

        //         console.error(
        //             "Unable to load payment information:",
        //             error
        //         );

        //         setCurrentPayment(null);

        //     }
        //     finally {

        //         setLoadingPayment(false);

        //     }

        // }

        async function loadAllPaymentSources(){

            try {

                setLoadingPayment(true);

                const data =
                    await paymentService.getAllPaymentSources();

                if (data && data.length > 0) {

                    setCurrentPaymentSouirce(data[0]);

                }
                else {

                    setCurrentPaymentSouirce(null);

                }

            }
            catch (error) {

                console.error(
                    "Unable to load payment sources information:",
                    error
                );

                setCurrentPaymentSouirce(null);

            }
            finally {

                setLoadingPayment(false);

            }

        }

        if (customerId > 0) {
            console.log("Calling the loadPayment function in the useEffect");
            // loadPaymentInformation();
            // loadAllPaymentSources();

        }

    }, [customerId]);


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

    const handleCreatePayment = (paymentData) => {


        console.log("Payment data received:", paymentData);


        const payload = {

            ...paymentData,

            customerId: currentUser?.id

        };


        console.log("Final payment payload:", payload);


        createPayment(payload);

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
            name="lnAccountNumber"
            value={formData.lnAccountNumber}
            onChange={handleChange}
            placeholder="Account Number"
            required
        />

        <input
            type="password"
            className="form-control mb-3"
            name="lnConfirmAccountNumber"
            value={formData.lnConfirmAccountNumber}
            onChange={handleChange}
            placeholder="Confirm Account Number"
            required
        />

        <h4>Payment Information</h4>

        {loadingPayment && (
            <div className="mb-4">
                Loading payment information...
            </div>
        )}

        {!loadingPayment && currentPayment && !showPaymentInformation && (

            <div className="card mb-4">

                <div className="card-body">

                    <h5>
                        Current Payment Method
                    </h5>

                    <p className="mb-3">
                        {currentPayment.paymentType}
                        {" "}
                        ending in
                        {" "}
                        {currentPayment.lastFour}
                    </p>


                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() =>
                            setShowPaymentInformation(true)
                        }
                    >
                        Change Payment Method
                    </button>

                </div>

            </div>
        )}

        {!loadingPayment && !currentPayment && !showPaymentInformation && (

            <div className="mb-4">

                <p>
                    No payment method has been added.
                </p>


                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() =>
                        setShowPaymentInformation(true)
                    }
                >
                    Add Payment Method
                </button>

            </div>
        )}

        {showPaymentInformation && (
            <div className="row">

                <div className="col-md-12 mb-2">
                    Payment Type: [{formData.paymentType}]
                </div>

                <div className="col-md-12 mb-4">
                    <select
                    className="form-select"
                        name="paymentType"
                        value={formData.paymentType}
                        onChange={handleChange}
                        required
                        >
                        <option value="ACH">ACH</option>
                        <option value="Card">Credit Card</option>
                    </select>                   
                </div> 

                {formData.paymentType === "ACH" && (
                    <>
                        <div className="col-md-12">
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
                        <div className="col-md-12">
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
                        <div className="col-md-12 mb-4">
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
                        <div className="col-md-12 mb-4">
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
                    </>
                )}

                {formData.paymentType === "Card" && (
                    <>
                        <div className="col-md-12 mb-4">
                            <input
                                className="form-control"
                                type="text"
                                name="creditcardnumber"
                                placeholder="Credit Card #"
                                value={formData.creditcardnumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-12 mb-4">
                            <input
                                className="form-control"
                                type="date"
                                name="expdate"
                                value={formData.expdate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-4">
                            <input
                                className="form-control"
                                type="text"
                                name="cvvcode"
                                placeholder="CVV Code"
                                value={formData.cvvcode}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </>
                )}  
            </div>          
        )}

        <h4>Loan Amount</h4>

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