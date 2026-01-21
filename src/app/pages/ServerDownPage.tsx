import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { checkHealth } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export function ServerDownPage() {
    const [isChecking, setIsChecking] = useState(false);
    const navigate = useNavigate();

    const handleRetry = async () => {
        setIsChecking(true);
        try {
            const isHealthy = await checkHealth();
            if (isHealthy) {
                navigate('/');
            } else {
                alert("Server is still unavailable. Please try again later.");
            }
        } catch (error) {
            // Should be handled by checkHealth returning false, but just in case
            console.error("Manual health check failed", error);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-neutral-900 border-neutral-800 text-white shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-red-500/10 p-4 rounded-full w-fit mb-2">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold">System Unavailable</CardTitle>
                    <CardDescription className="text-neutral-400">
                        We are currently experiencing connectivity issues with our servers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm text-neutral-300">
                        Our team has been notified and we are working to restore service as quickly as possible.
                        Please check back in a few moments.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                    <Button
                        onClick={handleRetry}
                        disabled={isChecking}
                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                    >
                        {isChecking ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Checking...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Retry Connection
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
