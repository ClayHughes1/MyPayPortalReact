// src/features/paymentSources/hooks/usePaymentSources.js

import {
    useEffect,
    useState
} from "react";

import paymentSourceService
    from "../../../services/paymentSourceService";

import logService
    from "../../../services/logService";


export default function usePaymentSources() {

    const [paymentSources, setPaymentSources] =
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
     * Load Payment Sources
     * ---------------------------------------------------------
     */

    useEffect(() => {

        if (!customerId) {

            setError(
                "Unable to load payment sources because a valid customer was not found."
            );


            logService.logWarning(
                "Payment source list could not be loaded because no valid customer ID was available.",
                {
                    customerId: customerId ?? null,
                    action: "PAYMENT_SOURCE_LIST_LOAD_VALIDATION_FAILED"
                }
            );

            return;
        }


        loadPaymentSources();

    }, [customerId]);


    const loadPaymentSources = async () => {

        try {

            setLoading(true);

            setError("");


            /*
             * Log that the customer requested
             * their saved payment sources.
             */

            await logService.info(
                `Customer ${customerId} requested payment sources.`,
                {
                    customerId,
                    action: "PAYMENT_SOURCE_LIST_LOAD_STARTED"
                }
            );


            /*
             * Retrieve payment sources from API.
             *
             * The customer ID is supplied to the existing
             * paymentSourceService.
             */

            const response =
                await paymentSourceService.getAll(
                    customerId
                );


            setPaymentSources(
                Array.isArray(response)
                    ? response
                    : []
            );


            /*
             * Log successful retrieval.
             *
             * Do not log:
             *
             * ProviderPaymentMethodId
             * account numbers
             * routing numbers
             * full card numbers
             */

            await logService.info(
                `Payment sources successfully loaded for customer ${customerId}.`,
                {
                    customerId,

                    action:
                        "PAYMENT_SOURCE_LIST_LOAD_COMPLETED",

                    paymentSourceCount:
                        Array.isArray(response)
                            ? response.length
                            : 0
                }
            );

        }
        catch (err) {

            const errorMessage =
                err?.message ||
                "Unable to load payment sources.";


            setError(
                errorMessage
            );


            await logService.logError(
                `Unable to load payment sources for customer ${customerId}.`,
                {
                    customerId,

                    action:
                        "PAYMENT_SOURCE_LIST_LOAD_FAILED"
                }
            );

        }
        finally {

            setLoading(false);

        }

    };


    /*
     * ---------------------------------------------------------
     * Create Payment Source
     * ---------------------------------------------------------
     *
     * This will be used by PaymentSourceForm.
     *
     * The actual provider/payment-method creation can be
     * handled by the service/API layer.
     */

    const createPaymentSource = async (
        data
    ) => {

        try {

            if (
                !customerId ||
                customerId <= 0
            ) {

                const message =
                    "A valid customer ID is required to create a payment source.";


                setError(
                    message
                );


                await logService.logWarning(
                    "Payment source creation was attempted without a valid customer ID.",
                    {
                        customerId:
                            customerId ?? null,

                        action:
                            "PAYMENT_SOURCE_CREATE_VALIDATION_FAILED"
                    }
                );


                throw new Error(
                    message
                );
            }


            /*
             * Log only safe payment-source information.
             */

            await logService.info(
                `Customer ${customerId} started creating a payment source.`,
                {
                    customerId,

                    action:
                        "PAYMENT_SOURCE_CREATE_STARTED",

                    paymentType:
                        data?.paymentType ?? null,

                    provider:
                        data?.provider ?? null
                }
            );


            const response =
                await paymentSourceService.create(
                    {
                        ...data,
                        customerId
                    }
                );


            /*
             * Refresh the list after creation.
             */

            await loadPaymentSources();


            const paymentSourceId =
                response?.id ??
                response?.paymentSourceId ??
                null;


            await logService.info(
                paymentSourceId
                    ? `Customer ${customerId} successfully created payment source ${paymentSourceId}.`
                    : `Customer ${customerId} successfully created a payment source.`,
                {
                    customerId,

                    paymentSourceId,

                    action:
                        "PAYMENT_SOURCE_CREATE_COMPLETED",

                    paymentType:
                        data?.paymentType ?? null,

                    provider:
                        data?.provider ?? null
                }
            );


            return response;

        }
        catch (err) {

            const errorMessage =
                err?.message ||
                "Unable to create payment source.";


            setError(
                errorMessage
            );


            await logService.logError(
                `Customer ${customerId ?? "unknown"} was unable to create a payment source.`,
                {
                    customerId:
                        customerId ?? null,

                    action:
                        "PAYMENT_SOURCE_CREATE_FAILED"
                }
            );


            throw err;

        }

    };


    /*
     * ---------------------------------------------------------
     * Update Payment Source
     * ---------------------------------------------------------
     */

    const updatePaymentSource = async (
        id,
        data
    ) => {

        try {

            if (
                !id ||
                id <= 0
            ) {

                const message =
                    "A valid payment source ID is required to update the payment source.";


                setError(
                    message
                );


                await logService.logWarning(
                    "Payment source update was attempted without a valid payment source ID.",
                    {
                        customerId:
                            customerId ?? null,

                        action:
                            "PAYMENT_SOURCE_UPDATE_VALIDATION_FAILED"
                    }
                );


                throw new Error(
                    message
                );
            }


            await logService.info(
                `Customer ${customerId} started updating payment source ${id}.`,
                {
                    customerId,

                    paymentSourceId:
                        id,

                    action:
                        "PAYMENT_SOURCE_UPDATE_STARTED",

                    paymentType:
                        data?.paymentType ?? null,

                    provider:
                        data?.provider ?? null
                }
            );


            const response =
                await paymentSourceService.update(
                    id,
                    data
                );


            /*
             * Refresh list.
             */

            await loadPaymentSources();


            await logService.info(
                `Customer ${customerId} successfully updated payment source ${id}.`,
                {
                    customerId,

                    paymentSourceId:
                        id,

                    action:
                        "PAYMENT_SOURCE_UPDATE_COMPLETED"
                }
            );


            return response;

        }
        catch (err) {

            const errorMessage =
                err?.message ||
                "Unable to update payment source.";


            setError(
                errorMessage
            );


            await logService.logError(
                `Customer ${customerId ?? "unknown"} was unable to update payment source ${id}.`,
                {
                    customerId:
                        customerId ?? null,

                    paymentSourceId:
                        id ?? null,

                    action:
                        "PAYMENT_SOURCE_UPDATE_FAILED"
                }
            );


            throw err;

        }

    };


    /*
     * ---------------------------------------------------------
     * Delete Payment Source
     * ---------------------------------------------------------
     */

    const deletePaymentSource = async (
        id
    ) => {

        try {

            if (
                !id ||
                id <= 0
            ) {

                const message =
                    "A valid payment source ID is required to delete the payment source.";


                setError(
                    message
                );


                await logService.logWarning(
                    "Payment source deletion was attempted without a valid payment source ID.",
                    {
                        customerId:
                            customerId ?? null,

                        action:
                            "PAYMENT_SOURCE_DELETE_VALIDATION_FAILED"
                    }
                );


                throw new Error(
                    message
                );
            }


            await logService.info(
                `Customer ${customerId} started deleting payment source ${id}.`,
                {
                    customerId,

                    paymentSourceId:
                        id,

                    action:
                        "PAYMENT_SOURCE_DELETE_STARTED"
                }
            );


            const response =
                await paymentSourceService.delete(
                    id
                );


            /*
             * Refresh list.
             */

            await loadPaymentSources();


            await logService.info(
                `Customer ${customerId} successfully deleted payment source ${id}.`,
                {
                    customerId,

                    paymentSourceId:
                        id,

                    action:
                        "PAYMENT_SOURCE_DELETE_COMPLETED"
                }
            );


            return response;

        }
        catch (err) {

            const errorMessage =
                err?.message ||
                "Unable to delete payment source.";


            setError(
                errorMessage
            );


            await logService.logError(
                `Customer ${customerId ?? "unknown"} was unable to delete payment source ${id}.`,
                {
                    customerId:
                        customerId ?? null,

                    paymentSourceId:
                        id ?? null,

                    action:
                        "PAYMENT_SOURCE_DELETE_FAILED"
                }
            );


            throw err;

        }

    };


    /*
     * ---------------------------------------------------------
     * Set Default Payment Source
     * ---------------------------------------------------------
     */

    const setDefaultPaymentSource = async (
        id
    ) => {

        try {

            if (
                !id ||
                id <= 0
            ) {

                const message =
                    "A valid payment source ID is required to set the default payment source.";


                setError(
                    message
                );


                await logService.logWarning(
                    "Setting the default payment source was attempted without a valid payment source ID.",
                    {
                        customerId:
                            customerId ?? null,

                        action:
                            "PAYMENT_SOURCE_DEFAULT_VALIDATION_FAILED"
                    }
                );


                throw new Error(
                    message
                );
            }


            await logService.info(
                `Customer ${customerId} started setting payment source ${id} as the default payment source.`,
                {
                    customerId,

                    paymentSourceId:
                        id,

                    action:
                        "PAYMENT_SOURCE_DEFAULT_STARTED"
                }
            );


            const response =
                await paymentSourceService.setDefault(
                    id
                );


            /*
             * Refresh list so the UI reflects the new
             * default payment source.
             */

            await loadPaymentSources();


            await logService.info(
                `Customer ${customerId} successfully set payment source ${id} as the default payment source.`,
                {
                    customerId,

                    paymentSourceId:
                        id,

                    action:
                        "PAYMENT_SOURCE_DEFAULT_COMPLETED"
                }
            );


            return response;

        }
        catch (err) {

            const errorMessage =
                err?.message ||
                "Unable to set the default payment source.";


            setError(
                errorMessage
            );


            await logService.logError(
                `Customer ${customerId ?? "unknown"} was unable to set payment source ${id} as the default payment source.`,
                {
                    customerId:
                        customerId ?? null,

                    paymentSourceId:
                        id ?? null,

                    action:
                        "PAYMENT_SOURCE_DEFAULT_FAILED"
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

        paymentSources,

        loading,

        error,

        createPaymentSource,

        updatePaymentSource,

        deletePaymentSource,

        setDefaultPaymentSource

    };

}
