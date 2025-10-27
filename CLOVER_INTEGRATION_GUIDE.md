# 🔗 Clover POS Integration Guide

Complete guide for integrating your inventory system with Clover POS.

---

## Table of Contents
1. [Understanding Clover API](#understanding-clover-api)
2. [Setup Methods](#setup-methods)
3. [Synchronization Features](#synchronization-features)
4. [Troubleshooting](#troubleshooting)
5. [Best Practices](#best-practices)

---

## Understanding Clover API

### What is Clover?
Clover is a cloud-based Point of Sale (POS) system by Fiserv that provides:
- Payment processing
- Inventory management
- Order management
- Merchant services

### API Capabilities
Our integration uses Clover's REST API v3 to:
- ✅ Read inventory items
- ✅ Create/update products
- ✅ Sync stock levels
- ✅ Read order data
- ✅ Access merchant information

### API Endpoints Used
- `GET /v3/merchants/{mId}/items` - Fetch products
- `POST /v3/merchants/{mId}/items` - Create product
- `POST /v3/merchants/{mId}/items/{itemId}` - Update product
- `GET /v3/merchants/{mId}/items?expand=itemStock` - Get with stock
- `POST /v3/merchants/{mId}/item_stocks/{itemId}` - Update stock

---

## Setup Methods

### Method 1: OAuth 2.0 (Production Ready)

**When to use:** Production apps, multi-merchant support

#### Step 1: Create Clover App

1. Visit **Clover Developer Portal**
   - Sandbox: https://sandbox.dev.clover.com/developers
   - Production: https://www.clover.com/developers

2. **Create New App**
   ```
   App Name: Clover Inventory Pro
   Package Name: com.yourdomain.inventory
   Default Launch: Web App
   ```

3. **Set Permissions**
   - ☑️ Merchant: Read
   - ☑️ Inventory: Read
   - ☑️ Inventory: Write
   - ☑️ Orders: Read (optional for future features)

4. **Configure URLs**
   ```
   Site URL: https://yourdomain.com
   OAuth Redirect URI: https://yourdomain.com/api/clover/oauth/callback
   ```

#### Step 2: Get Credentials

After app creation, note:
- **App ID** (Client ID): `ABC123XYZ`
- **App Secret**: `abc-123-xyz-secret-key`

#### Step 3: Configure Backend

Edit `backend/.env`:
```env
CLOVER_CLIENT_ID=ABC123XYZ
CLOVER_CLIENT_SECRET=abc-123-xyz-secret-key
CLOVER_REDIRECT_URI=https://yourdomain.com/api/clover/oauth/callback
CLOVER_ENV=production  # or 'sandbox' for testing
```

#### Step 4: Authorize

**From Your Application:**
1. Navigate to **Clover Sync** page
2. Click **Connect to Clover**
3. Redirected to Clover authorization page
4. Login to Clover account
5. Accept permissions
6. Redirected back to app with access token

**Manual Authorization URL:**
```
https://www.clover.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI
```

**Response:**
```
https://yourdomain.com/api/clover/oauth/callback?code=AUTH_CODE&merchant_id=MERCHANT_ID
```

#### Step 5: Exchange Code for Token

**Automatic:** System exchanges code for access token
**Manual API Call:**
```bash
curl -X POST https://www.clover.com/oauth/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d code=AUTH_CODE
```

**Store Token Securely:** Token is used for all future API calls

---

### Method 2: Direct API Token (Quick Testing)

**When to use:** Development, testing, single merchant

#### Step 1: Get API Token

1. **Login to Clover Dashboard**
   - Sandbox: https://sandbox.dev.clover.com/dashboard
   - Production: https://www.clover.com/dashboard

2. **Generate API Token**
   ```
   Setup > API Tokens > Generate New Token
   
   Select Permissions:
   - Read Inventory ✓
   - Write Inventory ✓
   - Read Merchant ✓
   ```

3. **Copy Token**
   ```
   Token: a1b2c3d4-e5f6-7890-abcd-ef1234567890
   Merchant ID: ABC123MERCHANT
   ```

#### Step 2: Configure

**Option A: Add to .env**
```env
CLOVER_MERCHANT_ID=ABC123MERCHANT
CLOVER_ACCESS_TOKEN=a1b2c3d4-e5f6-7890-abcd-ef1234567890
CLOVER_ENV=sandbox
```

**Option B: Enter in UI**
- Go to Clover Sync page
- Click "Test Connection"
- Enter credentials when prompted
- System validates connection

---

## Synchronization Features

### Import from Clover

**What it does:**
- Fetches all products from Clover
- Creates matching products in your system
- Imports stock quantities
- Links products by Clover Item ID

**How to use:**
1. Navigate to **Clover Sync**
2. Click **Import Inventory**
3. Enter credentials (if not in .env)
4. Select location to import to
5. Click **Start Import**

**What happens:**
```
1. Connects to Clover API
2. Fetches all items with: GET /items?expand=itemStock
3. Creates category: "Imported from Clover"
4. For each item:
   - Check if exists by clover_item_id
   - If exists: Update price and stock
   - If new: Create product + inventory
5. Logs sync activity
6. Shows results summary
```

**Result:**
```
✅ Import Completed
   - 150 products imported
   - 5 products updated
   - 2 products failed
```

---

### Export to Clover

**What it does:**
- Pushes your products to Clover POS
- Creates new items in Clover
- Updates existing items
- Links products bi-directionally

**How to use:**
1. Navigate to **Clover Sync**
2. Click **Export Inventory**
3. Enter credentials
4. Optional: Select specific products
5. Click **Start Export**

**What happens:**
```
1. Retrieves active products from database
2. For each product:
   - Check if has clover_item_id
   - If yes: POST /items/{itemId} (update)
   - If no: POST /items (create new)
3. Store returned clover_item_id
4. Mark as synced
5. Log activity
```

**Clover Item Format:**
```json
{
  "name": "Product Name",
  "price": 1500,  // Price in cents ($15.00)
  "cost": 1000,   // Cost in cents ($10.00)
  "sku": "PROD-001",
  "defaultTaxRates": true
}
```

---

### Stock Synchronization

**What it does:**
- Keeps inventory quantities in sync
- Updates Clover stock levels
- Bi-directional sync capability

**How to use:**
1. Navigate to **Clover Sync**
2. Click **Sync Stock Levels**
3. Select location
4. Click **Start Sync**

**Stock Update API:**
```http
POST /v3/merchants/{mId}/item_stocks/{itemId}
Content-Type: application/json

{
  "quantity": 125.5
}
```

**Frequency Recommendations:**
- Manual: After physical counts
- Scheduled: Every hour via cron
- Real-time: After each sale (advanced)

---

### Automatic Sync Setup (Optional)

**Using Webhooks:**
1. **Register webhook in Clover:**
```http
POST /v3/merchants/{mId}/webhooks
{
  "url": "https://yourdomain.com/api/clover/webhook",
  "enabled": true,
  "events": [
    "inventory.updated",
    "inventory.created"
  ]
}
```

2. **Handle webhook in your backend:**
```javascript
app.post('/api/clover/webhook', (req, res) => {
  const { type, data } = req.body;
  if (type === 'inventory.updated') {
    // Update local inventory
    updateInventoryFromClover(data);
  }
  res.sendStatus(200);
});
```

---

## Troubleshooting

### Error: "Invalid Access Token"

**Cause:** Token expired or invalid

**Solutions:**
1. **Check token validity:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://apisandbox.dev.clover.com/v3/merchants/YOUR_MERCHANT_ID
   ```

2. **Regenerate token:**
   - Go to Clover Dashboard
   - Setup > API Tokens
   - Delete old token
   - Generate new token

3. **For OAuth:** Re-authorize the app

---

### Error: "403 Forbidden"

**Cause:** Insufficient permissions

**Solution:**
1. Check app permissions in Developer Dashboard
2. Ensure token has required scopes:
   - Inventory: Read ✓
   - Inventory: Write ✓
3. Reinstall app on merchant account

---

### Error: "Rate Limit Exceeded"

**Cause:** Too many API requests

**Clover Rate Limits:**
- 200 requests per minute per merchant
- 1000 requests per hour per merchant

**Solutions:**
1. **Implement backoff:**
```javascript
async function apiCallWithRetry(fn, retries = 3) {
  try {
    return await fn();
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      await sleep(2000); // Wait 2 seconds
      return apiCallWithRetry(fn, retries - 1);
    }
    throw error;
  }
}
```

2. **Batch operations:**
   - Don't sync all products at once
   - Process in chunks of 50

---

### Error: "Products not syncing"

**Checklist:**
- [ ] Valid credentials in .env
- [ ] Correct environment (sandbox vs production)
- [ ] Network connectivity
- [ ] Clover API status: https://status.clover.com
- [ ] App installed on merchant account
- [ ] Token has correct permissions

---

## Best Practices

### 1. Environment Management

**Use Sandbox First:**
```env
# Testing
CLOVER_ENV=sandbox
CLOVER_MERCHANT_ID=test_merchant_id

# Production (only when ready)
CLOVER_ENV=production
CLOVER_MERCHANT_ID=real_merchant_id
```

### 2. Error Handling

**Always handle API errors:**
```javascript
try {
  await api.post('/clover/import-inventory', data);
} catch (error) {
  if (error.response?.status === 401) {
    // Token invalid - reauth needed
  } else if (error.response?.status === 429) {
    // Rate limited - wait and retry
  } else {
    // Other error - log and alert
  }
}
```

### 3. Data Validation

**Validate before sending to Clover:**
```javascript
function validateProduct(product) {
  if (!product.name || product.name.length > 127) {
    throw new Error('Invalid product name');
  }
  if (product.price < 0) {
    throw new Error('Price cannot be negative');
  }
  // More validations...
}
```

### 4. Sync Scheduling

**Recommended schedule:**
- **Import from Clover:** Daily at 2 AM
- **Export to Clover:** After inventory counts
- **Stock sync:** Hourly
- **Full sync:** Weekly

**Using node-cron:**
```javascript
const cron = require('node-cron');

// Daily import at 2 AM
cron.schedule('0 2 * * *', () => {
  importFromClover();
});

// Hourly stock sync
cron.schedule('0 * * * *', () => {
  syncStockLevels();
});
```

### 5. Logging

**Log all sync activities:**
```javascript
{
  timestamp: '2025-10-26T10:30:00Z',
  action: 'import_inventory',
  status: 'completed',
  recordsProcessed: 150,
  recordsFailed: 2,
  duration: 45 // seconds
}
```

### 6. Security

- ✅ **Never commit credentials** to version control
- ✅ **Use environment variables**
- ✅ **Encrypt tokens** at rest
- ✅ **Use HTTPS** for all API calls
- ✅ **Validate webhook signatures**
- ✅ **Rotate tokens** regularly

---

## Testing Checklist

Before going to production:

- [ ] Test import with sample data
- [ ] Test export creates items in Clover
- [ ] Test stock sync updates quantities
- [ ] Test OAuth flow completely
- [ ] Test error handling
- [ ] Test rate limiting
- [ ] Verify data accuracy
- [ ] Test with real Clover account
- [ ] Review audit logs
- [ ] Test rollback procedures

---

## API Reference

### Base URLs

**Sandbox:**
```
https://apisandbox.dev.clover.com/v3
```

**Production:**
```
https://api.clover.com/v3
```

### Common Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json
```

### Key Endpoints

**Get Items:**
```
GET /merchants/{mId}/items?expand=itemStock
```

**Create Item:**
```
POST /merchants/{mId}/items
Body: { "name": "...", "price": 1000 }
```

**Update Stock:**
```
POST /merchants/{mId}/item_stocks/{itemId}
Body: { "quantity": 100 }
```

---

## Additional Resources

- **Clover Docs:** https://docs.clover.com
- **API Reference:** https://docs.clover.com/reference
- **Developer Dashboard:** https://www.clover.com/developers
- **Status Page:** https://status.clover.com
- **Support:** [email protected]

---

## Support

Having integration issues?

1. Check **Sync History** in app for error details
2. Review **Audit Logs** for API calls
3. Test connection with **Test Connection** button
4. Verify credentials in .env file
5. Check Clover API status
6. Contact support with error logs

---

**Happy syncing! 🔄**
