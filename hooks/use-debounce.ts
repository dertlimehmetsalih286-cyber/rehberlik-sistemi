# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:37:33 2026

@author: Dell
"""

import { useState, useEffect } from "react";
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
