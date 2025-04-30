import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WishlistProvider } from "@/hooks/use-wishlist";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EventPage from "@/pages/EventPage";
import Checkout from "@/pages/Checkout";
import WishlistPage from "@/pages/WishlistPage";
import CalendarView from "@/pages/CalendarView";
import AuthPage from "@/pages/AuthPage";
import EventCreationPage from "@/pages/EventCreationPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// User role constants to match backend
const ROLE_ADMIN = "admin";
const ROLE_ORGANIZER = "organizer";
const ROLE_USER = "user";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/event/:id" component={EventPage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/calendar" component={CalendarView} />
          <ProtectedRoute path="/checkout/:id" component={Checkout} />
          <ProtectedRoute path="/wishlist" component={WishlistPage} />
          <ProtectedRoute 
            path="/create-event" 
            roles={[ROLE_ADMIN, ROLE_ORGANIZER]} 
            component={EventCreationPage} 
          />
          <ProtectedRoute 
            path="/profile" 
            component={ProfilePage} 
          />
          <ProtectedRoute 
            path="/admin/users" 
            roles={[ROLE_ADMIN]} 
            component={AdminUsersPage} 
          />
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
        <AuthProvider>
          <WishlistProvider>
            <Toaster />
            <Router />
          </WishlistProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
