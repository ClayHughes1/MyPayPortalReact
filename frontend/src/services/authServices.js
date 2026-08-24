const API_URL = "http://localhost:5000/api/auth";
const GOOGLE_API_URL =
    "https://localhost:7000/api/auth";

export async function login(username, password) {

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

        // console.log(
        //     "JWT expiration:",
        //     new Date(expirationTime)
        // );

        // console.log(
        //     "Current time:",
        //     new Date()
        // );

        if (
            !expirationTime ||
            Date.now() >= expirationTime
        ) {

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

/*
 * Google OAuth token request
 */
export async function googleLogin(code) {

    const response = await fetch(
        `${GOOGLE_API_URL}/google-token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Google login failed"
        );
    }

    localStorage.setItem(
        "token",
        data.token
    );

    localStorage.setItem(
        "user",
        JSON.stringify(data.user)
    );

    localStorage.setItem(
        "isLoggedIn",
        "true"
    );

    return data;
}