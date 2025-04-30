# TicketMaster - Event Booking Platform

TicketMaster is a full-stack web application for browsing, searching, and purchasing tickets for various events. The platform allows users to browse events, save favorites to a wishlist, view events on a calendar, and purchase tickets. It also includes role-based access control allowing organizers to create and manage their own events.

## Features

### Core Features
- **User Authentication**: Secure signup, login, and role-based access control
- **Event Discovery**: Browse and search events by category, date, or keywords
- **Wishlist Management**: Save favorite events to a personal wishlist
- **Calendar View**: Browse upcoming events on an interactive calendar
- **Event Creation**: Organizers can create and manage their own events
- **Ticket Purchase**: Seamless checkout process for buying event tickets
- **Responsive Design**: Modern UI that works across desktop and mobile devices

### Advanced Features
- **User Management Dashboard**: Admin interface for managing user accounts
- **Profile Management**: Users can update their profiles and preferences
- **Social Features**: Follow event organizers and receive updates
- **Reviews & Ratings**: Leave reviews and ratings for attended events
- **Notifications**: Real-time notifications for purchases, follows, and more
- **Promo Codes**: Support for discount codes and promotional offers
- **QR Code Tickets**: Digital tickets with QR codes for event check-in

## Tech Stack

### Frontend
- React with TypeScript
- TanStack Query for data fetching and state management
- Wouter for lightweight client-side routing
- Tailwind CSS for responsive styling
- Shadcn UI components for consistent design
- Lucide React for beautiful icons
- React Hook Form for form validation and submission
- Zod for schema validation
- Date-fns for date manipulation and formatting

### Backend
- Node.js with Express
- PostgreSQL database with Drizzle ORM
- Passport.js for authentication and session management
- Zod for request validation
- Stripe API integration for payment processing
- SendGrid for email notifications
- WebSockets for real-time notifications
- QR code generation for digital tickets
- Crypto for secure password hashing

### DevOps & Tooling
- Vite for fast development and optimized builds
- TypeScript for type safety across the stack
- ESLint for code quality
- PostgreSQL on Neon Database for cloud hosting
- Session persistence with connect-pg-simple
- Shared schema definitions between frontend and backend

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18+ recommended)
- PostgreSQL (v13+ recommended)
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ticketmaster.git
cd ticketmaster
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

This project uses PostgreSQL. Make sure you have PostgreSQL installed and running.

Create a `.env` file in the root directory of the project and add the following:

```
DATABASE_URL=postgresql://username:password@localhost:5432/ticketmaster
SESSION_SECRET=your_session_secret_here
```

Replace `username`, `password` with your PostgreSQL credentials, and `your_session_secret_here` with a secure random string.

Then, initialize your database schema:

```bash
npm run db:push
```

### 4. Start the Development Server

```bash
npm run dev
```

This will start both the backend server and the frontend development server. The application will be available at `http://localhost:5000`.

## Project Structure

```
├── client/                 # Frontend code
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Application pages
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Entry point
│   └── index.html          # HTML template
├── server/                 # Backend code
│   ├── auth.ts             # Authentication logic
│   ├── db.ts               # Database connection
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data access layer
│   └── vite.ts             # Vite server configuration
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Database schema and types
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## User Roles

The application implements a robust role-based access control system with three distinct user roles:

### Regular User
- Browse and search all events
- View event details and available tickets
- Purchase tickets for events
- Save events to personal wishlist
- Follow event organizers
- Leave reviews and ratings for attended events
- Manage personal profile and preferences
- Receive notifications for followed organizers and purchases

### Organizer
- All regular user privileges
- Create and publish new events
- Edit and manage created events
- View attendee lists for their events
- Create and manage promotional codes
- Access sales analytics for their events
- Communicate with attendees via notifications
- View event check-ins via ticket scanning

### Administrator
- Complete system access and control
- User account management (create, edit, suspend, delete)
- Manage all events regardless of creator
- Access comprehensive analytics dashboard
- Override and modify any system settings
- Manage global promotional campaigns
- Review and moderate user-generated content
- Troubleshoot and address system issues

## Available Scripts

- `npm run dev`: Starts the development server
- `npm run build`: Builds the application for production
- `npm run db:push`: Pushes the database schema to the connected database
- `npm run start`: Starts the production server

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session management

### Optional External Services
- `STRIPE_SECRET_KEY`: Stripe API secret key for payment processing
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key for client-side integration
- `STRIPE_PRICE_ID`: For subscription payment plans
- `SENDGRID_API_KEY`: For email notifications and communications
- `SITE_URL`: Base URL for the application (used in emails and redirects)

## Authentication & Security

### Authentication System
- Session-based authentication using Passport.js
- Secure password hashing with Node.js Crypto scrypt algorithm
- PostgreSQL-based session storage for persistence across server restarts
- Remember-me functionality for extended login sessions
- Rate limiting on authentication attempts to prevent brute force attacks

### Security Features
- Role-based access control (RBAC) for all API endpoints
- CSRF protection for all form submissions
- Sanitized user inputs to prevent XSS attacks
- Securely hashed and salted passwords
- Secure HTTP-only cookies for session management
- Protected routes requiring authentication
- Password strength requirements and validation

## Database Schema

### Core Tables
- **Users**: Stores user information, credentials, and preferences
- **Events**: Stores event information, location, pricing, and capacity
- **Purchases**: Records ticket purchases, payment status, and ticket codes

### Relationship Tables
- **Reviews**: User reviews and ratings for events
- **Followers**: User-to-organizer following relationships
- **Wishlists**: User-saved events
- **Notifications**: System and user-generated notifications
- **Promocodes**: Discount and promotional codes for events

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide React](https://lucide.dev/)
- Database ORM by [Drizzle](https://orm.drizzle.team/)