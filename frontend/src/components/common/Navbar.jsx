import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";import { FaBars, FaTimes } from "react-icons/fa";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { Navigate } from "react-router-dom";
import {
    isLoggedIn as checkIsLoggedIn,
    logout
} from "../../services/authServices";

export default function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    // Keep the existing authentication logic.
    const isLoggedIn = checkIsLoggedIn();

    /*
     * Get the logged-in user's information.
     *
     * The authentication state remains controlled by
     * checkIsLoggedIn(), just as it was in the original
     * working navbar.
     */
    useEffect(() => {

        if (isLoggedIn) {

            const storedUser = localStorage.getItem("user");

            if (storedUser) {

                try {

                    setUser(JSON.parse(storedUser));

                } catch (error) {

                    console.error(
                        "Unable to read stored user information:",
                        error
                    );

                    setUser(null);
                }

            } else {

                setUser(null);

            }

        } else {

            setUser(null);
        }

    }, [isLoggedIn]);


    /*
     * Update the date/time every second.
     *
     * new Date() represents the current instant.
     * The browser's locale/timezone is used when
     * formatting the date and time below.
     */
    useEffect(() => {

        const timer = setInterval(() => {

            setCurrentTime(new Date());

        }, 1000);


        return () => {

            clearInterval(timer);

        };

    }, []);


    /*
     * Toggle navigation menu.
     */
    const toggleMenu = () => {

        setMenuOpen(prev => !prev);

    };


    /*
     * Close navigation menu.
     */
    const closeMenu = () => {

        setMenuOpen(false);

    };


    /*
     * Handle Login / Logout.
     *
     * This follows the original working implementation.
     */
    const handleLoginLogout = () => {
        if (isLoggedIn) {

            // Log out
            logout();

            // Close the menu
            closeMenu();

            // Redirect to Login
            navigate("/dashboard");

        } else {

            // Go to Login
            closeMenu();

            navigate("/login");

        }

    };


    /*
     * Format the date using the user's local timezone.
     *
     * Example:
     * Thursday, August 20, 2026
     */
    const formattedDate = currentTime.toLocaleDateString(
        undefined,
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );


    /*
     * Format the time using the user's local timezone.
     *
     * Example:
     * 5:52:34 PM
     */
    const formattedTime = currentTime.toLocaleTimeString(
        undefined,
        {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit"
        }
    );


    return (
        <>
            {/* =========================================
                MAIN NAVBAR
            ========================================= */}

            <nav className="navbar p-2">

                <NavLink
                    to="/"
                    className="logo"
                    onClick={closeMenu}
                >
                    MyPay Portal
                </NavLink>


                <button
                    className="menu-button"
                    onClick={toggleMenu}
                    aria-label="Toggle Navigation"
                >
                    {menuOpen ? (
                        <HiOutlineX />
                    ) : (
                        <HiOutlineMenu />
                    )}
                </button>


                <ul
                    className={`nav-links ${
                        menuOpen ? "active" : ""
                    }`}
                >

                    {/* ================================
                        PAYMENTS
                    ================================= */}

                    {isLoggedIn && (

                        <li className="nav-item dropdown">

                            <button
                                className="nav-link dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Payments
                            </button>


                            <ul className="dropdown-menu">

                                <li>
                                    <NavLink
                                        to="/payments"
                                        className="dropdown-item"
                                        onClick={closeMenu}
                                    >
                                        Payment List
                                    </NavLink>
                                </li>


                                <li>
                                    <NavLink
                                        to="/payments/create"
                                        className="dropdown-item"
                                        onClick={closeMenu}
                                    >
                                        Create A Payment
                                    </NavLink>
                                </li>


                                <li>
                                    <NavLink
                                        to="/payments/makeapayment"
                                        className="dropdown-item"
                                        onClick={closeMenu}
                                    >
                                        Make A Payment
                                    </NavLink>
                                </li>

                            </ul>

                        </li>

                    )}

                    {/* ================================
                        PAYMENT Sources
                    ================================= */}

                    {isLoggedIn && (

                        <li className="nav-item dropdown">

                            <button
                                className="nav-link dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Payment Source
                            </button>


                            <ul className="dropdown-menu">

                                <li>
                                    <NavLink
                                        to="/paymentsource"
                                        className="dropdown-item"
                                        onClick={closeMenu}
                                    >
                                        Payment Sources
                                    </NavLink>
                                </li>


                                <li>
                                    <NavLink
                                        to="/paymentsource/create"
                                        className="dropdown-item"
                                        onClick={closeMenu}
                                    >
                                        Create A Payment Source
                                    </NavLink>
                                </li>


                                <li>
                                    <NavLink
                                        to="/paymentsource/edit"
                                        className="dropdown-item"
                                        onClick={closeMenu}
                                    >
                                        Edit Payment Source
                                    </NavLink>
                                </li>

                            </ul>

                        </li>

                    )}

                    {/* ================================
                        LOANS
                    ================================= */}
                    {isLoggedIn && (

                        <li className="nav-item dropdown">

                            <button
                                className="nav-link dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Loans
                            </button>


                            <ul className="dropdown-menu">

                                <li>
                                    <NavLink
                                        to="/loans"
                                        className="dropdown-item"
                                        onClick={closeMenu}
                                    >
                                        Loans List
                                    </NavLink>
                                </li>


                                <li>
                                    <NavLink
                                        to="/loans/createloan"
                                        className="dropdown-item"
                                        onClick={closeMenu}
                                    >
                                        Create A Loan
                                    </NavLink>
                                </li>


                                {/* <li>
                                    <NavLink
                                        to="/loans/editloan"
                                        className="dropdown-item"
                                        onClick={closeMenu}
                                    >
                                        Edit A Loan
                                    </NavLink>
                                </li> */}

                            </ul>

                        </li>

                    )}




                    {/* ================================
                        REPORTS
                    ================================= */}

                    {isLoggedIn && (

                        <li>

                            <NavLink
                                to="/customer-reports"
                                onClick={closeMenu}
                            >
                                Reports
                            </NavLink>

                        </li>

                    )}


                    {/* ================================
                        LOGIN / LOGOUT
                    ================================= */}

                    <li>

                        <button
                            type="button"
                            className="nav-link ml-4"
                            onClick={handleLoginLogout}
                        >
                            {isLoggedIn
                                ? "Log Out"
                                : "Login"
                            }
                        </button>

                    </li>


                    {/* ================================
                        CREATE ACCOUNT
                    ================================= */}

                    {!isLoggedIn && (

                        <li>

                            <NavLink
                                to="/create-account"
                                onClick={closeMenu}
                            >
                                Create Account
                            </NavLink>

                        </li>

                    )}

                </ul>

            </nav>


            {/* =========================================
                USER / DATE / TIME INFORMATION BAR

                This is intentionally OUTSIDE the
                <nav> element so it appears directly
                underneath the navbar.
            ========================================= */}

            <div className="navbar-info-bar">

                {/* User Information */}

                <div className="navbar-info-user">

                    {isLoggedIn && user ? (

                        <>
                            {/* <span>
                                Welcome,{" "}
                            </span> */}

                            <strong>
                                {user.firstName} {user.lastName}
                            </strong>
                        </>

                    ) 
                    : (

                        <>
                        </>
                        // <span>
                        //     Welcome to MyPay Portal
                        // </span>

                    )}

                </div>


                {/* Date and Time */}

                <div className="navbar-info-datetime">
                    <span className="pe-2">
                        {formattedDate}
                    </span>

                    <span>
                        {formattedTime}
                    </span>

                </div>

            </div>

        </>
    );
}
