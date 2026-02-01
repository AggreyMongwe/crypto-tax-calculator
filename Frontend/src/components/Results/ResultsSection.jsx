export default function ResultsSection() {
  const [expandAll, setExpandAll] = useState(false);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">
        Step 2: Review Your Results
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <BaseCostSummary />
        <CapitalGainsSummary />
      </div>

      <button
        onClick={() => setExpandAll(!expandAll)}
        className="text-primary font-medium"
      >
        {expandAll ? "Collapse All" : "Expand All Calculations"} ▼
      </button>

      <TransactionTable expandAll={expandAll} />
    </section>
  );
}