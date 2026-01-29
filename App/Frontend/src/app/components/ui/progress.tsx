export function Progress({ value = 0 }: { value?: number }) {
  return (
    <div className="h-2 w-full rounded bg-gray-200">
      <div
        className="h-2 rounded bg-black"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
