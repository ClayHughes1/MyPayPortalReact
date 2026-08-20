const API_URL = "http://localhost:5000/api/loanaccounts";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        ...(token && {
            Authorization: `Bearer ${token}`
        })
    };
};

export const getAll = async () => {
    const response = await fetch(API_URL, {
        method: "GET",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve loan accounts.");
    }

    return await response.json();
};

export const getById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve loan account.");
    }

    return await response.json();
};

export const getByCustomerId = async (customerId) => {
    const response = await fetch(
        `${API_URL}/customer/${customerId}`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to retrieve customer loan accounts."
        );
    }

    return await response.json();
};

export const create = async (loanAccount) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(loanAccount)
    });

    if (!response.ok) {
        throw new Error("Failed to create loan account.");
    }

    return await response.json();
};

export const update = async (id, loanAccount) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(loanAccount)
    });

    if (!response.ok) {
        throw new Error("Failed to update loan account.");
    }

    return await response.json();
};

export const remove = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to delete loan account.");
    }
};