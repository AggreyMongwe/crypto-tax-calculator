export default function Header({ showLogout = false }) {
  return (
    <header className="bg-white shadow p-6 mb-4 rounded flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-semibold text-primary">
          Crypto Tax Calculator for South Africa 🇿🇦
        </h1>
        <p className="text-gray-600 mt-1">
          Calculate your capital gains using SARS FIFO method
        </p>
      </div>
      {showLogout && (
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      )}
    </header>
  );
}