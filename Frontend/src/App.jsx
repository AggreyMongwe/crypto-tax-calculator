import { useState } from "react";
import Header from "./components/Header";
import Navbar from "./components/shared/Navbar";
import TransactionInput from "./components/TransactionInput/PasteArea";
import BaseCostSummary from "./components/Results/BaseCostSummary";
import CapitalGainsSummary from "./components/Results/CapitalGainsSummary";
import TransactionTable from "./components/Results/TransactionTable";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Placeholder data
  const baseCosts = [
    { coin: "BTC", amount: 0.3, value: 30000 },
    { coin: "ETH", amount: 10, value: 20000 },
  ];
  const capitalGains = [
    { coin: "BTC", gain: 9000 },
    { coin: "ETH", gain: 0 },
  ];
  const processedTransactions = [
    { id: 1, date: "2024-11-01", type: "BUY", coin: "BTC", amount: 0.1, price: 80000, gain: null },
    { id: 2, date: "2024-11-02", type: "BUY", coin: "BTC", amount: 0.2, price: 90000, gain: null },
    { id: 3, date: "2025-05-05", type: "TRADE", coin: "BTC", amount: 0.133, price: 150000, gain: 9030 },
  ];

  // Simple login handler
  const handleLogin = () => setIsLoggedIn(true);

  return (
    <div className="min-h-screen bg-f9fafb p-6">
      <Header showLogout={isLoggedIn} />

      {!isLoggedIn ? (
        // LOGIN SCREEN
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Crypto Tax Calculator</h2>
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      ) : (
        // DASHBOARD AFTER LOGIN
        <>
          <Navbar />

          <section id="dashboard" className="my-6">
            <h2 className="text-2xl font-semibold mb-2">Dashboard Overview</h2>
            <p>Overview placeholder content...</p>
          </section>

          <section id="transactions" className="my-6">
            <TransactionInput />
          </section>

          <section id="portfolio" className="my-6">
            <h2 className="text-2xl font-semibold mb-4">Portfolio</h2>
            <p>Portfolio placeholder content...</p>
          </section>

          <section id="tax-report" className="my-6">
            <h2 className="text-2xl font-semibold mb-4">Tax Report</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <BaseCostSummary data={baseCosts} />
              <CapitalGainsSummary data={capitalGains} />
            </div>
            <TransactionTable transactions={processedTransactions} />
          </section>

          <section id="help" className="my-6">
            <h2 className="text-2xl font-semibold mb-4">Help</h2>
            <p>Help content placeholder...</p>
          </section>
        </>
      )}
    </div>
  );
}