import { deployment } from '@/config/deployment';

export default function EnategaLoader() {
  const { appName, shortName, colors } = deployment.brand;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-[#fafafa] to-[#f3f4f6]">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden opacity-100">
        <div className="floating-circle-1 absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-black opacity-5" />
        <div className="floating-circle-2 absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-black opacity-5" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Logo container with advanced animations */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="spinner-ring-1 absolute inset-0 -m-4">
            <div className="h-32 w-32 rounded-full border-2 border-transparent border-t-black border-r-black opacity-30 blur-sm"></div>
          </div>

          {/* Second rotating ring */}
          <div className="spinner-ring-2 absolute inset-0 -m-2">
            <div className="h-28 w-28 rounded-full border-[3px] border-transparent border-l-black border-b-black"></div>
          </div>

          {/* Center icon with scale animation */}
          <div
            className="pulse-scale relative flex h-24 w-24 items-center justify-center rounded-full shadow-2xl shadow-black/40"
            style={{
              background: `linear-gradient(to bottom right, ${colors.secondary}, ${colors.primary})`,
            }}
          >
            {/* Inner pulsing glow */}
            <div className="pulse-glow absolute inset-0 rounded-full bg-white opacity-20" />

            {/* Lightning icon */}
            <svg
              className="icon-appear relative z-10 h-10 w-10 text-[#f3f4f6]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        {/* Brand name with advanced text animation */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-1">
            {shortName.split('').map((char, index) => (
              <span
                key={`${char}-${index}`}
                className={`letter-bounce text-5xl font-bold text-black letter-${(index % 7) + 1}`}
              >
                {char}
              </span>
            ))}
          </div>

          {/* Admin badge */}
          <div className="badge-appear rounded-full bg-black/10 px-4 py-1.5">
            <span className="text-sm font-semibold text-black">{appName}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-container w-64">
          <div className="h-1 w-full overflow-hidden rounded-full bg-black/15">
            <div className="progress-bar h-full w-1/2 rounded-full bg-gradient-to-r from-black to-[#6b7280]" />
          </div>

          {/* Loading text */}
          <p className="loading-text mt-3 text-center text-sm font-medium text-[#4b5563]">
            Initializing your workspace
            <span className="loading-dots">...</span>
          </p>
        </div>
      </div>
    </div>
  );
}
