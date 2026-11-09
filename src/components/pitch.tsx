import { cn } from "@/lib/utils";

type PitchProps = {
  className?: string;
};

// A football pitch seen from above. The viewBox fits the drawing exactly, so it
// scales down whole; overflow-visible keeps the outer half of the lines.
export function Pitch({ className }: PitchProps) {
  return (
    <svg
      viewBox="11 7 368 228"
      aria-hidden="true"
      className={cn("overflow-visible", className)}
    >
      <g className="fill-none stroke-primary/70" strokeWidth={2}>
        <rect
          x="20"
          y="8"
          width="350"
          height="226"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="195"
          y1="8"
          x2="195"
          y2="234"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="195" cy="121" r="30.5" vectorEffect="non-scaling-stroke" />
        <rect
          x="20"
          y="53.8"
          width="55"
          height="134.4"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="315"
          y="53.8"
          width="55"
          height="134.4"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="20"
          y="90.5"
          width="18.3"
          height="61"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="351.7"
          y="90.5"
          width="18.3"
          height="61"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M75 96.6 A30.5 30.5 0 0 1 75 145.4"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M315 96.6 A30.5 30.5 0 0 0 315 145.4"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="12"
          y="108.8"
          width="8"
          height="24.4"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="370"
          y="108.8"
          width="8"
          height="24.4"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M20 11.3 A3.3 3.3 0 0 0 23.3 8 M366.7 8 A3.3 3.3 0 0 0 370 11.3 M370 230.7 A3.3 3.3 0 0 0 366.7 234 M23.3 234 A3.3 3.3 0 0 0 20 230.7"
          vectorEffect="non-scaling-stroke"
        />
      </g>
      <g className="fill-primary/70">
        <circle cx="195" cy="121" r="2.5" />
        <circle cx="56.7" cy="121" r="2" />
        <circle cx="333.3" cy="121" r="2" />
      </g>
    </svg>
  );
}
