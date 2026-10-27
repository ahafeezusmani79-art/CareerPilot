
import { useCallback, useEffect, useState } from "react";

export default function CareerPilotIntro({ onComplete }) {
  const [visible, setVisible] = useState(false);

  const finish = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(finish, 3200);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [finish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-[#080B16] transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <style>{`
        @keyframes cpDraw {
          to { stroke-dashoffset: 0; }
        }

        @keyframes cpReveal {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes cpGlow {
          0%, 100% { filter: drop-shadow(0 0 5px #8b5cf6); }
          50% { filter: drop-shadow(0 0 19px #38bdf8); }
        }

        @keyframes cpRing {
          0% { transform: scale(.7); opacity: 0; }
          35% { opacity: .5; }
          100% { transform: scale(1.7); opacity: 0; }
        }

        @keyframes cpSpark {
          0% { opacity: 0; transform: scale(.3); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(.5); }
        }

        .cp-draw {
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: cpDraw 1.15s cubic-bezier(.45,0,.2,1) forwards;
        }

        .cp-draw-body {
          animation-delay: .1s;
        }

        .cp-draw-window {
          animation-delay: .55s;
        }

        .cp-draw-fins {
          animation-delay: .8s;
        }

        .cp-draw-fire {
          animation-delay: 1s;
        }

        .cp-draw-trails {
          animation-delay: 0s;
        }

        .cp-wordmark {
          opacity: 0;
          animation: cpReveal .7s ease-out 1.35s forwards;
        }

        .cp-logo-glow {
          animation: cpGlow 2s ease-in-out infinite;
        }

        .cp-ring {
          animation: cpRing 2.1s ease-out .3s infinite;
          transform-origin: center;
        }

        .cp-spark {
          animation: cpSpark 1.4s ease-out 1.1s infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .cp-draw {
            stroke-dashoffset: 0;
            animation: none;
          }

          .cp-wordmark {
            opacity: 1;
            animation: none;
          }

          .cp-ring, .cp-logo-glow, .cp-spark {
            animation: none;
          }
        }
      `}</style>

      <div className="relative flex w-full max-w-lg flex-col items-center px-6 text-center">
        {/* Expanding launch rings */}
        <div className="cp-ring absolute top-[31%] h-40 w-40 rounded-full border border-violet-400/30 sm:h-48 sm:w-48" />
        <div className="cp-ring absolute top-[31%] h-40 w-40 rounded-full border border-sky-400/20 sm:h-48 sm:w-48" style={{ animationDelay: "1.2s" }} />

        {/* Original CareerPilot rocket logo */}
        <div className="cp-logo-glow relative z-10 mb-7 h-36 w-36 sm:h-44 sm:w-44">
          <svg
            viewBox="0 0 64 64"
            className="h-full w-full overflow-visible"
            fill="none"
            role="img"
            aria-label="CareerPilot original launching rocket logo"
          >
            <defs>
              <linearGradient id="cpIntroRocketBody" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>

              <linearGradient id="cpIntroRocketFire" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#67E8F9" />
              </linearGradient>
            </defs>

            {/* Original launch trails */}
            <path
              className="cp-draw cp-draw-trails"
              d="M8 53 22 39"
              stroke="#A78BFA"
              strokeWidth="2.5"
              strokeLinecap="round"
              pathLength="220"
            />

            <path
              className="cp-draw cp-draw-trails"
              d="M8 43 15 36"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeLinecap="round"
              opacity=".7"
              pathLength="220"
            />

            <g transform="rotate(42 32 32)">
              {/* Original rocket body */}
              <path
                className="cp-draw cp-draw-body"
                d="M32 7C40 15 45 25 43 39L32 50 21 39C19 25 24 15 32 7Z"
                fill="#151B32"
                stroke="url(#cpIntroRocketBody)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                pathLength="220"
              />

              {/* Original cyan rocket window */}
              <circle
                className="cp-draw cp-draw-window"
                cx="32"
                cy="25"
                r="5"
                fill="#0B1020"
                stroke="#67E8F9"
                strokeWidth="2.5"
                pathLength="220"
              />

              {/* Original purple fins */}
              <path
                className="cp-draw cp-draw-fins"
                d="M21 32 12 41 14 27 23 24"
                fill="#8B5CF6"
                stroke="#A78BFA"
                strokeWidth="2"
                strokeLinejoin="round"
                pathLength="220"
              />

              <path
                className="cp-draw cp-draw-fins"
                d="M43 32 52 41 50 27 41 24"
                fill="#8B5CF6"
                stroke="#A78BFA"
                strokeWidth="2"
                strokeLinejoin="round"
                pathLength="220"
              />

              {/* Original violet-to-cyan flame */}
              <path
                className="cp-draw cp-draw-fire"
                d="M27 49 32 61 37 49"
                fill="url(#cpIntroRocketFire)"
                stroke="#67E8F9"
                strokeWidth="1.5"
                strokeLinejoin="round"
                pathLength="220"
              />
            </g>

            {/* Launch spark */}
            <circle
              className="cp-spark"
              cx="12"
              cy="49"
              r="2"
              fill="#67E8F9"
            />
          </svg>
        </div>

        {/* Original CareerPilot wordmark and tagline */}
        <h1 className="cp-wordmark text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-white">Career</span>
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">
            Pilot
          </span>
        </h1>

        <p
          className="cp-wordmark mt-3 text-[10px] font-semibold tracking-[0.2em] text-slate-400 sm:text-xs"
          style={{ animationDelay: "1.55s" }}
        >
          YOUR CAREER. YOUR NEXT LEVEL.
        </p>

        <div
          className="cp-wordmark mt-9 flex items-center gap-3"
          style={{ animationDelay: "1.8s" }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
          <p className="text-sm text-slate-300">
            Preparing your career dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}
