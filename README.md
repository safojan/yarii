# Yarii Foundation Client
<img width="1181" height="627" alt="Screenshot 2025-08-27 at 01 48 25" src="https://github.com/user-attachments/assets/908d110b-2c7a-4ee7-8b66-add537463b1b" />

### Self-Hosted ERP for Nonprofit Organizations
Yarii is a fully self-hosted ERP system built for nonprofit and mission-driven organizations that respect data protection, privacy, self-hosting, and fund transparency. It provides governance workflows and modular management dashboards to help nonprofits streamline operations — without relying on third-party proprietary platforms.

## Features

Yarii provides a structured and modular frontend designed to support nonprofit organizations with transparency, accountability, and operational efficiency. Below is a detailed overview of the core features implemented in the system.

### 1. Dashboard & Overview

The dashboard serves as the central control panel for users.

- Aggregated financial summaries (total funds, expenses, balances)
- Overview of active projects and recent activity
- Quick-access panels for frequently used modules
- Real-time visual indicators for organizational performance

This allows decision-makers to quickly assess operational and financial status.

---

### 2. Fund & Transaction Management

Yarii enables structured and transparent financial tracking.

- Recording and tracking of donations
- Expense entry and categorization
- Transaction history with filtering and search capabilities
- Structured data representation for financial auditing

The system ensures traceability of funds from receipt to allocation.

---

### 3. Project & Budget Management

Projects are treated as first-class entities within the system.

- Creation and management of initiatives
- Budget allocation per project
- Linking transactions to specific projects
- Monitoring spending against allocated budgets

This ensures accountability and financial clarity across initiatives.

---

### 4. User & Role Management (RBAC)

Yarii implements role-based access control to protect sensitive data and maintain governance standards.

- User creation and profile management
- Role assignment and permission control
- Access restrictions based on role hierarchy
- Module-level authorization enforcement

Typical roles include:

- Administrator (full system access)
- Manager (operational control)
- Accountant (financial oversight)
- Standard User (restricted access)

Permissions are enforced at the interface level to ensure that users only see and interact with authorized modules.

---

### 5. Reporting & Data Export

The system provides structured reporting capabilities to support transparency and compliance.

- Financial summaries by date range
- Project-level financial breakdowns
- Activity reports
- Exportable datasets (e.g., CSV or PDF, depending on backend integration)

Reports are designed to assist audits, internal reviews, and stakeholder communication.

---

### 6. Modular Angular Architecture

The frontend is built using Angular with a modular architecture to ensure scalability and maintainability.

- Feature-based module separation
- Reusable shared components
- Structured routing with guarded access
- Environment-based configuration management

This design allows future expansion without major refactoring.

---

### 7. Security & Self-Hosted Compatibility

Yarii is designed for organizations that prioritize data ownership and privacy.

- Compatible with self-hosted deployments
- Secure authentication flow
- Controlled API communication
- Frontend enforcement of permission boundaries

The architecture supports secure nonprofit operations without reliance on external SaaS platforms.

## Technical Details

This section outlines the core technologies, architectural decisions, and development structure of the Yarii frontend application.

### Frontend Stack

- **Framework:** Angular  
- **Language:** TypeScript  
- **Styling:** Tailwind CSS  
- **Architecture Pattern:** Modular, feature-based structure  
- **Routing:** Angular Router with guarded routes  
- **State Handling:** Component-driven state management (extendable to NgRx if required)  
- **Environment Configuration:** Angular environment files for dev/prod separation  

### Project Structure

The project follows a scalable and maintainable folder structure:
src/
├── app/
│ ├── core/ # Core services, guards, interceptors
│ ├── shared/ # Reusable components and utilities
│ ├── features/ # Feature-based modules (dashboard, users, projects, etc.)
│ ├── auth/ # Authentication module
│ └── layout/ # Navigation and layout components
├── assets/
├── environments/
└── styles/


### Authentication & Authorization

- Route guards to protect restricted pages  
- Role-based access enforcement at UI level  
- Token-based authentication (backend integrated)  
- Dynamic navigation rendering based on user role  

### API Communication

- Structured HTTP services  
- Centralized API configuration  
- Error handling via interceptors  
- Environment-based API base URL switching  

### Deployment Compatibility

- Optimized production builds using Angular CLI  
- Compatible with Docker-based deployment (if backend containerized)  
- Can be hosted on any static hosting server (Nginx, Apache, etc.)  

---

## Contributing

We welcome contributions to improve Yarii. Whether you are fixing a bug, improving UI/UX, or adding new features, contributions are appreciated.
