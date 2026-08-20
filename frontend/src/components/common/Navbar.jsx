import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { Navigate } from "react-router-dom";
import {
    isLoggedIn as checkIsLoggedIn,
    logout
} from "../../services/authServices";




export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const isLoggedIn = checkIsLoggedIn();

    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const handleLoginLogout = () => {
        console.log("isLogin value when clicked...  ",isLoggedIn);
        if (isLoggedIn) {
            // Log out
            logout();


            // Close the menu
            closeMenu();

            // Redirect to Dashboard
            navigate("/");
        } else {
            // Go to Login
            closeMenu();
            navigate("/login");
        }
    };

    return (
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
                {menuOpen ? <HiOutlineX /> : <HiOutlineMenu />}
            </button>

            <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
                {/* <li>
                    <NavLink to="/customers" onClick={closeMenu}>
                        Customers
                    </NavLink>
                </li> */}

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

                {isLoggedIn && (
                    <li>
                        <NavLink to="/customer-reports" onClick={closeMenu}>
                            Reports
                        </NavLink>
                    </li>
                )}

 

                <li>
                    <button
                        type="button"
                        className="nav-link ml-4"
                        onClick={handleLoginLogout}
                    >
                        {isLoggedIn ? "Log Out" : "Login"}
                    </button>
                </li>
                {!isLoggedIn && (
                    <li>
                        <NavLink to="/create-account" onClick={closeMenu}>
                            Create Account
                        </NavLink>
                    </li>  
                )}
            </ul>
        </nav>
    );
}

// export default Navbar;