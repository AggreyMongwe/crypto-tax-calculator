import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";

export function AppLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Page Content */}
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}
