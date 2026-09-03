export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-sm">
          MediVault
        </h1>
        <p className="text-xl text-slate-300 font-medium text-center max-w-lg">
          Secure, intelligent, and seamless health data management at your fingertips.
        </p>
      </div>
    </main>
  )
}
