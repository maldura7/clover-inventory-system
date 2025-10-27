# 🚀 Quick Start Guide - Get Running in 5 Minutes

## Prerequisites
- Node.js v16+ installed
- Terminal/Command Prompt access

## 1. Install Backend (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Initialize database
npm run init-db

# Start server
npm start
```

✅ Backend running on: http://localhost:3001

## 2. Install Frontend (2 minutes)

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start application
npm start
```

✅ Frontend running on: http://localhost:3000

## 3. First Login (1 minute)

1. Open browser: http://localhost:3000
2. Login with:
   - **Email**: admin@cloverpro.com
   - **Password**: admin123
3. **IMPORTANT**: Change password in Settings immediately!

---

## Quick Clover Setup

### Option A: Test with Sandbox (Recommended First)

1. Go to: https://sandbox.dev.clover.com
2. Create test merchant account
3. Get API token from Setup > API Tokens
4. In app: Clover Sync > Import Inventory
5. Enter credentials when prompted

### Option B: Production Setup

1. Create app at: https://www.clover.com/developers
2. Get App ID and Secret
3. Add to backend/.env:
```env
CLOVER_CLIENT_ID=your_app_id
CLOVER_CLIENT_SECRET=your_app_secret
CLOVER_ENV=production
```
4. Follow OAuth flow in app

---

## Test the System

### Add Your First Product
1. Go to Products > Add Product
2. Fill in:
   - Name: "Test Product"
   - Cost Price: 10.00
   - Selling Price: 15.00
3. Click Save

### Import from Clover
1. Go to Clover Sync
2. Click "Import Inventory"
3. Enter your Clover credentials
4. Watch products sync automatically

### Check Dashboard
- View total products
- See inventory value
- Check low stock alerts

---

## Common Commands

```bash
# Backend
cd backend
npm start          # Start server
npm run dev        # Development mode with auto-reload
npm run init-db    # Reset database

# Frontend
cd frontend
npm start          # Start development server
npm run build      # Build for production
```

---

## Need Help?

- 📖 Full docs: See README.md
- 🔧 API Reference: See API_REFERENCE.md
- ❓ Issues: Check Troubleshooting section in README.md

---

## Next Steps

1. ✅ Add your store locations
2. ✅ Import products from Clover
3. ✅ Set up suppliers
4. ✅ Configure low stock alerts
5. ✅ Create your first purchase order
6. ✅ Generate your first report

**You're ready to go! 🎉**
