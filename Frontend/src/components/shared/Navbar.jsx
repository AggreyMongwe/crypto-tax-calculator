export default function Navbar() {
  const sections = [
    { name: "Dashboard Overview", id: "dashboard" },
    { name: "Transactions", id: "transactions" },
    { name: "Portfolio", id: "portfolio" },
    { name: "Tax Report", id: "tax-report" },
    { name: "Help", id: "help" },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="flex items-center justify-center space-x-4 bg-gray-100 p-2 rounded-lg mb-6">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className="px-3 py-1 rounded hover:bg-blue-100 font-medium"
        >
          {section.name}
        </button>
      ))}
    </nav>
  );
}