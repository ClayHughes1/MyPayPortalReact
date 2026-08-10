export function validateCreateAccount(formData) {

    const errors = {};

    if (!formData.firstName.trim()) {
        errors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
        errors.lastName = "Last name is required.";
    }

    // if (!formData.acceptTerms) {
    //     errors.acceptTerms =
    //         "You must accept the Terms and Conditions.";
    // }

    // if (!formData.acceptPrivacy) {
    //     errors.acceptPrivacy =
    //         "You must accept the Privacy Policy.";
    // }

    // if (!formData.authorizePayments) {
    //     errors.authorizePayments =
    //         "You must authorize recurring payments.";
    // }

    return errors;
}