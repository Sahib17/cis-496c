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
import { register } from "@/services/authService";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Register your account</CardTitle>
        <CardDescription>
          Enter your email below to register to your account
        </CardDescription>
        <CardAction>
          <Link to="/login">
            <Button variant="link">Log In</Button>
          </Link>
        </CardAction>
      </CardHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          //   setError("");
          try {
            const response = await register({ name, phone, email, password });
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="johndoe@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="text"
                placeholder="+1 1234567890"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
            Register
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default Register;
