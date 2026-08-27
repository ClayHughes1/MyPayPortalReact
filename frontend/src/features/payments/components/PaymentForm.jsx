// src/features/payments/components/PaymentForm.jsx

import { useEffect, useState } from "react";

import paymentService from "../../../services/paymentService";
import applicationLogService from "../../../services/logService";

import usePayments from "../hooks/usePayments";

import eyeIcon from "../../../assets/icons/eye.svg";
import eyeSlashIcon from "../../../assets/icons/eye-slash.svg";


const initialState = {

    loanType: "Auto Loan",

    loanName: "",

    lenderName: "",


    // Loan account
    lnAccountNumber: "",

    lnConfirmAccountNumber: "",

    originalLoanAmount: "",

    currentBalance: "",

    interestRate: "",


    // Auto pay
    minimumPayment: "",

    paymentAmount: "",

    paymentFrequency: "Monthly",

    paymentDate: "",


    // Payment source
    paymentMethod: "ACH",

    paymentType: "ACH",


    // ACH
    routingNumber: "",

    accountNumber: "",

    confirmAccountNumber: "",

    accountType: "Checking",


    // Credit Card
    creditcardnumber: "",

    expdate: "",

    cvvcode: ""
};


// ============================================================
// Credit Card Test Payment
// ============================================================

const creditTestState = {

    loanType: "Auto Loan",

    loanName: "Test Auto Loan",

    lenderName: "Test Bank",


    // Loan account
    lnAccountNumber: "12345678",

    lnConfirmAccountNumber: "12345678",

    originalLoanAmount: "25000",

    currentBalance: "18500",

    interestRate: "5.25",


    // Auto pay
    minimumPayment: "350",

    paymentAmount: "500",

    paymentFrequency: "Monthly",

    paymentDate: "2026-09-01",


    // Payment source
    paymentMethod: "Card",

    paymentType: "Card",


    // ACH
    routingNumber: "",

    accountNumber: "",

    confirmAccountNumber: "",

    accountType: "Checking",


    // Credit Card
    creditcardnumber: "4111111111111111",

    expdate: "2027-12-31",

    cvvcode: "123",

    cardType: "Visa"

};


// ============================================================
// ACH Test Payment
// ============================================================

const achTestState = {

    loanType: "Credit Card",

    loanName: "Test ACH Card",

    lenderName: "Test Bank",


    // Loan account
    lnAccountNumber: "12345678",

    lnConfirmAccountNumber: "12345678",

    originalLoanAmount: "25000",

    currentBalance: "18500",

    interestRate: "5.25",


    // Auto pay
    minimumPayment: "350",

    paymentAmount: "500",

    paymentFrequency: "Monthly",

    paymentDate: "2026-09-01",


    // Payment source
    paymentMethod: "ACH",

    paymentType: "ACH",


    // ACH
    routingNumber: "021000021",

    accountNumber: "123456789",

    confirmAccountNumber: "123456789",

    accountType: "Checking",


    // Credit Card
    creditcardnumber: "",

    expdate: "",

    cvvcode: ""
};


export default function PaymentForm() {

    // ========================================================
    // Visibility State
    // ========================================================

    const [showCvv, setShowCvv] =
        useState(false);

    const [showCCNumber, setShowCCNumber] =
        useState(false);

    const [showBANumber, setShowBANumber] =
        useState(false);

    const [showLANumber, setShowLANumber] =
        useState(false);

    const [showCLANumber, setShowCLANumber] =
        useState(false);


    // ========================================================
    // Current User
    // ========================================================

    const storedUser =
        localStorage.getItem("user");

    const user =
        storedUser
            ? JSON.parse(storedUser)
            : null;

    const customerId =
        user?.id ?? 0;


    // ========================================================
    // Payment Hook
    // ========================================================

    const {
        createPayment
    } = usePayments();


    // ========================================================
    // Form State
    // ========================================================

    const [submitError, setSubmitError] =
        useState("");


    /*
     * Credit Card Test State
     *
     * Change this back to initialState when testing
     * the actual empty form.
     */
    const [formData, setFormData] =
        useState(creditTestState);


    /*
     * ACH Test State
     *
     * To test ACH instead, replace the line above with:
     *
     * const [formData, setFormData] =
     *     useState(achTestState);
     */


    const [errors, setErrors] =
        useState({});


    const [touched, setTouched] =
        useState({});


    const [showPaymentInformation, setShowPaymentInformation] =
        useState(false);


    const [currentPayment, setCurrentPayment] =
        useState(null);


    const [currentPaymentSouirce, setCurrentPaymentSouirce] =
        useState(null);


    const [loadingPayment, setLoadingPayment] =
        useState(false);


    // ========================================================
    // Application Logging
    // ========================================================

    /*
     * Application logging is intentionally centralized here.
     *
     * IMPORTANT:
     *
     * Never send sensitive payment credentials to the
     * application logging API.
     *
     * DO NOT LOG:
     *
     * - Credit card number
     * - CVV
     * - ACH account number
     * - Routing number
     * - Loan account number
     * - Confirmation account numbers
     *
     * SAFE BUSINESS/WORKFLOW INFORMATION:
     *
     * - Customer ID
     * - Payment ID
     * - Loan ID
     * - Loan type
     * - Loan name
     * - Lender name
     * - Payment type
     * - Payment amount
     * - Payment frequency
     * - Payment date
     * - Application action
     * - API status code
     * - Non-sensitive error message
     */

    const logApplicationEvent = async (
        action,
        message,
        metadata = {}
    ) => {

        try {

            await applicationLogService.create({

                level: "Information",

                source:
                    "Payments.PaymentForm",

                action,

                message,

                userId:
                    customerId > 0
                        ? customerId
                        : null,

                metadata

            });

        }
        catch (loggingError) {

            /*
             * Logging failures must never prevent the
             * customer's requested operation from continuing.
             *
             * We intentionally do not use console logging here.
             */
        }
    };


    // ========================================================
    // Validation Helpers
    // ========================================================

    const isEmpty = (value) => {

        return (

            value === undefined ||

            value === null ||

            String(value).trim() === ""

        );
    };


    const isValidRoutingNumber = (value) => {

        const routing =
            String(value).replace(/\D/g, "");


        if (!/^\d{9}$/.test(routing)) {

            return false;
        }


        const digits =
            routing.split("").map(Number);


        const checksum =

            3 * (

                digits[0] +

                digits[3] +

                digits[6]

            ) +

            7 * (

                digits[1] +

                digits[4] +

                digits[7]

            ) +

            (

                digits[2] +

                digits[5] +

                digits[8]

            );


        return checksum % 10 === 0;
    };


    const isValidCardNumber = (value) => {

        const cardNumber =
            String(value).replace(/\D/g, "");


        if (!/^\d{13,19}$/.test(cardNumber)) {

            return false;
        }


        let sum = 0;

        let shouldDouble = false;


        for (
            let i = cardNumber.length - 1;
            i >= 0;
            i--
        ) {

            let digit =
                parseInt(
                    cardNumber[i],
                    10
                );


            if (shouldDouble) {

                digit *= 2;


                if (digit > 9) {

                    digit -= 9;
                }
            }


            sum += digit;

            shouldDouble = !shouldDouble;
        }


        return sum % 10 === 0;
    };


    const isValidDate = (value) => {

        if (!value) {

            return false;
        }


        const date =
            new Date(
                `${value}T00:00:00`
            );


        return !Number.isNaN(
            date.getTime()
        );
    };


    const isExpiredCard = (value) => {

        if (!value) {

            return true;
        }


        const expiration =
            new Date(
                `${value}T23:59:59`
            );


        return expiration < new Date();
    };


    // ========================================================
    // Field Validation
    // ========================================================

    const validateField = (
        name,
        value,
        type = "text",
        currentData = formData
    ) => {

        const trimmedValue =
            typeof value === "string"
                ? value.trim()
                : value;


        /*
         * Required fields that are always required.
         */

        const requiredFields = [

            "loanType",

            "loanName",

            "lenderName",

            "lnAccountNumber",

            "lnConfirmAccountNumber",

            "currentBalance",

            "interestRate",

            "paymentAmount",

            "paymentFrequency",

            "paymentDate"

        ];


        if (

            requiredFields.includes(name) &&

            isEmpty(trimmedValue)

        ) {

            return "This field is required.";
        }


        /*
         * Empty optional field.
         */

        if (isEmpty(trimmedValue)) {

            return "";
        }


        // ====================================================
        // Name-Based Validation
        // ====================================================

        switch (name) {


            // ------------------------------------------------
            // Loan Name
            // ------------------------------------------------

            case "loanName":

                if (
                    String(trimmedValue).length < 2
                ) {

                    return (
                        "Loan name must be at least 2 characters."
                    );
                }


                if (
                    String(trimmedValue).length > 100
                ) {

                    return (
                        "Loan name cannot exceed 100 characters."
                    );
                }

                break;


            // ------------------------------------------------
            // Lender Name
            // ------------------------------------------------

            case "lenderName":

                if (
                    String(trimmedValue).length < 2
                ) {

                    return (
                        "Lender name must be at least 2 characters."
                    );
                }


                if (
                    String(trimmedValue).length > 100
                ) {

                    return (
                        "Lender name cannot exceed 100 characters."
                    );
                }

                break;


            // ------------------------------------------------
            // Loan Account
            // ------------------------------------------------

            case "lnAccountNumber":

                if (
                    !/^\d{4,30}$/.test(
                        String(trimmedValue)
                    )
                ) {

                    return (
                        "Loan account number must contain 4–30 digits."
                    );
                }

                break;


            case "lnConfirmAccountNumber":

                if (
                    trimmedValue !==
                    currentData.lnAccountNumber
                ) {

                    return (
                        "Loan account numbers do not match."
                    );
                }

                break;


            // ------------------------------------------------
            // ACH
            // ------------------------------------------------

            case "routingNumber":

                if (
                    !isValidRoutingNumber(
                        trimmedValue
                    )
                ) {

                    return (
                        "Enter a valid 9-digit routing number."
                    );
                }

                break;


            case "accountNumber":

                if (
                    !/^\d{4,30}$/.test(
                        String(trimmedValue)
                    )
                ) {

                    return (
                        "Account number must contain 4–30 digits."
                    );
                }

                break;


            case "confirmAccountNumber":

                if (
                    trimmedValue !==
                    currentData.accountNumber
                ) {

                    return (
                        "Account numbers do not match."
                    );
                }

                break;


            case "accountType":

                if (
                    ![
                        "Checking",
                        "Savings"
                    ].includes(trimmedValue)
                ) {

                    return (
                        "Select Checking or Savings."
                    );
                }

                break;


            // ------------------------------------------------
            // Credit Card
            // ------------------------------------------------

            case "creditcardnumber":

                if (
                    !isValidCardNumber(
                        trimmedValue
                    )
                ) {

                    return (
                        "Enter a valid credit card number."
                    );
                }

                break;


            case "cvvcode":

                if (
                    !/^\d{3,4}$/.test(
                        String(trimmedValue)
                    )
                ) {

                    return (
                        "CVV must contain 3 or 4 digits."
                    );
                }

                break;


            case "expdate":

                if (
                    !isValidDate(
                        trimmedValue
                    )
                ) {

                    return (
                        "Enter a valid expiration date."
                    );
                }


                if (
                    isExpiredCard(
                        trimmedValue
                    )
                ) {

                    return (
                        "Credit card has expired."
                    );
                }

                break;


            // ------------------------------------------------
            // Current Balance
            // ------------------------------------------------

            case "currentBalance": {

                const balance =
                    Number(trimmedValue);


                if (
                    !Number.isFinite(balance)
                ) {

                    return (
                        "Current balance must be a valid number."
                    );
                }


                if (balance < 0) {

                    return (
                        "Current balance cannot be negative."
                    );
                }

                break;
            }


            // ------------------------------------------------
            // Interest Rate
            // ------------------------------------------------

            case "interestRate": {

                const rate =
                    Number(trimmedValue);


                if (
                    !Number.isFinite(rate)
                ) {

                    return (
                        "Interest rate must be a valid number."
                    );
                }


                if (
                    rate < 0 ||
                    rate > 100
                ) {

                    return (
                        "Interest rate must be between 0 and 100."
                    );
                }

                break;
            }


            // ------------------------------------------------
            // Payment Amount
            // ------------------------------------------------

            case "paymentAmount": {

                const amount =
                    Number(trimmedValue);


                if (
                    !Number.isFinite(amount)
                ) {

                    return (
                        "Payment amount must be a valid number."
                    );
                }


                if (amount <= 0) {

                    return (
                        "Payment amount must be greater than zero."
                    );
                }

                break;
            }


            // ------------------------------------------------
            // Loan Type
            // ------------------------------------------------

            case "loanType":

                if (
                    ![
                        "Auto Loan",
                        "Mortgage",
                        "Credit Card",
                        "Student Loan",
                        "Personal Loan"
                    ].includes(trimmedValue)
                ) {

                    return (
                        "Select a valid loan type."
                    );
                }

                break;


            // ------------------------------------------------
            // Payment Frequency
            // ------------------------------------------------

            case "paymentFrequency":

                if (
                    ![
                        "Monthly",
                        "Bi-Weekly",
                        "Weekly"
                    ].includes(trimmedValue)
                ) {

                    return (
                        "Select a valid payment frequency."
                    );
                }

                break;


            // ------------------------------------------------
            // Payment Type
            // ------------------------------------------------

            case "paymentType":

                if (
                    ![
                        "ACH",
                        "Card"
                    ].includes(trimmedValue)
                ) {

                    return (
                        "Select a valid payment type."
                    );
                }

                break;


            // ------------------------------------------------
            // Payment Date
            // ------------------------------------------------

            case "paymentDate":

                if (
                    !isValidDate(
                        trimmedValue
                    )
                ) {

                    return (
                        "Enter a valid payment date."
                    );
                }

                break;


            default:

                break;
        }


        // ====================================================
        // Type-Based Validation
        // ====================================================

        if (type === "number") {

            const numberValue =
                Number(trimmedValue);


            if (
                !Number.isFinite(numberValue)
            ) {

                return (
                    "Enter a valid number."
                );
            }
        }


        if (type === "date") {

            if (
                !isValidDate(
                    trimmedValue
                )
            ) {

                return (
                    "Enter a valid date."
                );
            }
        }


        return "";
    };


    // ========================================================
    // Get Active Payment Fields
    // ========================================================

    const getPaymentFields = () => {

        if (!showPaymentInformation) {

            return [];
        }


        if (
            formData.paymentType === "ACH"
        ) {

            return [

                {
                    name: "routingNumber",
                    type: "text"
                },

                {
                    name: "accountNumber",
                    type: "password"
                },

                {
                    name: "confirmAccountNumber",
                    type: "password"
                },

                {
                    name: "accountType",
                    type: "select"
                }

            ];
        }


        if (
            formData.paymentType === "Card"
        ) {

            return [

                {
                    name: "creditcardnumber",
                    type: "password"
                },

                {
                    name: "expdate",
                    type: "date"
                },

                {
                    name: "cvvcode",
                    type: "password"
                }

            ];
        }


        return [];
    };


    // ========================================================
    // Validate Payment Section
    // ========================================================

    const validatePaymentSection = (
        data = formData
    ) => {

        const paymentFields =
            getPaymentFields();


        const paymentErrors = {};


        paymentFields.forEach((field) => {

            const error =
                validateField(
                    field.name,
                    data[field.name],
                    field.type,
                    data
                );


            if (error) {

                paymentErrors[field.name] =
                    error;
            }

        });


        return paymentErrors;
    };


    // ========================================================
    // Validate Entire Form
    // ========================================================

    const validateForm = () => {

        const newErrors = {};

        const newTouched = {};


        const baseFields = [

            {
                name: "loanType",
                type: "select"
            },

            {
                name: "loanName",
                type: "text"
            },

            {
                name: "lenderName",
                type: "text"
            },

            {
                name: "lnAccountNumber",
                type: "password"
            },

            {
                name: "lnConfirmAccountNumber",
                type: "password"
            },

            {
                name: "currentBalance",
                type: "number"
            },

            {
                name: "interestRate",
                type: "number"
            },

            {
                name: "paymentAmount",
                type: "number"
            },

            {
                name: "paymentFrequency",
                type: "select"
            },

            {
                name: "paymentDate",
                type: "date"
            }

        ];


        baseFields.forEach((field) => {

            newTouched[field.name] =
                true;


            const error =
                validateField(
                    field.name,
                    formData[field.name],
                    field.type,
                    formData
                );


            if (error) {

                newErrors[field.name] =
                    error;
            }

        });


        // ====================================================
        // Conditional Payment Validation
        // ====================================================

        if (showPaymentInformation) {

            newTouched.paymentType =
                true;


            const paymentTypeError =
                validateField(
                    "paymentType",
                    formData.paymentType,
                    "select",
                    formData
                );


            if (paymentTypeError) {

                newErrors.paymentType =
                    paymentTypeError;
            }


            const paymentFields =
                getPaymentFields();


            paymentFields.forEach((field) => {

                newTouched[field.name] =
                    true;


                const error =
                    validateField(
                        field.name,
                        formData[field.name],
                        field.type,
                        formData
                    );


                if (error) {

                    newErrors[field.name] =
                        error;
                }

            });
        }


        setTouched(newTouched);

        setErrors(newErrors);


        return (
            Object.keys(newErrors).length === 0
        );
    };


    // ========================================================
    // Clear Payment Validation
    // ========================================================

    const clearPaymentValidation = (
        paymentType
    ) => {

        const fieldsToClear =

            paymentType === "ACH"

                ? [

                    "creditcardnumber",

                    "expdate",

                    "cvvcode"

                ]

                : [

                    "routingNumber",

                    "accountNumber",

                    "confirmAccountNumber",

                    "accountType"

                ];


        setErrors((prev) => {

            const updated = {
                ...prev
            };


            fieldsToClear.forEach(
                (field) => {

                    delete updated[field];

                }
            );


            return updated;
        });


        setTouched((prev) => {

            const updated = {
                ...prev
            };


            fieldsToClear.forEach(
                (field) => {

                    delete updated[field];

                }
            );


            return updated;
        });
    };


    // ========================================================
    // Handle Payment Type Change
    // ========================================================

    const handlePaymentTypeChange = async (e) => {

        const newPaymentType =
            e.target.value;


        const previousPaymentType =
            formData.paymentType;


        setFormData((prev) => ({

            ...prev,

            paymentType:
                newPaymentType

        }));


        clearPaymentValidation(
            newPaymentType
        );


        setErrors((prev) => {

            const updated = {
                ...prev
            };


            delete updated.paymentType;


            return updated;
        });


        setTouched((prev) => ({

            ...prev,

            paymentType: true

        }));


        await logApplicationEvent(

            "PaymentForm.PaymentTypeChanged",

            "Customer changed the payment type.",

            {

                customerId,

                previousPaymentType,

                paymentType:
                    newPaymentType

            }

        );
    };


    // ========================================================
    // Handle Input Change
    // ========================================================

    const handleChange = (e) => {

        const {
            name,
            value,
            type
        } = e.target;


        let newValue =
            value;


        // ====================================================
        // Numeric Fields
        // ====================================================

        const numericFields = [

            "currentBalance",

            "originalLoanAmount",

            "minimumPayment",

            "paymentAmount",

            "interestRate"

        ];


        if (
            numericFields.includes(name)
        ) {

            newValue =
                value.replace(
                    /[^\d.]/g,
                    ""
                );


            const parts =
                newValue.split(".");


            if (parts.length > 2) {

                newValue =
                    parts[0] +
                    "." +
                    parts
                        .slice(1)
                        .join("");
            }
        }


        // ====================================================
        // Digit-Only Fields
        // ====================================================

        const digitOnlyFields = [

            "routingNumber",

            "accountNumber",

            "confirmAccountNumber",

            "lnAccountNumber",

            "lnConfirmAccountNumber",

            "cvvcode",

            "creditcardnumber"

        ];


        if (
            digitOnlyFields.includes(name)
        ) {

            newValue =
                value.replace(
                    /\D/g,
                    ""
                );
        }


        // ====================================================
        // Build Updated State
        // ====================================================

        const updatedFormData = {

            ...formData,

            [name]: newValue

        };


        setFormData(
            updatedFormData
        );


        // ====================================================
        // Validate Touched Field
        // ====================================================

        if (touched[name]) {

            const error =
                validateField(
                    name,
                    newValue,
                    type,
                    updatedFormData
                );


            setErrors((prev) => {

                const updated = {
                    ...prev
                };


                if (error) {

                    updated[name] =
                        error;

                }
                else {

                    delete updated[name];

                }


                return updated;
            });
        }


        // ====================================================
        // Revalidate Loan Account Confirmation
        // ====================================================

        if (

            name === "lnAccountNumber" &&

            touched.lnConfirmAccountNumber

        ) {

            const confirmError =
                validateField(
                    "lnConfirmAccountNumber",
                    updatedFormData.lnConfirmAccountNumber,
                    "password",
                    updatedFormData
                );


            setErrors((prev) => {

                const updated = {
                    ...prev
                };


                if (confirmError) {

                    updated.lnConfirmAccountNumber =
                        confirmError;

                }
                else {

                    delete updated.lnConfirmAccountNumber;

                }


                return updated;
            });
        }


        // ====================================================
        // Revalidate ACH Confirmation
        // ====================================================

        if (

            name === "accountNumber" &&

            touched.confirmAccountNumber

        ) {

            const confirmError =
                validateField(
                    "confirmAccountNumber",
                    updatedFormData.confirmAccountNumber,
                    "password",
                    updatedFormData
                );


            setErrors((prev) => {

                const updated = {
                    ...prev
                };


                if (confirmError) {

                    updated.confirmAccountNumber =
                        confirmError;

                }
                else {

                    delete updated.confirmAccountNumber;

                }


                return updated;
            });
        }
    };


    // ========================================================
    // Handle Blur
    // ========================================================

    const handleBlur = (e) => {

        const {
            name,
            value,
            type
        } = e.target;


        setTouched((prev) => ({

            ...prev,

            [name]: true

        }));


        const error =
            validateField(
                name,
                value,
                type,
                formData
            );


        setErrors((prev) => {

            const updated = {
                ...prev
            };


            if (error) {

                updated[name] =
                    error;

            }
            else {

                delete updated[name];

            }


            return updated;
        });
    };


    // ========================================================
    // Submit
    // ========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        /*
         * Clear any previous API submission error.
         */

        setSubmitError("");


        /*
         * Log that the customer attempted to submit.
         *
         * This intentionally contains business/workflow
         * information but no sensitive payment credentials.
         */

        await logApplicationEvent(

            "PaymentForm.SubmitStarted",

            "Customer submitted the payment form.",

            {

                customerId,

                loanType:
                    formData.loanType,

                loanName:
                    formData.loanName,

                lenderName:
                    formData.lenderName,

                paymentType:
                    formData.paymentType,

                paymentAmount:
                    formData.paymentAmount,

                paymentFrequency:
                    formData.paymentFrequency,

                paymentDate:
                    formData.paymentDate

            }

        );


        // ====================================================
        // STEP 1: Validate Form
        // ====================================================

        const isValid =
            validateForm();


        /*
         * STOP HERE if validation fails.
         */

        if (!isValid) {

            await logApplicationEvent(

                "PaymentForm.ValidationFailed",

                "Customer payment form validation failed.",

                {

                    customerId,

                    loanType:
                        formData.loanType,

                    loanName:
                        formData.loanName,

                    lenderName:
                        formData.lenderName,

                    paymentType:
                        formData.paymentType,

                    paymentAmount:
                        formData.paymentAmount,

                    paymentFrequency:
                        formData.paymentFrequency,

                    paymentDate:
                        formData.paymentDate,

                    validationFields:
                        Object.keys(errors)

                }

            );


            return;
        }


        // ====================================================
        // STEP 2: Clean Form Data
        // ====================================================

        const cleanedFormData =
            Object.entries(formData)
                .reduce(
                    (
                        result,
                        [key, value]
                    ) => {

                        result[key] =

                            typeof value === "string"

                                ? value.trim()

                                : value;


                        return result;

                    },
                    {}
                );


        // ====================================================
        // STEP 3: Submit To API
        // ====================================================

        await handleCreatePayment(
            cleanedFormData
        );
    };


    // ========================================================
    // Create Payment
    // ========================================================

    const handleCreatePayment =
        async (paymentData) => {

            try {

                // ==============================================
                // Validate Customer
                // ==============================================

                if (
                    !customerId ||
                    customerId <= 0
                ) {

                    setSubmitError(

                        "A valid customer ID is required to create the payment."

                    );


                    await logApplicationEvent(

                        "PaymentForm.InvalidCustomer",

                        "Payment creation was stopped because the authenticated customer ID was invalid.",

                        {

                            customerId

                        }

                    );


                    return;
                }


                // ==============================================
                // Build API Payload
                // ==============================================

                const payload = {

                    ...paymentData,

                    customerId

                };


                /*
                 * DO NOT log payload.
                 *
                 * It contains sensitive payment credentials.
                 */


                await logApplicationEvent(

                    "Payment.CreateStarted",

                    "Payment creation request is being sent to the API.",

                    {

                        customerId,

                        loanType:
                            paymentData.loanType,

                        loanName:
                            paymentData.loanName,

                        lenderName:
                            paymentData.lenderName,

                        paymentType:
                            paymentData.paymentType,

                        paymentAmount:
                            paymentData.paymentAmount,

                        paymentFrequency:
                            paymentData.paymentFrequency,

                        paymentDate:
                            paymentData.paymentDate

                    }

                );


                // ==============================================
                // Create Payment
                // ==============================================

                const result =
                    await createPayment(
                        payload
                    );


                // ==============================================
                // Successful Creation
                // ==============================================

                if (result === true) {

                    await logApplicationEvent(

                        "Payment.CreateSucceeded",

                        "Payment was successfully created.",

                        {

                            customerId,

                            loanType:
                                paymentData.loanType,

                            loanName:
                                paymentData.loanName,

                            lenderName:
                                paymentData.lenderName,

                            paymentType:
                                paymentData.paymentType,

                            paymentAmount:
                                paymentData.paymentAmount,

                            paymentFrequency:
                                paymentData.paymentFrequency,

                            paymentDate:
                                paymentData.paymentDate

                        }

                    );


                    /*
                     * Only reset the form after the API
                     * successfully creates the payment.
                     */

                    setFormData(
                        initialState
                    );


                    setErrors({});


                    setTouched({});


                    setSubmitError("");


                    setShowPaymentInformation(
                        false
                    );
                }

            }
            catch (error) {

                // ==========================================
                // Log Payment Creation Failure
                // ==========================================

                await logApplicationEvent(

                    "Payment.CreateFailed",

                    "Payment creation failed.",

                    {

                        customerId,

                        loanType:
                            paymentData?.loanType,

                        loanName:
                            paymentData?.loanName,

                        lenderName:
                            paymentData?.lenderName,

                        paymentType:
                            paymentData?.paymentType,

                        paymentAmount:
                            paymentData?.paymentAmount,

                        paymentFrequency:
                            paymentData?.paymentFrequency,

                        paymentDate:
                            paymentData?.paymentDate,

                        errorMessage:

                            error?.message ||

                            "Unknown payment creation error.",

                        statusCode:

                            error?.response?.status ||

                            error?.status ||

                            null

                    }

                );


                /*
                 * Keep all form data intact so the user
                 * can correct/retry the submission.
                 */

                setSubmitError(

                    error?.message ||

                    "Unable to create payment. Please try again."

                );
            }
        };


    // ========================================================
    // Input CSS Helpers
    // ========================================================

    const getInputClass = (name) => {

        if (!touched[name]) {

            return "form-control";
        }


        return errors[name]

            ? "form-control is-invalid"

            : "form-control is-valid";
    };


    const getSelectClass = (name) => {

        if (!touched[name]) {

            return "form-select";
        }


        return errors[name]

            ? "form-select is-invalid"

            : "form-select is-valid";
    };


    const renderError = (name) => {

        if (

            !touched[name] ||

            !errors[name]

        ) {

            return null;
        }


        return (

            <div className="invalid-feedback d-block">

                {errors[name]}

            </div>

        );
    };


    // ========================================================
    // Existing Payment Source Loading
    // ========================================================

    useEffect(() => {

        async function loadAllPaymentSources() {

            try {

                setLoadingPayment(
                    true
                );


                await logApplicationEvent(

                    "PaymentSource.LoadStarted",

                    "Payment source information loading started.",

                    {

                        customerId

                    }

                );


                const data =
                    await paymentService
                        .getAllPaymentSources();


                if (

                    data &&

                    data.length > 0

                ) {

                    setCurrentPaymentSouirce(
                        data[0]
                    );


                    setCurrentPayment(
                        data[0]
                    );


                    await logApplicationEvent(

                        "PaymentSource.LoadSucceeded",

                        "Payment source information loaded successfully.",

                        {

                            customerId,

                            paymentSourceCount:
                                data.length,

                            paymentSourceId:
                                data[0]?.id ?? null,

                            paymentType:
                                data[0]?.paymentType ?? null,

                            lastFour:
                                data[0]?.lastFour ?? null

                        }

                    );

                }
                else {

                    setCurrentPaymentSouirce(
                        null
                    );


                    setCurrentPayment(
                        null
                    );


                    await logApplicationEvent(

                        "PaymentSource.NoneFound",

                        "No active payment sources were found for the customer.",

                        {

                            customerId

                        }

                    );
                }

            }
            catch (error) {

                await logApplicationEvent(

                    "PaymentSource.LoadFailed",

                    "Unable to load payment source information.",

                    {

                        customerId,

                        errorMessage:

                            error?.message ||

                            "Unknown payment source loading error.",

                        statusCode:

                            error?.response?.status ||

                            error?.status ||

                            null

                    }

                );


                setCurrentPaymentSouirce(
                    null
                );


                setCurrentPayment(
                    null
                );

            }
            finally {

                setLoadingPayment(
                    false
                );
            }
        }


        if (customerId > 0) {

            /*
             * Enable when payment source loading is required.
             */

            loadAllPaymentSources();
        }

    }, [customerId]);


    // ========================================================
    // Render
    // ========================================================

    return (

        <form
            onSubmit={handleSubmit}
        >

            {submitError && (

                <div className="alert alert-danger mb-4">

                    {submitError}

                </div>

            )}


            {/* =================================================
                LOAN INFORMATION
            ================================================= */}

            <h4>
                Loan Information
            </h4>


            {/* Loan Type */}

            <select
                className={`${getSelectClass(
                    "loanType"
                )} mb-3`}
                name="loanType"
                value={formData.loanType}
                onChange={handleChange}
                onBlur={handleBlur}
                required
            >

                <option value="">
                    Select Loan Type
                </option>

                <option value="Auto Loan">
                    Auto Loan
                </option>

                <option value="Mortgage">
                    Mortgage
                </option>

                <option value="Credit Card">
                    Credit Card
                </option>

                <option value="Student Loan">
                    Student Loan
                </option>

                <option value="Personal Loan">
                    Personal Loan
                </option>

            </select>


            {renderError(
                "loanType"
            )}


            {/* Loan Name */}

            <input
                type="text"
                className={`${getInputClass(
                    "loanName"
                )} mb-1`}
                name="loanName"
                value={formData.loanName}
                placeholder="Loan Name"
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={100}
                required
            />


            {renderError(
                "loanName"
            )}


            {/* Lender Name */}

            <input
                type="text"
                className={`${getInputClass(
                    "lenderName"
                )} mb-1`}
                name="lenderName"
                value={formData.lenderName}
                placeholder="Lender Name"
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={100}
                required
            />


            {renderError(
                "lenderName"
            )}


            {/* =================================================
                Loan Account Number
            ================================================= */}

            <div className="position-relative">

                <input
                    type={
                        showLANumber
                            ? "text"
                            : "password"
                    }
                    className={`${getInputClass(
                        "lnAccountNumber"
                    )} mb-1`}
                    name="lnAccountNumber"
                    value={formData.lnAccountNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Loan Account Number"
                    inputMode="numeric"
                    maxLength={30}
                    required
                />


                <button
                    type="button"
                    onClick={() =>
                        setShowLANumber(
                            prev => !prev
                        )
                    }
                    aria-label={
                        showLANumber
                            ? "Hide Loan Account Number"
                            : "Show Loan Account Number"
                    }
                    className="cvv-toggle"
                >

                    <img
                        src={
                            showLANumber
                                ? eyeSlashIcon
                                : eyeIcon
                        }
                        alt=""
                    />

                </button>


                {renderError(
                    "lnAccountNumber"
                )}

            </div>


            {/* =================================================
                Confirm Loan Account Number
            ================================================= */}

            <div className="position-relative">

                <input
                    type={
                        showCLANumber
                            ? "text"
                            : "password"
                    }
                    className={`${getInputClass(
                        "lnConfirmAccountNumber"
                    )} mb-3`}
                    name="lnConfirmAccountNumber"
                    value={
                        formData.lnConfirmAccountNumber
                    }
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm Loan Account Number"
                    inputMode="numeric"
                    maxLength={30}
                    required
                />


                <button
                    type="button"
                    onClick={() =>
                        setShowCLANumber(
                            prev => !prev
                        )
                    }
                    aria-label={
                        showCLANumber
                            ? "Hide Confirm Loan Account Number"
                            : "Show Confirm Loan Account Number"
                    }
                    className="cvv-toggle"
                >

                    <img
                        src={
                            showCLANumber
                                ? eyeSlashIcon
                                : eyeIcon
                        }
                        alt=""
                    />

                </button>


                {renderError(
                    "lnConfirmAccountNumber"
                )}

            </div>


            {/* =================================================
                PAYMENT INFORMATION
            ================================================= */}

            <h4>
                Payment Information
            </h4>


            {loadingPayment && (

                <div className="mb-4">

                    Loading payment information...

                </div>

            )}


            {!loadingPayment &&
                currentPayment &&
                !showPaymentInformation && (

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
                                onClick={async () => {

                                    setShowPaymentInformation(
                                        true
                                    );


                                    await logApplicationEvent(

                                        "PaymentForm.PaymentInformationOpened",

                                        "Customer opened payment method information for editing.",

                                        {

                                            customerId,

                                            paymentSourceId:
                                                currentPayment?.id ?? null,

                                            paymentType:
                                                currentPayment?.paymentType ?? null

                                        }

                                    );

                                }}
                            >

                                Change Payment Method

                            </button>

                        </div>

                    </div>

                )}


            {!loadingPayment &&
                !currentPayment &&
                !showPaymentInformation && (

                    <div className="mb-4">

                        <p>
                            No payment method has been added.
                        </p>


                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={async () => {

                                setShowPaymentInformation(
                                    true
                                );


                                await logApplicationEvent(

                                    "PaymentForm.PaymentInformationOpened",

                                    "Customer opened payment method information to add a payment method.",

                                    {

                                        customerId

                                    }

                                );

                            }}
                        >

                            Add Payment Method

                        </button>

                    </div>

                )}


            {/* =================================================
                PAYMENT METHOD ENTRY
            ================================================= */}

            {showPaymentInformation && (

                <div className="row">

                    <div className="col-md-12 mb-2">

                        Payment Type:

                        {" "}

                        [{formData.paymentType}]

                    </div>


                    {/* Payment Type */}

                    <div className="col-md-12 mb-4">

                        <select
                            className={getSelectClass(
                                "paymentType"
                            )}
                            name="paymentType"
                            value={formData.paymentType}
                            onChange={
                                handlePaymentTypeChange
                            }
                            onBlur={handleBlur}
                            required
                        >

                            <option value="ACH">
                                ACH
                            </option>

                            <option value="Card">
                                Credit Card
                            </option>

                        </select>


                        {renderError(
                            "paymentType"
                        )}

                    </div>


                    {/* =================================================
                        ACH PAYMENT
                    ================================================= */}

                    {formData.paymentType === "ACH" && (

                        <>

                            {/* Routing Number */}

                            <div className="col-md-12 mb-1">

                                <input
                                    className={getInputClass(
                                        "routingNumber"
                                    )}
                                    type="text"
                                    name="routingNumber"
                                    placeholder="Routing Number"
                                    value={
                                        formData.routingNumber
                                    }
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    inputMode="numeric"
                                    maxLength={9}
                                    required
                                />


                                {renderError(
                                    "routingNumber"
                                )}

                            </div>


                            {/* Account Number */}

                            <div className="col-md-12 mb-1">

                                <div className="position-relative">

                                    <input
                                        className={getInputClass(
                                            "accountNumber"
                                        )}
                                        type={
                                            showBANumber
                                                ? "text"
                                                : "password"
                                        }
                                        name="accountNumber"
                                        placeholder="Account Number"
                                        value={
                                            formData.accountNumber
                                        }
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        inputMode="numeric"
                                        maxLength={30}
                                        required
                                    />


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowBANumber(
                                                prev => !prev
                                            )
                                        }
                                        aria-label={
                                            showBANumber
                                                ? "Hide Bank Account Number"
                                                : "Show Bank Account Number"
                                        }
                                        className="cvv-toggle"
                                    >

                                        <img
                                            src={
                                                showBANumber
                                                    ? eyeSlashIcon
                                                    : eyeIcon
                                            }
                                            alt=""
                                        />

                                    </button>


                                    {renderError(
                                        "accountNumber"
                                    )}

                                </div>

                            </div>


                            {/* Confirm Account Number */}

                            <div className="col-md-12 mb-1">

                                <input
                                    className={getInputClass(
                                        "confirmAccountNumber"
                                    )}
                                    type="password"
                                    name="confirmAccountNumber"
                                    placeholder="Confirm Account Number"
                                    value={
                                        formData.confirmAccountNumber
                                    }
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    inputMode="numeric"
                                    maxLength={30}
                                    required
                                />


                                {renderError(
                                    "confirmAccountNumber"
                                )}

                            </div>


                            {/* Account Type */}

                            <div className="col-md-12 mb-4">

                                <select
                                    className={getSelectClass(
                                        "accountType"
                                    )}
                                    name="accountType"
                                    value={
                                        formData.accountType
                                    }
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                >

                                    <option value="">
                                        Select Account Type
                                    </option>

                                    <option value="Checking">
                                        Checking
                                    </option>

                                    <option value="Savings">
                                        Savings
                                    </option>

                                </select>


                                {renderError(
                                    "accountType"
                                )}

                            </div>

                        </>

                    )}


                    {/* =================================================
                        CREDIT CARD PAYMENT
                    ================================================= */}

                    {formData.paymentType === "Card" && (

                        <>

                            {/* Credit Card Number */}

                            <div className="col-md-12 mb-1">

                                <div className="position-relative">

                                    <input
                                        className={getInputClass(
                                            "creditcardnumber"
                                        )}
                                        type={
                                            showCCNumber
                                                ? "text"
                                                : "password"
                                        }
                                        name="creditcardnumber"
                                        placeholder="Credit Card Number"
                                        value={
                                            formData.creditcardnumber
                                        }
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        inputMode="numeric"
                                        maxLength={19}
                                        required
                                    />


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCCNumber(
                                                prev => !prev
                                            )
                                        }
                                        aria-label={
                                            showCCNumber
                                                ? "Hide Credit Card Number"
                                                : "Show Credit Card Number"
                                        }
                                        className="cvv-toggle"
                                    >

                                        <img
                                            src={
                                                showCCNumber
                                                    ? eyeSlashIcon
                                                    : eyeIcon
                                            }
                                            alt=""
                                        />

                                    </button>


                                    {renderError(
                                        "creditcardnumber"
                                    )}

                                </div>

                            </div>

                            <div className="col-md-12 mb-1">   
                                <label htmlFor="cardType" className="form-label">
                                    Card Type
                                </label>

                                <div className="d-flex gap-3 flex-wrap">

                                    <label className="card-type-option">
                                        <input
                                            type="radio"
                                            name="cardType"
                                            value="Visa"
                                            checked={formData.cardType === "Visa"}
                                            onChange={handleChange}
                                            className="d-none"
                                        />

                                        <div className="card-type-card">
                                            <img
                                                src="/images/cards/visa.png"
                                                alt="Visa"
                                                className="card-type-image"
                                            />

                                            <span>Visa</span>
                                        </div>
                                    </label>


                                    <label className="card-type-option">
                                        <input
                                            type="radio"
                                            name="cardType"
                                            value="Mastercard"
                                            checked={formData.cardType === "Mastercard"}
                                            onChange={handleChange}
                                            className="d-none"
                                        />

                                        <div className="card-type-card">
                                            <img
                                                src="/images/cards/mastercard.png"
                                                alt="Mastercard"
                                                className="card-type-image"
                                            />

                                            <span>Mastercard</span>
                                        </div>
                                    </label>


                                    <label className="card-type-option">
                                        <input
                                            type="radio"
                                            name="cardType"
                                            value="Discover"
                                            checked={formData.cardType === "Discover"}
                                            onChange={handleChange}
                                            className="d-none"
                                        />

                                        <div className="card-type-card">
                                            <img
                                                src="/images/cards/discover.png"
                                                alt="Discover"
                                                className="card-type-image"
                                            />

                                            <span>Discover</span>
                                        </div>
                                    </label>


                                    <label className="card-type-option">
                                        <input
                                            type="radio"
                                            name="cardType"
                                            value="American Express"
                                            checked={formData.cardType === "American Express"}
                                            onChange={handleChange}
                                            className="d-none"
                                        />

                                        <div className="card-type-card">
                                            <img
                                                src="/images/cards/amex.png"
                                                alt="American Express"
                                                className="card-type-image"
                                            />

                                            <span>Amex</span>
                                        </div>
                                    </label>

                                </div>
                            </div>

                            {/* Expiration Date */}

                            <div className="col-md-12 mb-1">

                                <input
                                    className={getInputClass(
                                        "expdate"
                                    )}
                                    type="date"
                                    name="expdate"
                                    value={
                                        formData.expdate
                                    }
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                />


                                {renderError(
                                    "expdate"
                                )}

                            </div>


                            {/* CVV */}

                            <div className="col-md-6 mb-4">

                                <div className="position-relative">

                                    <input
                                        className={getInputClass(
                                            "cvvcode"
                                        )}
                                        type={
                                            showCvv
                                                ? "text"
                                                : "password"
                                        }
                                        name="cvvcode"
                                        placeholder="CVV Code"
                                        value={
                                            formData.cvvcode
                                        }
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        inputMode="numeric"
                                        maxLength={4}
                                        required
                                    />


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCvv(
                                                prev => !prev
                                            )
                                        }
                                        aria-label={
                                            showCvv
                                                ? "Hide CVV Code"
                                                : "Show CVV Code"
                                        }
                                        className="cvv-toggle"
                                    >

                                        <img
                                            src={
                                                showCvv
                                                    ? eyeSlashIcon
                                                    : eyeIcon
                                            }
                                            alt=""
                                        />

                                    </button>

                                </div>


                                {renderError(
                                    "cvvcode"
                                )}

                            </div>

                        </>

                    )}

                </div>

            )}


            {/* =================================================
                LOAN AMOUNT
            ================================================= */}

            <h4>
                Loan Amount
            </h4>


            {/* Current Balance */}

            <input
                type="number"
                step="0.01"
                min="0"
                className={`${getInputClass(
                    "currentBalance"
                )} mb-1`}
                name="currentBalance"
                value={
                    formData.currentBalance
                }
                placeholder="Current Balance"
                onChange={handleChange}
                onBlur={handleBlur}
                required
            />


            {renderError(
                "currentBalance"
            )}


            {/* Interest Rate */}

            <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className={`${getInputClass(
                    "interestRate"
                )} mb-3`}
                name="interestRate"
                value={
                    formData.interestRate
                }
                placeholder="Interest Rate (%)"
                onChange={handleChange}
                onBlur={handleBlur}
                required
            />


            {renderError(
                "interestRate"
            )}


            {/* =================================================
                AUTO PAY SETTINGS
            ================================================= */}

            <h4>
                Auto Pay Settings
            </h4>


            {/* Payment Amount */}

            <input
                type="number"
                step="0.01"
                min="0.01"
                className={`${getInputClass(
                    "paymentAmount"
                )} mb-1`}
                name="paymentAmount"
                value={
                    formData.paymentAmount
                }
                placeholder="Payment Amount"
                onChange={handleChange}
                onBlur={handleBlur}
                required
            />


            {renderError(
                "paymentAmount"
            )}


            {/* Payment Frequency */}

            <select
                className={`${getSelectClass(
                    "paymentFrequency"
                )} mb-1`}
                name="paymentFrequency"
                value={
                    formData.paymentFrequency
                }
                onChange={handleChange}
                onBlur={handleBlur}
                required
            >

                <option value="">
                    Select Frequency
                </option>

                <option value="Monthly">
                    Monthly
                </option>

                <option value="Bi-Weekly">
                    Bi-Weekly
                </option>

                <option value="Weekly">
                    Weekly
                </option>

            </select>


            {renderError(
                "paymentFrequency"
            )}


            {/* Payment Date */}

            <input
                type="date"
                className={`${getInputClass(
                    "paymentDate"
                )} mb-1`}
                name="paymentDate"
                value={
                    formData.paymentDate
                }
                onChange={handleChange}
                onBlur={handleBlur}
                required
            />


            {renderError(
                "paymentDate"
            )}


            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
                className="btn btn-primary mt-3"
                type="submit"
            >

                Create Payment

            </button>

        </form>

    );
}

