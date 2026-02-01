export default function BaseCostSummary({ data }) {
  return (
    <div className="bg-white p-4 shadow rounded">
      <h3 className="font-semibold mb-2">Base Cost Summary</h3>
      <ul>
        {data.map((item, idx) => (
          <li key={idx}>{item.coin}: {item.amount} (R {item.value})</li>
        ))}
      </ul>
    </div>
  );
}