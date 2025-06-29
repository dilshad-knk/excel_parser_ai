// components/ui/MultiSelect.tsx
'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = 'Select options' }: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
          <span className="ml-2">▾</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-h-64 overflow-y-auto p-2 space-y-2">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={option}
              checked={selected.includes(option)}
              onCheckedChange={() => toggleOption(option)}
            />
            <label htmlFor={option} className="text-sm">
              {option}
            </label>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
