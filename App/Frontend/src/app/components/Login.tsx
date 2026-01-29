interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-96 rounded-lg border p-6">
        <h1 className="mb-4 text-xl font-bold">Login</h1>
        <button
          onClick={onLogin}
          className="w-full rounded bg-black px-4 py-2 text-white"
        >
          Login
        </button>
      </div>
    </div>
  );
}
