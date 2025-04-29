import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Route } from "wouter";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  path: string;
  roles?: string[];
  component: () => JSX.Element;
};

export function ProtectedRoute({
  path,
  roles,
  component: Component,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If roles are specified, check if user has required role
  if (roles && !roles.includes(user.role)) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 max-w-md">
            You don't have permission to access this page. This area is restricted to {roles.join(" or ")} users.
          </p>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}