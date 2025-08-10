export default function Loading() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="max-w-xl w-full mx-6 text-center space-y-8">
        {/* Brand */}
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-400/20">
            <span className="text-gray-900 font-bold text-lg">K</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-gold to-yellow-300 bg-clip-text text-transparent tracking-tight">
            Kleo
          </h1>
        </div>
        <p className="text-gray-300 text-sm md:text-base">
          Spreading awareness of what’s happening across regions worldwide — add your story to inform, connect, and inspire action.
        </p>

        {/* Progress */}
        <div className="space-y-3">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-gold to-yellow-400 kleo-progress origin-left rounded-full" />
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
            <span className="inline-block w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span>Fetching pins, stories, and your location…</span>
          </div>
        </div>

        {/* Story prompts */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
          <p className="text-white text-sm font-semibold mb-2">Prompt to get started</p>
          <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
            <li>What’s happening here that people should know about?</li>
            <li>How is this affecting the community or environment?</li>
            <li>Share a short video or a few sentences to raise awareness.</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-center gap-3">
          <div className="px-4 py-2 bg-gradient-to-r from-gold to-yellow-400 text-gray-900 rounded-lg text-sm font-medium shadow-lg shadow-yellow-400/20">
            Preparing the map…
          </div>
        </div>
      </div>
    </div>
  );
} 