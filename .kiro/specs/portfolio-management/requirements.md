# Portfolio Management - Requirements

## Overview
Admin interface for managing website portfolio items with image uploads. Portfolio items showcase projects/work and can be set to Public, Private, or Draft status.

## User Stories

### US-1: View Portfolio Items
**As an** admin user  
**I want to** view all portfolio items in a table  
**So that** I can see and manage all projects

**Acceptance Criteria:**
- Display portfolio items in a data table with columns: Image, Title, Category, Status, Link, Created Date
- Show image thumbnails in the table
- Support pagination (10 items per page)
- Filter by status (All, Public, Private, Draft)
- Filter by category
- Show total count of portfolio items
- Click on row to view details

### US-2: Create Portfolio Item
**As an** admin user  
**I want to** create a new portfolio item with an image  
**So that** I can showcase new projects

**Acceptance Criteria:**
- Open a side drawer form to create portfolio
- Required fields: Title, Category, Description, Image
- Optional fields: Status (default: Public), Link
- Image upload with preview
- Support image formats: JPG, PNG, GIF, WebP, SVG
- Maximum image size: 10MB
- Show upload progress
- Validate all required fields
- Show success/error messages
- Close drawer and refresh list on success

### US-3: Edit Portfolio Item
**As an** admin user  
**I want to** edit an existing portfolio item  
**So that** I can update project information

**Acceptance Criteria:**
- Open side drawer with pre-filled form data
- Show current image with option to replace
- All fields editable
- Replacing image deletes old image
- Validate all required fields
- Show success/error messages
- Update table without full page reload

### US-4: Delete Portfolio Item
**As an** admin user  
**I want to** delete a portfolio item  
**So that** I can remove outdated projects

**Acceptance Criteria:**
- Show confirmation dialog before deletion
- Display portfolio title in confirmation
- Delete both database record and image from GCS
- Show success/error messages
- Remove from table without page reload

### US-5: Change Portfolio Status
**As an** admin user  
**I want to** quickly change portfolio status  
**So that** I can control visibility

**Acceptance Criteria:**
- Status dropdown in table row (Public, Private, Draft)
- Update status without opening full form
- Immediate visual feedback
- No page reload required

### US-6: View Portfolio Details
**As an** admin user  
**I want to** view full portfolio details  
**So that** I can see all information including full-size image

**Acceptance Criteria:**
- Open side drawer with full details
- Display full-size image
- Show all fields: Title, Category, Description, Status, Link
- Show metadata: Created date, Updated date, ID
- Provide Edit and Delete actions
- Link opens in new tab if provided

## Technical Requirements

### Data Model
```typescript
interface Portfolio {
  id: string;
  title: string;
  category: string;
  description: string;
  status: "Public" | "Private" | "Draft";
  link?: string;
  imageURL: string;
  created_at: string;
  updated_at: string;
}
```

### API Integration
- Use multipart/form-data for create/update with images
- Handle image proxy URLs from `/api/images/preview/:filename`
- Support pagination and filtering
- Handle file upload progress

### UI Components
- Data table with image thumbnails
- Side drawer for create/edit forms
- Image upload with drag-and-drop
- Image preview
- Status badges with colors
- Filter dropdowns
- Confirmation dialogs

### Categories
Common categories to suggest:
- Web Application
- Mobile App
- E-commerce
- Landing Page
- Dashboard
- API/Backend
- Design System
- Other

## Navigation
- Add "Portfolio" to sidebar under main navigation
- Route: `/portfolio`
- Icon: Image/Gallery icon

## Non-Functional Requirements
- Responsive design for all screen sizes
- Image upload with progress indicator
- Optimistic UI updates where possible
- Error handling with user-friendly messages
- Loading states for all async operations
- Accessible forms and controls
