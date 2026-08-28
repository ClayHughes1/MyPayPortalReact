import React from "react";

import PaymentSourceList
    from "../components/PaymentSourceList";

import usePaymentSources
    from "../hooks/usePaymentSources";


const PaymentSourcePage = () => {

    const {
        paymentSources,
        loading,
        error,
        createPaymentSource,
        updatePaymentSource,
        deletePaymentSource
    } = usePaymentSources();

    console.log("PaymentSourcesPage.  \n",paymentSources);

    return (

        <div className="container-fluid py-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h1>
                        Payment Sources
                    </h1>

                    <p className="text-muted mb-0">
                        Manage the payment sources associated with your account.
                    </p>

                </div>

            </div>


            {error && (

                <div
                    className="alert alert-danger"
                    role="alert"
                >

                    {error}

                </div>

            )}


            <div className="row">

                <div className="col-lg-12">

                    <div className="card">

                        <div className="card-header">

                            <h5 className="mb-0">
                                Existing Payment Sources
                            </h5>

                        </div>


                        <div className="card-body">

                            <PaymentSourceList
                                paymentSources={
                                    paymentSources
                                }

                                loading={
                                    loading
                                }

                                error={
                                    error
                                }

                                onCreate={
                                    createPaymentSource
                                }

                                onUpdate={
                                    updatePaymentSource
                                }

                                onDelete={
                                    deletePaymentSource
                                }
                            />

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};


export default PaymentSourcePage;








// import React, { useEffect, useState } from "react";
// import PaymentSourceList from "../components/PaymewntSourceList";
// import usePaymentSources from "../hooks/usePaymentSources";


// const PaymentSourcePage = () => {
//     const [clientId, setClientId] = useState(null);
//     // const [paymentSources, setPaymentSources] = useState([]);
//     // const [loading, setLoading] = useState(true);
//     // const [error, setError] = useState("");

//     const {
//         paymentSources,
//         loading,
//         error,
//         createPaymentSource,
//         updatePaymentSource,
//         deletePaymentSource
//     } = usePaymentSources();


//     // =========================================================
//     // LOAD CURRENT USER
//     // =========================================================

//     useEffect(() => {

//         const loadCurrentUser = async () => {

//             try {

//                 await logService.info(
//                     "Payments page initialization started.",
//                     {
//                         sourceContext:
//                             "PaymentsPage",

//                         requestPath:
//                             "/payments",

//                         httpMethod:
//                             "GET"
//                     }
//                 );


//                 const storedUser =
//                     localStorage.getItem("user");


//                 if (!storedUser) {

//                     await logService.logWarning(
//                         "Payments page loaded without a logged-in user.",
//                         {
//                             sourceContext:
//                                 "PaymentsPage",

//                             requestPath:
//                                 "/payments",

//                             httpMethod:
//                                 "GET"
//                         }
//                     );

//                     setCurrentUser(null);

//                     return;
//                 }


//                 const user =
//                     JSON.parse(storedUser);


//                 // setCurrentUser(user);
//                 setClientId(user.Id);



//                 await logService.info(
//                     "Payments page loaded for authenticated user.",
//                     {
//                         sourceContext:
//                             "PaymentsPage",

//                         requestPath:
//                             "/payments",

//                         httpMethod:
//                             "GET",

//                         customerId:
//                             user?.id ?? null
//                     }
//                 );

//             }
//             catch (error) {

//                 await logService.logError(
//                     "Error loading current user on Payments page.",
//                     {
//                         sourceContext:
//                             "PaymentsPage",

//                         requestPath:
//                             "/payments",

//                         httpMethod:
//                             "GET",

//                         exception:
//                             error?.message
//                     }
//                 );
//             }

//         };


//         loadCurrentUser();

//     }, []);

//     useEffect(() => {
//         const loadPaymentSources = async () => {
//             try {
//                 setLoading(true);
//                 setError("");

//                 // TODO:
//                 // Replace this with however your application
//                 // gets the currently logged-in client's ID.
//                 // const loggedInClientId = getLoggedInClientId();

//                 if (!loggedInClientId) {
//                     throw new Error("Unable to determine the logged-in client.");
//                 }

//                 // setClientId(loggedInClientId);

//                 const response = await fetch(
//                     `/api/payment-sources/client/${loggedInClientId}`,
//                     {
//                         method: "GET",
//                         headers: {
//                             "Content-Type": "application/json",
//                         },
//                     }
//                 );

//                 if (!response.ok) {
//                     throw new Error("Unable to load payment sources.");
//                 }

//                 const data = await response.json();

//                 setPaymentSources(data);
//             } catch (err) {
//                 console.error("Error loading payment sources:", err);
//                 setError(err.message || "Unable to load payment sources.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadPaymentSources();
//     }, []);

//     if (loading) {
//         return (
//             <div className="payment-source-page">
//                 <h1>Payment Sources</h1>
//                 <div>Loading payment sources...</div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="payment-source-page">
//                 <h1>Payment Sources</h1>

//                 <div className="payment-source-error">
//                     {error}
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="container-fluid py-4">
//             <h1>Payment Sources</h1>
//             <p>
//                 Manage the payment sources associated with your account.
//             </p>

//             {
//                 error &&

//                 <div className="alert alert-danger">

//                     {error}

//                 </div>
//             }

//             <div className="row">

//                 <div className="col-lg-12">

//                     <div className="card">

//                         <div className="card-header">

//                             Existing Payments

//                         </div>

//                         <div className="card-body">

//                             <PaymentSourceList
//                                 clientId={clientId}
//                                 paymentSources={paymentSources}

//                             />

//                         </div>

//                     </div>

//                 </div>

//             </div>
//         </div>
//     );
// };

// export default PaymentSourcePage;
