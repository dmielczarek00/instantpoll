"use client";

interface PollTitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PollTitleInput({ value, onChange }: PollTitleInputProps) {
  return (
    <div className="mb-8">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tytuł ankiety..."
        maxLength={200}
        className="
          w-full
          text-2xl sm:text-3xl
          font-semibold
          text-zinc-900 dark:text-white
          bg-transparent
          outline-none
          border-b-2 border-zinc-200 dark:border-zinc-700
          focus:border-zinc-900 dark:focus:border-zinc-300
          placeholder:text-zinc-300 dark:placeholder:text-zinc-600
          pb-2
          transition-colors duration-200
        "
      />
      
      {value.length > 150 && (
        <p className="mt-1 text-xs text-zinc-400 text-right">
          {value.length}/200
        </p>
      )}
    </div>
  );
}
