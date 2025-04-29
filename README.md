# TicketMaster - Event Booking Platform

TicketMaster is a full-stack web application for browsing, searching, and purchasing tickets for various events. The platform allows users to browse events, save favorites to a wishlist, view events on a calendar, and purchase tickets. It also includes role-based access control allowing organizers to create and manage their own events.

## Features

- **User Authentication**: Secure signup, login, and role-based access control
- **Event Discovery**: Browse and search events by category, date, or keywords
- **Wishlist Management**: Save favorite events to a personal wishlist
- **Calendar View**: Browse upcoming events on an interactive calendar
- **Event Creation**: Organizers can create and manage their own events
- **Ticket Purchase**: Seamless checkout process for buying event tickets
- **Responsive Design**: Modern UI that works across desktop and mobile devices

## Tech Stack

### Frontend
- React with TypeScript
- TanStack Query for data fetching and state management
- Wouter for routing
- Tailwind CSS for styling
- Shadcn UI components
- Lucide React for icons

### Backend
- Node.js with Express
- PostgreSQL database with Drizzle ORM
- Passport.js for authentication
- Zod for validation

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

The application supports three user roles:

1. **User**: Can browse events, save to wishlist, and purchase tickets
2. **Organizer**: Can create and manage events, plus all User privileges
3. **Admin**: Full access to all features and management tools

## Available Scripts

- `npm run dev`: Starts the development server
- `npm run build`: Builds the application for production
- `npm run db:push`: Pushes the database schema to the connected database
- `npm run start`: Starts the production server

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session management
- `STRIPE_SECRET_KEY` (optional): For Stripe payment integration
- `VITE_STRIPE_PUBLIC_KEY` (optional): For Stripe payment integration on the client side

## Authentication

The application uses session-based authentication with Passport.js. Passwords are securely hashed using scrypt before being stored in the database.

## Database Schema

- **Users**: Stores user information and credentials
- **Events**: Stores event information
- **Purchases**: Records ticket purchases

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