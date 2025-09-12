"use client";

import { LoginForm } from "@/components/login-form";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {ModeToggle} from "@/components/mode-toggle";

export default function LoginPage() {
    const [isVerified, setIsVerified] = useState(false);
    const [key, setKey] = useState("");
    const [error, setError] = useState("");

    // @ts-expect-error because "e" is implicitly any
    const handleKeyVerification = async (e) => {
        e.preventDefault(); // Prevent default form submission
        try {
            const response = await fetch("/api/verifyKey", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key }),
            });

            if (response.ok) {
                setIsVerified(true);
                setError("");
            } else {
                setError("Invalid teacher key.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="absolute top-4 right-4">
                <ModeToggle />
            </div>
            <div className="flex w-full max-w-sm flex-col gap-6">

                {!isVerified ? (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">Welcome back</CardTitle>
                            <CardDescription>
                                Please enter your teacher key to proceed
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleKeyVerification}>
                                <div className="grid gap-6">
                                    <div className="flex flex-col gap-4">
                                        <Input
                                            id="key"
                                            type="text"
                                            placeholder="Teacher Key"
                                            required
                                            value={key}
                                            onChange={(e) => setKey(e.target.value)}
                                        />
                                    </div>
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    <Button type="submit" className="w-full">
                                        Verify
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <LoginForm/>
                )}
            </div>
        </div>
    );
}