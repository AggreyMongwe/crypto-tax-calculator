import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Sessions from "./pages/Sessions";
import NotFound from "./pages/NotFound";
import Docs from "./pages/Docs";
import Help from "./pages/Help";
import { ScrollToTop } from "./pages/ScrollToTop";
import { TaxRobot } from "./components/TaxRobot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />

          {/* The TaxRobot is placed here so it persists across all pages.
            It sits outside <Routes> so the chat doesn't close when you navigate.
          */}
          <TaxRobot />

          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;