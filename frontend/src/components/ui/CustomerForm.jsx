export default function CustomerForm({ formData, handleChange }) {

    return (
        <div className="container-fluid mt-5">
            <h2 className="mb-4 text-center text-sm-start">Client Information</h2>

            <div className="row mb-2">
                <div className="col-md-2">
                    <label className="form-label">
                        First Name
                    </label>
                </div>
                <div className="col-md-5">

                    <input
                        name="firstName"
                        className="form-control"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
             
                </div>
            </div>  
            <div className="row mb-2">
                <div className="col-md-2">
                    <label className="form-label">
                        Last Name
                    </label>
                </div>
                <div className="col-md-5">

                    <input
                        name="lastName"
                        className="form-control"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
             
                </div>
            </div>  
            <div className="row mb-2">
                <div className="col-md-2">
                    <label className="form-label">
                        Email
                    </label>
                </div>
                <div className="col-md-5">

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        className="form-control"
                        onChange={handleChange}
                        required
                    />
             
                </div>
            </div> 
            <div className="row mb-2">
                 <div className="col-md-2">
                    <label className="form-label">
                        User Name
                    </label>
                </div>
                <div className="col-md-5">
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        readOnly
                        diabled
                        className="form-control"
                    />
                </div>
            </div>
            <div className="row mb-2">
                <div className="col-md-2">
                    <label className="form-label">
                        Password
                    </label>
                </div>
                <div className="col-md-5">

                    <input
                        type="password"
                        name="password"
                        // value={formData.password}
                        className="form-control"
                        required
                    />
             
                </div>
            </div>
            <div className="row mb-2">
                <div className="col-md-2">
                    <label className="form-label">
                        Confirm
                    </label>
                </div>
                <div className="col-md-5">

                    <input
                        type="password"
                        className="form-control"
                        required
                    />
             
                </div>
            </div>
            <div className="row mb-2">
                <div className="col-md-2">
                    <label className="form-label">
                        Phone
                    </label>
                </div>
                <div className="col-md-5">

                    <input
                        type="tel"
                        className="form-control"
                        required
                    />
             
                </div>
            </div>  
        </div>
    );

}