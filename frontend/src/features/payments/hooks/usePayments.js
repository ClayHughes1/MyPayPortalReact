// src/features/payments/hooks/usePayments.js

import {
    useEffect,
    useState
} from "react";

import paymentService
    from "../../../services/paymentService";

import logService
    from "../../../services/logService";

import PaymentRequest
    from "../../../dto/requests/CreatePaymentRequest";

import MakePaymentRequest
    from "../../../dto/requests/MakePaymentRequest";


export default function usePayments() {

    const [payments, setPayments] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    /*
     * ---------------------------------------------------------
     * Current User
     * ---------------------------------------------------------
     */

    const storedUser =
        localStorage.getItem("user");

    const user =
        storedUser
            ? JSON.parse(storedUser)
            : null;

    const customerId =
        user?.id;


    /*
     * ---------------------------------------------------------
     * Application Logging
     * ---------------------------------------------------------
     *
     * All application logging goes through the existing
     * logService.
     *
     * The logService sends the event to:
     *
     *     /api/applicationlogs
     *
     * The API then persists the event to ApplicationLogs.
     *
     * Never place sensitive payment information in logs.
     *
     * Safe information includes:
     *
     *     CustomerId
     *     PaymentId
     *     LoanId
     *     Amount
     *     Payment type
     *     Application action
     *
     * Never log:
     *
     *     Full credit card number
     *     CVV
     *     Routing number
     *     Full bank account number
     *     Passwords
     */


    /*
     * ---------------------------------------------------------
     * Load Payments
     * ---------------------------------------------------------
     */

    useEffect(() => {

        if (!customerId) {

            setError(
                "Unable to load payments because a valid customer was not found."
            );


            logService.logWarning(
                "Payment list could not be loaded because no valid customer ID was available.",
                {
                    customerId: customerId ?? null,
                    action: "PAYMENT_LIST_LOAD_VALIDATION_FAILED"
                }
            );

            return;
        }


        loadPayments();

    }, [customerId]);


    const loadPayments = async () => {

        try {

            setLoading(true);

            setError("");


            /*
             * Log that the customer requested
             * their payment accounts.
             */

            await logService.info(
                `Customer ${customerId} requested payment accounts.`,
                {
                    customerId,
                    action: "PAYMENT_LIST_LOAD_STARTED"
                }
            );


            const response =
                await paymentService.getAll(
                    customerId
                );


            setPayments(
                response
            );


            /*
             * Log successful retrieval.
             */

            await logService.info(
                `Payment accounts successfully loaded for customer ${customerId}.`,
                {
                    customerId,
                    action: "PAYMENT_LIST_LOAD_COMPLETED",
                    paymentCount:
                        Array.isArray(response)
                            ? response.length
                            : 0
                }
            );

        }
        catch (err) {

            const errorMessage =
                err?.message ||
                "Unable to load payment accounts.";


            setError(
                errorMessage
            );


            /*
             * Do not expose the technical exception
             * to the application log message if it
             * could contain sensitive information.
             *
             * The backend can capture exception details
             * separately if required.
             */

            await logService.logError(
                `Unable to load payment accounts for customer ${customerId}.`,
                {
                    customerId,
                    action: "PAYMENT_LIST_LOAD_FAILED"
                }
            );

        }
        finally {

            setLoading(false);

        }

    };


    /*
     * ---------------------------------------------------------
     * Create Payment
     * ---------------------------------------------------------
     */

    const createPayment = async (
        data
    ) => {

        try {

            /*
             * Validate customer.
             */

            if (
                !customerId ||
                customerId <= 0
            ) {

                const message =
                    "A valid customer ID is required to create the payment.";


                setError(
                    message
                );


                await logService.logWarning(
                    "Payment creation was attempted without a valid customer ID.",
                    {
                        customerId: customerId ?? null,
                        action:
                            "PAYMENT_CREATE_VALIDATION_FAILED"
                    }
                );


                throw new Error(
                    message
                );
            }


            /*
             * Log creation attempt.
             *
             * We intentionally do NOT log:
             *
             *     accountNumber
             *     routingNumber
             *     creditcardnumber
             *     cvvcode
             *     loan account numbers
             */

            await logService.info(
                `Customer ${customerId} started creating a payment account.`,
                {
                    customerId,

                    action:
                        "PAYMENT_CREATE_STARTED",

                    paymentType:
                        data?.paymentType ?? null,

                    amount:
                        data?.paymentAmount
                            ? Number(data.paymentAmount)
                            : null
                }
            );


            /*
             * Create request DTO.
             */

            const request =
                new PaymentRequest(
                    data
                );


            /*
             * Send payment request to API.
             */

            const response =
                await paymentService.create(
                    request
                );


            /*
             * Refresh payment list.
             */

            await loadPayments();


            /*
             * Identify newly-created payment
             * when returned by the API.
             */

            const paymentId =
                response?.id ??
                response?.paymentId ??
                null;


            /*
             * Log successful creation.
             */

            await logService.info(
                paymentId
                    ? `Customer ${customerId} successfully created payment account ${paymentId}.`
                    : `Customer ${customerId} successfully created a payment account.`,
                {
                    customerId,

                    paymentId,

                    action:
                        "PAYMENT_CREATE_COMPLETED",

                    paymentType:
                        data?.paymentType ?? null,

                    amount:
                        data?.paymentAmount
                            ? Number(data.paymentAmount)
                            : null
                }
            );


            return true;

        }
        catch (err) {

            const errorMessage =
                err?.message ||
                "Unable to create payment.";


            setError(
                errorMessage
            );


            /*
             * Log failed creation.
             */

            await logService.logError(
                `Customer ${customerId ?? "unknown"} was unable to create a payment account.`,
                {
                    customerId:
                        customerId ?? null,

                    action:
                        "PAYMENT_CREATE_FAILED",

                    paymentType:
                        data?.paymentType ?? null,

                    amount:
                        data?.paymentAmount
                            ? Number(data.paymentAmount)
                            : null
                }
            );


            /*
             * Let PaymentForm handle the error.
             */

            throw err;

        }

    };


    /*
     * ---------------------------------------------------------
     * Update Payment
     * ---------------------------------------------------------
     */

    const updatePayment = async (
        id,
        data
    ) => {

        try {

            if (
                !id ||
                id <= 0
            ) {

                const message =
                    "A valid payment ID is required to update the payment.";


                setError(
                    message
                );


                await logService.logWarning(
                    "Payment update was attempted without a valid payment ID.",
                    {
                        customerId:
                            customerId ?? null,

                        action:
                            "PAYMENT_UPDATE_VALIDATION_FAILED"
                    }
                );


                throw new Error(
                    message
                );
            }


            /*
             * Log update start.
             */

            await logService.info(
                `Customer ${customerId} started updating payment ${id}.`,
                {
                    customerId,

                    paymentId:
                        id,

                    action:
                        "PAYMENT_UPDATE_STARTED",

                    paymentType:
                        data?.paymentType ?? null,

                    amount:
                        data?.paymentAmount
                            ? Number(data.paymentAmount)
                            : null
                }
            );


            /*
             * Update payment.
             */

            const response =
                await paymentService.update(
                    id,
                    data
                );


            /*
             * Refresh payment list.
             */

            await loadPayments();


            /*
             * Log successful update.
             */

            await logService.info(
                `Customer ${customerId} successfully updated payment ${id}.`,
                {
                    customerId,

                    paymentId:
                        id,

                    action:
                        "PAYMENT_UPDATE_COMPLETED",

                    paymentType:
                        data?.paymentType ?? null,

                    amount:
                        data?.paymentAmount
                            ? Number(data.paymentAmount)
                            : null
                }
            );


            return response;

        }
        catch (err) {

            const errorMessage =
                err?.message ||
                "Unable to update payment.";


            setError(
                errorMessage
            );


            await logService.logError(
                `Customer ${customerId ?? "unknown"} was unable to update payment ${id}.`,
                {
                    customerId:
                        customerId ?? null,

                    paymentId:
                        id ?? null,

                    action:
                        "PAYMENT_UPDATE_FAILED",

                    amount:
                        data?.paymentAmount
                            ? Number(data.paymentAmount)
                            : null
                }
            );


            throw err;

        }

    };


    /*
     * ---------------------------------------------------------
     * Delete Payment
     * ---------------------------------------------------------
     */

    const deletePayment = async (
        id
    ) => {

        try {

            if (
                !id ||
                id <= 0
            ) {

                const message =
                    "A valid payment ID is required to delete the payment.";


                setError(
                    message
                );


                await logService.logWarning(
                    "Payment deletion was attempted without a valid payment ID.",
                    {
                        customerId:
                            customerId ?? null,

                        action:
                            "PAYMENT_DELETE_VALIDATION_FAILED"
                    }
                );


                throw new Error(
                    message
                );
            }


            /*
             * Log deletion start.
             */

            await logService.info(
                `Customer ${customerId} started deleting payment ${id}.`,
                {
                    customerId,

                    paymentId:
                        id,

                    action:
                        "PAYMENT_DELETE_STARTED"
                }
            );


            /*
             * Delete payment.
             */

            const response =
                await paymentService.delete(
                    id
                );


            /*
             * Refresh payment list.
             */

            await loadPayments();


            /*
             * Log successful deletion.
             */

            await logService.info(
                `Customer ${customerId} successfully deleted payment ${id}.`,
                {
                    customerId,

                    paymentId:
                        id,

                    action:
                        "PAYMENT_DELETE_COMPLETED"
                }
            );


            return response;

        }
        catch (err) {

            const errorMessage =
                err?.message ||
                "Unable to delete payment.";


            setError(
                errorMessage
            );


            await logService.logError(
                `Customer ${customerId ?? "unknown"} was unable to delete payment ${id}.`,
                {
                    customerId:
                        customerId ?? null,

                    paymentId:
                        id ?? null,

                    action:
                        "PAYMENT_DELETE_FAILED"
                }
            );


            throw err;

        }

    };


    /*
     * ---------------------------------------------------------
     * Make Payment
     * ---------------------------------------------------------
     */

    const makePayment = async (
        data
    ) => {

        try {

            if (
                !customerId ||
                customerId <= 0
            ) {

                const message =
                    "A valid customer ID is required to make a payment.";


                setError(
                    message
                );


                await logService.logWarning(
                    "Payment transaction was attempted without a valid customer ID.",
                    {
                        customerId:
                            customerId ?? null,

                        action:
                            "MAKE_PAYMENT_VALIDATION_FAILED",

                        amount:
                            data?.paymentAmount
                                ? Number(data.paymentAmount)
                                : null
                    }
                );


                throw new Error(
                    message
                );
            }


            /*
             * Extract safe identifiers.
             */

            const loanId =
                data?.loanId ??
                null;

            const paymentId =
                data?.paymentId ??
                null;

            const amount =
                data?.paymentAmount
                    ? Number(data.paymentAmount)
                    : null;


            /*
             * Log transaction start.
             *
             * Safe information:
             *
             * CustomerId
             * LoanId
             * PaymentId
             * Amount
             *
             * Never log payment credentials.
             */

            await logService.info(
                loanId
                    ? `Customer ${customerId} started a payment for loan ${loanId}.`
                    : `Customer ${customerId} started a payment transaction.`,
                {
                    customerId,

                    loanId,

                    paymentId,

                    amount,

                    action:
                        "MAKE_PAYMENT_STARTED"
                }
            );


            /*
             * Create request DTO.
             */

            const request =
                new MakePaymentRequest(
                    data
                );


            /*
             * Process payment.
             */

            const response =
                await paymentService.makePayment(
                    request
                );


            /*
             * Refresh payments.
             */

            await loadPayments();


            /*
             * Use IDs returned from the API
             * when available.
             */

            const completedPaymentId =
                response?.paymentId ??
                response?.id ??
                paymentId ??
                null;


            const completedLoanId =
                response?.loanId ??
                loanId ??
                null;


            /*
             * Log successful payment.
             */

            await logService.info(
                completedLoanId
                    ? `Customer ${customerId} successfully made a payment for loan ${completedLoanId}.`
                    : `Customer ${customerId} successfully completed a payment transaction.`,
                {
                    customerId,

                    loanId:
                        completedLoanId,

                    paymentId:
                        completedPaymentId,

                    amount,

                    action:
                        "MAKE_PAYMENT_COMPLETED"
                }
            );


            return response;

        }
        catch (err) {

            const errorMessage =
                err?.message ||
                "Unable to process payment.";


            setError(
                errorMessage
            );


            await logService.logError(
                `Customer ${customerId ?? "unknown"} was unable to complete a payment transaction.`,
                {
                    customerId:
                        customerId ?? null,

                    loanId:
                        data?.loanId ??
                        null,

                    paymentId:
                        data?.paymentId ??
                        null,

                    amount:
                        data?.paymentAmount
                            ? Number(data.paymentAmount)
                            : null,

                    action:
                        "MAKE_PAYMENT_FAILED"
                }
            );


            throw err;

        }

    };


    /*
     * ---------------------------------------------------------
     * Hook API
     * ---------------------------------------------------------
     */

    return {

        payments,

        loading,

        error,

        createPayment,

        updatePayment,

        deletePayment,

        makePayment

    };

}

