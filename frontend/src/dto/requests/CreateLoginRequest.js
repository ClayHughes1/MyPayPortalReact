class LoginRequest {
    constructor(data = {}) {
        this.username = data.username || "";
        this.password = data.password || "";
        this.rememberMe = data.rememberMe || false;
    }
}

export default LoginRequest;