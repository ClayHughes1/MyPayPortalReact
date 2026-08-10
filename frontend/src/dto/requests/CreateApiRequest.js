class ApiRequest {
    constructor(data = {}) {
        this.url = data.url || "";

        this.method = data.method || "GET";

        this.body = data.body || null;

        this.headers = data.headers || {
            "Content-Type": "application/json"
        };

        this.params = data.params || {};

        this.timeout = data.timeout || 30000;

        this.requiresAuth = data.requiresAuth ?? true;
    }
}

export default ApiRequest;