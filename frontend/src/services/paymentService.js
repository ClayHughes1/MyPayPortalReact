const API_URL = "http://localhost:5000/api/payments";
const PaySources_API_URL = "http://localhost:5000/api/PaymentSources"

function getAuthHeaders()
{
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}


const paymentService = {


    /*
     * Get all payment methods for a specific customer.
     *
     * Keep this method for situations where the application
     * already knows the customerId and needs all payment methods.
     */




    async getAll(customerId)
    {
        const response = await fetch(
            `${API_URL}/customer/${customerId}`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );


        const data = await response.json();

        if(!response.ok)
        {
            throw new Error(
                data.message || "Unable to retrieve payments."
            );
        }


        return data;
    },



    /*
     * Get the current/default payment method for the
     * authenticated customer.
     *
     * The backend should determine the customer from
     * the JWT rather than accepting a customerId from
     * the browser.
     */
    async getCurrent()
    {
        const response = await fetch(
            `${API_URL}/current`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );


        const data = await response.json();


        if(!response.ok)
        {
            throw new Error(
                data.message ||
                "Unable to retrieve current payment information."
            );
        }


        return data;
    },



    /*
     * Get all payment methods for the authenticated customer.
     *
     * This is useful when the user clicks:
     *
     * "Select Existing Payment Method"
     */
    async getMine()
    {
        const response = await fetch(
            `${API_URL}/mine`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );


        const data = await response.json();


        if(!response.ok)
        {
            throw new Error(
                data.message ||
                "Unable to retrieve payment methods."
            );
        }


        return data;
    },



    /*
     * Get a payment method by ID.
     */
    async getById(id)
    {
        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );


        const data = await response.json();


        if(!response.ok)
        {
            throw new Error(
                data.message ||
                "Unable to retrieve payment."
            );
        }


        return data;
    },



    /*
     * Create a new payment method.
     *
     * The payment object should contain the information
     * required by the backend/payment provider.
     *
     * Do NOT store CVV or raw payment credentials in
     * your database.
     */
    async create(payment)
    {

        const response = await fetch(
            API_URL,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payment)
            }
        );


        const data = await response.json();


        if(!response.ok)
        {
            throw new Error(
                data.message ||
                "Unable to create payment."
            );
        }


        return data;
    },



    /*
     * Update an existing payment method.
     */
    async update(id, payment)
    {
        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(payment)
            }
        );


        const data = await response.json();


        if(!response.ok)
        {
            throw new Error(
                data.message ||
                "Unable to update payment."
            );
        }


        return data;
    },



    /*
     * Set a payment method as the current/default
     * payment method.
     *
     * This allows the user to select an existing
     * payment method without creating a new one.
     */
    async setCurrent(id)
    {
        const response = await fetch(
            `${API_URL}/${id}/current`,
            {
                method: "PUT",
                headers: getAuthHeaders()
            }
        );


        const data = await response.json();


        if(!response.ok)
        {
            throw new Error(
                data.message ||
                "Unable to set current payment method."
            );
        }


        return data;
    },



    /*
     * Delete/deactivate a payment method.
     */
    async delete(id)
    {
        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );


        if(!response.ok)
        {
            const data = await response.json().catch(() => ({}));


            throw new Error(
                data.message ||
                "Unable to delete payment."
            );
        }


        return true;
    },

    async makePayment(payment)
    {
        console.log("Sending poayment info \n",payment);
        const response = await fetch(
            `${API_URL}/make-payment`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payment)
            }
        );

        const data = await response.json();

        if(!response.ok)
        {
            throw new Error(
                data.message ||
                "Unable to process payment."
            );
        }

        return data;
    },

};


export default paymentService;
