# 🛒 Clover Inventory Pro - Enterprise Inventory Management System

**A production-ready inventory management system with full Clover POS integration**

## 📋 Table of Contents
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Clover POS Integration Setup](#clover-pos-integration-setup)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Core Features (MVP - Available Now)
- ✅ **Smart Inventory Management** - Full CRUD operations with real-time updates
- ✅ **Multi-Location Support** - Manage inventory across multiple stores
- ✅ **User Management** - Role-based access control (Admin, Manager, Staff)
- ✅ **Barcode/QR Scanning** - Browser-based scanning for quick lookups
- ✅ **Low Stock Alerts** - Automated notifications when stock is low
- ✅ **Analytics Dashboard** - Real-time insights on sales and inventory
- ✅ **Comprehensive Reports** - Export to CSV, PDF, XLSX formats
- ✅ **Audit Trail** - Track all changes with timestamps and user IDs
- ✅ **Clover POS Integration** - Two-way sync with Clover POS systems
- ✅ **Purchase Orders** - Create and manage supplier orders
- ✅ **Stock Adjustments** - Track inventory changes with reasons

### Clover Integration Features
- **Import from Clover** - Sync products and inventory from Clover POS
- **Export to Clover** - Push your products to Clover POS
- **Stock Sync** - Keep inventory levels synchronized
- **OAuth Authentication** - Secure connection to Clover API
- **Sync History** - Track all synchronization activities

---

## 💻 System Requirements

### Backend
- **Node.js**: v16.x or higher
- **npm**: v8.x or higher
- **SQLite3**: Included with better-sqlite3 package

### Frontend
- **Modern Web Browser**: Chrome, Firefox, Safari, Edge (latest versions)
- **Node.js**: v16.x or higher (for development)

### For Production
- **Server**: Linux/Windows/macOS
- **RAM**: Minimum 2GB
- **Storage**: 10GB+ recommended

---

## 🚀 Installation

### Step 1: Clone or Extract the Project
```bash
cd clover-inventory-system
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your settings
nano .env
```

**Important Environment Variables:**
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLOVER_CLIENT_ID=your_clover_client_id
CLOVER_CLIENT_SECRET=your_clover_client_secret
CLOVER_ENV=sandbox  # or 'production'
```

### Step 4: Initialize Database
```bash
npm run init-db
```

**Default Login Credentials:**
- Email: `admin@cloverpro.com`
- Password: `admin123`

⚠️ **CHANGE THE DEFAULT PASSWORD IMMEDIATELY!**

### Step 5: Start Backend Server
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

The backend will run on: `http://localhost:3001`

### Step 6: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 7: Start Frontend Application
```bash
npm start
```

The frontend will run on: `http://localhost:3000`

---

## 🔐 Clover POS Integration Setup

### Option 1: OAuth Flow (Recommended for Production)

#### Step 1: Create a Clover Developer Account
1. Go to https://www.clover.com/developers
2. Sign up or log in
3. Navigate to **Developer Dashboard**

#### Step 2: Create a New App
1. Click **Create New App**
2. Fill in app details:
   - **App Name**: Clover Inventory Pro
   - **Website URL**: Your application URL
   - **App Type**: Web App
3. Configure **Permissions**:
   - ☑️ Read Inventory
   - ☑️ Write Inventory
   - ☑️ Read Merchant
   - ☑️ Read Orders

#### Step 3: Get Your Credentials
1. After creating the app, copy:
   - **App ID** (Client ID)
   - **App Secret** (Client Secret)
2. Add these to your `.env` file:
```env
CLOVER_CLIENT_ID=your_app_id_here
CLOVER_CLIENT_SECRET=your_app_secret_here
CLOVER_REDIRECT_URI=http://localhost:3001/api/clover/oauth/callback
```

#### Step 4: Authorize Your App
1. In the application, go to **Clover Sync** page
2. The system will guide you through the OAuth authorization
3. Or manually navigate to:
   ```
   https://sandbox.dev.clover.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI
   ```

### Option 2: Direct API Token (Quick Setup for Testing)

#### Step 1: Get Test Merchant Credentials
1. Log into Clover Sandbox: https://sandbox.dev.clover.com/dashboard
2. Go to **Setup** > **API Tokens**
3. Generate a new API Token with required permissions

#### Step 2: Add Credentials to .env
```env
CLOVER_MERCHANT_ID=your_merchant_id
CLOVER_ACCESS_TOKEN=your_access_token
CLOVER_ENV=sandbox
```

#### Step 3: Test Connection
1. Go to **Clover Sync** page in the app
2. Click **Test Connection**
3. Enter your credentials when prompted

### Switching to Production
When ready for production:
```env
CLOVER_ENV=production
# Use production URLs will be automatically selected
```

**Production URLs:**
- API Base: `https://api.clover.com/v3`
- OAuth: `https://www.clover.com/oauth`

---

## 📖 Usage Guide

### Initial Setup

#### 1. First Login
- Navigate to `http://localhost:3000`
- Login with default credentials
- **Immediately change your password** in Settings

#### 2. Add Locations
1. Go to **Settings** > **Locations**
2. Click **Add Location**
3. Enter store details

#### 3. Add Suppliers (Optional)
1. Go to **Settings** > **Suppliers**
2. Add your product suppliers

### Managing Products

#### Adding Products
1. Go to **Products** > **Add Product**
2. Fill in:
   - SKU (auto-generated if not provided)
   - Name
   - Cost Price
   - Selling Price
   - Category
   - Supplier
   - Reorder Level
3. Click **Save**

#### Importing from Clover
1. Go to **Clover Sync**
2. Click **Import Inventory**
3. Enter your Clover credentials
4. Products will be synced automatically

#### Exporting to Clover
1. Go to **Clover Sync**
2. Click **Export Inventory**
3. Enter your Clover credentials
4. Your products will be pushed to Clover

### Managing Inventory

#### Adjusting Stock
1. Go to **Inventory**
2. Find the product
3. Click **Adjust Stock**
4. Select adjustment type:
   - Increase
   - Decrease
   - Transfer
   - Damage/Loss
5. Enter quantity and reason
6. Save

#### Stock Takes
1. Go to **Inventory** > **Stock Take**
2. Select location
3. Scan products or enter quantities
4. Submit count

### Generating Reports

#### Inventory Report
1. Go to **Reports** > **Inventory Report**
2. Select location (optional)
3. Choose format: CSV, PDF, or XLSX
4. Click **Generate**

#### Low Stock Report
1. Go to **Reports** > **Low Stock**
2. View products below reorder level
3. Export or create purchase orders

---

## 🔌 API Documentation

### Authentication

#### POST `/api/auth/login`
Login to the system
```json
{
  "email": "admin@cloverpro.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "admin@cloverpro.com",
    "fullName": "System Administrator",
    "role": "admin"
  }
}
```

### Products

#### GET `/api/products`
Get all products with filters
```
Query Parameters:
- search: Search term
- category: Category ID
- supplier: Supplier ID
- status: 'active' | 'inactive'
- limit: Number of results (default: 50)
- offset: Pagination offset
```

#### POST `/api/products`
Create a new product
```json
{
  "sku": "PROD-001",
  "name": "Product Name",
  "description": "Product description",
  "categoryId": "category_id",
  "supplierId": "supplier_id",
  "costPrice": 10.00,
  "sellingPrice": 15.00,
  "reorderLevel": 10,
  "reorderQuantity": 50
}
```

### Clover Integration

#### POST `/api/clover/import-inventory`
Import inventory from Clover
```json
{
  "merchantId": "your_merchant_id",
  "accessToken": "your_access_token",
  "locationId": "your_location_id"
}
```

#### POST `/api/clover/export-inventory`
Export inventory to Clover
```json
{
  "merchantId": "your_merchant_id",
  "accessToken": "your_access_token"
}
```

#### POST `/api/clover/sync-stock`
Sync stock levels with Clover
```json
{
  "merchantId": "your_merchant_id",
  "accessToken": "your_access_token",
  "locationId": "your_location_id"
}
```

**For complete API documentation, see:** `API_REFERENCE.md`

---

## 🌐 Deployment

### Production Deployment

#### 1. Prepare Environment
```bash
# Set production environment variables
NODE_ENV=production
JWT_SECRET=generate-a-strong-random-secret-here
CLOVER_ENV=production
```

#### 2. Build Frontend
```bash
cd frontend
npm run build
```

#### 3. Serve Application
You can use:
- **Nginx** - As reverse proxy
- **PM2** - For process management
- **Docker** - For containerization

#### Example with PM2:
```bash
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name clover-inventory-api

# Serve frontend with static server
cd ../frontend
pm2 serve build 3000 --spa --name clover-inventory-app
```

#### 4. Configure Nginx (Optional)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

### Cloud Deployment Options

#### AWS
- **EC2**: Traditional server deployment
- **Elastic Beanstalk**: Automated deployment
- **RDS**: For PostgreSQL database (upgrade from SQLite)

#### Heroku
```bash
heroku create clover-inventory-app
git push heroku main
```

#### DigitalOcean
- Use App Platform or Droplets
- Connect database
- Deploy via GitHub

---

## 🛠️ Troubleshooting

### Common Issues

#### "Cannot connect to database"
**Solution:**
```bash
# Reinitialize database
cd backend
npm run init-db
```

#### "Clover API connection failed"
**Solutions:**
1. Verify your credentials in `.env`
2. Check if using correct environment (sandbox vs production)
3. Ensure API token has correct permissions
4. Check network connectivity

#### "Port already in use"
**Solution:**
```bash
# Change port in .env
PORT=3002

# Or kill process using the port
# On Linux/Mac:
lsof -ti:3001 | xargs kill -9

# On Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

#### "Module not found" errors
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. Check logs:
   ```bash
   # Backend logs
   tail -f backend/logs/error.log
   
   # Frontend console in browser
   F12 > Console tab
   ```

2. Enable debug mode:
   ```env
   DEBUG=true
   LOG_LEVEL=debug
   ```

3. Contact support:
   - Email: support@cloverpro.com
   - GitHub Issues: (if applicable)

---

## 📊 Database Schema

The system uses SQLite by default. Main tables:
- **users** - User accounts and authentication
- **locations** - Store/warehouse locations
- **products** - Product catalog
- **inventory** - Stock levels per location
- **categories** - Product categories
- **suppliers** - Supplier information
- **purchase_orders** - PO management
- **stock_adjustments** - Inventory changes
- **sales** - Sales data for analytics
- **alerts** - System notifications
- **audit_log** - Complete audit trail
- **clover_sync_log** - Clover synchronization history

---

## 🔒 Security Best Practices

1. **Change default credentials immediately**
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Enable HTTPS** in production
4. **Regular backups** of database
5. **Keep dependencies updated**:
   ```bash
   npm audit
   npm audit fix
   ```
6. **Use environment variables** for sensitive data
7. **Implement rate limiting** (already included)
8. **Monitor audit logs** regularly

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 🎯 Roadmap / Future Enhancements

### Phase 2 (Future Development)
- AI Forecasting for demand prediction
- Automated replenishment suggestions
- Advanced supplier management
- Email notifications for alerts

### Phase 3 (Future Development)
- Native iOS app
- Native Android app
- Offline mode with sync

### Phase 4 (Future Development)
- QuickBooks integration
- Shopify integration
- Custom ERP connections

---

## ✅ Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] User login/logout
- [ ] Create product
- [ ] Adjust inventory
- [ ] Import from Clover
- [ ] Export to Clover
- [ ] Generate reports
- [ ] Low stock alerts
- [ ] Multi-location support

---

## 📞 Support

For technical support or questions:
- **Email**: support@cloverpro.com
- **Documentation**: See docs folder
- **API Reference**: API_REFERENCE.md

---

**Built with ❤️ for Clover POS merchants**
