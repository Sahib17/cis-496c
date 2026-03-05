import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/authService";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  console.log("API URL:", import.meta.env.VITE_API_URL)
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Link to="/register">
            <Button variant="link">Register</Button>
          </Link>
        </CardAction>
      </CardHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          //   setError("");
          try {
            const response = await login({ email, password });
            if (!response.success) {
              setError(response.message);
              return;
            }
            await navigate("/dashboard");
          } catch (err) {
            setError(err.response?.data?.message || "Server error");
          }
        }}
      >
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          {error && (
            <Alert variant="destructive" className="mt-8 flex">
              {error}
            </Alert>
          )}
          <Button type="submit" className="w-full mt-8">
            Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default Login;
