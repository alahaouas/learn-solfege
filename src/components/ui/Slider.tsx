interface SliderProps {
  min: number;
  max: number;
  value: number;
  step?: number;
  label?: string;
  onChange: (value: number) => void;
  className?: string;
}

export default function Slider({
  min,
  max,
  value,
  step = 1,
  label,
  onChange,
  className = '',
}: SliderProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <span className="text-sm text-slate-500">{value}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-primary-600
                   [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
}
