const API_URL = "http://localhost:5000/api/payments";


function getAuthHeaders()
{
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}



const paymentService = {


    async getAll(customerId)
    {

        const response = await fetch(
            `${API_URL}/customer/${customerId}`,
            {
                method:"GET",

                headers:getAuthHeaders()
            }
        );


        const data = await response.json();

console.log(data);
        if(!response.ok)
        {
            throw new Error(
                "Unable to retrieve payments."
            );
        }


        return data;
    },




    async getById(id)
    {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method:"GET",

                headers:getAuthHeaders()
            }
        );


        const data = await response.json();


        if(!response.ok)
        {
            throw new Error(
                "Unable to retrieve payment."
            );
        }


        return data;

    },





    async create(payment)
    {
console.log(JSON.stringify(payment, null, 2));
        const response = await fetch(
            API_URL,
            {
                method:"POST",

                headers:getAuthHeaders(),

                body:JSON.stringify(payment)
            }
        );


        const data = await response.json();


        if(!response.ok)
        {
            throw new Error(
                "Unable to create payment."
            );
        }


        return data;

    },





    async update(id,payment)
    {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method:"PUT",

                headers:getAuthHeaders(),

                body:JSON.stringify(payment)
            }
        );


        const data = await response.json();


        if(!response.ok)
        {
            throw new Error(
                "Unable to update payment."
            );
        }


        return data;

    },





    async delete(id)
    {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method:"DELETE",

                headers:getAuthHeaders()
            }
        );


        if(!response.ok)
        {
            throw new Error(
                "Unable to delete payment."
            );
        }


        return true;

    }


};


export default paymentService;