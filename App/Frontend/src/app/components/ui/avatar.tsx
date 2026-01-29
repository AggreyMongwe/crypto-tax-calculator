    export function Avatar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
      {children}
    </div>
  );
}
