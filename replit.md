# Cloud Infrastructure Deployment Platform

## Overview

This is a full-stack web application that provides a guided workflow for deploying cloud infrastructure. Users can input project details, configure infrastructure settings, generate deployment templates, and deploy their applications to cloud providers. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and a comprehensive UI component library.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with custom styling via Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Storage**: Local file system with Multer for uploads
- **Development**: tsx for TypeScript execution in development

### Data Storage Solutions
- **Database**: PostgreSQL via Neon Database serverless connection
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database migrations
- **File Uploads**: Local filesystem storage in `uploads/` directory

## Key Components

### Database Schema
- **Projects Table**: Stores project metadata including name, description, tech stack, expected users, uploaded files (JSON array), configuration (JSON object), selected provider, and deployment status
- **Schema Validation**: Zod schemas for runtime validation of project data and configuration

### API Endpoints
- `POST /api/projects` - Create new project
- `POST /api/projects/:id/upload` - Upload project files
- `PUT /api/projects/:id/configuration` - Update project configuration
- `POST /api/projects/:id/templates` - Generate deployment templates
- `POST /api/projects/:id/deploy` - Deploy project

### Frontend Components
- **Step Progress**: Multi-step wizard navigation
- **Project Input**: Form for project details and file uploads
- **Configuration**: Infrastructure configuration form
- **Templates**: Template generation and selection
- **Deployment**: Real-time deployment monitoring

### File Upload System
- **Storage**: Local filesystem in `uploads/` directory
- **Validation**: File type restrictions (PNG, JPG, PDF)
- **Size Limits**: 10MB per file, maximum 5 files per project
- **Processing**: Multer middleware for handling multipart/form-data

## Data Flow

1. **Project Creation**: User submits project details → Server validates and stores in database → Returns project ID
2. **File Upload**: User uploads files → Server stores files locally → Updates project record with file paths
3. **Configuration**: User configures infrastructure settings → Server validates configuration → Updates project record
4. **Template Generation**: Server generates deployment templates based on configuration → Returns template options
5. **Deployment**: User selects template and initiates deployment → Server orchestrates deployment process → Real-time status updates

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- TanStack Query for data fetching
- Radix UI component primitives
- Wouter for routing
- Tailwind CSS for styling
- Zod for schema validation

### Backend Dependencies
- Express.js web framework
- Drizzle ORM with PostgreSQL adapter
- Neon Database serverless client
- Multer for file uploads
- Various utility libraries (date-fns, clsx, etc.)

### Development Dependencies
- Vite for build tooling
- TypeScript for type safety
- ESBuild for server bundling
- Drizzle Kit for database operations

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Environment variable `DATABASE_URL` for connection
- **Port**: Application runs on port 5000

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Deployment**: Configured for autoscale deployment target
- **Static Files**: Express serves built frontend from `dist/public`

### Database Configuration
- **Connection**: PostgreSQL via `DATABASE_URL` environment variable
- **Schema**: Located in `shared/schema.ts` for shared types
- **Migrations**: Generated in `migrations/` directory

## Changelog

```
Changelog:
- June 22, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```