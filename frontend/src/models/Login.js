class Login {

    constructor(data = {}) {


        this.id =
            data.id || 0;


        this.userId =
            data.userId || 0;


        this.username =
            data.username || "";


        this.passwordHash =
            data.passwordHash || "";


        this.lastLoginDate =
            data.lastLoginDate || null;


        this.failedLoginAttempts =
            data.failedLoginAttempts || 0;


        this.isLocked =
            data.isLocked ?? false;


        this.lockedDate =
            data.lockedDate || null;


        this.createdDate =
            data.createdDate || new Date().toISOString();


        this.modifiedDate =
            data.modifiedDate || null;


    }

}


export default Login;