import { useEffect,useState } from "react";

import paymentService from "../../../services/paymentService";

import PaymentRequest from "../../../dto/requests/CreatePaymentRequest";


export default function usePayments(){


    const [payments,setPayments]=useState([]);

    const [loading,setLoading]=useState(false);

    const [error,setError]=useState("");



    const user = JSON.parse(localStorage.getItem("user"));

    const customerId = user?.id;

console.log("customer id in",customerId);
    useEffect(()=>{

        loadPayments();

    },[]);



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



    return {


        payments,

        loading,

        error,

        createPayment,

        updatePayment,

        deletePayment

    };


}