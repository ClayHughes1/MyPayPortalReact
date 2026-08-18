// src/features/customers/pages/CreateAccount.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../assets/styles/index.css";

import CustomerForm from "../components/ui/CustomerForm";
import AddressForm from "../components/ui/AddressForm";
import PaymentForm from "../components/ui/PaymentForm";
import AutoPaySettings from "../components/ui/AutoPaySettings";

import useCreateAccount from "../hooks/useCreateAccount";

const generateUsername = (email) => {
    return `${email}`;
};

export default function CreateAccount() {

    const navigate = useNavigate();

    //---------------------------------------------------------
    // Initial Form State
    //---------------------------------------------------------

    const initialState = {

        //-------------------------
        // Customer
        //-------------------------

        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        // dob: "",
        dateOfBirth:  "2026-08-04",
        ssnLast4: "",

        //-------------------------
        // Address
        //-------------------------

        address1: "",
        address2: "",
        city: "",
        state: "",
        zipCode: "",

        //-------------------------
        // Login
        //-------------------------

        username: "",
        password: "",
        confirmPassword: "",

        //-------------------------
        // Payment
        //-------------------------

        paymentType: "ACH",

        routingNumber: "",
        accountNumber: "",
        confirmAccountNumber: "",
        accountType: "Checking",

        cardNumber: "",
        expirationDate: "",
        cvv: "",
        cardHolder: "",

        //-------------------------
        // Auto Pay
        //-------------------------

        paymentAmount: "",
        paymentFrequency: "Monthly",
        paymentDay: "",
        minimumBalance: "",

        //-------------------------
        // Agreements
        //-------------------------

        acceptTerms: true,
        acceptPrivacy: true,
        authorizePayments: true

    };

    //---------------------------------------------------------
    // State
    //---------------------------------------------------------

    const [formData, setFormData] = useState(initialState);

    //---------------------------------------------------------
    // Custom Hook
    //---------------------------------------------------------

    const {

        loading,

        error,

        errors,

        createAccount

    } = useCreateAccount();

    //---------------------------------------------------------
    // Input Changes
    //---------------------------------------------------------
    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        const newValue =
            type === "checkbox"
                ? checked
                : value;

        setFormData(previous => {

            const updatedData = {
                ...previous,
                [name]: newValue
            };

            // if (name === "firstName"  || name === "lastName" || name === "emaikl") {
            if (name === "email") {

                updatedData.username = generateUsername(

                    name === "email"
                        ? newValue
                        : previous.email
                );
            }

            if (name === "password") {
                updatedData.password = newValue;
            }

            return updatedData;
        });
    };

    //---------------------------------------------------------
    // Submit
    //---------------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
    try {
        console.log("FORM SUBMIT FIRED");
        console.log(
            "PASSWORD:",
            formData.password
        );

        if (formData.accountNumber !== formData.confirmAccountNumber) {
            console.log("They are the same");
            // setErrors({
            //         accountNumber:
            //             "Account numbers do not match."
            //     });

                return;
        }

        await createAccount(

            formData,

            () => {

                setFormData(initialState);

                navigate("/");

            }

        );
    }
    catch(e)
    {
        console.log("Error"+e);
    }

    };

    //---------------------------------------------------------
    // UI
    //---------------------------------------------------------

    console.group("Before return");
    return (

        <>

            <h1>Create Account</h1>

            <p>Create a new MyPay customer account.</p>

            <p className="alert alert-danger">

                All required fields must be completed.

            </p>

            {error && (

                <div className="alert alert-danger">

                    {error}

                </div>

            )}

            <div className="container-fluid py-4">

                <div className="row justify-content-center">

                    <div className="col-lg-10">

                        <div className="card shadow">

                            <div className="card-body">

                                <form 
                                // onSubmit={handleSubmit}
                                    onSubmit={(e) => {
                                    console.log("FORM SUBMIT EVENT FIRED");
                                    handleSubmit(e);
                                }}
                                >

                                    <CustomerForm
                                        formData={formData}
                                        errors={errors}
                                        handleChange={handleChange}
                                    />

                                    <AddressForm
                                        formData={formData}
                                        errors={errors}
                                        handleChange={handleChange}
                                    />

      

                                    <div className="mt-4">

                                        <button
                                            className="btn btn-primary me-3"
                                            type="submit"
                                            // disabled={loading}
                                        >
Create
                                            {/* {loading
                                                ? "Creating..."
                                                : "Create Account"} */}

                                        </button>

                                        <button
                                            className="btn btn-secondary"
                                            type="button"
                                            onClick={() => navigate("/")}
                                        >

                                            Cancel

                                        </button>

                                    </div>

                                </form>

                                <div className="mt-4">

                                    Already have an account?

                                    <Link
                                        className="ms-2"
                                        to="/"
                                    >
                                        Login
                                    </Link>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </>

    );

}