interface ProgressDotsProps {
  total: number;
  current: number;
}

const ProgressDots = ({ total, current }: ProgressDotsProps) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i === current
              ? "w-6 bg-primary"
              : i < current
              ? "w-1.5 bg-primary/40"
              : "w-1.5 bg-border"
          }`}
        />
      ))}
    </div>
  );
};

export default ProgressDots;
