import React from "react";

type CategoryFilterProps = {
  label: string;
  categories: string[];
  selectedCategory: string;
  onChange: (category: string) => void;
};

export default function CategoryFilter({
  label,
  categories,
  selectedCategory,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex items-start gap-6 flex-wrap">
      <span className="text-gray-700 font-medium whitespace-nowrap text-[15px] pt-2">
        {label}
      </span>

      <div className="flex overflow-x-auto gap-3 w-full pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`flex-shrink-0 px-4 py-2 rounded-full transition-colors border text-[15px] ${
              selectedCategory === category
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-gray-200 text-black hover:bg-gray-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

