# ALO Sales Dashboard v1.0.1 — Technical & User Documentation

## Overview
ALO Sales Dashboard is a modern, responsive web application for managing sales leads, visits, team performance, and conversions. It is designed for both sales representatives and managers, with robust features for data entry, reporting, and workflow automation. The app is built with React (TypeScript), Vite, Tailwind CSS, and Supabase for backend/database integration.

---

## User Flow

### 1. Authentication
- Users log in via the Auth page, which integrates with Supabase Auth.
- Authenticated state is managed globally via a custom `useAuth` hook.

### 2. Navigation
- Responsive navigation bar adapts to mobile, tablet, and desktop.
- Hamburger menu, notification center, and profile/settings/logout are contextually placed.

### 3. Dashboard
- **Manager Dashboard**: Team-wide stats, performance, and access to all team data.
- **Rep Dashboard**: User-specific stats and data.
- All dashboards and tables are mobile/tablet/desktop responsive.

### 4. Visits & Leads
- Users can log visits and add leads via forms.
- Visits and leads are displayed in detailed, filterable tables.
- From a visit’s detail page, users can click "Convert to Lead" to open the Add Lead form pre-filled with visit data (including date).
- The Add Lead form allows editing or accepting pre-filled info before submission.

### 5. Notification Center
- Accessible from the nav bar.
- Responsive dropdown: centered on mobile, right-aligned on desktop.
- Displays real-time notifications (e.g., new leads, team activity).

### 6. Team/User Management
- Managers can view and manage users and teams in card-based, responsive layouts.
- Team dashboards and tables show team-wide data when accessed from the team context.

---

## Technical Details

### Tech Stack
- **Frontend**: React (TypeScript), Vite, Tailwind CSS
- **Backend/DB**: Supabase (Postgres, Auth)
- **State Management**: React hooks, context
- **Utilities**: Custom currency conversion utility with live rates, fallback, and caching

### Key Components & Files
- `src/components/forms/AddLeadForm.tsx`: Lead creation form, supports `initialValues` for pre-filling, includes all relevant fields (company, contact, address, source, status, currency, estimated revenue, date, notes).
- `src/components/details/VisitsDetailPage.tsx`: Visit details, "Convert to Lead" button, dialog logic for pre-filling AddLeadForm.
- `src/components/tables/DetailedVisitsTable.tsx`, `DetailedLeadsTable.tsx`, `DetailedConversionsTable.tsx`: Responsive, filterable tables, support for team/user scope.
- `src/components/Navigation.tsx`: Responsive navigation bar.
- `src/components/notifications/NotificationCenter.tsx`: Responsive notification dropdown.
- `src/pages/ManageUsers.tsx`, `src/components/dashboard/ManageTeamDashboard.tsx`: User/team management, responsive card layouts.
- `src/lib/currency.ts`: Currency conversion logic, live rates, fallback, caching.
- `src/integrations/supabase/types.ts`: Type definitions for Supabase data models.

### Data Flow & Pre-filling Logic
- When converting a visit to a lead, the visit’s data (including date) is passed as `initialValues` to `AddLeadForm`.
- `AddLeadForm` uses these values to pre-fill all fields, but allows the user to edit before submission.
- On submit, the form validates and inserts/updates the lead in Supabase.

### Responsiveness & UX
- All forms, tables, and dashboards use Tailwind CSS for mobile/tablet/desktop responsiveness.
- Modern, card-based layouts for clarity and usability.
- Notification center and navigation adapt to screen size and context.

### Currency Utility
- `src/lib/currency.ts` fetches live exchange rates, caches them, and provides conversion functions.
- Fallback to static rates if live fetch fails.
- Used in forms and tables to display/convert revenue estimates.

### Error Handling & Type Safety
- All forms and components use TypeScript interfaces for props and data.
- AddLeadForm’s type definitions match all fields used in the form and `initialValues`.
- Toast notifications provide user feedback on success/error.

---

## Extending & Customizing
- To add new fields to leads/visits, update the Supabase schema, type definitions, and relevant forms.
- To add new currencies, update the `currencies` array in `AddLeadForm.tsx` and currency utility.
- For new notification types, extend the NotificationCenter logic and backend triggers.

---

## Developer Notes
- All major features are modular and reusable.
- Responsive design is enforced throughout.
- Pre-filling and conversion flows are robust and type-safe.
- For further customization, follow the established patterns in forms, tables, and hooks.

---

## Contact & Support
For questions or contributions, contact the project maintainer or refer to the README for setup instructions.
