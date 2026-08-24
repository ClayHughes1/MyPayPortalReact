import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { googleLogin } from "../services/authServices";

export default function GoogleCallback() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [error, setError] = useState("");

    useEffect(() => {

        const completeGoogleLogin = async () => {

            const code = searchParams.get("code");

            if (!code) {
                setError(
                    "Google login code was not provided."
                );
                return;
            }

            try {

                await googleLogin(code);

                // Google authentication is complete.
                // JWT and user have been stored by googleLogin().
                navigate("/payments");

            }
            catch (err) {

                console.error(
                    "Google login failed:",
                    err
                );

                setError(
                    "Google login failed. Please try again."
                );
            }
        };

        completeGoogleLogin();

    }, [searchParams, navigate]);


    if (error) {

        return (
            <div className="container text-center mt-5">

                <h3>Login Failed</h3>

                <p>{error}</p>

            </div>
        );
    }


    return (
        <div className="container text-center mt-5">

            <h3>Signing you in...</h3>

            <p>
                Please wait while we complete your Google login.
            </p>

        </div>
    );
}