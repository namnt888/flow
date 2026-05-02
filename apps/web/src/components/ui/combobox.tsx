'use client';

import * as React from 'react';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronDownIcon, Store } from 'lucide-react';
import Image from 'next/image';

interface ComboboxItem {
  value: string;
  label: string;
  iconUrl?: string | null;
}

interface ComboboxProps {
  items: ComboboxItem[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

function ComboboxTrigger({
  selectedLabel,
  placeholder,
}: {
  selectedLabel: string | null;
  placeholder: string;
}) {
  return (
    <ComboboxPrimitive.Trigger className="flex w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
      <span className="flex-1 truncate text-left">
        {selectedLabel ?? <span className="text-muted-foreground">{placeholder}</span>}
      </span>
      <ChevronDownIcon className="size-4 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  );
}

function ItemIcon({ iconUrl, label }: { iconUrl?: string | null; label: string }) {
  if (iconUrl) {
    return (
      <Image
        src={iconUrl}
        alt={label}
        width={20}
        height={20}
        className="size-5 rounded-full object-contain"
      />
    );
  }
  return <Store className="size-4 shrink-0 text-muted-foreground" />;
}

export function Combobox({
  items,
  value,
  onValueChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  className,
}: ComboboxProps) {
  const [inputValue, setInputValue] = React.useState('');

  const filteredItems = React.useMemo(() => {
    if (!inputValue) return items;
    const q = inputValue.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, inputValue]);

  const selectedItem = React.useMemo(
    () => items.find((item) => item.value === value) ?? null,
    [items, value],
  );

  return (
    <ComboboxPrimitive.Root
      value={value || null}
      onValueChange={(newValue) => {
        if (newValue != null) {
          onValueChange(String(newValue));
        }
      }}
      onInputValueChange={(newInputValue) => setInputValue(newInputValue ?? '')}
    >
      <ComboboxPrimitive.Label className="sr-only">{placeholder}</ComboboxPrimitive.Label>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner className="isolate z-50 outline-none">
          <ComboboxPrimitive.Popup className="origin-(--transform-origin) w-(--available-width) min-w-36 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="flex items-center border-b border-border px-3">
              <ComboboxPrimitive.Input
                placeholder={searchPlaceholder}
                className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                autoComplete="off"
              />
            </div>
            <ComboboxPrimitive.List className="max-h-60 overflow-y-auto p-1">
              {filteredItems.length === 0 && (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  {emptyText}
                </div>
              )}
              {filteredItems.map((item) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item.value}
                  className="relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <ItemIcon iconUrl={item.iconUrl} label={item.label} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {value === item.value && (
                    <span className="absolute right-2 flex items-center">
                      <CheckIcon className="size-4 text-primary" />
                    </span>
                  )}
                </ComboboxPrimitive.Item>
              ))}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
      <ComboboxTrigger
        selectedLabel={selectedItem?.label ?? null}
        placeholder={placeholder}
      />
    </ComboboxPrimitive.Root>
  );
}
