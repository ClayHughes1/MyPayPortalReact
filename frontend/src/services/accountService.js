import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";


const create = async (accountData) => {

    const response = await axios.post(
        `${API_BASE_URL}/account`,
        accountData
    );

    return response.data;

};


export default {
    create
};