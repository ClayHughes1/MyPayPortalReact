class LoginResponse {
    constructor(data = {}) {
        this.success = data.success || false;
        this.token = data.token || "";
        this.refreshToken = data.refreshToken || "";
        this.expires = data.expires || "";
        this.message = data.message || "";

        this.user = data.user || null;
    }
}

export default LoginResponse;