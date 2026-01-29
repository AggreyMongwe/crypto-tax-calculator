interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ children, ...props }: Props) {
  return (
    <button
      {...props}
      className="rounded bg-black px-4 py-2 text-white"
    >
      {children}
    </button>
  );
}
