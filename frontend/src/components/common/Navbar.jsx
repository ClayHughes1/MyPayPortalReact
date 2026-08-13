import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import {
    isLoggedIn as checkIsLoggedIn,
    logout
} from "../../services/authServices";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const isLoggedIn = checkIsLoggedIn();

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
                <li>
                    <NavLink to="/customers" onClick={closeMenu}>
                        Customers
                    </NavLink>
                </li>

                {/* {isLoggedIn && ( 
                    <li className="nav-item dropdown">
                        <span className="nav-link dropdown-toggle">
                            Payments
                        </span>

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
                                    Make a Payment
                                </NavLink>
                            </li>
                        </ul>
                    </li>
                )}  */}

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
                                    Make a Payment
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
                    <NavLink to="/login" onClick={closeMenu}>
                        Login
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/create-account" onClick={closeMenu}>
                        Create Account
                    </NavLink>
                </li>       
            </ul>
        </nav>
    );
}

// export default Navbar;