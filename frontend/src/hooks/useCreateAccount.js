import { useState } from "react";

import accountService from "../services/accountService";

import { validateCreateAccount }
    from "../validation/createAccountValidator";


export default function useCreateAccount() {

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [errors, setErrors] = useState({});


    const createAccount = async (
        formData,
        onSuccess
    ) => {
        setLoading(true);
        setError("");
        setErrors({});

        try {

            if (
                formData.password !== 
                formData.confirmPassword
            ) {

                setErrors({
                    confirmPassword:
                    "Passwords do not match."
                });

                return;
            }


            const validationErrors =
                validateCreateAccount(formData);

            if (
                Object.keys(validationErrors).length > 0
            ) {

                setErrors(validationErrors);

                return;

            }


            const request = {

                firstName: formData.firstName,
                middleName: formData.middleName,
                lastName: formData.lastName,

                email: formData.email,
                phone: formData.phone,

                dateOfBirth: "1974-02-17",
                ssnLast4: formData.ssnLast4,

                username: formData.email,
                password: formData.password,
                role: "Customer",

                address1: formData.address1,
                address2: formData.address2,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,


                paymentType: formData.paymentType,

                routingNumber: formData.routingNumber,
                accountNumber: formData.accountNumber,
                accountType: formData.accountType

            };

            const result =
                await accountService.create(request);

            if(onSuccess)
            {
                onSuccess();
            }
        }
        catch(err)
        {
            setError(err.message ??"Unable to create account.");
        }
        finally
        {

            setLoading(false);

        }

    };


    return {

        loading,
        error,
        errors,
        createAccount

    };

}