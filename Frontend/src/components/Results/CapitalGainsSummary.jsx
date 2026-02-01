export default function CapitalGainsSummary({ data }) {
  return (
    <div className="bg-white p-4 shadow rounded">
      <h3 className="font-semibold mb-2">Capital Gains Summary</h3>
      <ul>
        {data.map((item, idx) => (
          <li key={idx}>{item.coin}: R {item.gain}</li>
        ))}
      </ul>
    </div>
  );
}