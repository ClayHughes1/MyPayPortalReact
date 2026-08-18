// import apiHelper from '../helpers/apiHelper'

// const API_URL = "https://localhost:7001/api/login";

const API_URL = "http://localhost:5000/api/auth";


export async function login(username, password) {

    console.log(`${API_URL}/login`);


    const response = await fetch(
        `${API_URL}/login`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username: username,
                password: password
            })
        }
    );


    console.log("Response", response);


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message || "Login failed"
        );

    }


    /*
     * Save JWT
     */
    localStorage.setItem(
        "token",
        data.token
    );


    return data;
}


/*
 * Check whether the JWT exists AND
 * whether it has expired.
 */
// export function isLoggedIn() {

//     const token =
//         localStorage.getItem("token");


//     if (!token) {

//         return false;

//     }


//     try {

//         /*
//          * JWT structure:
//          *
//          * header.payload.signature
//          */

//         const payload =
//             JSON.parse(
//                 atob(
//                     token.split(".")[1]
//                 )
//             );


//         /*
//          * JWT exp is in seconds.
//          * Date.now() is milliseconds.
//          */

//         const expirationTime =
//             payload.exp * 1000;


//         /*
//          * Token has expired.
//          */
//         if (
//             !expirationTime ||
//             Date.now() >= expirationTime
//         ) {

//             logout();

//             return false;

//         }


//         return true;

//     }
//     catch (error) {

//         console.error(
//             "Invalid authentication token:",
//             error
//         );


//         logout();

//         return false;

//     }
// }

export function isLoggedIn() {

    const token =
        localStorage.getItem("token");

    if (!token) {
        return false;
    }

    try {

        const payload =
            JSON.parse(
                atob(token.split(".")[1])
            );

        const expirationTime =
            payload.exp * 1000;

        console.log(
            "JWT expiration:",
            new Date(expirationTime)
        );

        console.log(
            "Current time:",
            new Date()
        );

        if (
            !expirationTime ||
            Date.now() >= expirationTime
        ) {

            console.log("JWT HAS EXPIRED");

            logout();

            return false;
        }

        return true;

    }
    catch (error) {

        console.error(
            "Invalid authentication token:",
            error
        );

        logout();

        return false;
    }
}


/*
 * Log the user out.
 */
export function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem("isLoggedIn");

}








// const API_URL = "http://localhost:5000/api/auth";
// export async function login(username, password) {
//     console.log(`${API_URL}/login`);
//     const response = await fetch(`${API_URL}/login`, {

//         method: "POST",

//         headers: {
//             "Content-Type": "application/json"
//         },

//         body: JSON.stringify({
//             username: username,
//             password: password
//         })
//     });


//     console.log("Respoinse",response);
//     const data = await response.json();

//     if (!response.ok) {
//         throw new Error(data.message || "Login failed");
//     }

//     // Save the token after successful login 
//     localStorage.setItem("token", data.token);

//     return data;
// }

// // Check whether the user is logged in 
// export function isLoggedIn() 
// { 
//     const token = localStorage.getItem("token"); 
//     console.log("The token value is.   ",token);
//     return !!token; 
// } 
// // Log the user out 
// export function logout() {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     localStorage.removeItem("isLoggedIn");
// }