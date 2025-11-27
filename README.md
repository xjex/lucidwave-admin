# Invoice & Receipt Email Sender

A Next.js application for sending invoices and receipts via email. This application allows you to upload multiple files and send them to recipients through a backend API.

## Features

- **Login System** (`/`) - Simple authentication flow
- **Invoice Sender** (`/dashboard`) - Send multiple invoice files with email
- **Receipt Sender** (`/receipts`) - Send receipts with receiver details
- Multiple file upload for documents (PDF, DOC, DOCX, JPG, PNG, TXT)
- Accumulative file selection - select files multiple times to add more
- Individual file removal with remove buttons
- Form validation and error handling
- Loading states and success/error messages
- Clean, responsive UI built with Tailwind CSS and shadcn/ui components
- Environment-based API configuration
- Axios HTTP client and Zustand state management
- Tabler icons for consistent iconography

## Prerequisites

- Node.js 18+
- A backend server with the following endpoints:

### Invoice API (`localhost:8080/api/invoices/send`)

- `invoices`: Multiple invoice files (multipart/form-data)
- `receiverEmail`: The recipient email address

### Receipt API (`localhost:8080/api/receipts/send`)

- `receipts`: Multiple receipt files (multipart/form-data)
- `receiverName`: Name of the receiver
- `receivedAmount`: Amount received (decimal)
- `receiverEmail`: The recipient email address

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment variables:

```bash
cp .env.example .env.local
```

3. Update the environment variables in `.env.local` to match your backend configuration.

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

The application uses the following environment variables:

- `NEXT_PUBLIC_API_BASE_URL`: Base URL of your backend API (default: `http://localhost:8080`)
- `NEXT_PUBLIC_INVOICE_SEND_ENDPOINT`: API endpoint for sending invoices (default: `/api/invoices/send`)
- `NEXT_PUBLIC_API_URL`: Full invoice API URL (overrides the above if set)
- `NEXT_PUBLIC_RECEIPT_SEND_ENDPOINT`: API endpoint for sending receipts (default: `/api/receipts/send`)
- `NEXT_PUBLIC_RECEIPT_API_URL`: Full receipt API URL (overrides the above if set)

You can set these in your `.env.local` file:

```bash
# Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Invoice endpoints
NEXT_PUBLIC_INVOICE_SEND_ENDPOINT=/api/invoices/send
NEXT_PUBLIC_API_URL=http://localhost:8080/api/invoices/send

# Receipt endpoints
NEXT_PUBLIC_RECEIPT_SEND_ENDPOINT=/api/receipts/send
NEXT_PUBLIC_RECEIPT_API_URL=http://localhost:8080/api/receipts/send
```

## Architecture

The application follows a clean architecture pattern:

- **Services** (`/src/services/`): API calls using Axios
- **Stores** (`/src/stores/`): State management using Zustand
- **Components** (`/src/app/`): UI components with minimal logic

This separation makes the code more maintainable, testable, and scalable.

## Usage

### Login (/)

1. Navigate to the root page to access the login screen
2. Enter any email and password to continue (demo authentication)
3. Click "Sign In" to proceed to the dashboard

### Invoice Sender (/dashboard)

1. After logging in, you'll be redirected to the dashboard
2. Click "Choose Files" to select invoice documents (you can select files multiple times to add more)
3. Selected files will be displayed below with remove buttons
4. Enter the recipient's email address
5. Click "Send Invoice" to submit the form
6. Click "Go to Receipt Sender →" to switch to receipt mode

### Receipt Sender (/receipts)

1. Navigate to `/receipts` or click the link from the dashboard
2. Click "Choose Files" to select receipt documents
3. Enter receiver name, received amount, and receiver email
4. Click "Send Receipt" to submit the form

## Backend API Requirements

Your backend server should accept POST requests to `/api/invoices/send` with:

- Content-Type: `multipart/form-data`
- Parameters:
  - `invoices`: Multiple uploaded invoice files (array)
  - `receiverEmail`: The recipient email address

Example backend implementation (Node.js/Express):

```javascript
app.post("/api/invoices/send", upload.array("invoices"), (req, res) => {
  const { receiverEmail } = req.body;
  const files = req.files; // Array of uploaded files
  // Send email logic here
  res.status(200).send("Invoices sent successfully");
});
```

## Technologies Used

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- ESLint
- Axios (HTTP client)
- Zustand (State management)
