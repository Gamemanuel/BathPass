"use client"

import { LoginForm } from "@/components/LoginForm"
import { useState } from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const [isVerified, setIsVerified] = useState(false);
    const [key, setKey] = useState('');
    const [error, setError] = useState('');

    const handleKeyVerification = async () => {
        // This should ideally be done in a Server Action for security
        // For simplicity in this tutorial, we'll call an API route.
        const response = await fetch('/api/verifyKey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key }),
        });

        if (response.ok) {
            setIsVerified(true);
            setError('');
        } else {
            setError('Invalid teacher key.');
        }
    };

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
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
                            <form>
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
                                    <Button className="w-full" onClick={handleKeyVerification}>
                                        Verify
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    ) : (
                    <LoginForm />
                )}
            </div>
        </div>
    )
}