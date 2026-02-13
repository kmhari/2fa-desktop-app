interface CountdownRingProps {
  remaining: number;
  period: number;
  size?: number;
}

export function CountdownRing({
  remaining,
  period,
  size = 24,
}: CountdownRingProps) {
  const fraction = remaining / period;
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - fraction);

  const color =
    remaining > 10 ? "#F97316" : remaining > 5 ? "#F59E0B" : "#EF4444";

  return (
    <svg
      width={size}
      height={size}
      className="shrink-0"
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        opacity={0.2}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s linear" }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#F8FAFC"
        fontSize={size * 0.4}
        style={{
          transform: "rotate(90deg)",
          transformOrigin: `${size / 2}px ${size / 2}px`,
        }}
      >
        {remaining}
      </text>
    </svg>
  );
}
