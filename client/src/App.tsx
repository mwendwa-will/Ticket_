import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WishlistProvider } from "@/hooks/use-wishlist";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EventPage from "@/pages/EventPage";
import Checkout from "@/pages/Checkout";
import WishlistPage from "@/pages/WishlistPage";
import CalendarView from "@/pages/CalendarView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/event/:id" component={EventPage} />
          <Route path="/checkout/:id" component={Checkout} />
          <Route path="/wishlist" component={WishlistPage} />
          <Route path="/calendar" component={CalendarView} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WishlistProvider>
          <Toaster />
          <Router />
        </WishlistProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
