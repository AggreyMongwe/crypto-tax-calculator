export function NavigationMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  return <nav className="flex gap-4">{children}</nav>;
}
