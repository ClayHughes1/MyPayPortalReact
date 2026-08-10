class UserRequest {
    constructor(data = {}) {
        this.firstName = data.firstName || "";
        this.lastName = data.lastName || "";
        this.email = data.email || "";
        this.phone = data.phone || "";
        this.username = data.username || "";
        this.password = data.password || "";
        this.confirmPassword = data.confirmPassword || "";
    }
}

export default UserRequest;