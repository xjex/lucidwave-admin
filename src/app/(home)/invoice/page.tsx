"use client";

import { useInvoiceStore } from "@/stores/invoiceStore";
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
import Link from "next/link";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";

export default function InvoicePage() {
  const {
    files,
    email,
    isLoading,
    message,
    addFiles,
    removeFile,
    setEmail,
    sendInvoices,
  } = useInvoiceStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendInvoices();
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              Send Invoice via Email
            </CardTitle>
            <CardDescription className="text-center">
              Upload multiple invoice files and send them via email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-input">Invoice Files</Label>
                <Input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                {files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Selected files ({files.length}):
                    </p>
                    <ul className="space-y-1">
                      {files.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between bg-muted p-2 rounded text-sm"
                        >
                          <div className="flex items-center">
                            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                            {file.name}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-destructive hover:text-destructive/80 h-auto p-1"
                          >
                            <IconCircleX className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  required
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending..." : "Send Invoice"}
              </Button>
            </form>

            {message && (
              <Alert
                className={
                  message.includes("successfully")
                    ? "border-green-200"
                    : "border-red-200"
                }
              >
                <div className="flex items-center">
                  {message.includes("successfully") ? (
                    <IconCircleCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <IconCircleX className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard">← Back to Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/receipts">Go to Receipt Sender →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
