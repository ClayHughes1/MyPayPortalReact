import React, { useState } from "react";
import PaymentSourceEditModal from "./PaymentSourceEditModal";


const PaymentSourceList = ({
    paymentSources = [],
    loading = false,
    error = "",
    onCreate,
    onUpdate,
    onDelete
}) => {

    const [selectedPaymentSource, setSelectedPaymentSource] =
        useState(null);

    const [showEditModal, setShowEditModal] =
        useState(false);


    // =========================================================
    // DEBUG
    // =========================================================

    console.log(
        "PaymentSourceList received payment sources:",
        paymentSources
    );


    // =========================================================
    // EDIT
    // =========================================================

    const handleEdit = (source) => {

        setSelectedPaymentSource(source);

        setShowEditModal(true);

    };


    // =========================================================
    // CLOSE EDIT MODAL
    // =========================================================

    const handleCloseEditModal = () => {

        setShowEditModal(false);

        setSelectedPaymentSource(null);

    };


    // =========================================================
    // SAVE EDIT
    // =========================================================

    const handleSaveEdit = async (updatedSource) => {

        try {

            if (onUpdate) {

                await onUpdate(updatedSource);

            }

            handleCloseEditModal();

        } catch (err) {

            console.error(
                "Failed to update payment source:",
                err
            );

        }

    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="text-center py-4">

                <div
                    className="spinner-border"
                    role="status"
                >

                    <span className="visually-hidden">
                        Loading payment sources...
                    </span>

                </div>

                <div className="mt-2">
                    Loading payment sources...
                </div>

            </div>

        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (

            <div
                className="alert alert-danger"
                role="alert"
            >

                {error}

            </div>

        );

    }


    // =========================================================
    // VALIDATE PAYMENT SOURCE ARRAY
    // =========================================================

    const sources =
        Array.isArray(paymentSources)
            ? paymentSources
            : [];


    // =========================================================
    // NO PAYMENT SOURCES
    // =========================================================

    if (sources.length === 0) {

        return (

            <div className="text-center py-4">

                <p className="text-muted mb-3">
                    No payment sources are currently associated
                    with your account.
                </p>

                {onCreate && (

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onCreate}
                    >
                        Add Payment Source
                    </button>

                )}

            </div>

        );

    }


    // =========================================================
    // PAYMENT SOURCE LIST
    // =========================================================

    return (

        <>

            <div>

                <div className="d-flex justify-content-between align-items-center mb-3">

                    <h6 className="mb-0">
                        Payment Sources
                    </h6>


                    {onCreate && (

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={onCreate}
                        >
                            Add Payment Source
                        </button>

                    )}

                </div>


                <div className="table-responsive">

                    <table className="table table-striped table-hover align-middle">

                        <thead>

                            <tr>

                                <th>
                                    Type
                                </th>

                                <th>
                                    Account / Card
                                </th>

                                <th>
                                    Name
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Default
                                </th>

                                <th className="text-end">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {sources.map((source, index) => (

                                <tr
                                    key={
                                        source.id ??
                                        source.paymentSourceId ??
                                        index
                                    }
                                >

                                    <td>
                                        {source.paymentType ?? "—"}
                                    </td>


                                    <td>
                                        {source.maskedAccountNumber ??
                                            source.maskedCardNumber ??
                                            (source.lastFour
                                                ? `•••• ${source.lastFour}`
                                                : "—")}
                                    </td>


                                    <td>
                                        {source.accountName ??
                                            source.cardholderName ??
                                            source.name ??
                                            "—"}
                                    </td>


                                    <td>

                                        <span
                                            className={
                                                source.status === "Active"
                                                    ? "badge bg-success"
                                                    : "badge bg-secondary"
                                            }
                                        >

                                            {source.status ?? "Unknown"}

                                        </span>

                                    </td>


                                    <td>

                                        {source.isDefault
                                            ? (
                                                <span className="badge bg-primary">
                                                    Yes
                                                </span>
                                            )
                                            : (
                                                <span className="text-muted">
                                                    No
                                                </span>
                                            )}

                                    </td>


                                    <td className="text-end">

                                        <div className="d-flex justify-content-end">

                                            {onUpdate && (

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() =>
                                                        handleEdit(source)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                            )}


                                            {onDelete && (

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger ms-2"
                                                    onClick={() =>
                                                        onDelete(
                                                            source.id ??
                                                            source.paymentSourceId
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            )}

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =====================================================
                EDIT PAYMENT SOURCE MODAL
            ====================================================== */}

            {showEditModal && selectedPaymentSource && (

                <PaymentSourceEditModal
                    paymentSource={selectedPaymentSource}
                    onSave={handleSaveEdit}
                    onClose={handleCloseEditModal}
                />

            )}

        </>

    );

};


export default PaymentSourceList;









// import React from "react";


//     const PaymentSourceList = ({
//         paymentSources = [],
//         loading = false,
//         error = "",
//         onCreate,
//         onUpdate,
//         onDelete
//     }) => {

//     const [selectedPaymentSource, setSelectedPaymentSource] = useState(null); 
//     const [showEditModal, setShowEditModal] = useState(false);
            

//     // =========================================================
//     // DEBUG
//     // =========================================================

//     console.log(
//         "PaymentSourceList received payment sources:",
//         paymentSources
//     );


//     // =========================================================
//     // LOADING
//     // =========================================================

//     if (loading) {

//         return (

//             <div className="text-center py-4">

//                 <div
//                     className="spinner-border"
//                     role="status"
//                 >

//                     <span className="visually-hidden">
//                         Loading payment sources...
//                     </span>

//                 </div>

//                 <div className="mt-2">
//                     Loading payment sources...
//                 </div>

//             </div>

//         );

//     }


//     // =========================================================
//     // ERROR
//     // =========================================================

//     if (error) {

//         return (

//             <div
//                 className="alert alert-danger"
//                 role="alert"
//             >

//                 {error}

//             </div>

//         );

//     }


//     // =========================================================
//     // VALIDATE PAYMENT SOURCE ARRAY
//     // =========================================================

//     const sources =
//         Array.isArray(paymentSources)
//             ? paymentSources
//             : [];


//     // =========================================================
//     // NO PAYMENT SOURCES
//     // =========================================================

//     if (sources.length === 0) {

//         return (

//             <div className="text-center py-4">

//                 <p className="text-muted mb-3">
//                     No payment sources are currently associated with your account.
//                 </p>

//                 {onCreate && (

//                     <button
//                         type="button"
//                         className="btn btn-primary"
//                         onClick={onCreate}
//                     >
//                         Add Payment Source
//                     </button>

//                 )}

//             </div>

//         );

//     }


//     // =========================================================
//     // PAYMENT SOURCE LIST
//     // =========================================================

//     return (

//         <div>

//             <div className="d-flex justify-content-between align-items-center mb-3">

//                 <h6 className="mb-0">
//                     Payment Sources
//                 </h6>


//                 {onCreate && (

//                     <button
//                         type="button"
//                         className="btn btn-primary"
//                         onClick={onCreate}
//                     >
//                         Add Payment Source
//                     </button>

//                 )}

//             </div>


//             <div className="table-responsive">

//                 <table className="table table-striped table-hover align-middle">

//                     <thead>

//                         <tr>

//                             <th>
//                                 Type
//                             </th>

//                             <th>
//                                 Account / Card
//                             </th>

//                             <th>
//                                 Name
//                             </th>

//                             <th>
//                                 Status
//                             </th>

//                             <th>
//                                 Default
//                             </th>

//                             <th className="text-end">
//                                 Actions
//                             </th>

//                         </tr>

//                     </thead>


//                     <tbody>

//                         {sources.map((source, index) => (

//                             <tr
//                                 key={
//                                     source.id ??
//                                     source.paymentSourceId ??
//                                     index
//                                 }
//                             >

//                                 <td>
//                                     {
//                                         source.paymentType ??
//                                         source.type ??
//                                         "—"
//                                     }
//                                 </td>


//                                 <td>
//                                     {
//                                         source.maskedAccountNumber ??
//                                         source.maskedCardNumber ??
//                                         source.lastFour
//                                             ? `•••• ${source.lastFour}`
//                                             : "—"
//                                     }
//                                 </td>


//                                 <td>
//                                     {
//                                         source.accountName ??
//                                         source.cardholderName ??
//                                         source.name ??
//                                         "—"
//                                     }
//                                 </td>


//                                 <td>

//                                     <span
//                                         className={
//                                             source.status === "Active"
//                                                 ? "badge bg-success"
//                                                 : "badge bg-secondary"
//                                         }
//                                     >

//                                         {
//                                             source.status ??
//                                             "Unknown"
//                                         }

//                                     </span>

//                                 </td>


//                                 <td>

//                                     {
//                                         source.isDefault
//                                             ? (
//                                                 <span className="badge bg-primary">
//                                                     Yes
//                                                 </span>
//                                             )
//                                             : (
//                                                 <span className="text-muted">
//                                                     No
//                                                 </span>
//                                             )
//                                     }

//                                 </td>


//                                 <td className="text-end">

//                                     <div className="btn-group">

//                                         {onUpdate && (

//                                             <button
//                                                 type="button"
//                                                 className="btn btn-sm btn-outline-primary"
//                                                 onClick={() =>
//                                                     onUpdate(source)
//                                                 }
//                                             >
//                                                 Edit
//                                             </button>

//                                         )}


//                                         {onDelete && (

//                                             <button
//                                                 type="button"
//                                                 className="btn btn-sm btn-outline-danger"
//                                                 onClick={() =>
//                                                     onDelete(
//                                                         source.id ??
//                                                         source.paymentSourceId
//                                                     )
//                                                 }
//                                             >
//                                                 Delete
//                                             </button>

//                                         )}

//                                     </div>

//                                 </td>

//                             </tr>

//                         ))}

//                     </tbody>

//                 </table>

//             </div>

//         </div>

//     );

// };


// export default PaymentSourceList;





// // import React, { useEffect, useState } from "react";


// // const  PaymentSourceList = () => {


// // };

// // export default PaymentSourceList;