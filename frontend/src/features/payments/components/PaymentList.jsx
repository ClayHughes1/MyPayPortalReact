// src/features/payments/components/PaymentList.jsx

import PaymentCard from "./PaymentCard";


export default function PaymentList({
    payments,
    loading,
    onDelete,
    onUpdate
}) {

    if (loading) {

        return (

            <div className="text-center">

                <div
                    className="spinner-border"
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading...
                    </span>

                </div>

            </div>

        );

    }



    if (!payments || payments.length === 0) {

        return (

            <div className="alert alert-info">

                No payment accounts have been created.

            </div>

        );

    }



    return (

        <div className="row g-3">


            {
                payments.map(payment => (

                    <div
                        className="col-12"
                        key={payment.id}
                    >

                        <PaymentCard

                            payment={payment}

                            onDelete={onDelete}

                            onUpdate={onUpdate}

                        />

                    </div>

                ))

            }


        </div>

    );

}