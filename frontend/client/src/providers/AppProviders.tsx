"use client";

import { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type AppProvidersProps = {
  children: ReactNode;
};

// Tworzymy instancję QueryClient
const queryClient = new QueryClient();

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
} 