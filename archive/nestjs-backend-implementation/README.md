# RIS OMS Backend API

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
</p>

<p align="center">
  <strong>Enterprise-grade Order Management System Backend API</strong>
</p>

<p align="center">
  Built for Central Group's retail operations with real-time processing, SLA monitoring, and advanced analytics.
</p>

## Overview

RIS OMS (Retail Intelligence System - Order Management System) is a comprehensive NestJS backend application designed for Central Group's order management operations. Built with TypeScript and modern enterprise patterns, it provides real-time order processing, SLA monitoring, and dashboard analytics.

### 🚀 Key Features

- **Real-time Order Processing**: Live order status updates and SLA monitoring
- **WebSocket Gateway**: Real-time notifications and dashboard updates  
- **External API Integration**: Central Group PMP API connectivity with authentication
- **MS Teams Notifications**: Automated alert system for SLA breaches and escalations
- **Advanced Analytics**: Dashboard KPIs and performance metrics
- **Cron Job Automation**: Background tasks for SLA monitoring and data updates
- **Enterprise Scalability**: Built with NestJS for production-grade performance
- **Type-Safe DTOs**: Comprehensive data validation with class-validator
- **Swagger Documentation**: Auto-generated API documentation

### 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   NestJS API     │    │  External APIs  │
│   (React)       │◄──►│   (Backend)      │◄──►│  Central Group  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   PostgreSQL     │
                       │   Database       │
                       └──────────────────┘
```

### 📋 Core Modules

- **Orders Module**: Order processing, filtering, and status management
- **Dashboard Module**: Analytics, KPIs, and performance metrics
- **Notifications Module**: MS Teams integration and escalation management
- **Realtime Module**: WebSocket gateway for live updates
- **Models**: Database entities (Orders, OrderItems, Escalations)

## 🛠️ Tech Stack

- **Framework**: NestJS 11+ with TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Real-time**: Socket.io WebSocket gateway
- **External APIs**: Axios with retry logic and authentication
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **Scheduling**: @nestjs/schedule for cron jobs
- **Monitoring**: Built-in health checks and metrics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- PostgreSQL 13+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nestjs-boilerplate

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Set up database
pnpm run db:create
pnpm run db:migrate
pnpm run db:seed  # Optional: Load sample data
```

### Development

```bash
# Development server with hot reload
pnpm run start:dev

# Debug mode
pnpm run start:debug

# Production build and start
pnpm run build
pnpm run start:prod
```

### Environment Configuration

Key environment variables (see `.env.example` for complete list):

```bash
# Application
NODE_ENV=development
APP_PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_HOST=localhost
DATABASE_NAME=ris_oms
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password

# External API
API_BASE_URL=https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1
PARTNER_CLIENT_ID=your_client_id
PARTNER_CLIENT_SECRET=your_client_secret

# MS Teams
MS_TEAMS_WEBHOOK_URL=your_teams_webhook_url
```

### 🧪 Testing

```bash
# Run unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run e2e tests
pnpm run test:e2e

# Generate test coverage report
pnpm run test:cov
```

### 🗄️ Database Management

```bash
# Create database
pnpm run db:create

# Run migrations
pnpm run db:migrate

# Seed database with sample data
pnpm run db:seed

# Reset database (development only)
pnpm run db:reset

# Create new migration
pnpm run migration:create -- --name create-new-table
```

### 🐳 Docker Deployment

```bash
# Build Docker image
pnpm run docker:build

# Run with Docker Compose
pnpm run docker:compose:up

# Stop Docker services
pnpm run docker:compose:down
```

## 📚 API Documentation

Once the application is running, visit:

- **Swagger UI**: `http://localhost:3001/docs`
- **Health Check**: `http://localhost:3001/health`
- **WebSocket**: `ws://localhost:3001` (for real-time updates)

### Key API Endpoints

#### Orders
```bash
GET    /api/v1/orders           # List orders with filtering
GET    /api/v1/orders/counts    # Real-time order counts
GET    /api/v1/orders/:id       # Get order details
PUT    /api/v1/orders/:id/status # Update order status
```

#### Dashboard
```bash
GET    /api/v1/dashboard/summary # Dashboard summary
GET    /api/v1/dashboard/kpis    # Detailed KPIs
```

#### Notifications
```bash
POST   /api/v1/notifications/escalate      # Create escalation
GET    /api/v1/notifications/escalations   # List escalations
```

### WebSocket Events

- `ORDER_UPDATE`: Real-time order status changes
- `SLA_BREACH`: SLA breach notifications
- `DASHBOARD_REFRESH`: Dashboard data updates
- `SYSTEM_ALERT`: System-wide alerts

## 🚀 Production Deployment

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive instructions including:

- Environment configuration
- Database setup and migrations
- Docker containerization
- Kubernetes deployment
- Monitoring and health checks
- Security considerations

## 🏗️ Project Structure

```
src/
├── models/                 # Database models (Sequelize)
│   ├── order.model.ts
│   ├── order-item.model.ts
│   └── escalation.model.ts
├── modules/
│   ├── orders/            # Order management
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   └── orders.module.ts
│   ├── dashboard/         # Analytics and KPIs
│   ├── notifications/     # MS Teams integration
│   └── realtime/         # WebSocket gateway
├── core/                  # Core modules (DB, Config, etc.)
├── common/               # Shared utilities
└── utils/                # Helpers and utilities
```

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. Key categories:

- **Application**: Basic app settings (port, name, etc.)
- **Database**: PostgreSQL connection details
- **External APIs**: Central Group API credentials
- **Integrations**: MS Teams webhook, cache settings
- **Security**: CORS, rate limiting, authentication

### Feature Flags

```bash
GRAPHQL_ENABLED=false      # Enable/disable GraphQL
TEAMS_NOTIFICATION_ENABLED=true # MS Teams notifications
DEBUG_SQL=false           # Database query logging
MOCK_EXTERNAL_API=false   # Use mock data for testing
```

## 📊 Monitoring

### Health Checks

```bash
# Basic health check
curl http://localhost:3001/health

# Detailed health with dependencies
curl http://localhost:3001/health/detailed
```

### Metrics

- Application metrics available at `/metrics`
- Custom business metrics in Dashboard module
- WebSocket connection monitoring
- Database performance tracking

## 🔐 Security

- **Input Validation**: All inputs validated with class-validator
- **CORS Protection**: Configurable CORS origins
- **Rate Limiting**: Request rate limiting per client
- **Helmet**: Security headers with Helmet.js
- **Environment Isolation**: Separate configs for different environments

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Update documentation for API changes
4. Use conventional commit messages
5. Ensure all checks pass before submitting PR

## 📝 Development Guidelines

- **Code Style**: ESLint + Prettier configuration
- **Commits**: Conventional commit format
- **Testing**: Unit tests for services, E2E for controllers
- **Documentation**: Update Swagger annotations for API changes
- **Database**: Use migrations for schema changes

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**:
```bash
# Check database is running and credentials are correct
pnpm run db:test-connection
```

**External API Authentication**:
```bash
# Verify API credentials and connectivity
curl -X POST http://localhost:3001/api/v1/orders/test-connection
```

**WebSocket Connection Issues**:
```bash
# Test WebSocket connectivity
wscat -c ws://localhost:3001
```

## 📞 Support

For technical support:
1. Check application logs for error details
2. Verify environment configuration
3. Review API documentation at `/docs`
4. Test individual components using health checks

## 📄 License

This project is proprietary software. All rights reserved.
