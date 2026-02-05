import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Instant jump to top
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};