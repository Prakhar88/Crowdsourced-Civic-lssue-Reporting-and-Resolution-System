import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Dashboard from "../pages/Dashboard"; // for menu/close icons
import CivicLogo from "./CivicLogo"; // replace with your civic logo file or component

export default function Navbar({ onToggleSidebar }) {
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // handle scroll hide/show
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY) {
                setShowNavbar(true); // scrolling down → hide
            } else {
                setShowNavbar(true); // scrolling up → show
            }
            setLastScrollY(window.scrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const toggleSidebar = () => {
        setIsSidebarMinimized(!isSidebarMinimized);
        if (onToggleSidebar) onToggleSidebar(!isSidebarMinimized);
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 bg-white shadow transition-transform duration-300 ${
                showNavbar ? "translate-y-0" : "-translate-y-full"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left section */}
                    <div className="flex items-center space-x-4">
                        {/* Toggle Button (mobile + desktop) */}
                        <button
                            onClick={toggleSidebar}
                            className="text-gray-700 hover:text-emerald-600 transition"
                            aria-label="Toggle sidebar"
                        >
                            ☰
                        </button>

                        {/* Logo */}
                        <Link to={Dashboard} aria-label="Visit home page">
                            <CivicLogo className=" h-8" />
                        </Link>

                    </div>

                    {/* Right section */}
                    <div className="flex items-center space-x-6">
                        {/* Replace with your actions (profile, notifications, etc.) */}
                        <button className="text-gray-700 hover:text-emerald-600 transition-transform">
                            🔔
                        </button>
                        <button className="text-gray-700 hover:text-emerald-600 transition">
                            👤
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
