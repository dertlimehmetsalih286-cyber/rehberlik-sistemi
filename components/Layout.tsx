# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:37:59 2026

@author: Dell
"""

import { Link, useLocation } from "wouter";
import { Users, LayoutDashboard, SlidersHorizontal, BookOpen, Building2 } from "lucide-react";

const navItems = [
  { href: "/",             label: "Özet",          icon: LayoutDashboard },
  { href: "/degerlendirme", label: "Değerlendirme", icon: SlidersHorizontal },
  { href: "/ogrenciler",   label: "Öğrenciler",     icon: Users },
  { href: "/okullar",      label: "Okullar",         icon: Building2 },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-primary">Rehberlik</h1>
            <p className="text-xs text-muted-foreground">Karar Destek</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all cursor-pointer ${isActive ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  <Icon className="w-5 h-5" /><span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-6 text-xs text-muted-foreground text-center border-t border-border">
          Fuzzy Logic Engine v1.0
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
