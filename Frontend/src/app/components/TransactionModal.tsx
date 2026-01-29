interface Props {
  onClose: () => void;
}

export default function TransactionModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="w-96 rounded bg-white p-4">
        <h3 className="mb-4 font-bold">New Transaction</h3>
        <button
          onClick={onClose}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
