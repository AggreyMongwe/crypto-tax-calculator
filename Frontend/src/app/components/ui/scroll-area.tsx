export function ScrollArea({ children }: { children: React.ReactNode }) {
  return <div className="max-h-64 overflow-y-auto">{children}</div>;
}
