"use client";

import { useState } from "react";
import { useReceiptStore } from "@/stores/receiptStore";
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
import {
  IconCircleCheck,
  IconCircleX,
  IconUpload,
  IconFile,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
} from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

type Step = 1 | 2 | 3 | 4;

export default function ReceiptsPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const {
    files,
    receiverName,
    receivedAmount,
    receiverEmail,
    currency,
    receivedVia,
    isLoading,
    message,
    addFiles,
    removeFile,
    setReceiverName,
    setReceivedAmount,
    setReceiverEmail,
    setCurrency,
    setReceivedVia,
    sendReceipts,
  } = useReceiptStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    e.target.value = "";
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        return files.length > 0;
      case 2:
        return receiverName.trim() !== "" && receiverEmail.trim() !== "";
      case 3:
        return receivedAmount.trim() !== "" && receivedVia.trim() !== "";
      case 4:
        return true; // Confirmation step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendReceipts();
  };

  const steps = [
    { id: 1, title: "Upload Files", description: "Add your receipt files" },
    {
      id: 2,
      title: "Recipient Info",
      description: "Who is receiving the receipt?",
    },
    {
      id: 3,
      title: "Payment Details",
      description: "Enter payment information",
    },
    { id: 4, title: "Confirm & Send", description: "Review and send receipt" },
  ];

  return (
    <div className="flex flex-1 flex-col px-2 pt-0">
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-3xl">
          <CardHeader className="text-center pb-2 ">
            <CardTitle className="text-2xl">Send Receipt via Email</CardTitle>
            <CardDescription>
              Follow the steps below to send your receipt
            </CardDescription>
          </CardHeader>

          {/* Progress Indicator */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      currentStep >= step.id
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentStep + 1 === step.id
                        ? "border-primary text-primary"
                        : "border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <IconCheck className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.id
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / 4) * 100} className="h-2" />
          </div>

          <CardContent className="p-6">
            {/* Step Content */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Upload Receipt Files
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select the receipt files you want to send
                  </p>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                  <IconUpload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Drop receipt files here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF, DOC, DOCX, JPG, JPEG, PNG, TXT files
                    </p>
                  </div>
                  <Input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() =>
                      document.getElementById("file-input")?.click()
                    }
                  >
                    Browse Files
                  </Button>
                </div>

                {files.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      Selected files ({files.length}):
                    </p>
                    <div className="grid gap-2 max-h-40 overflow-y-auto">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            <IconFile className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium truncate max-w-xs">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          >
                            <IconCircleX className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Recipient Information
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter the details of the person receiving the receipt
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiverName">Full Name</Label>
                    <Input
                      id="receiverName"
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiverEmail">Email Address</Label>
                    <Input
                      id="receiverEmail"
                      type="email"
                      value={receiverEmail}
                      onChange={(e) => setReceiverEmail(e.target.value)}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Payment Details
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Provide the payment amount and method
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="receivedAmount">Amount Received</Label>
                      <Input
                        id="receivedAmount"
                        type="number"
                        step="0.01"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PHP">PHP</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receivedVia">Payment Method</Label>
                    <Select value={receivedVia} onValueChange={setReceivedVia}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wise">Wise</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                        <SelectItem value="Bank Transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Confirm & Send</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please review all information before sending
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">
                      Files to Send ({files.length})
                    </h4>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <IconFile className="h-4 w-4 text-muted-foreground" />
                          <span>{file.name}</span>
                          <span className="text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Recipient</h4>
                      <p className="text-sm">
                        {receiverName || "Not specified"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {receiverEmail || "Not specified"}
                      </p>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Payment</h4>
                      <p className="text-sm">
                        {receivedAmount
                          ? `${currency} ${receivedAmount}`
                          : "Not specified"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {receivedVia || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {message && (
                  <Alert
                    className={
                      message.includes("successfully")
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
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
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <IconChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="flex items-center gap-2"
                  >
                    Next
                    <IconChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                      {isLoading ? "Sending..." : "Send Receipt"}
                      <IconCheck className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
