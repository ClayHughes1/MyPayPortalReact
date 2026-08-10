class UpdateLoginRequest {
    constructor(data = {}) {
        this.id = data.id || 0;

        this.username = data.username || "";

        this.currentPassword = data.currentPassword || "";

        this.newPassword = data.newPassword || "";

        this.confirmPassword = data.confirmPassword || "";

        this.rememberMe = data.rememberMe ?? false;
    }
}

export default UpdateLoginRequest;