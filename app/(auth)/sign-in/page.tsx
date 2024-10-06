"use client";
import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SignInPage({ searchParams }: { searchParams: { success: string; error: string } }) {
    const handleSignIn = async (formData: FormData) => {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const result = await supabase().auth.signInWithPassword({ email, password });
        if (result.error) {
            return redirect("/sign-in?error=" + encodeURIComponent(result.error.message));
        }
        return redirect("/dashboard");
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSignIn}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            {searchParams.error && (
                                <p className="text-red-500 text-sm">{searchParams.error}</p>
                            )}
                            {searchParams.success && (
                                <p className="text-green-500 text-sm">{searchParams.success}</p>
                            )}
                            <Button type="submit" className="w-full">
                                Sign In
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center space-y-2">
                        <Link
                            href="/forgot-password"
                            className="text-blue-500 hover:underline"
                        >
                            Forgot password?
                        </Link>
                        <div>
                            Don't have an account?{" "}
                            <Link href="/sign-up" className="text-blue-500 hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}