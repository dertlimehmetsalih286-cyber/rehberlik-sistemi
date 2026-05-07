# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:37:32 2026

@author: Dell
"""

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }