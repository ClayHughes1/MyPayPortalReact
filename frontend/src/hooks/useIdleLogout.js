import { useEffect, useRef } from "react";
import { logout } from "../services/authServices";

const DEFAULT_IDLE_TIME = 15 * 60 * 1000; // 15 minutes

export default function useIdleLogout(
    idleTime = DEFAULT_IDLE_TIME
) {
    const timeoutRef = useRef(null);

    useEffect(() => {

        const resetTimer = () => {

            // Check whether the user is authenticated.
            const token =
                localStorage.getItem("token");

            // No token means the user is not logged in.
            // Therefore, don't start an idle logout timer.
            if (!token) {

                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }

                return;
            }

            // User is authenticated.
            // Clear the previous timer.
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Start a new inactivity timer.
            timeoutRef.current = setTimeout(() => {

                console.log(
                    "User inactive. Logging out."
                );

                // Remove JWT, user information,
                // and isLoggedIn from localStorage.
                logout();

                // Return the user to the login page.
                window.location.href = "/login";

            }, idleTime);
        };


        // Events that indicate user activity.
        const activityEvents = [
            // "mousemove", May enable these domain events at a later point
            // "mousedown",
            "keydown",
            "scroll",
            "touchstart",
            "click"
        ];


        // Listen for user activity.
        activityEvents.forEach((event) => {

            window.addEventListener(
                event,
                resetTimer
            );

        });


        // Start the timer when the application loads.
        resetTimer();


        // Cleanup when the application unmounts.
        return () => {

            if (timeoutRef.current) {

                clearTimeout(
                    timeoutRef.current
                );

                timeoutRef.current = null;
            }


            activityEvents.forEach((event) => {

                window.removeEventListener(
                    event,
                    resetTimer
                );

            });

        };

    }, [idleTime]);
}