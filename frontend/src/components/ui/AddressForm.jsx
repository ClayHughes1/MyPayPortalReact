import React, { useState } from 'react';
export default function AddressForm({ formData, handleChange }) {
    return (

        <div className="container-fluid px-0">
            <section>
                <h2 className="mb-4 text-center text-sm-start">Address</h2>
                
                {/* Row 1: Street Address */}
                <div className="row align-items-center mb-3">
                    <div className="col-sm-4 text-sm-end text-start">
                        <label className="form-label mb-sm-0 fw-semibold">Street Address</label>
                    </div>
                    <div className="col-sm-8">
                        <input className="form-control" name="address1" placeholder="1234 Main St" value={formData.address1 || ''} onChange={handleChange}  required />
                    </div>
                </div>

                {/* Row 2: Apartment */}
                <div className="row align-items-center mb-3">
                    <div className="col-sm-4 text-sm-end text-start">
                        <label className="form-label mb-sm-0 fw-semibold">Apartment, suite, or unit</label>
                    </div>
                    <div className="col-sm-8">
                        <input className="form-control" name="address2" placeholder="Apartment 2B" value={formData.address2 || ''} onChange={handleChange} />
                    </div>
                </div>

                {/* Row 3: City */}
                <div className="row align-items-center mb-3">
                    <div className="col-sm-4 text-sm-end text-start">
                        <label className="form-label mb-sm-0 fw-semibold">City</label>
                    </div>
                    <div className="col-sm-8">
                        <input className="form-control" name="city" placeholder="City" value={formData.city || ''} onChange={handleChange} required/>
                    </div>
                </div>

                {/* Row 4: State */}
                <div className="row align-items-center mb-3">
                    <div className="col-sm-4 text-sm-end text-start">
                        <label className="form-label mb-sm-0 fw-semibold">State</label>
                    </div>
                    <div className="col-sm-8">
                        <input className="form-control" name="state" placeholder="State" value={formData.state || ''} onChange={handleChange} required/>
                    </div>
                </div>

                {/* Row 5: Zip Code */}
                <div className="row align-items-center mb-4">
                    <div className="col-sm-4 text-sm-end text-start">
                        <label className="form-label mb-sm-0 fw-semibold">Zip Code</label>
                    </div>
                    <div className="col-sm-8">
                        <input className="form-control" name="zipCode" placeholder="Zip" value={formData.zipCode || ''} onChange={handleChange} required/>
                    </div>
                </div>
            </section>
        </div>

        // <div className="container mt-10">
        //      <h2>Address</h2>
        //     <div className="row">
        //         {/* <div className="col-md-2">
        //             <label className="form-label">
        //                 First Name
        //             </label>
        //         </div> */}
        //         <div className="col-md-12">

        //             <input
        //                 className="form-control"
        //                 type="text"
        //             />
             
        //         </div>
        //     </div>  
        // </div>

        // <div className="col-md-12">
        //         <section>

        //             <h2>Address</h2>

        //             <input
        //                 name="address1"
        //                 placeholder="Street Address"
        //                 value={formData.address1}
        //                 onChange={handleChange}
        //             />

        //             <input
        //                 name="address2"
        //                 placeholder="Apartment"
        //                 value={formData.address2}
        //                 onChange={handleChange}
        //             />

        //             <input
        //                 name="city"
        //                 placeholder="City"
        //                 value={formData.city}
        //                 onChange={handleChange}
        //             />

        //             <input
        //                 name="state"
        //                 placeholder="State"
        //                 value={formData.state}
        //                 onChange={handleChange}
        //             />

        //             <input
        //                 name="zipCode"
        //                 placeholder="Zip Code"
        //                 value={formData.zipCode}
        //                 onChange={handleChange}
        //             />

        //         </section>
        // </div>
    );

}