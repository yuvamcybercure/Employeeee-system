# TaskEase - Premium Employee Management System

TaskEase is a state-of-the-art, unified Employee Management System designed for modern workplaces. It features real-time tracking, AI-powered matching, geofenced attendance, and a seamless chat experience.

## 🚀 Key Features

- **Unified Dashboard**: Smart role-based redirection (Superadmin, Admin, Employee).
- **Geofenced Attendance**: Clock in/out with real-time selfie capture, geolocation verification, and distance checking.
- **Leave Management**: Full application and approval workflow with document attachments.
- **Real-time Chat**: Integrated messaging system using Socket.io for seamless team communication.
- **Project & Tasks**: Kanban-style project management with task assignments and status tracking.
- **Idea Hub**: Employees can submit suggestions and vote on ideas to improve workplace culture.
- **Policy Center**: Centralized document management with employee acknowledgment tracking.
- **Audit Logs**: Comprehensive system-wide activity logging for security and compliance.
- **Asset Tracking**: Manage hardware and equipment assigned to employees with ease.
- **Payroll & Timesheets**: Integrated timesheet logging and payroll management (configurable by roles).

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Shadcn/UI, Recharts, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT Authentication.
- **Storage**: Cloudinary (Image and document uploads).

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB account (Local or Atlas)
- Cloudinary credentials for media storage

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yuvamcybercure/Employeeee-system.git
   cd Employeeee-system
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
   Start the development server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../client
   npm install
   ```
   Set up any environment variables if required, then start the application:
   ```bash
   npm run dev
   ```

## 🔒 Roles & Access Control

- **Superadmin**: Full system visibility, RBAC management, security logs, and employee password access.
- **Admin**: Manages assigned teams, approves leaves, tracks attendance, and handles user profiles.
- **Employee**: Accesses personal performance stats, marks attendance, applies for leaves, and participates in team chats.

---
Developed as a premium solution for specialized employee management.
