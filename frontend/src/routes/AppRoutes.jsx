import { Routes, Route } from "react-router-dom";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import CustomersPage from "../features/customers/pages/CustomersPage";
import CustomerDetailsPage from "../features/customers/pages/CustomerDetailsPage";
import PaymentsPage from "../features/payments/pages/PaymentsPage";
import NotFoundPage from "../pages/NotFoundPage";
import CreateAccount from "../pages/CreateAccount";
import Login from "../pages/Login";
import ProtectedRoute from "../components/common/ProtectedRoute";
import CreatePaymentsage from "../features/payments/pages/CreatePayment";
import CustomerReports from "../features/reports/pages/ReportPage"; 

export default function AppRoutes() {
    const isAuthenticated = !!localStorage.getItem("token");


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
                element={<CreatePaymentsage />}
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
                path="/payments"
                element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <PaymentsPage />
                </ProtectedRoute>
                }
            />
        </Routes>
    );
}