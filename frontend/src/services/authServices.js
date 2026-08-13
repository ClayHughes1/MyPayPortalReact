// import apiHelper from '../helpers/apiHelper'

// const API_URL = "https://localhost:7001/api/login";
const API_URL = "http://localhost:5000/api/auth";
export async function login(username, password) {
    console.log(`${API_URL}/login`);
    const response = await fetch(`${API_URL}/login`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username: username,
            password: password
        })
    });


    console.log("Respoinse",response);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    // Save the token after successful login 
    localStorage.setItem("token", data.token);

    return data;
}

// Check whether the user is logged in 
export function isLoggedIn() 
{ 
    const token = localStorage.getItem("token"); 
    console.log("The token value is.   ",token);
    return !!token; 
} 
// Log the user out 
export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
}