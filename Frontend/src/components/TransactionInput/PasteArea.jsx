export default function TransactionInput() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-semibold mb-2">Step 1: Input Your Transactions</h2>
      <p className="text-gray-600 mb-4">
        Copy from Excel and paste here. Required columns: Date, Type, Coin, Amount, Price
      </p>
      <textarea
        className="w-full h-[400px] font-mono text-sm border border-border rounded-lg p-4 focus:ring-2 focus:ring-primary"
        placeholder="Paste your transaction data here..."
      />
      <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
        Calculate
      </button>
    </div>
  );
}


// export default function PasteArea({
//   value,
//   onChange,
//   transactionCount,
//   onCalculate,
//   isValid,
// }) {
//   return (
//     <div className="bg-card border border-border rounded-xl p-6 space-y-4">
//       <h2 className="text-xl font-semibold">
//         Step 1: Input Your Transactions
//       </h2>

//       <textarea
//         className="w-full h-[400px] font-mono text-sm border border-border rounded-lg p-4 focus:ring-2 focus:ring-primary"
//         placeholder="Paste your transaction data here..."
//         value={value}
//         onChange={onChange}
//       />

//       <div className="flex items-center justify-between">
//         <span className={isValid ? "text-success" : "text-warning"}>
//           {transactionCount > 0
//             ? `✓ ${transactionCount} transactions detected`
//             : "No transactions yet"}
//         </span>

//         <button
//           onClick={onCalculate}
//           disabled={!isValid}
//           className="bg-primary text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
//         >
//           Calculate My Capital Gains
//         </button>
//       </div>
//     </div>
//   );
// }