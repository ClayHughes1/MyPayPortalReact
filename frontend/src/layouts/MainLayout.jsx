import Navbar from "../components/common/Navbar";

function MainLayout({ children }) {
    return (
        <>
            <Navbar />

            <main className="container">
                {children}
            </main>
        </>
    );
}

export default MainLayout;