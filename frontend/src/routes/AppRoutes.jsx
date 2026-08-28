import { Routes, Route } from "react-router-dom";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import CustomersPage from "../features/customers/pages/CustomersPage";
import CustomerDetailsPage from "../features/customers/pages/CustomerDetailsPage";
import PaymentsPage from "../features/payments/pages/PaymentsPage";
import NotFoundPage from "../pages/NotFoundPage";
import CreateAccount from "../pages/CreateAccount";
import Login from "../pages/Login";
import ProtectedRoute from "../components/common/ProtectedRoute";
import CreatePaymentsPage from "../features/payments/pages/CreatePayment";
import CustomerReports from "../features/reports/pages/ReportPage"; 
import MakeAPayment  from "../features/payments/pages/MakePayment";
import CreateLoanAccount from "../features/loans/pages/CreateLoanAccount";
import LoanPage from "../features/loans/pages/LoanAccounts";
import EditLoanAccount from "../features/loans/pages/EditLoanAccount";
import GoogleCallback from "../pages/GoogleCallback";
import PaymentSources from "../features/paymentsource/pages/PaymentSourcePage";
import CreatePaymentSources from "../features/paymentsource/components/PaymentSourceCreateModal";
import EditPaymentSources from "../features/paymentsource/components/PaymentSourceEditModal";


// and useSearchParams() retrieves:
//https://console.cloud.google.com/welcome?project=mypayportal

export default function AppRoutes() {
    const isAuthenticated = !!localStorage.getItem("token");
console.log("in routes page isAuthenticated ",isAuthenticated);

    return (
        <Routes>
            <Route 
                path="/" 
                element={<DashboardPage />} 
            />

            <Route
                path="/dashboard"
                element={<DashboardPage />}
            />

            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customer-reports" element={<CustomerReports />} />


            <Route
                path="/customers/:id"
                element={<CustomerDetailsPage />}
            />

            <Route
                path="/payments"
                element={
                        <PaymentsPage />
                }
            />
            <Route
                path="/payments/create"
                element={<CreatePaymentsPage />}
            />
            <Route
                path="/payments/makeapayment"
                element={<MakeAPayment />}
            />

            <Route
                path="/paymentsource"
                element={
                        <PaymentSources />
                }
            />
            <Route
                path="/paymentsource/create"
                element={<CreatePaymentSources />}
            />
            <Route
                path="/paymentsource/edit"
                element={<EditPaymentSources />}
            />


            <Route
                path="/loans"
                element={<LoanPage />}
            />
            <Route
                path="/loans/createloan"
                element={<CreateLoanAccount />}
            />
            <Route
                path="/loans/editloan"
                element={<EditLoanAccount />}
            />

            <Route
                path="/create-account"
                element={

                        <CreateAccount />

                }
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route path="*" element={<NotFoundPage />} 
            />

            <Route
                path="/google-callback"
                element={<GoogleCallback />}
            />
        </Routes>
    );
}