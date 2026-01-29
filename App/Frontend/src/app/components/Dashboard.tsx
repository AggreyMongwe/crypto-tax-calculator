import { useState } from "react";
import Navigation from "./Navigation";
import DashboardOverview from "./DashboardOverview";
import TransactionsPage from "./TransactionsPage";
import PortfolioPage from "./PortfolioPage";
import TaxReportPage from "./TaxReportPage";
import HelpPage from "./HelpPage";

interface Props {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: Props) {
  const [page, setPage] = useState("overview");

  return (
    <div className="flex min-h-screen">
      <Navigation onNavigate={setPage} onLogout={onLogout} />
      <main className="flex-1 p-6">
        {page === "overview" && <DashboardOverview />}
        {page === "transactions" && <TransactionsPage />}
        {page === "portfolio" && <PortfolioPage />}
        {page === "tax" && <TaxReportPage />}
        {page === "help" && <HelpPage />}
      </main>
    </div>
  );
}
