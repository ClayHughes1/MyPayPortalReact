import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { googleLogin } from "../services/authServices";

export default function GoogleCallback() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [error, setError] = useState("");

    // Prevent this component instance from
    // submitting the same Google code more than once.
    const processedCode = useRef(null);

    useEffect(() => {

        const code = searchParams.get("code");

        // console.log(
        //     "Google callback with code value:",
        //     code
        // );

        if (!code) {
            setError(
                "Google login code was not provided."
            );
            return;
        }

        // IMPORTANT:
        // Do not submit the same authorization code twice.
        if (processedCode.current === code) {

            // console.log(
            //     "Google callback already processing code:",
            //     code
            // );

            return;
        }

        processedCode.current = code;

        const completeGoogleLogin = async () => {
            try {

                await googleLogin(code);

                // Google authentication is complete.
                // JWT and user have been stored by googleLogin().

                // navigate("/payments", {
                //     replace: true
                // });
console.log("IsLOggedIn value from local storage BEFORE WE NAVIGATE TO PAYMENTS\n. ",localStorage.getItem("token"));
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







// import React, { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { googleLogin } from "../services/authServices";

// export default function GoogleCallback() {

//     const [searchParams] = useSearchParams();
//     const navigate = useNavigate();

//     const [error, setError] = useState("");

//     useEffect(() => {

//         const completeGoogleLogin = async () => {

//             const code = searchParams.get("code");

//             console.log("Googel callback with code value o.  ",code);
                        
//             if (!code) {
//                 setError(
//                     "Google login code was not provided."
//                 );
//                 return;
//             }

//             try {

//                 await googleLogin(code);

//                 // Google authentication is complete.
//                 // JWT and user have been stored by googleLogin().
//                 navigate("/payments");

//             }
//             catch (err) {

//                 console.error(
//                     "Google login failed:",
//                     err
//                 );

//                 setError(
//                     "Google login failed. Please try again."
//                 );
//             }
//         };

//         completeGoogleLogin();

//     }, [searchParams, navigate]);


//     if (error) {

//         return (
//             <div className="container text-center mt-5">

//                 <h3>Login Failed</h3>

//                 <p>{error}</p>

//             </div>
//         );
//     }


//     return (
//         <div className="container text-center mt-5">

//             <h3>Signing you in...</h3>

//             <p>
//                 Please wait while we complete your Google login.
//             </p>

//         </div>
//     );
// }