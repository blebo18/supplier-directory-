"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex-1 max-w-xl">
      <input
        type="text"
        placeholder="Search companies..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400"
      />
    </div>
  );
}
