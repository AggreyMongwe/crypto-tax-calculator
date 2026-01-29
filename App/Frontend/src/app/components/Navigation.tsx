interface Props {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Navigation({ onNavigate, onLogout }: Props) {
  return (
    <aside className="w-64 border-r p-4">
      <nav className="space-y-2">
        <button onClick={() => onNavigate("overview")}>Overview</button>
        <button onClick={() => onNavigate("transactions")}>Transactions</button>
        <button onClick={() => onNavigate("portfolio")}>Portfolio</button>
        <button onClick={() => onNavigate("tax")}>Tax Report</button>
        <button onClick={() => onNavigate("help")}>Help</button>
      </nav>
      <button
        onClick={onLogout}
        className="mt-6 text-sm text-red-600"
      >
        Logout
      </button>
    </aside>
  );
}
