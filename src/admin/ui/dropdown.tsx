"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
type Option = { value: string; label: string };
export function Dropdown({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  required = false,
}: {
  label: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  required?: boolean;
}) {
  return (
    <Select
      items={options}
      value={value}
      defaultValue={
        defaultValue ?? (value === undefined ? options[0]?.value : undefined)
      }
      onValueChange={(next) => onValueChange?.(next ?? "")}
      name={name}
      required={required}
    >
      <SelectTrigger aria-label={label} className="dropdown-trigger">
        <SelectValue
          placeholder={
            options.find((option) => option.value === "")?.label ||
            `Choose ${label.toLowerCase()}`
          }
        />
      </SelectTrigger>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        className="dropdown-popup"
      >
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
