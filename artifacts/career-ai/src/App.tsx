import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Battle from "@/pages/Battle";
import Onboarding from "@/pages/Onboarding";
import Recommendations from "@/pages/Recommendations";
import Roadmap from "@/pages/Roadmap";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard">
        {() => (
          <AuthGuard requireAuth={true}>
            <Dashboard />
          </AuthGuard>
        )}
      </Route>
      <Route path="/profile">
        {() => (
          <AuthGuard requireAuth={true}>
            <Profile />
          </AuthGuard>
        )}
      </Route>
      <Route path="/battle">
        {() => (
          <AuthGuard requireAuth={true}>
            <Battle />
          </AuthGuard>
        )}
      </Route>
      <Route path="/onboarding">
        {() => (
          <AuthGuard requireAuth={true}>
            <Onboarding />
          </AuthGuard>
        )}
      </Route>
      <Route path="/recommendations">
        {() => (
          <AuthGuard requireAuth={true}>
            <Recommendations />
          </AuthGuard>
        )}
      </Route>
      <Route path="/roadmap">
        {() => (
          <AuthGuard requireAuth={true}>
            <Roadmap />
          </AuthGuard>
        )}
      </Route>
      <Route path="/chat">
        {() => (
          <AuthGuard requireAuth={true}>
            <Chat />
          </AuthGuard>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
