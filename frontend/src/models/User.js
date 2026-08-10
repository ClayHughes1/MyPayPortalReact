class User {

    constructor(data = {}) {

        this.id =
            data.id || 0;

        this.firstName =
            data.firstName || "";

        this.lastName =
            data.lastName || "";

        this.email =
            data.email || "";

        this.username =
            data.username || "";

        this.passwordHash =
            data.passwordHash || "";

        this.role =
            data.role || "Customer";

        this.isActive =
            data.isActive ?? true;

        this.createdDate =
            data.createdDate || new Date().toISOString();

        this.modifiedDate =
            data.modifiedDate || null;

    }

}


export default User;