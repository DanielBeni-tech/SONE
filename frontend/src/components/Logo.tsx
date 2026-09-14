export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-ink flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="text-surface font-bold" style={{ fontSize: size * 0.45 }}>
        S
      </span>
    </div>
  )
}
