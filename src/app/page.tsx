"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconLogin, IconAlertCircle } from "@tabler/icons-react";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const {
    login,
    register,
    isLoading,
    error,
    clearError,
    checkAuth,
    isAuthenticated,
  } = useAuthStore();

  const handleModeSwitch = () => {
    setIsRegistering(!isRegistering);
    clearError();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await register(email.split("@")[0], email, password);
      setIsRegistering(false);
    } catch (error) {
      // Error is handled by the store
    }
  };

  // Check if already logged in
  useEffect(() => {
    checkAuth();
    if (isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [checkAuth, isAuthenticated]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <IconLogin className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isRegistering ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isRegistering
              ? "Sign up to get started"
              : "Sign in to your account to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={isRegistering ? handleRegister : handleLogin}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <Alert
                variant={
                  error.includes("successful") ? "default" : "destructive"
                }
              >
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading
                ? isRegistering
                  ? "Creating account..."
                  : "Signing in..."
                : isRegistering
                ? "Create Account"
                : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={handleModeSwitch}
              className="text-sm"
            >
              {isRegistering
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>
              Demo: Use the register button to create an account, then login
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
