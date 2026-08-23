// src/features/loans/hooks/useLoanAccounts.js

import { useEffect, useState } from "react";

import * as loanAccountService
    from "../../../services/loanAccountService";
    
export default function useLoanAccounts() {

    const [loanAccounts, setLoanAccounts] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const storedUser =
        localStorage.getItem("user");

    const user =
        storedUser
            ? JSON.parse(storedUser)
            : null;

    const customerId = user?.id;

console.log("Customer Id in the use Loan fufile.  ", customerId);
    useEffect(() => {

        if (!customerId) {

            console.warn(
                "useLoanAccounts: customerId is not available."
            );

            return;
        }

        loadLoanAccounts();

    }, [customerId]);


    const loadLoanAccounts = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await loanAccountService.getByCustomerId(
                    customerId
                );

            setLoanAccounts(response);

        }
        catch (err) {

            console.error(
                "Unable to load loan accounts:",
                err
            );

            setError(err.message);

        }
        finally {

            setLoading(false);

        }

    };


    const createLoanAccount = async (data) => {

        try {

            setError("");

            const response =
                await loanAccountService.create(
                    data
                );

            await loadLoanAccounts();

            return response;

        }
        catch (err) {

            console.error(
                "Unable to create loan account:",
                err
            );

            setError(err.message);

            throw err;

        }

    };


    const updateLoanAccount = async (
        id,
        data
    ) => {

        try {

            setError("");

            const response =
                await loanAccountService.update(
                    id,
                    data
                );

            await loadLoanAccounts();

            return response;

        }
        catch (err) {

            console.error(
                "Unable to update loan account:",
                err
            );

            setError(err.message);

            throw err;

        }

    };


    const deleteLoanAccount = async (id) => {

        try {

            setError("");

            await loanAccountService.remove(id);

            await loadLoanAccounts();

        }
        catch (err) {

            console.error(
                "Unable to delete loan account:",
                err
            );

            setError(err.message);

            throw err;

        }

    };


    return {

        loanAccounts,

        loading,

        error,

        createLoanAccount,

        updateLoanAccount,

        deleteLoanAccount

    };

}