export default function DebugSpin() {
  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="relative w-40 h-40">
        <div className="absolute inset-0 rounded-full blur-sm opacity-50 bg-[conic-gradient(from_0deg_at_50%_50%,#44BCFF,#44BCFF,#FF44EC,#FF675E,#FF675E)]" />
        <div className="absolute inset-0 rounded-full blur-md opacity-80 animate-spin-slow bg-[conic-gradient(from_0deg_at_50%_50%,#44BCFF,#44BCFF,#FF44EC,#FF675E,#FF675E)]" />
      </div>
    </div>
  );
}
