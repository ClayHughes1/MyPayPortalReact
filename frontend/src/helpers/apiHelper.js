export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.headers
    };

    return fetch(url, {
        ...options,
        headers
    });
}