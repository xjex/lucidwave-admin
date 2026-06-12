# Job Applications API Documentation

## Overview

The Job Applications API allows candidates to apply for job positions and admins to manage applications with status tracking.

## Application Statuses

| Status | Description |
|--------|-------------|
| `new` | Newly submitted application |
| `interested` | Admin is interested in the candidate |
| `interviewed` | Candidate has been interviewed |
| `pooling` | Candidate is in the talent pool |
| `offered` | Job offer has been made |
| `accepted` | Candidate accepted the offer |
| `rejected` | Application rejected |

---

## Public Endpoints

### Submit Application

Submit a job application for a specific career position.

```
POST /api/applications
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| career_id | string | Yes | Career/Job ID to apply for |
| first_name | string | Yes | Applicant's first name |
| last_name | string | Yes | Applicant's last name |
| email | string | Yes | Email address |
| contact_number | string | Yes | Phone/contact number |
| linkedin_profile | string | No | LinkedIn profile URL |
| portfolio_url | string | No | Portfolio or website URL |
| cover_letter | string | No | Cover letter (max 5000 chars) |
| notes | string | No | Additional notes (max 2000 chars) |

**Example Request:**

```bash
curl -X POST "http://localhost:8080/api/applications" \
  -H "Content-Type: application/json" \
  -d '{
    "career_id": "507f1f77bcf86cd799439011",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "contact_number": "+1234567890",
    "linkedin_profile": "https://linkedin.com/in/johndoe",
    "portfolio_url": "https://johndoe.dev",
    "cover_letter": "I am excited to apply for this position...",
    "notes": "Available to start immediately"
  }'
```

**Success Response (201):**

```json
{
  "data": {
    "type": "job_application",
    "id": "507f1f77bcf86cd799439012",
    "attributes": {
      "career_id": "507f1f77bcf86cd799439011",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "status": "new",
      "created_at": "2026-01-14T10:00:00.000Z"
    }
  },
  "message": "Application submitted successfully"
}
```

**Error Responses:**

- `400` - Missing required fields or invalid email
- `404` - Career not found
- `409` - Already applied for this position

---

## Admin Endpoints

All admin endpoints require JWT Bearer token authentication.

### Get All Applications

Retrieve all job applications with optional filtering.

```
GET /api/applications/admin
```

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| status | string | Filter by status |
| career_id | string | Filter by career ID |

**Example Request:**

```bash
# Get all applications
curl -X GET "http://localhost:8080/api/applications/admin" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Filter by status
curl -X GET "http://localhost:8080/api/applications/admin?status=interviewed" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Get Applications by Career

Retrieve all applications for a specific job position with status counts.

```
GET /api/applications/admin/career/:careerId
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| status | string | Filter by status |

**Example Request:**

```bash
curl -X GET "http://localhost:8080/api/applications/admin/career/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Response:**

```json
{
  "data": [
    {
      "type": "job_application",
      "id": "507f1f77bcf86cd799439012",
      "attributes": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "contact_number": "+1234567890",
        "linkedin_profile": "https://linkedin.com/in/johndoe",
        "portfolio_url": "https://johndoe.dev",
        "cover_letter": "...",
        "notes": "...",
        "status": "interviewed",
        "status_history": [
          { "status": "new", "changed_at": "2026-01-14T10:00:00.000Z" },
          { "status": "interested", "changed_at": "2026-01-15T10:00:00.000Z" },
          { "status": "interviewed", "changed_at": "2026-01-16T10:00:00.000Z" }
        ],
        "created_at": "2026-01-14T10:00:00.000Z"
      }
    }
  ],
  "career": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Senior Frontend Developer",
    "department": "Engineering",
    "location": "Remote"
  },
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "pages": 2,
    "status_counts": {
      "new": 10,
      "interested": 5,
      "interviewed": 3,
      "pooling": 2,
      "offered": 1,
      "accepted": 1,
      "rejected": 3
    }
  }
}
```

---

### Get Single Application

Retrieve detailed information about a specific application.

```
GET /api/applications/admin/:id
```

**Example Request:**

```bash
curl -X GET "http://localhost:8080/api/applications/admin/507f1f77bcf86cd799439012" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Update Application Status

Update the status of an application (tag/segregate).

```
PATCH /api/applications/admin/:id/status
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status |
| notes | string | No | Notes about the status change |

**Valid Statuses:** `new`, `interested`, `interviewed`, `pooling`, `offered`, `accepted`, `rejected`

**Example Request:**

```bash
curl -X PATCH "http://localhost:8080/api/applications/admin/507f1f77bcf86cd799439012/status" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "interviewed",
    "notes": "First round interview completed. Strong candidate."
  }'
```

**Example Response:**

```json
{
  "data": {
    "type": "job_application",
    "id": "507f1f77bcf86cd799439012",
    "attributes": {
      "status": "interviewed",
      "status_history": [
        { "status": "new", "changed_at": "2026-01-14T10:00:00.000Z" },
        { "status": "interested", "changed_at": "2026-01-15T10:00:00.000Z" },
        { 
          "status": "interviewed", 
          "changed_at": "2026-01-16T10:00:00.000Z",
          "changed_by": "admin_user_id",
          "notes": "First round interview completed. Strong candidate."
        }
      ],
      "updated_at": "2026-01-16T10:00:00.000Z"
    }
  },
  "message": "Application status updated successfully"
}
```

---

### Update Application Notes

Update admin notes on an application.

```
PATCH /api/applications/admin/:id
```

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| notes | string | Admin notes |

**Example Request:**

```bash
curl -X PATCH "http://localhost:8080/api/applications/admin/507f1f77bcf86cd799439012" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Excellent communication skills. Schedule second interview."
  }'
```

---

### Delete Application

Permanently delete an application.

```
DELETE /api/applications/admin/:id
```

**Example Request:**

```bash
curl -X DELETE "http://localhost:8080/api/applications/admin/507f1f77bcf86cd799439012" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## TypeScript Interfaces

```typescript
type ApplicationStatus = 
  | "new"
  | "interested"
  | "interviewed"
  | "pooling"
  | "offered"
  | "accepted"
  | "rejected";

interface StatusHistoryEntry {
  status: ApplicationStatus;
  changed_at: string;
  changed_by?: string;
  notes?: string;
}

interface JobApplication {
  id: string;
  career_id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  linkedin_profile?: string;
  portfolio_url?: string;
  cover_letter?: string;
  notes?: string;
  status: ApplicationStatus;
  status_history: StatusHistoryEntry[];
  created_at: string;
  updated_at: string;
}

interface ApplicationInput {
  career_id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  linkedin_profile?: string;
  portfolio_url?: string;
  cover_letter?: string;
  notes?: string;
}
```

---

## Usage Examples

### Public App (React/Next.js)

```typescript
// Submit application
const submitApplication = async (data: ApplicationInput) => {
  const response = await fetch(`${API_URL}/api/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

### Admin App (React/Next.js)

```typescript
// Get applications for a career
const getCareerApplications = async (careerId: string, token: string, status?: ApplicationStatus) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  
  const response = await fetch(`${API_URL}/api/applications/admin/career/${careerId}?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

// Update application status
const updateStatus = async (id: string, status: ApplicationStatus, notes: string, token: string) => {
  const response = await fetch(`${API_URL}/api/applications/admin/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, notes }),
  });
  return response.json();
};

// Filter applications by status
const filterByStatus = async (status: ApplicationStatus, token: string) => {
  const response = await fetch(`${API_URL}/api/applications/admin?status=${status}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};
```
