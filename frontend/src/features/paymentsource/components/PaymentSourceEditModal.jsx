import React, { useEffect, useState } from "react";


const PaymentSourceEditModal = ({
    paymentSource,
    onSave,
    onClose
}) => {

    const [formData, setFormData] = useState({
        id: null,
        paymentType: "",
        accountType: "",
        provider: "",
        status: "",
        isDefault: false
    });


    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");


    // =========================================================
    // LOAD PAYMENT SOURCE
    // =========================================================

    useEffect(() => {

        if (!paymentSource) {
            return;
        }

        setFormData({
            id: paymentSource.id ?? paymentSource.paymentSourceId ?? null,

            paymentType:
                paymentSource.paymentType ?? "",

            accountType:
                paymentSource.accountType ?? "",

            provider:
                paymentSource.provider ?? "",

            status:
                paymentSource.status ?? "",

            isDefault:
                paymentSource.isDefault ?? false
        });

        setError("");

    }, [paymentSource]);


    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleChange = (event) => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;


        setFormData(previous => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));

    };


    // =========================================================
    // SAVE
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        if (!formData.id) {

            setError(
                "Unable to update payment source. Payment source ID is missing."
            );

            return;

        }


        try {

            setSaving(true);


            await onSave(formData);

        } catch (err) {

            console.error(
                "Payment source update failed:",
                err
            );

            setError(
                err?.message ??
                "Unable to update payment source."
            );

        } finally {

            setSaving(false);

        }

    };


    // =========================================================
    // NOTHING SELECTED
    // =========================================================

    if (!paymentSource) {
        return null;
    }


    // =========================================================
    // MODAL
    // =========================================================

    return (

        <div
            className="modal fade show"
            tabIndex="-1"
            style={{
                display: "block",
                backgroundColor: "rgba(0,0,0,0.5)"
            }}
            role="dialog"
            aria-modal="true"
        >

            <div className="modal-dialog modal-dialog-centered">

                <div className="modal-content">


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="modal-header">

                        <h5 className="modal-title">
                            Edit Payment Source
                        </h5>

                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={onClose}
                            disabled={saving}
                        />

                    </div>


                    {/* =================================================
                        BODY
                    ================================================= */}

                    <form onSubmit={handleSubmit}>

                        <div className="modal-body">


                            {error && (

                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >
                                    {error}
                                </div>

                            )}


                            {/* Payment Type */}

                            <div className="mb-3">

                                <label
                                    htmlFor="paymentType"
                                    className="form-label"
                                >
                                    Payment Type
                                </label>

                                <input
                                    id="paymentType"
                                    type="text"
                                    className="form-control"
                                    value={formData.paymentType}
                                    disabled
                                />

                            </div>


                            {/* Last Four */}

                            <div className="mb-3">

                                <label
                                    htmlFor="lastFour"
                                    className="form-label"
                                >
                                    Account / Card
                                </label>

                                <input
                                    id="lastFour"
                                    type="text"
                                    className="form-control"
                                    value={
                                        paymentSource.lastFour
                                            ? `•••• ${paymentSource.lastFour}`
                                            : "—"
                                    }
                                    disabled
                                />

                            </div>


                            {/* Account Type */}
                            {formData.paymentType === "ACH" ? (

                                <div className="mb-3">

                                    <label
                                        htmlFor="accountType"
                                        className="form-label"
                                    >
                                        Account Type
                                    </label>

                                    <select
                                        id="accountType"
                                        name="accountType"
                                        className="form-select"
                                        value={formData.accountType}
                                        onChange={handleChange}
                                    >

                                        <option value="">
                                            Select account type
                                        </option>

                                        <option value="Checking">
                                            Checking
                                        </option>

                                        <option value="Savings">
                                            Savings
                                        </option>

                                    </select>

                                </div>

                            ) : (

                                <div className="mb-3">

                                    <label
                                        htmlFor="cardType"
                                        className="form-label"
                                    >
                                        Card Type
                                    </label>

                                    <select
                                        id="cardType"
                                        name="cardType"
                                        className="form-select"
                                        value={formData.cardType}
                                        onChange={handleChange}
                                    >

                                        <option value="">
                                            Select card type
                                        </option>

                                        <option value="Visa">
                                            Visa
                                        </option>

                                        <option value="Mastercard">
                                            Mastercard
                                        </option>

                                        <option value="American Express">
                                            American Express
                                        </option>

                                        <option value="Discover">
                                            Discover
                                        </option>

                                    </select>

                                </div>

                            )}


                            {/* <div className="mb-3">

                                <label
                                    htmlFor="accountType"
                                    className="form-label"
                                >
                                    Account Type
                                </label>

                                <select
                                    id="accountType"
                                    name="accountType"
                                    className="form-select"
                                    value={formData.accountType}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select account type
                                    </option>

                                    <option value="Checking">
                                        Checking
                                    </option>

                                    <option value="Savings">
                                        Savings
                                    </option>

                                </select>

                            </div> */}


                            {/* Provider */}

                            <div className="mb-3">

                                <label
                                    htmlFor="provider"
                                    className="form-label"
                                >
                                    Provider
                                </label>

                                <input
                                    id="provider"
                                    name="provider"
                                    type="text"
                                    className="form-control"
                                    value={formData.provider}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* Status */}

                            <div className="mb-3">

                                <label
                                    htmlFor="status"
                                    className="form-label"
                                >
                                    Status
                                </label>

                                <select
                                    id="status"
                                    name="status"
                                    className="form-select"
                                    value={formData.status}
                                    onChange={handleChange}
                                >

                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>

                                </select>

                            </div>


                            {/* Default */}

                            <div className="form-check">

                                <input
                                    id="isDefault"
                                    name="isDefault"
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={formData.isDefault}
                                    onChange={handleChange}
                                />

                                <label
                                    htmlFor="isDefault"
                                    className="form-check-label"
                                >
                                    Make this my default payment source
                                </label>

                            </div>

                        </div>


                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <div className="modal-footer">

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >

                                {saving
                                    ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            />

                                            Saving...
                                        </>
                                    )
                                    : "Save Changes"}

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>

    );

};


export default PaymentSourceEditModal;
