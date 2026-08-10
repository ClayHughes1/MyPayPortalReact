class UpdateUserRequest {
    constructor(data = {}) {
        this.id = data.id || 0;

        this.firstName = data.firstName || "";

        this.lastName = data.lastName || "";

        this.email = data.email || "";

        this.phone = data.phone || "";

        this.username = data.username || "";

        this.role = data.role || "";

        this.isActive = data.isActive ?? true;
    }
}

export default UpdateUserRequest;