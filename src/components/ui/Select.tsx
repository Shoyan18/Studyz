'use client';

import React from 'react';
import { StudyzSelect, StudyzSelectProps, StudyzSelectOption } from './StudyzSelect';

export type SelectOption = StudyzSelectOption;

export interface SelectProps extends Omit<StudyzSelectProps, 'onChange'> {
  onChange?: any; // Supports both (value: string) => void and standard React (e: { target: { value } }) => void
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ onChange, ...props }, ref) => {
    const handleChange = (val: any) => {
      if (!onChange) return;
      // If consumer expects an event-like object (e.g. e.target.value)
      if (typeof onChange === 'function') {
        try {
          onChange({
            target: { value: val, name: props.name },
            currentTarget: { value: val, name: props.name },
          });
        } catch {
          // If consumer expects raw string value
          onChange(val);
        }
      }
    };

    return <StudyzSelect {...props} onChange={handleChange} />;
  }
);

Select.displayName = 'Select';

export { StudyzSelect };
export default Select;
