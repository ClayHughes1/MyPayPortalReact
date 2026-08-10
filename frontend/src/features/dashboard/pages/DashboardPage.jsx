function DashboardPage() {
  return (
        <>
            <h1>Welcome to MyPay Portal</h1>

            <p>
                AutoPayPlus is a customer payment management platform
                designed to simplify recurring payment administration,
                account management, and payment tracking.
            </p>

            <p>
                This application enables users to manage customer
                profiles, monitor payment activity, and review payment
                history from a centralized dashboard.
            </p>

            <section className="dashboard-cards">

                <div className="card p-3 m-3">
                    <h2>Customers</h2>

                    <p>
                        Create, update, and maintain customer accounts.
                    </p>
                </div>

                <div className="card p-3 m-3">
                    <h2>Payments</h2>

                    <p>
                        View scheduled and completed payments.
                    </p>
                </div>

                <div className="card p-3 m-3">
                    <h2>Reports</h2>

                    <p>
                        Monitor account activity and payment trends.
                    </p>
                </div>

            </section>
        </>
    );
}

export default DashboardPage;