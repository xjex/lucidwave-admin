# Careers API Documentation

## Overview

The Careers API allows managing job listings. Public users can view active careers, while admin users can create, update, and delete job postings.

---

## Public Endpoints

These endpoints are accessible without authentication.

### Get All Careers

Retrieves a paginated list of all active job listings.

```
GET /api/careers
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| department | string | - | Filter by department |
| type | string | - | Filter by job type |

**Example Request:**

```bash
curl -X GET "http://localhost:8080/api/careers?page=1&limit=10&department=Engineering"
```

**Example Response:**

```json
{
  "data": [
    {
      "type": "career",
      "id": "507f1f77bcf86cd799439011",
      "attributes": {
        "title": "Senior Frontend Developer",
        "department": "Engineering",
        "location": "Remote",
        "type": "full-time",
        "description": "We are looking for an experienced frontend developer...",
        "requirements": [
          "5+ years of React experience",
          "Strong TypeScript skills",
          "Experience with modern CSS"
        ],
        "responsibilities": [
          "Build and maintain web applications",
          "Collaborate with design team",
          "Code reviews and mentoring"
        ],
        "salary_range": {
          "min": 80000,
          "max": 120000,
          "currency": "USD"
        },
        "is_active": true,
        "created_at": "2026-01-14T10:00:00.000Z",
        "updated_at": "2026-01-14T10:00:00.000Z"
      }
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  },
  "links": {
    "self": "/api/careers?page=1&limit=10",
    "first": "/api/careers?page=1&limit=10",
    "last": "/api/careers?page=2&limit=10",
    "next": "/api/careers?page=2&limit=10"
  }
}
```

---

### Get Career by ID

Retrieves a specific job listing by its ID.

```
GET /api/careers/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Career ID (MongoDB ObjectId) |

**Example Request:**

```bash
curl -X GET "http://localhost:8080/api/careers/507f1f77bcf86cd799439011"
```

**Example Response:**

```json
{
  "data": {
    "type": "career",
    "id": "507f1f77bcf86cd799439011",
    "attributes": {
      "title": "Senior Frontend Developer",
      "department": "Engineering",
      "location": "Remote",
      "type": "full-time",
      "description": "We are looking for an experienced frontend developer to join our team...",
      "requirements": [
        "5+ years of React experience",
        "Strong TypeScript skills",
        "Experience with modern CSS"
      ],
      "responsibilities": [
        "Build and maintain web applications",
        "Collaborate with design team",
        "Code reviews and mentoring"
      ],
      "salary_range": {
        "min": 80000,
        "max": 120000,
        "currency": "USD"
      },
      "is_active": true,
      "created_at": "2026-01-14T10:00:00.000Z",
      "updated_at": "2026-01-14T10:00:00.000Z"
    }
  }
}
```

**Error Response (404):**

```json
{
  "errors": [
    {
      "status": "404",
      "title": "Not Found",
      "detail": "Career not found"
    }
  ]
}
```

---

## Admin Endpoints

These endpoints require admin authentication via JWT Bearer token.

### Get All Careers (Admin)

Retrieves all careers including inactive ones. Admins can filter by status.

```
GET /api/careers/admin
```

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| department | string | - | Filter by department |
| type | string | - | Filter by job type |
| is_active | boolean | - | Filter by active status (true/false) |

**Example Request:**

```bash
# Get all careers (active and inactive)
curl -X GET "http://localhost:8080/api/careers/admin" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get only inactive careers
curl -X GET "http://localhost:8080/api/careers/admin?is_active=false" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Response:**

```json
{
  "data": [
    {
      "type": "career",
      "id": "507f1f77bcf86cd799439011",
      "attributes": {
        "title": "Senior Frontend Developer",
        "department": "Engineering",
        "location": "Remote",
        "type": "full-time",
        "description": "...",
        "requirements": ["..."],
        "responsibilities": ["..."],
        "salary_range": { "min": 80000, "max": 120000, "currency": "USD" },
        "is_active": false,
        "created_at": "2026-01-14T10:00:00.000Z",
        "updated_at": "2026-01-14T10:00:00.000Z"
      }
    }
  ],
  "meta": { "total": 5, "page": 1, "limit": 10, "pages": 1 },
  "links": { "self": "/api/careers/admin?page=1&limit=10", "..." }
}
```

---

### Create Career

Creates a new job listing.

```
POST /api/careers
```

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Job title |
| department | string | Yes | Department name |
| location | string | Yes | Job location |
| type | string | No | Job type (default: "full-time") |
| description | string | Yes | Job description |
| requirements | string[] | No | List of requirements |
| responsibilities | string[] | No | List of responsibilities |
| salary_range | object | No | Salary range object |
| salary_range.min | number | No | Minimum salary |
| salary_range.max | number | No | Maximum salary |
| salary_range.currency | string | No | Currency (default: "USD") |

**Job Types:**
- `full-time`
- `part-time`
- `contract`
- `internship`

**Example Request:**

```bash
curl -X POST "http://localhost:8080/api/careers" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Frontend Developer",
    "department": "Engineering",
    "location": "Remote",
    "type": "full-time",
    "description": "We are looking for an experienced frontend developer to join our team and help build amazing user experiences.",
    "requirements": [
      "5+ years of React experience",
      "Strong TypeScript skills",
      "Experience with modern CSS and responsive design"
    ],
    "responsibilities": [
      "Build and maintain web applications",
      "Collaborate with design and backend teams",
      "Participate in code reviews and mentoring"
    ],
    "salary_range": {
      "min": 80000,
      "max": 120000,
      "currency": "USD"
    }
  }'
```

**Example Response (201):**

```json
{
  "data": {
    "type": "career",
    "id": "507f1f77bcf86cd799439011",
    "attributes": {
      "title": "Senior Frontend Developer",
      "department": "Engineering",
      "location": "Remote",
      "type": "full-time",
      "description": "We are looking for an experienced frontend developer...",
      "requirements": ["5+ years of React experience", "..."],
      "responsibilities": ["Build and maintain web applications", "..."],
      "salary_range": {
        "min": 80000,
        "max": 120000,
        "currency": "USD"
      },
      "is_active": true,
      "created_at": "2026-01-14T10:00:00.000Z"
    },
    "links": {
      "self": "/api/careers/507f1f77bcf86cd799439011"
    }
  },
  "message": "Career created successfully"
}
```

---

### Update Career

Updates an existing job listing.

```
PATCH /api/careers/:id
```

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Career ID |

**Request Body:**

All fields are optional. Only include fields you want to update.

| Field | Type | Description |
|-------|------|-------------|
| title | string | Job title |
| department | string | Department name |
| location | string | Job location |
| type | string | Job type |
| description | string | Job description |
| requirements | string[] | List of requirements |
| responsibilities | string[] | List of responsibilities |
| salary_range | object | Salary range object |
| is_active | boolean | Whether the job is active |

**Example Request:**

```bash
curl -X PATCH "http://localhost:8080/api/careers/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "salary_range": {
      "min": 90000,
      "max": 130000,
      "currency": "USD"
    },
    "is_active": true
  }'
```

**Example Response:**

```json
{
  "data": {
    "type": "career",
    "id": "507f1f77bcf86cd799439011",
    "attributes": {
      "title": "Senior Frontend Developer",
      "department": "Engineering",
      "location": "Remote",
      "type": "full-time",
      "description": "We are looking for an experienced frontend developer...",
      "requirements": ["..."],
      "responsibilities": ["..."],
      "salary_range": {
        "min": 90000,
        "max": 130000,
        "currency": "USD"
      },
      "is_active": true,
      "updated_at": "2026-01-14T12:00:00.000Z"
    }
  },
  "message": "Career updated successfully"
}
```

---

### Delete Career

Permanently deletes a job listing.

```
DELETE /api/careers/:id
```

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Career ID |

**Example Request:**

```bash
curl -X DELETE "http://localhost:8080/api/careers/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Response:**

```json
{
  "message": "Career deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "status": "400",
      "title": "Bad Request",
      "detail": "Title, department, location, and description are required"
    }
  ]
}
```

### 403 Forbidden (Admin Required)

```json
{
  "error": "Admin access required"
}
```

### 404 Not Found

```json
{
  "errors": [
    {
      "status": "404",
      "title": "Not Found",
      "detail": "Career not found"
    }
  ]
}
```

### 500 Server Error

```json
{
  "errors": [
    {
      "status": "500",
      "title": "Server Error",
      "detail": "An error occurred while processing the request"
    }
  ]
}
```

---

## Data Model

### Career Object

| Field | Type | Description |
|-------|------|-------------|
| id | ObjectId | Unique identifier |
| title | string | Job title (max 200 chars) |
| department | string | Department name (max 100 chars) |
| location | string | Job location (max 200 chars) |
| type | enum | full-time, part-time, contract, internship |
| description | string | Full job description |
| requirements | string[] | List of job requirements |
| responsibilities | string[] | List of job responsibilities |
| salary_range | object | Optional salary information |
| salary_range.min | number | Minimum salary |
| salary_range.max | number | Maximum salary |
| salary_range.currency | string | Currency code (default: USD) |
| is_active | boolean | Whether job is visible to public |
| created_by | ObjectId | Admin user who created the job |
| created_at | Date | Creation timestamp |
| updated_at | Date | Last update timestamp |

---

## Usage Examples

### Public App (React/Next.js)

```typescript
// Fetch all careers
const fetchCareers = async (page = 1, department?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: '10' });
  if (department) params.append('department', department);
  
  const response = await fetch(`${API_URL}/api/careers?${params}`);
  return response.json();
};

// Fetch single career
const fetchCareer = async (id: string) => {
  const response = await fetch(`${API_URL}/api/careers/${id}`);
  return response.json();
};
```

### Admin App (React/Next.js)

```typescript
// Get all careers (including inactive) - Admin only
const fetchAdminCareers = async (token: string, filters?: { is_active?: boolean; department?: string }) => {
  const params = new URLSearchParams();
  if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
  if (filters?.department) params.append('department', filters.department);
  
  const response = await fetch(`${API_URL}/api/careers/admin?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

// Create career
const createCareer = async (careerData: CareerInput, token: string) => {
  const response = await fetch(`${API_URL}/api/careers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(careerData),
  });
  return response.json();
};

// Update career
const updateCareer = async (id: string, updates: Partial<CareerInput>, token: string) => {
  const response = await fetch(`${API_URL}/api/careers/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  return response.json();
};

// Delete career
const deleteCareer = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/api/careers/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

// Toggle career active status
const toggleCareerStatus = async (id: string, isActive: boolean, token: string) => {
  return updateCareer(id, { is_active: isActive }, token);
};
```

### TypeScript Interfaces

```typescript
interface SalaryRange {
  min?: number;
  max?: number;
  currency?: string;
}

interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary_range?: SalaryRange;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CareerInput {
  title: string;
  department: string;
  location: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  salary_range?: SalaryRange;
}
```
