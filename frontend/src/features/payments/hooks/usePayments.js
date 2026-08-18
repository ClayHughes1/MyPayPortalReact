import { useEffect,useState } from "react";

import paymentService from "../../../services/paymentService";

import PaymentRequest 
    from "../../../dto/requests/CreatePaymentRequest";
import MakePaymentRequest
    from "../../../dto/requests/MakePaymentRequest";

export default function usePayments(){


    const [payments,setPayments]=useState([]);

    const [loading,setLoading]=useState(false);

    const [error,setError]=useState("");



    // const user = JSON.parse(localStorage.getItem("user"));

    const storedUser =
        localStorage.getItem("user");

    const user =
        storedUser
            ? JSON.parse(storedUser)
            : null;

    const customerId = user?.id;

    console.log("customer id in",customerId);

    useEffect(() => {

        if (!customerId) {
            console.warn(
                "usePayments: customerId is not available."
            );

            return;
        }

        loadPayments();

    }, [customerId]);



    const loadPayments = async()=>{


        try{

            setLoading(true);


            const response =
                await paymentService.getAll(customerId);


            setPayments(response);


        }
        catch(err){
            console.log("Error in the usePayments",err);
            setError(err.message);

        }
        finally{

            setLoading(false);

        }

    };

    const createPayment = async(data)=>{


        try{

console.log(data);
            const request =
                new PaymentRequest(data);

   console.log("Request object after DTO mapping:", request);


            await paymentService.create(request);



            await loadPayments();


        }
        catch(err){

            setError(err.message);

        }


    };

    const updatePayment =
        async(id,data)=>{


        await paymentService.update(
            id,
            data
        );


        await loadPayments();

    };

    const deletePayment =
        async(id)=>{


        await paymentService.delete(id);


        await loadPayments();

    };

    const makePayment = async (data) => {

        try {

            const request =
                new MakePaymentRequest(data);

            console.log(
                "Make Payment request:",
                request
            );

            const response =
                await paymentService.makePayment(request);

            await loadPayments();

            return response;

        }
        catch (err) {

            setError(err.message);

            throw err;

        }

    };


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