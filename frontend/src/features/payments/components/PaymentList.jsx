// src/features/payments/components/PaymentList.jsx

import { useEffect } from "react";

import PaymentCard from "./PaymentCard";

import applicationLogService from "../../../services/logService";


// ============================================================
// PAYMENT LIST
// ============================================================

export default function PaymentList({
    payments,
    loading,
    onDelete,
    onUpdate
}) {

    // ========================================================
    // LOG:
    // Payment list state changed
    // ========================================================

    useEffect(() => {

        applicationLogService.info(
            "PaymentList state updated.",
            {
                sourceContext:
                    "PaymentList",

                metadata: {
                    loading:
                        loading,

                    paymentCount:
                        payments?.length ?? 0
                }
            }
        );

    }, [payments, loading]);


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        applicationLogService.info(
            "PaymentList displaying loading state.",
            {
                sourceContext:
                    "PaymentList"
            }
        );


        return (

            <div className="">

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


    // ========================================================
    // NO PAYMENTS
    // ========================================================

    if (!payments || payments.length === 0) {

        applicationLogService.info(
            "PaymentList contains no payment accounts.",
            {
                sourceContext:
                    "PaymentList"
            }
        );


        return (

            <div className="alert alert-info">

                No payment accounts have been created.

            </div>

        );

    }


    // ========================================================
    // PAYMENTS AVAILABLE
    // ========================================================

    applicationLogService.info(
        "PaymentList displaying payment accounts.",
        {
            sourceContext:
                "PaymentList",

            metadata: {
                paymentCount:
                    payments.length
            }
        }
    );


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="row g-3">

            {
                payments.map(payment => {

                    // ------------------------------------------------
                    // Log each payment being made available to the
                    // customer in the payment list.
                    //
                    // We deliberately log business identifiers and
                    // amount, but NOT sensitive account information.
                    // ------------------------------------------------

                    applicationLogService.info(
                        "Payment account displayed.",
                        {
                            sourceContext:
                                "PaymentList",

                            customerId:
                                payment.customerId,

                            paymentId:
                                payment.id,

                            loanAccountId:
                                payment.loanAccountId,

                            paymentAmount:
                                payment.paymentAmount,

                            status:
                                payment.status
                        }
                    );


                    return (

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

                    );

                })
            }

        </div>

    );

}






// // src/features/payments/components/PaymentList.jsx

// import PaymentCard from "./PaymentCard";


// export default function PaymentList({
//     payments,
//     loading,
//     onDelete,
//     onUpdate
// }) {

//     if (loading) {

//         return (

//             <div className="">

//                 <div
//                     className="spinner-border"
//                     role="status"
//                 >
//                     <span className="visually-hidden">
//                         Loading...
//                     </span>

//                 </div>

//             </div>

//         );

//     }



//     if (!payments || payments.length === 0) {

//         return (

//             <div className="alert alert-info">

//                 No payment accounts have been created.

//             </div>

//         );

//     }



//     return (

//         <div className="row g-3">


//             {
//                 payments.map(payment => (

//                     <div
//                         className="col-12"
//                         key={payment.id}
//                     >

//                         <PaymentCard

//                             payment={payment}

//                             onDelete={onDelete}

//                             onUpdate={onUpdate}

//                         />

//                     </div>

//                 ))

//             }


//         </div>

//     );

// }