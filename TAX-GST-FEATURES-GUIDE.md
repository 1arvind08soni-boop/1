# Tax and GST Features Guide

## Overview
This billing system now supports comprehensive Tax/GST features with company-level control. Each company can independently enable or disable tax features.

## Key Features

### 1. Company Configuration
When creating or editing a company, you can:
- **Enable Tax/GST Features** - Toggle to activate tax features for this company
- **Select State/UT** - Required for GST type determination (intra-state vs inter-state)
- **Set Default GST Rate** - Pre-fill value for invoices (e.g., 18%)
- **Choose Tax Invoice Template** - Select from GST Standard, GST Detailed, or GST Compact

### 2. Product Master Enhancements (Tax-Enabled Companies Only)
- **HSN/SAC Code** - Enter HSN code for GST compliance
- **GST Rate %** - Set custom GST percentage for each product
- Default GST rate from company settings is pre-filled but can be customized per product

### 3. Client Master Enhancements (Tax-Enabled Companies Only)
- **State/UT** - Required field to determine if transaction is intra-state or inter-state
- Used to auto-calculate CGST+SGST vs IGST

### 4. Invoice Creation - Tax-Enabled Companies

#### Invoice Items Table
```
| S.No | Product/Design No | HSN Code | No of Box | Unit Per Box | Quantity | Rate | Amount | Action |
```
- **HSN Code column** - Auto-filled from product master
- **Editable Rate** - Rate can be changed after product selection (click to edit)

#### GST Calculation Section
- **Taxable Amount** - Subtotal before GST
- **GST Type** - Auto-selected based on client state:
  - Same state as company → Intra-State (CGST+SGST)
  - Different state → Inter-State (IGST)
- **GST Rate %** - With quick selection buttons: 5%, 12%, 18%, 28%
- **GST Breakdown**:
  - Intra-State: Shows CGST % & Amount, SGST % & Amount
  - Inter-State: Shows IGST % & Amount
- **Total Amount** - Taxable amount + GST

#### Example Calculations

**Intra-State (CGST+SGST):**
- Taxable Amount: ₹10,000
- GST Rate: 18%
- CGST 9%: ₹900
- SGST 9%: ₹900
- Total: ₹11,800

**Inter-State (IGST):**
- Taxable Amount: ₹10,000
- GST Rate: 18%
- IGST 18%: ₹1,800
- Total: ₹11,800

### 5. Invoice Creation - Non-Tax Companies

For companies without tax enabled:
- Standard invoice form (no changes)
- Simple "Tax %" field
- No HSN code column
- No GST breakdown

## Data Storage

### Invoice Record with Tax
```javascript
{
  id: "inv123",
  invoiceNo: "INV-001",
  date: "2024-01-15",
  clientId: "client123",
  items: [
    {
      productId: "prod123",
      productCode: "BG-001",
      productCategory: "Bangles",
      hsnCode: "7113",  // New field
      boxes: 5,
      quantity: 120,
      rate: 50,
      amount: 6000
    }
  ],
  subtotal: 10000,
  gstType: "intra",      // New field: 'intra' or 'inter'
  gstRate: 18,           // New field
  cgstPercent: 9,        // New field
  cgstAmount: 900,       // New field
  sgstPercent: 9,        // New field
  sgstAmount: 900,       // New field
  total: 11800
}
```

### Invoice Record without Tax (Legacy/Non-Tax Companies)
```javascript
{
  id: "inv124",
  invoiceNo: "INV-002",
  date: "2024-01-15",
  clientId: "client124",
  items: [...],
  subtotal: 10000,
  tax: 5,          // Simple tax percentage
  total: 10500
}
```

## How to Use

### Step 1: Enable Tax for Company
1. Go to Company Selection screen
2. Click "Add New Company" or edit existing company
3. Check "Enable Tax/GST Features"
4. Fill in State/UT, Default GST Rate, and select Tax Invoice Template
5. Save company

### Step 2: Add Products with HSN Codes
1. Go to Products section
2. Add new product
3. Fill in HSN Code and GST Rate % (these fields only appear if tax is enabled)
4. Save product

### Step 3: Add Clients with State
1. Go to Clients section
2. Add new client
3. Fill in State/UT (required if tax is enabled)
4. Save client

### Step 4: Create Tax Invoice
1. Go to Sales Invoice section
2. Click "New Invoice"
3. Select client → GST type auto-detects based on states
4. Add products → HSN codes and rates auto-fill
5. Edit rate if needed (click in the rate field)
6. Adjust GST rate if needed (or use quick buttons)
7. Review GST breakdown (CGST+SGST or IGST)
8. Create invoice

## Benefits

### For Tax-Enabled Companies:
✅ **GST Compliance** - Full CGST, SGST, IGST breakdown
✅ **HSN Code Tracking** - Required for GST returns
✅ **Automatic Calculations** - No manual GST computation needed
✅ **State-Based Logic** - Auto-detect intra vs inter-state
✅ **Flexible Rates** - Set GST % per product or per invoice
✅ **Audit Ready** - All GST data stored in invoices

### For Non-Tax Companies:
✅ **No Complexity** - Simple interface remains unchanged
✅ **Optional Feature** - Only enable when needed
✅ **Backward Compatible** - Existing data works as-is

## Future Enhancements (Coming Soon)

- **Purchase GST Tracking** - Add GST fields to purchase module
- **Input vs Output GST** - Calculate input tax credit
- **GST Reports** - Period-wise GST summary, liability calculations
- **GST Invoice Templates** - Print templates with GST breakdown
- **GSTR Export** - Export data for GST returns (GSTR-1, GSTR-3B)

## Technical Notes

### Backward Compatibility
- Existing invoices without GST data continue to work
- Non-tax companies are unaffected
- Old invoice format remains valid
- GST fields are optional in data structure

### Validation
- State/UT is required for tax-enabled companies
- HSN code is optional but recommended
- GST rate can be 0 to 100%
- At least one invoice item is required

### Auto-Detection Logic
```javascript
if (client.state === company.state) {
  // Intra-state: Use CGST + SGST
  cgst = gstRate / 2
  sgst = gstRate / 2
} else {
  // Inter-state: Use IGST
  igst = gstRate
}
```

## Support

For issues or questions about tax/GST features:
1. Check if company has "Enable Tax/GST" enabled
2. Verify State/UT is set for company and client
3. Ensure products have HSN codes (if needed)
4. Check browser console for any JavaScript errors
