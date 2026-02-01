export default function TransactionTable({ transactions }) {
  return (
    <div className="bg-white shadow rounded p-4 mt-4">
      <h3 className="font-semibold mb-2">Transactions</h3>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Type</th>
            <th className="border px-2 py-1">Coin</th>
            <th className="border px-2 py-1">Amount</th>
            <th className="border px-2 py-1">Price</th>
            <th className="border px-2 py-1">Gain</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="border px-2 py-1">{tx.id}</td>
              <td className="border px-2 py-1">{tx.date}</td>
              <td className="border px-2 py-1">{tx.type}</td>
              <td className="border px-2 py-1">{tx.coin}</td>
              <td className="border px-2 py-1">{tx.amount}</td>
              <td className="border px-2 py-1">{tx.price}</td>
              <td className="border px-2 py-1">{tx.gain ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}