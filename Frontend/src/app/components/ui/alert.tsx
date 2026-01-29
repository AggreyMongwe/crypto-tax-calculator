export function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded border border-red-300 bg-red-50 p-4 text-red-800">
      {children}
    </div>
  );
}
