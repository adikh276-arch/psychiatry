import { useState } from "react";

interface StepInputProps {
  count: number;
  placeholder?: string;
  values: string[];
  onChange: (values: string[]) => void;
}

const StepInput = ({ count, placeholder, values, onChange }: StepInputProps) => {
  const handleChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
  };

  return (
    <div className="space-y-3 w-full w-full mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="fade-in-up" style={{ animationDelay: `${0.3 + i * 0.1}s`, opacity: 0 }}>
          <input
            type="text"
            value={values[i] || ""}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder={placeholder || `${i + 1}.`}
            className="w-full bg-transparent border border-border rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
          />
        </div>
      ))}
    </div>
  );
};

export default StepInput;
