export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-black px-2 py-1 text-xs text-white">
      {children}
    </span>
  );
}
