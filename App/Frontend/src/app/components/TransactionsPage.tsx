import { useState } from "react";
import TransactionModal from "./TransactionModal";

export default function TransactionsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-bold">Transactions</h2>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 rounded bg-black px-4 py-2 text-white"
      >
        Add Transaction
      </button>
      {open && <TransactionModal onClose={() => setOpen(false)} />}
    </div>
  );
}
