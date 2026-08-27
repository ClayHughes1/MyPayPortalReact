const API_URL =
    "http://localhost:5000/api/applicationlogs";

const getAuthHeaders = () => {

    const token =
        localStorage.getItem("token");

    return {
        "Content-Type": "application/json",

        ...(token && {
            Authorization:
                `Bearer ${token}`
        })
    };
};


const info = async (
    message,
    additionalData = {}
) => {

    try {

        await fetch(API_URL, {

            method: "POST",

            headers:
                getAuthHeaders(),

            body: JSON.stringify({

                level: "Information",

                message,

                ...additionalData

            })

        });

    }
    catch {
        // Do not throw logging errors back into
        // the application workflow.
    }
};


const logWarning = async (
    message,
    additionalData = {}
) => {

    try {

        await fetch(API_URL, {

            method: "POST",

            headers:
                getAuthHeaders(),

            body: JSON.stringify({

                level: "Warning",

                message,

                ...additionalData

            })

        });

    }
    catch {
        // Logging failure should never break
        // the application.
    }
};


const logError = async (
    message,
    additionalData = {}
) => {

    try {

        await fetch(API_URL, {

            method: "POST",

            headers:
                getAuthHeaders(),

            body: JSON.stringify({

                level: "Error",

                message,

                ...additionalData

            })

        });

    }
    catch {
        // Logging failure should never break
        // the application.
    }
};


const logService = {

    info,

    logWarning,

    logError

};


export default logService;