# Portfolio Management - Design Document

## Overview

The Portfolio Management system is a full-featured admin interface for managing portfolio projects with image uploads. It provides comprehensive CRUD operations through a modern React-based UI with server-side data persistence. The system uses a side drawer pattern for forms and details, a data table for listing, and integrates with a backend API for data management and Google Cloud Storage for image hosting.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Portfolio Page (Main)                    │
│  - Data table with filtering                                 │
│  - Status filter dropdown                                    │
│  - Create button                                             │
│  - Pagination controls                                       │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────────┐
             │              │              │                  │
             ▼              ▼              ▼                  ▼
    ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌──────────────┐
    │  Form      │  │  Detail    │  │  Delete  │  │  Portfolio   │
    │  Drawer    │  │  Drawer    │  │  Dialog  │  │  Service     │
    └────────────┘  └────────────┘  └──────────┘  └──────┬───────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │   Backend API   │
                                                  │  - CRUD ops     │
                                                  │  - Image upload │
                                                  │  - Validation   │
                                                  └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │  Google Cloud   │
                                                  │    Storage      │
                                                  └─────────────────┘
```

### Technology Stack

- **Frontend Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+ with TypeScript
- **Component Library**: shadcn/ui (Radix UI primitives)
- **HTTP Client**: Axios
- **State Management**: React useState/useEffect hooks
- **Styling**: Tailwind CSS
- **Icons**: Tabler Icons React
- **Backend API**: RESTful API (external)
- **Image Storage**: Google Cloud Storage (via backend)

## Components and Interfaces

### 1. Main Portfolio Page (`page.tsx`)

**Responsibilities**:
- Display portfolio items in a data table
- Manage filtering by status
- Handle pagination
- Coordinate drawer and dialog states
- Orchestrate CRUD operations

**State Management**:
```typescript
- portfolios: Portfolio[]           // Current page of portfolio items
- loading: boolean                  // Loading state for async operations
- error: string | null              // Error messages
- meta: PaginationMeta | null       // Pagination metadata
- statusFilter: PortfolioStatus | "all"  // Current status filter
- selectedPortfolio: Portfolio | null    // Currently selected item
- formDrawerOpen: boolean           // Form drawer visibility
- detailDrawerOpen: boolean         // Detail drawer visibility
- deleteModalOpen: boolean          // Delete confirmation visibility
- portfolioToDelete: Portfolio | null    // Item pending deletion
- isDeleting: boolean               // Delete operation in progress
```

**Key Functions**:
- `fetchPortfolios(page)`: Fetch portfolio data with filters
- `handleCreateClick()`: Open form drawer for new portfolio
- `handleEditClick(portfolio)`: Open form drawer with existing data
- `handleViewClick(portfolio)`: Open detail drawer
- `handleDeleteClick(portfolio)`: Show delete confirmation
- `handleConfirmDelete()`: Execute deletion
- `handleStatusChange(portfolio, status)`: Quick status update
- `handleFormSuccess()`: Refresh data after form submission

**Data Table Configuration**:
- Columns: Image, Title, Category, Project Status, Status, Link, Created Date, Actions
- Row click: Opens detail drawer
- Inline status dropdown: Quick status changes
- Action buttons: View, Edit, Delete

### 2. Portfolio Form Drawer (`PortfolioFormDrawer.tsx`)

**Responsibilities**:
- Create new portfolio items
- Edit existing portfolio items
- Handle image upload with preview
- Validate form inputs
- Submit data to backend API

**Props Interface**:
```typescript
interface PortfolioFormDrawerProps {
  open: boolean;                    // Drawer visibility
  onOpenChange: (open: boolean) => void;  // Close handler
  portfolio: Portfolio | null;      // Existing portfolio for edit mode
  onSuccess: () => void;            // Success callback
}
```

**Form Fields**:
- **Image** (required for create, optional for edit): File upload with preview
- **Title** (required): Text input
- **Category** (required): Dropdown select from predefined categories
- **Description** (required): Textarea
- **Status** (optional, default: Public): Dropdown (Public, Private, Draft)
- **Project Status** (required, default: Public): Dropdown (Public, On Progress, NDA, Local)
- **Link** (optional): URL input

**Image Handling**:
- File type validation: image/* types only
- Size validation: Maximum 10MB
- Preview generation: FileReader API for local preview
- Existing image display: Shows current image URL from API
- Replace functionality: New upload replaces existing image

**Validation Rules**:
- Title, category, description are required
- Image required for create, optional for edit
- Link must be valid URL format if provided
- File size must not exceed 10MB
- File must be image type

### 3. Portfolio Detail Drawer (`PortfolioDetailDrawer.tsx`)

**Responsibilities**:
- Display full portfolio details
- Show full-size image
- Provide edit and delete actions
- Display metadata (timestamps, status, category)

**Props Interface**:
```typescript
interface PortfolioDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio: Portfolio | null;
  onEdit: (portfolio: Portfolio) => void;
  onDelete: (portfolio: Portfolio) => void;
}
```

**Display Sections**:
- Full-size image (h-64 container)
- Status badges (Status, Category, Project Status)
- Description (with whitespace preservation)
- Project link (if available, opens in new tab)
- Timestamps (created_at, updated_at)
- Action buttons (Edit, Delete)

### 4. Portfolio Service (`portfolioService.ts`)

**Responsibilities**:
- Abstract API communication
- Handle HTTP requests with Axios
- Format request data (FormData for multipart uploads)
- Type-safe API responses

**API Functions**:

```typescript
// Fetch paginated portfolios with optional filters
getPortfolios(
  page: number = 1,
  limit: number = 10,
  category?: string,
  status?: PortfolioStatus
): Promise<PortfoliosResponse>

// Fetch single portfolio by ID
getPortfolioById(id: string): Promise<PortfolioResponse>

// Create new portfolio with image upload
createPortfolio(portfolioData: PortfolioInput): Promise<PortfolioResponse>

// Update existing portfolio (partial updates supported)
updatePortfolio(
  id: string,
  updates: PortfolioUpdateInput
): Promise<PortfolioResponse>

// Delete portfolio (removes database record and image)
deletePortfolio(id: string): Promise<{ message: string }>
```

**Request Format**:
- All create/update operations use `multipart/form-data`
- Image file sent as FormData field
- Text fields sent as FormData fields
- PATCH method for updates (partial updates)
- DELETE method for deletion

## Data Models

### Core Types

```typescript
// Portfolio visibility status
type PortfolioStatus = "Public" | "Private" | "Draft";

// Project development status (additional field beyond requirements)
type ProjectStatus = "Public" | "On Progress" | "NDA" | "Local";

// Portfolio attributes (nested in API response)
interface PortfolioAttributes {
  title: string;
  category: string;
  description: string;
  status: PortfolioStatus;
  project_status: ProjectStatus;  // Additional field
  link?: string;
  imageURL: string;               // Full URL from API
  created_at: string;             // ISO 8601 timestamp
  updated_at: string;             // ISO 8601 timestamp
}

// Portfolio entity (JSON:API format)
interface Portfolio {
  type: "portfolio";
  id: string;
  attributes: PortfolioAttributes;
}

// Input for creating portfolio
interface PortfolioInput {
  title: string;
  category: string;
  description: string;
  status?: PortfolioStatus;       // Optional, defaults to "Public"
  project_status: ProjectStatus;  // Required
  link?: string;
  image: File;                    // Required for create
}

// Input for updating portfolio (all fields optional)
interface PortfolioUpdateInput {
  title?: string;
  category?: string;
  description?: string;
  status?: PortfolioStatus;
  project_status?: ProjectStatus;
  link?: string;
  image?: File;                   // Optional, replaces existing if provided
}

// Paginated list response
interface PortfoliosResponse {
  data: Portfolio[];
  meta: {
    total: number;    // Total items across all pages
    page: number;     // Current page number
    limit: number;    // Items per page
    pages: number;    // Total number of pages
  };
}

// Single portfolio response
interface PortfolioResponse {
  data: Portfolio;
  message?: string;
}
```

### Predefined Categories

```typescript
const CATEGORIES = [
  "Web Application",
  "Mobile App",
  "E-commerce",
  "Landing Page",
  "Dashboard",
  "API/Backend",
  "Design System",
  "Other",
];
```

### Status Badge Variants

**Portfolio Status**:
- Public → default (primary color)
- Private → secondary (muted color)
- Draft → outline (border only)

**Project Status**:
- Public → default (primary color)
- On Progress → secondary (muted color)
- NDA → destructive (red/warning color)
- Local → outline (border only)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Portfolio Creation Persistence
*For any* valid portfolio input with required fields (title, category, description, image, project_status), creating a portfolio should result in a new portfolio entity that can be retrieved from the system with all provided data intact.

**Validates: Requirements US-2 (Create Portfolio Item)**

### Property 2: Image Upload Validation
*For any* file upload attempt, if the file size exceeds 10MB or the file type is not an image format, the system should reject the upload and display an appropriate error message without creating or updating a portfolio.

**Validates: Requirements US-2 (Create Portfolio Item - Image validation)**

### Property 3: Required Field Validation
*For any* form submission attempt, if any required field (title, category, description, or image for create) is missing or empty, the system should prevent submission and display a validation error without making an API call.

**Validates: Requirements US-2, US-3 (Form validation)**

### Property 4: Portfolio Update Preservation
*For any* existing portfolio, updating specific fields should preserve all non-updated fields, and the updated_at timestamp should be more recent than the created_at timestamp.

**Validates: Requirements US-3 (Edit Portfolio Item)**

### Property 5: Image Replacement Atomicity
*For any* portfolio update that includes a new image, the old image should be deleted and the new image should be stored, or if the operation fails, the original image should remain unchanged (no orphaned images).

**Validates: Requirements US-3 (Edit Portfolio Item - Image replacement)**

### Property 6: Delete Confirmation Safety
*For any* delete operation, the system should display a confirmation dialog showing the portfolio title before deletion, and deletion should only proceed after explicit user confirmation.

**Validates: Requirements US-4 (Delete Portfolio Item)**

### Property 7: Delete Cascade Completeness
*For any* portfolio deletion, both the database record and the associated image file should be removed from storage, leaving no orphaned data.

**Validates: Requirements US-4 (Delete Portfolio Item - Cascade deletion)**

### Property 8: Status Update Immediacy
*For any* status change operation via the inline dropdown, the new status should be reflected in the UI immediately after successful API response without requiring a page reload.

**Validates: Requirements US-5 (Change Portfolio Status)**

### Property 9: Filter Consistency
*For any* status filter selection, the displayed portfolio items should only include items matching the selected status, or all items if "all" is selected.

**Validates: Requirements US-1 (View Portfolio Items - Filtering)**

### Property 10: Pagination Boundary Safety
*For any* pagination state, the "Previous" button should be disabled when on page 1, and the "Next" button should be disabled when on the last page.

**Validates: Requirements US-1 (View Portfolio Items - Pagination)**

### Property 11: Row Click Navigation
*For any* portfolio item row click (excluding action button clicks), the detail drawer should open displaying the full details of the clicked portfolio.

**Validates: Requirements US-1, US-6 (View Portfolio Details)**

### Property 12: Form Reset on Close
*For any* form drawer close action (cancel or successful submission), the form should reset to initial state when reopened for a new portfolio creation.

**Validates: Requirements US-2 (Create Portfolio Item - Form state management)**

### Property 13: Image Preview Accuracy
*For any* image upload, the preview displayed in the form should accurately represent the selected image file before submission.

**Validates: Requirements US-2, US-3 (Image upload with preview)**

### Property 14: Link External Navigation
*For any* portfolio with a link field, clicking the link should open the URL in a new browser tab without navigating away from the admin interface.

**Validates: Requirements US-6 (View Portfolio Details - Link handling)**

### Property 15: Error Message Clarity
*For any* failed API operation, the system should display a user-friendly error message that clearly indicates what went wrong without exposing technical implementation details.

**Validates: Non-Functional Requirements (Error handling)**

## Error Handling

### Client-Side Validation Errors

**Image Upload Errors**:
- File type not image: "Please select an image file"
- File size > 10MB: "Image size must be less than 10MB"
- Display in Alert component with destructive variant

**Form Validation Errors**:
- Missing required fields: "Title, category, and description are required"
- Missing image on create: "Image is required"
- Display in Alert component above form fields

### API Error Handling

**Error Response Format**:
```typescript
// Backend may return errors in different formats
err.response?.data?.errors?.[0]?.detail  // JSON:API format
err.response?.data?.message              // Simple message format
```

**Error Display Strategy**:
- Extract error message from response
- Fall back to generic message if no specific error
- Display in Alert component with destructive variant
- Keep error visible until next action or manual dismissal

**Operation-Specific Fallbacks**:
- Create failure: "Failed to create portfolio"
- Update failure: "Failed to update portfolio"
- Delete failure: "Failed to delete portfolio"
- Fetch failure: "Failed to load portfolios"
- Status update failure: "Failed to update status"

### Loading States

**Page-Level Loading**:
- Show centered spinner with "Loading portfolios..." message
- Only on initial load (portfolios.length === 0)

**Operation Loading States**:
- Form submission: Disable buttons, show "Creating..." or "Updating..."
- Delete operation: Disable buttons, show "Deleting..."
- Status change: Optimistic update (immediate UI change)

### Network Error Recovery

**Retry Strategy**:
- No automatic retry (user-initiated retry via refresh)
- Error messages persist until next successful operation
- Form data preserved on submission failure

**Offline Handling**:
- Axios will throw network errors
- Display generic error message
- User can retry when connection restored

## Testing Strategy

### Unit Testing

**Component Tests**:
- PortfolioFormDrawer: Form validation, image upload, edit mode
- PortfolioDetailDrawer: Data display, action callbacks
- Portfolio Page: State management, event handlers

**Service Tests**:
- portfolioService: API calls, FormData formatting, error handling

**Test Cases**:
- Form validation with missing fields
- Image file validation (type, size)
- Status badge rendering for all status types
- Project status badge rendering for all project status types
- Pagination button disabled states
- Filter application
- Error message extraction from various response formats

### Property-Based Testing

Each property test should run a minimum of 100 iterations with randomized inputs.

**Property 1: Portfolio Creation Persistence**
```typescript
// Feature: portfolio-management, Property 1
// Generate random valid portfolio data
// Create portfolio via API
// Fetch created portfolio
// Assert all fields match input
```

**Property 2: Image Upload Validation**
```typescript
// Feature: portfolio-management, Property 2
// Generate files with random sizes (including > 10MB)
// Generate files with random types (including non-images)
// Attempt upload
// Assert rejection for invalid files
```

**Property 3: Required Field Validation**
```typescript
// Feature: portfolio-management, Property 3
// Generate portfolio data with random missing required fields
// Attempt form submission
// Assert validation error displayed
// Assert no API call made
```

**Property 9: Filter Consistency**
```typescript
// Feature: portfolio-management, Property 9
// Generate random portfolio list with mixed statuses
// Apply each status filter
// Assert filtered results match filter criteria
```

**Property 10: Pagination Boundary Safety**
```typescript
// Feature: portfolio-management, Property 10
// Generate pagination states (first page, middle page, last page)
// Assert button disabled states match page position
```

### Integration Testing

**End-to-End Flows**:
- Create portfolio → View in list → Edit → Delete
- Filter by status → Create new → Verify appears in filtered view
- Upload image → Edit with new image → Verify old image replaced
- Quick status change → Verify persistence across page reload

**API Integration**:
- Mock API responses for all service functions
- Test error handling for various API error formats
- Test pagination with different page sizes
- Test filtering with different status values

### Manual Testing Checklist

- [ ] Create portfolio with all fields
- [ ] Create portfolio with only required fields
- [ ] Edit portfolio without changing image
- [ ] Edit portfolio with new image
- [ ] Delete portfolio and verify image removed
- [ ] Change status via inline dropdown
- [ ] Filter by each status type
- [ ] Navigate through multiple pages
- [ ] Click row to view details
- [ ] Open external link in new tab
- [ ] Test with images at size limit (10MB)
- [ ] Test with oversized images (> 10MB)
- [ ] Test with non-image files
- [ ] Test form validation for each required field
- [ ] Test responsive layout on mobile
- [ ] Test all project status types (Public, On Progress, NDA, Local)

## Implementation Notes

### Image URL Handling

The API returns full URLs in the `imageURL` field, which can be used directly in `<img>` tags without additional processing or proxy routes. This simplifies the implementation and avoids CORS issues.

```typescript
// Direct usage - no proxy needed
<img src={portfolio.attributes.imageURL} alt={portfolio.attributes.title} />
```

### Project Status Field

The `project_status` field was added beyond the original requirements to track the development/visibility status of projects independently from the portfolio item's visibility status:

- **Status**: Controls visibility in the admin interface (Public, Private, Draft)
- **Project Status**: Indicates project development state (Public, On Progress, NDA, Local)

This separation allows admins to:
- Mark a portfolio item as Public while the project is still "On Progress"
- Indicate NDA projects that shouldn't be publicly detailed
- Track local/internal projects separately

### Form Data Submission

All create and update operations use `multipart/form-data` encoding to support file uploads. The service layer handles FormData construction:

```typescript
const formData = new FormData();
formData.append("title", portfolioData.title);
formData.append("image", portfolioData.image);
// ... other fields
```

### Optimistic UI Updates

Status changes use optimistic updates - the UI updates immediately while the API call is in progress. If the API call fails, an error is displayed but the UI is not rolled back (user can refresh to see actual state).

### State Management Pattern

The implementation uses React hooks for state management without external state libraries:
- Local component state for UI concerns (drawer open/closed)
- Parent component state for shared data (portfolio list, selected item)
- Props drilling for communication between components
- Callback props for child-to-parent communication

This approach is sufficient for the current scope and avoids additional dependencies.

### Accessibility Considerations

- All interactive elements are keyboard accessible
- Form inputs have associated labels
- Buttons have descriptive titles/aria-labels
- Status badges use semantic color variants
- Error messages are announced to screen readers via Alert component
- Dialogs trap focus and can be dismissed with Escape key

### Performance Considerations

- Pagination limits data fetching to 10 items per page
- Images are loaded lazily by the browser
- No image optimization in frontend (handled by backend/GCS)
- Status filter triggers new API call (no client-side filtering)
- Form validation happens before API calls to reduce unnecessary requests

### Future Enhancements

Potential improvements not in current scope:
- Bulk operations (delete multiple, status change multiple)
- Image cropping/editing before upload
- Drag-and-drop reordering for portfolio display order
- Category management (add/edit/delete categories)
- Search functionality (by title, description)
- Export portfolio data (CSV, JSON)
- Portfolio preview (public-facing view)
- Image optimization (resize, compress) in frontend
- Undo/redo for delete operations
- Activity log (who changed what when)
