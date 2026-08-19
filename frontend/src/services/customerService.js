import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";

//Update this service to use fetch instead of axios
const API_URL = "http://localhost:5000/api/customers";

const create = async (customerData) => {

    const response = await axios.post(
        `${API_BASE_URL}/customers`,
        customerData
    );

    return response.data;

};


export default {
    create
};

// const create = async (customerData) => {

//     const response = await axios.post(
//         API_URL,
//         customerData
//     );

//     return response.data;

// };


// const customerService = {
//     create
// };


// export default customerService;