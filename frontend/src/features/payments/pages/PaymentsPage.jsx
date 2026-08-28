// src/features/payments/pages/PaymentsPage.jsx

import { useEffect, useState } from "react";

import PaymentForm from "../components/PaymentForm";
import PaymentList from "../components/PaymentList";

import usePayments from "../hooks/usePayments";

import logService from "../../../services/logService";


export default function PaymentsPage() {

    const [currentUser, setCurrentUser] =
        useState(null);


    const {
        payments,
        loading,
        error,
        createPayment,
        updatePayment,
        deletePayment
    } = usePayments();


    // =========================================================
    // LOAD CURRENT USER
    // =========================================================

    useEffect(() => {

        const loadCurrentUser = async () => {

            try {

                await logService.info(
                    "Payments page initialization started.",
                    {
                        sourceContext:
                            "PaymentsPage",

                        requestPath:
                            "/payments",

                        httpMethod:
                            "GET"
                    }
                );


                const storedUser =
                    localStorage.getItem("user");


                if (!storedUser) {

                    await logService.logWarning(
                        "Payments page loaded without a logged-in user.",
                        {
                            sourceContext:
                                "PaymentsPage",

                            requestPath:
                                "/payments",

                            httpMethod:
                                "GET"
                        }
                    );

                    setCurrentUser(null);

                    return;
                }


                const user =
                    JSON.parse(storedUser);


                setCurrentUser(user);


                await logService.info(
                    "Payments page loaded for authenticated user.",
                    {
                        sourceContext:
                            "PaymentsPage",

                        requestPath:
                            "/payments",

                        httpMethod:
                            "GET",

                        customerId:
                            user?.id ?? null
                    }
                );

            }
            catch (error) {

                await logService.logError(
                    "Error loading current user on Payments page.",
                    {
                        sourceContext:
                            "PaymentsPage",

                        requestPath:
                            "/payments",

                        httpMethod:
                            "GET",

                        exception:
                            error?.message
                    }
                );
            }

        };


        loadCurrentUser();

    }, []);


    // =========================================================
    // MONITOR PAYMENT DATA
    // =========================================================

    useEffect(() => {

        if (loading) {

            logService.info(
                "Payment data loading started.",
                {
                    sourceContext:
                        "PaymentsPage",

                    requestPath:
                        "/api/payments"
                }
            );

            return;
        }


        if (error) {

            logService.logError(
                "Payment data failed to load.",
                {
                    sourceContext:
                        "PaymentsPage",

                    requestPath:
                        "/api/payments",

                    exception:
                        error
                }
            );

            return;
        }


        if (payments) {

            logService.info(
                "Payment data loaded successfully.",
                {
                    sourceContext:
                        "PaymentsPage",

                    requestPath:
                        "/api/payments"
                }
            );
        }

    }, [
        loading,
        error,
        payments
    ]);


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="container-fluid py-4">

            <h1>
                Payment Management
            </h1>


            <p>
                Manage your payments.
            </p>


            {
                error &&

                <div className="alert alert-danger">

                    {error}

                </div>
            }


            <div className="row">

                <div className="col-lg-12">

                    <div className="card">

                        <div className="card-header">

                            Existing Payments

                        </div>


                        <div className="card-body">

                            <PaymentList

                                payments={payments}

                                loading={loading}

                                onDelete={deletePayment}

                                onUpdate={updatePayment}

                            />

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

