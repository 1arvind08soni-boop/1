# Financial Year Management

## Overview

This document describes the financial year management system implemented in the Billing & Account Management application. The system allows businesses to manage multiple financial years, carry forward balances, and maintain historical data for compliance and reference.

## Features

### 1. Multiple Financial Year Support
- Create and manage multiple financial years per company
- Each financial year has:
  - Unique ID
  - Name (e.g., "2024-2025")
  - Start Date
  - End Date
  - Current status (one FY is marked as current)
  - Closed status (when year-end is processed)

### 2. Financial Year Configuration
- **Create New Financial Year**
  - Set custom name
  - Define start and end dates (not restricted to April-March)
  - Option to make it the current financial year immediately
  
- **Edit Current Financial Year**
  - Modify start and end dates
  - Updates transaction filtering accordingly

- **Switch Between Financial Years**
  - View historical data by switching to previous years
  - Only one FY can be current at a time
  - Dashboard and reports automatically filter by selected FY

### 3. Year-End Process
The year-end process is a critical feature that:

1. **Closes Current Financial Year**
   - Marks the current FY as closed with timestamp
   - Prevents future modifications to closed FY

2. **Calculates Closing Balances**
   - For each client: Opening Balance + Total Invoices - Total Payments
   - For each vendor: Opening Balance + Total Purchases - Total Payments
   - Displays summary before processing

3. **Carries Forward Balances**
   - Client closing balances → Opening balances for new FY
   - Vendor closing balances → Opening balances for new FY
   - Product data is retained with opening stock

4. **Creates New Financial Year**
   - Define new FY name and dates
   - Automatically set as current
   - Ready for new transactions

### 4. Data Management

#### Opening Balances
- **Clients & Vendors**: Have opening balance fields
  - Used as starting balance for calculations
  - Updated during year-end process

- **Products**: Have opening stock field
  - Track inventory at start of financial year
  - Can be manually updated

#### Historical Data
- All transaction data is retained
- Data is filtered by financial year date ranges
- Invoices, purchases, and payments within FY dates are displayed
- Deleted FY removes associated transactions permanently

#### Data Deletion
- Delete previous financial years
- WARNING: Deletes all transactions in that period
- Cannot delete current or closed financial years
- Confirmation required before deletion

### 5. Backup & Restore
- Backup includes all financial years
- Restore is backward compatible:
  - Handles old format (single FY string)
  - Handles new format (FY array)
  - Automatically migrates old backups

## User Interface

### Accessing Financial Year Settings
1. Navigate to **Settings** in the sidebar
2. Click **"Manage Financial Years"** button
3. Financial Year Management modal opens

### Financial Year Management Modal

#### View Section
Lists all financial years with:
- Name and date range
- Current status indicator (highlighted)
- Closed status and date
- Action buttons:
  - **Switch**: Change to this FY (if not current)
  - **Delete**: Remove FY and its data (if not current/closed)

#### Actions Section
- **Create New Financial Year**
  - Opens form to create new FY
  - Set name, dates, and current status
  
- **Edit Current FY Dates**
  - Modify date range of active FY
  - Affects transaction filtering
  
- **Year-End Process**
  - View closing balances summary
  - Configure new FY
  - Execute carry forward

### Sidebar Display
- Current financial year name shown in sidebar
- Format: "FY: 2024-2025"
- Updates when switching between years

## Technical Implementation

### Data Structure

#### AppState
```javascript
{
  currentFinancialYear: {
    id: "unique-id",
    name: "2024-2025",
    startDate: "2024-04-01",
    endDate: "2025-03-31",
    isCurrent: true,
    closedDate: null,  // or ISO timestamp
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  financialYears: [/* array of FY objects */],
  // ... other state
}
```

#### Product Structure
```javascript
{
  id: "unique-id",
  code: "PROD-001",
  name: "Product Name",
  category: "Category",
  unitPerBox: 10,
  pricePerUnit: 100,
  openingStock: 50,  // NEW FIELD
  clientPrices: {},
  description: "Description",
  createdAt: "..."
}
```

### Key Functions

#### Financial Year Management
- `createDefaultFinancialYear()` - Creates FY based on current date
- `showFinancialYearSettings()` - Main FY management UI
- `createFinancialYear(event)` - Create new FY
- `updateFinancialYearDates(event)` - Edit FY dates
- `switchToFinancialYear(fyId)` - Change current FY
- `deleteFinancialYear(fyId)` - Remove FY and data
- `processYearEnd(event)` - Execute year-end process
- `updateFinancialYearDisplay()` - Update UI with current FY

#### Balance Calculations
- `calculateClientBalance(clientId)` - Calculate client balance
- `calculateVendorBalance(vendorId)` - Calculate vendor balance

### Data Filtering
Transactions are filtered by date range:
```javascript
const startDate = new Date(currentFY.startDate);
const endDate = new Date(currentFY.endDate);

const fyInvoices = invoices.filter(inv => {
  const invDate = new Date(inv.date);
  return invDate >= startDate && invDate <= endDate;
});
```

## Business Workflow

### Annual Reset Process

1. **Before Year End**
   - Review all transactions
   - Reconcile client and vendor balances
   - Verify opening stock quantities

2. **Execute Year-End**
   - Go to Settings → Manage Financial Years
   - Click "Year-End Process"
   - Review closing balances
   - Enter new FY details
   - Confirm and execute

3. **After Year-End**
   - Current FY is closed
   - New FY is active
   - Opening balances updated
   - Ready for new transactions

4. **Historical Reference**
   - Switch to previous FY to view data
   - All transactions preserved
   - Cannot modify closed FY

### Multi-Year Database Management

#### Retention Strategy
- Keep all FYs for compliance (default)
- Historical data for audits and reference
- No automatic deletion

#### Cleanup Strategy (Optional)
- Delete very old FYs if storage is concern
- Ensure compliance requirements are met
- Create backup before deletion
- Cannot delete current or closed FY

## Compliance & Best Practices

### Compliance Support
- Historical data retention
- Audit trail (transaction dates preserved)
- Closing balances documented
- Year-end process tracked

### Best Practices
1. **Regular Backups**: Backup before year-end process
2. **Verification**: Review balances before carry forward
3. **Documentation**: Keep notes on year-end decisions
4. **Access Control**: Limit who can process year-end
5. **Testing**: Test year-end on backup first (if possible)

### Recommendations
- Define FY at company creation
- Process year-end promptly after fiscal year
- Don't delete historical data unless necessary
- Use consistent naming convention for FYs

## Migration from Old System

### Automatic Migration
When loading old company data:
1. System detects missing `financialYears` array
2. Creates default FY based on current date
3. Migrates existing data to new structure
4. All transactions preserved

### Backup Compatibility
- Old backups restore correctly
- FY created from backup metadata
- No data loss during migration

## Troubleshooting

### Common Issues

**Issue**: Can't switch to different financial year
- **Solution**: Only non-current FYs can be switched to. Current FY is automatically selected.

**Issue**: Year-end button is disabled
- **Solution**: Current FY must not already be closed.

**Issue**: Missing transactions after FY switch
- **Solution**: Transactions are filtered by FY date range. Switch to correct FY to view transactions.

**Issue**: Opening balances are zero
- **Solution**: Run year-end process to carry forward balances, or manually enter opening balances.

## Future Enhancements

Potential improvements:
- Lock closed FY (prevent accidental modifications)
- Multi-year reports and comparisons
- Automatic FY creation based on pattern
- Bulk FY management
- Advanced audit logging
- Role-based access for year-end process
