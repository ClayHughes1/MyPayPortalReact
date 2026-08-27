const PaySources_API_URL =
    "http://localhost:5000/api/PaymentSources";


/*
 * ============================================================
 * Payment Source Service
 * ============================================================
 *
 * Handles communication with:
 *
 *     /api/PaymentSources
 *
 * Authentication is handled by the API.
 *
 * The API determines the CustomerId from the authenticated
 * user's NameIdentifier claim.
 *
 * Therefore, CustomerId should NOT be sent from the client
 * when retrieving payment sources.
 */


/*
 * ============================================================
 * Get All Payment Sources
 * ============================================================
 *
 * GET:
 *
 * /api/PaymentSources
 *
 * The API determines the customer from the authenticated user.
 */

const getAll = async () => {

    const response =
        await fetch(
            PaySources_API_URL,
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include"
            }
        );


    if (!response.ok) {

        let message =
            "Unable to load payment sources.";


        try {

            const errorData =
                await response.json();


            message =
                errorData?.message ||
                errorData?.error ||
                message;

        }
        catch {
            // API did not return JSON.
        }


        throw new Error(
            message
        );

    }


    return await response.json();

};


/*
 * ============================================================
 * Get Payment Source
 * ============================================================
 *
 * GET:
 *
 * /api/PaymentSources/{id}
 */

const getById = async (
    id
) => {

    if (
        !id ||
        id <= 0
    ) {

        throw new Error(
            "A valid payment source ID is required."
        );

    }


    const response =
        await fetch(
            `${PaySources_API_URL}/${id}`,
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include"
            }
        );


    if (!response.ok) {

        let message =
            "Unable to load the payment source.";


        try {

            const errorData =
                await response.json();


            message =
                errorData?.message ||
                errorData?.error ||
                message;

        }
        catch {
            // API did not return JSON.
        }


        throw new Error(
            message
        );

    }


    return await response.json();

};


/*
 * ============================================================
 * Create Payment Source
 * ============================================================
 *
 * POST:
 *
 * /api/PaymentSources
 *
 * CustomerId is intentionally NOT included.
 *
 * The API determines the customer from the authenticated
 * user's NameIdentifier claim.
 */

const create = async (
    data
) => {

    if (!data) {

        throw new Error(
            "Payment source data is required."
        );

    }


    const response =
        await fetch(
            PaySources_API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body:
                    JSON.stringify(data)
            }
        );


    if (!response.ok) {

        let message =
            "Unable to create payment source.";


        try {

            const errorData =
                await response.json();


            message =
                errorData?.message ||
                errorData?.error ||
                message;

        }
        catch {
            // API did not return JSON.
        }


        throw new Error(
            message
        );

    }


    return await response.json();

};


/*
 * ============================================================
 * Update Payment Source
 * ============================================================
 *
 * PUT:
 *
 * /api/PaymentSources/{id}
 *
 * The API verifies that the payment source belongs to the
 * authenticated customer.
 */

const update = async (
    id,
    data
) => {

    if (
        !id ||
        id <= 0
    ) {

        throw new Error(
            "A valid payment source ID is required."
        );

    }


    if (!data) {

        throw new Error(
            "Payment source data is required."
        );

    }


    const response =
        await fetch(
            `${PaySources_API_URL}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body:
                    JSON.stringify(data)
            }
        );


    if (!response.ok) {

        let message =
            "Unable to update payment source.";


        try {

            const errorData =
                await response.json();


            message =
                errorData?.message ||
                errorData?.error ||
                message;

        }
        catch {
            // API did not return JSON.
        }


        throw new Error(
            message
        );

    }


    return await response.json();

};


/*
 * ============================================================
 * Delete Payment Source
 * ============================================================
 *
 * DELETE:
 *
 * /api/PaymentSources/{id}
 *
 * The API performs a soft delete by changing Status to
 * "Inactive".
 */

const remove = async (
    id
) => {

    if (
        !id ||
        id <= 0
    ) {

        throw new Error(
            "A valid payment source ID is required."
        );

    }


    const response =
        await fetch(
            `${PaySources_API_URL}/${id}`,
            {
                method: "DELETE",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include"
            }
        );


    if (!response.ok) {

        let message =
            "Unable to delete payment source.";


        try {

            const errorData =
                await response.json();


            message =
                errorData?.message ||
                errorData?.error ||
                message;

        }
        catch {
            // API did not return JSON.
        }


        throw new Error(
            message
        );

    }


    /*
     * Controller returns NoContent().
     */

    if (
        response.status === 204
    ) {

        return true;

    }


    return await response.json();

};


/*
 * ============================================================
 * Service API
 * ============================================================
 */

const paymentSourceService = {

    getAll,

    getById,

    create,

    update,

    delete: remove

};


export default paymentSourceService;
