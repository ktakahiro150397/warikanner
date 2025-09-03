'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Select({
  label,
  placeholder = "選択してください",
  options,
  value,
  onChange,
  error,
  disabled = false,
  className,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const autoId = useId();
  const selectId = id || autoId;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 選択されているオプションを取得
  const selectedOption = options.find(option => option.value === selectedValue);

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESCキーでドロップダウンを閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // 値が外部から変更された場合の同期
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    
    setSelectedValue(optionValue);
    setIsOpen(false);
    onChange?.(optionValue);
    buttonRef.current?.focus();
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // 次のオプションにフォーカス
          const currentIndex = options.findIndex(opt => opt.value === selectedValue);
          const nextIndex = Math.min(currentIndex + 1, options.length - 1);
          if (nextIndex >= 0 && !options[nextIndex].disabled) {
            handleSelect(options[nextIndex].value);
          }
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // 前のオプションにフォーカス
          const currentIndex = options.findIndex(opt => opt.value === selectedValue);
          const prevIndex = Math.max(currentIndex - 1, 0);
          if (prevIndex >= 0 && !options[prevIndex].disabled) {
            handleSelect(options[prevIndex].value);
          }
        }
        break;
    }
  };

  return (
    <div className="space-y-2" ref={dropdownRef}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          ref={buttonRef}
          id={selectId}
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            isOpen && 'ring-2 ring-blue-500 border-transparent',
            className
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? selectId : undefined}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )} 
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
            <ul
              role="listbox"
              className="max-h-60 overflow-auto rounded-md py-1 text-sm"
              aria-labelledby={selectId}
            >
              {options.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === selectedValue}
                  className={cn(
                    'relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-gray-50',
                    option.value === selectedValue && 'bg-blue-50 text-blue-600',
                    option.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
                  )}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                >
                  <span className={cn(
                    'block truncate',
                    option.value === selectedValue ? 'font-medium' : 'font-normal'
                  )}>
                    {option.label}
                  </span>
                  
                  {option.value === selectedValue && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </li>
              ))}
              
              {options.length === 0 && (
                <li className="py-2 pl-3 pr-9 text-gray-500">
                  選択肢がありません
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
