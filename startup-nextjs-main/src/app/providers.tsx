// src/Providers.tsx

"use client";

import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import store from "../utils/store";  // Apne store ko import karein

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}> {/* Redux Provider ko wrap karein */}
      <ThemeProvider attribute="class" enableSystem={false} defaultTheme="dark">
        {children}
      </ThemeProvider>
    </Provider>
  );
}
