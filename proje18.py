# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:38:06 2026

@author: Dell
"""

import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import AssessmentPlayground from "@/pages/AssessmentPlayground";
import StudentsList from "@/pages/StudentsList";
import StudentDetail from "@/pages/StudentDetail";
import SchoolsList from "@/pages/SchoolsList";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/"              component={Dashboard} />
        <Route path="/degerlendirme" component={AssessmentPlayground} />
        <Route path="/ogrenciler"    component={StudentsList} />
        <Route path="/ogrenciler/:id" component={StudentDetail} />
        <Route path="/okullar"       component={SchoolsList} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}