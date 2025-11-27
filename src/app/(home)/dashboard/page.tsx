"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  IconFileText,
  IconReceipt,
  IconMail,
  IconChartBar,
} from "@tabler/icons-react";
import { useAuthStore } from "@/stores/authStore";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome to Invoice Manager</h1>
            <p className="text-muted-foreground text-lg">
              Manage your invoices and receipts efficiently
            </p>
            {user && (
              <p className="text-sm text-muted-foreground">
                Welcome back, {user.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <IconFileText className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Send Invoices</CardTitle>
                <CardDescription>
                  Upload and send invoice files via email to your clients
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild className="w-full">
                  <Link href="/invoice">Send Invoice</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                  <IconReceipt className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Send Receipts</CardTitle>
                <CardDescription>
                  Upload receipt files with payment details and send via email
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/receipts">Send Receipt</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="text-center p-4">
              <IconMail className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium">Email Integration</h3>
              <p className="text-sm text-muted-foreground">
                Send documents directly via email
              </p>
            </Card>
            <Card className="text-center p-4">
              <IconFileText className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium">Multiple Formats</h3>
              <p className="text-sm text-muted-foreground">
                Support for PDF, DOC, images
              </p>
            </Card>
            <Card className="text-center p-4">
              <IconChartBar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium">Track Everything</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your document sending
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
