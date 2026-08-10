class ApiResponse {

    constructor(data = {}) {


        this.success =
            data.success ?? false;


        this.statusCode =
            data.statusCode || 200;


        this.message =
            data.message || "";


        this.data =
            data.data || null;


        this.errors =
            data.errors || [];


        this.timestamp =
            data.timestamp ||
            new Date().toISOString();

    }

}


export default ApiResponse;