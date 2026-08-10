import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import authService from "../../services/authServices";
import { isLoggedIn, logout } from '../../services/authServices';


export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    // const handleLogout = () => {

    //     authService.logout();

    //     navigate("/");

    // };

    const isLoggedIn = authService.isLoggedIn();

    return (
        <nav className="navbar p-2">
            <div className="logo">
                MyPay Portal
            </div>

            <button
                className="menu-button"
                onClick={toggleMenu}
                aria-label="Toggle Navigation"
            >
                {menuOpen ? <HiOutlineX /> : <HiOutlineMenu />}
            </button>

            <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
                <li>
                    <NavLink to="/" onClick={closeMenu}>
                        Hone
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/customers" onClick={closeMenu}>
                        Customers
                    </NavLink>
                </li>

                {/* <li>
                    <NavLink to="/payments" onClick={closeMenu}>
                        Payments
                    </NavLink>
                </li> */}

                {isLoggedIn && (
                    <li>
                        <NavLink to="/payments" onClick={closeMenu}>
                            Payments
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