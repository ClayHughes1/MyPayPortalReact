import { useEffect, useState } from "react";
import PaymentForm from "../components/PaymentForm";
import usePayments from "../hooks/usePayments";

export default function CreatePayment() {
    console.log("PaymentsPage");
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
        console.log("Stored user:", storedUser);
        if (storedUser) {
            const user = JSON.parse(storedUser);
            console.log("Parsed user:", user);
            console.log("User Id:", user.id);
            setCurrentUser(user);
        }
        else {
            console.warn("No logged-in user found.");
        }
    }, []);

    const handleCreatePayment = (paymentData) => {
        console.log("Payment data received:", paymentData);
        const payload = {

            ...paymentData,

            customerId: currentUser?.id

        };
        console.log("Final payment payload:", payload);
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
                    currentUser &&
    
                    <div className="alert alert-info">
    
                        Logged in user:
    
                        {" "}
    
                        {currentUser.firstName} {currentUser.lastName}
    
                        {" "}
    
                        (Customer ID: {currentUser.id})
    
                    </div>
    
                }
    
    
    
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

