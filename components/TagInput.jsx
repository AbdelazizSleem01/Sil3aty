"use client";
import { useState, useRef, useEffect } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";

export default function TagInput({ tags, setTags, placeholder, maxTags = 10 }) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      setTags([...tags, trimmedTag]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300 min-h-[48px] cursor-text"
      onClick={handleContainerClick}
    >
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white text-sm rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="hover:bg-white/20 rounded-full p-0.5 transition-colors duration-200"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </span>
      ))}

      {tags.length < maxTags && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-700 placeholder-gray-400"
        />
      )}

      {inputValue && (
        <button
          type="button"
          onClick={() => addTag(inputValue)}
          className="p-1 text-primary hover:bg-primary/10 rounded transition-colors duration-200"
        >
          <FaPlus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
