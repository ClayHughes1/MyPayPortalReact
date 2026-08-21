import { useEffect, useState } from "react";
import PaymentForm from "../components/PaymentForm";
import usePayments from "../hooks/usePayments";

export default function CreatePayment() {
    const [currentUser, setCurrentUser] = useState(null);

    const {
        payments,
        loading,
        error,
        createPayment,
        updatePayment,
        deletePayment
    } = usePayments();
    
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
        }
        else {
            console.warn("No logged-in user found.");
        }
    }, []);

    const handleCreatePayment = (paymentData) => {
        const payload = {

            ...paymentData,

            customerId: currentUser?.id

        };
        createPayment(payload);
    };

        return (
    
            <div className="container-fluid py-4">
    
    
                <h1>
                   Payment Page 
                </h1>
    
    
                <p>
                    Create your MyPay payment.
                </p>
    
    
                {
                    error &&
    
                    <div className="alert alert-danger">
    
                        {error}
    
                    </div>
    
                }
    
    
    
                <div className="row">
    
    
                    <div className="col-lg-5">
    
    
                        <div className="card shadow">
    
    
                            <div className="card-header">
    
                                Create MyPay Payment
    
                            </div>
    
    
                            <div className="card-body">
    
    
                                <PaymentForm
    
                                    onSubmit={handleCreatePayment}
    
                                />
    
    
                            </div>
    
    
                        </div>
    
    
                    </div>
                </div>
            </div>
    
        );
    

}

