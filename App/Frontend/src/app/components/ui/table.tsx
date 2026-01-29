export function Table({ children }: { children: React.ReactNode }) {
  return (
    <table className="w-full border-collapse border">
      {children}
    </table>
  );
}
