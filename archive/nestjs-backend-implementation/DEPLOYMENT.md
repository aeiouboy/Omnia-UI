# RIS OMS NestJS Backend Deployment Guide

## Overview

This document provides comprehensive deployment instructions for the RIS OMS NestJS backend application that replaces the Next.js frontend with a scalable, enterprise-grade architecture.

## Architecture Overview

The RIS OMS backend is built with:
- **NestJS Framework**: TypeScript-first Node.js framework
- **PostgreSQL**: Primary database with Sequelize ORM
- **WebSocket Gateway**: Real-time updates and notifications
- **Cron Jobs**: Automated SLA monitoring and data updates
- **MS Teams Integration**: Alert notifications via webhooks
- **External API Integration**: Central Group PMP APIs

## Prerequisites

### System Requirements
- Node.js 18+ (LTS recommended)
- PostgreSQL 13+ 
- Redis 6+ (optional, for caching)
- Docker & Docker Compose (for containerized deployment)

### Environment Setup

1. **Install Dependencies**:
   ```bash
   cd nestjs-boilerplate
   npm install
   # or
   pnpm install
   ```

2. **Environment Configuration**:
   ```bash
   # Copy and configure environment variables
   cp .env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

3. **Database Setup**:
   ```bash
   # Create PostgreSQL database
   createdb ris_oms
   
   # Run database migrations
   npm run db:migrate
   
   # (Optional) Seed sample data
   npm run db:seed
   ```

## Configuration

### Core Environment Variables

**Application Configuration**:
```bash
APP_NAME=RIS-OMS
APP_PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

**Database Configuration**:
```bash
DATABASE_HOST=your-postgres-host
DATABASE_PORT=5432
DATABASE_USERNAME=ris_oms_user
DATABASE_PASSWORD=your-secure-password
DATABASE_NAME=ris_oms
DATABASE_SCHEMA=public
```

**External API Configuration**:
```bash
API_BASE_URL=https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1
PARTNER_CLIENT_ID=your-partner-client-id
PARTNER_CLIENT_SECRET=your-partner-secret
API_TIMEOUT=30000
```

**MS Teams Integration**:
```bash
MS_TEAMS_WEBHOOK_URL=your-teams-webhook-url
TEAMS_NOTIFICATION_ENABLED=true
TEAMS_RETRY_ATTEMPTS=3
```

**WebSocket Configuration**:
```bash
WS_CORS_ORIGIN=https://your-frontend-domain.com
WS_TRANSPORTS=websocket,polling
```

### Security Configuration

**CORS Origins**:
```bash
CORS_ORIGINS=https://your-frontend-domain.com,https://your-admin-panel.com
```

**Rate Limiting**:
```bash
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

**Helmet Security**:
```bash
HELMET_ENABLED=true
```

## Database Schema

### Core Models

1. **Orders**: Main order entities with SLA tracking
2. **Order Items**: Individual line items within orders  
3. **Escalations**: Alert/notification history

### Migration Commands

```bash
# Run all pending migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:undo

# Reset database (development only)
npm run db:reset
```

## Deployment Methods

### Method 1: Direct Node.js Deployment

1. **Build Application**:
   ```bash
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   npm run start:prod
   ```

3. **Process Management with PM2**:
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name ris-oms-backend
   pm2 startup
   pm2 save
   ```

### Method 2: Docker Deployment

1. **Build Docker Image**:
   ```bash
   docker build -t ris-oms-backend .
   ```

2. **Run with Docker Compose**:
   ```bash
   # Create docker-compose.yml (see below)
   docker-compose up -d
   ```

### Method 3: Kubernetes Deployment

1. **Apply Kubernetes Manifests**:
   ```bash
   kubectl apply -f deployment-dev.yaml
   kubectl apply -f service.yaml
   kubectl apply -f ingress.yaml
   ```

## Docker Configuration

### docker-compose.yml

```yaml
version: '3.8'

services:
  ris-oms-backend:
    build: .
    ports:
      - \"3001:3001\"
    environment:
      - NODE_ENV=production
      - DATABASE_HOST=postgres
      - DATABASE_NAME=ris_oms
      - DATABASE_USERNAME=ris_oms_user
      - DATABASE_PASSWORD=secure_password
    depends_on:
      - postgres
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=ris_oms
      - POSTGRES_USER=ris_oms_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - \"5432:5432\"
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    ports:
      - \"6379:6379\"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## API Documentation

### Swagger/OpenAPI

The application includes automatic API documentation:

**Access URLs**:
- Development: `http://localhost:3001/docs`
- Production: `https://your-api-domain.com/docs`

**Configuration**:
```bash
ENABLE_API_DOCS=true  # Disable in production for security
API_DOCUMENT_PATH=/docs
API_DOCUMENT_TITLE=RIS OMS API
```

### Key Endpoints

**Orders Management**:
- `GET /api/v1/orders` - List orders with filtering
- `GET /api/v1/orders/counts` - Real-time order counts
- `GET /api/v1/orders/:id` - Get order details
- `PUT /api/v1/orders/:id/status` - Update order status

**Dashboard Analytics**:
- `GET /api/v1/dashboard/summary` - Dashboard KPIs
- `GET /api/v1/dashboard/kpis` - Detailed KPI metrics

**Notifications**:
- `POST /api/v1/notifications/escalate` - Create escalation
- `GET /api/v1/notifications/escalations` - List escalations

**Real-time WebSocket**:
- Connection: `ws://localhost:3001` or `wss://your-domain.com`
- Events: `ORDER_UPDATE`, `SLA_BREACH`, `DASHBOARD_REFRESH`

## Monitoring & Health Checks

### Health Check Endpoints

```bash
# Application health
GET /health

# Detailed health with dependencies
GET /health/detailed

# Database connectivity
GET /health/database

# External API connectivity  
GET /health/external-apis
```

### Application Metrics

**Prometheus Integration**:
```bash
# Metrics endpoint
GET /metrics

# Custom business metrics
GET /api/v1/dashboard/metrics
```

**Key Metrics**:
- Order processing rates
- SLA breach percentages
- API response times
- WebSocket connection counts
- Database connection pool status

### Logging

**Log Levels**:
```bash
LOG_LEVEL=info  # error, warn, info, debug
LOG_TRANSPORT=console,logstash
```

**Log Formats**:
- **Development**: Pretty-printed console logs
- **Production**: Structured JSON logs

**Log Locations**:
- Container logs: `docker logs ris-oms-backend`
- File logs: `/app/logs/` (if volume mounted)
- Centralized logging: Logstash/ElasticSearch

## Performance Optimization

### Database Optimization

**Connection Pooling**:
```bash
DATABASE_MAX_POOL=10  # Adjust based on load
```

**Query Optimization**:
- Indexes on frequently queried columns
- Pagination for large result sets
- Query result caching with Redis

### Caching Strategy

**Redis Configuration**:
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL_SECONDS=300  # 5 minutes
REDIS_KEY_PREFIX=ris_oms:
```

**Cached Data**:
- Dashboard summary data
- Order count statistics  
- External API authentication tokens
- Frequently accessed order details

### WebSocket Optimization

**Connection Management**:
- Automatic client reconnection
- Subscription-based message filtering
- Connection pooling and load balancing

**Message Optimization**:
- Efficient message serialization
- Batch updates for bulk operations
- Selective data broadcasting

## Security Considerations

### Authentication & Authorization

**API Key Management**:
- External API credentials in environment variables
- Secure secret storage (Azure Key Vault, AWS Secrets Manager)
- Regular credential rotation

**Request Validation**:
- Input sanitization and validation
- Rate limiting per IP/client
- Request size limits

### Data Protection

**Sensitive Data Masking**:
```bash
MASKING_CONFIDENTIAL=password,authorization,cvv
MASKING_EMAIL=email,email_address
MASKING_PHONE_NUMBER=phone_number,mobile
```

**Database Security**:
- Encrypted connections (SSL/TLS)
- Read-only database users for reporting
- Regular security updates

## Troubleshooting

### Common Issues

**Database Connection Issues**:
```bash
# Check database connectivity
npm run db:check-connection

# Verify migrations
npm run db:status

# Test database queries
npm run db:test-queries
```

**External API Issues**:
```bash
# Test API connectivity
curl -X POST http://localhost:3001/api/v1/orders/test-connection

# Check API credentials
npm run test:external-api

# Verify token refresh
npm run test:auth-refresh
```

**WebSocket Connection Issues**:
```bash
# Test WebSocket connectivity
wscat -c ws://localhost:3001

# Check subscription handling
wscat -c ws://localhost:3001 -x '{\"type\":\"subscribe\",\"data\":{\"types\":[\"all\"]}}'
```

### Performance Issues

**High Memory Usage**:
- Check connection pool sizes
- Monitor cache usage
- Review query efficiency

**Slow API Responses**:
- Enable query logging: `DEBUG_SQL=true`
- Check external API response times
- Monitor database query performance

**WebSocket Disconnections**:
- Verify network stability
- Check client-side reconnection logic
- Monitor server resource usage

## Maintenance

### Regular Tasks

**Daily**:
- Monitor application health checks
- Review error logs and alerts
- Check SLA breach notifications

**Weekly**:
- Database performance analysis
- Security log review
- Dependency vulnerability scan

**Monthly**:
- Database maintenance and optimization
- Performance baseline review
- Backup and recovery testing

### Updates and Patches

**Application Updates**:
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Build and restart
npm run build
pm2 restart ris-oms-backend
```

**Security Updates**:
```bash
# Check for security vulnerabilities
npm audit

# Update dependencies
npm update

# Apply security patches
npm audit fix
```

## Backup and Recovery

### Database Backup

**Automated Backups**:
```bash
# Daily automated backup (add to cron)
0 2 * * * pg_dump ris_oms > /backup/ris_oms_$(date +%Y%m%d).sql
```

**Manual Backup**:
```bash
# Create database backup
pg_dump -h localhost -U ris_oms_user ris_oms > backup.sql

# Restore from backup
psql -h localhost -U ris_oms_user ris_oms < backup.sql
```

### Application Recovery

**Disaster Recovery Steps**:
1. Restore database from latest backup
2. Deploy application from source control
3. Update environment configuration
4. Run database migrations if needed
5. Verify external API connectivity
6. Test WebSocket functionality
7. Monitor system health and performance

## Support and Documentation

### Additional Resources

- **API Documentation**: Available at `/docs` endpoint
- **Database Schema**: See `sequelize/migrations/` directory
- **Configuration Reference**: See `.env.example` file
- **Health Monitoring**: Use `/health` endpoints

### Getting Help

For deployment issues or questions:
1. Check application logs for error details
2. Verify environment configuration
3. Test individual components (database, APIs, WebSocket)
4. Review this documentation for troubleshooting steps

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Environment**: Production Ready