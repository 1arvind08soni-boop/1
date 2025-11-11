# GST & Tax System User Guide

## Overview

The Billing & Account Management System now includes comprehensive GST (Goods and Services Tax) support designed specifically for Indian businesses. This guide will help you understand and use the new tax features.

## Features

### 1. Company-Level Tax Configuration

Each company can be configured independently for tax handling:

- **Tax Enable/Disable Toggle**: Turn GST calculations on or off per company
- **State Information**: Add state code and name for accurate GST calculations
- **Tax Invoice Template Selection**: Choose different templates for tax invoices

### 2. GST Rate Configuration

Configure default GST rates that apply across your business:

- **CGST (Central GST)**: Default 9%
- **SGST (State GST)**: Default 9%
- **IGST (Integrated GST)**: Default 18%

These rates can be customized based on your business requirements.

### 3. Product-Level Tax Information

Each product can have:

- **HSN Code**: Harmonized System of Nomenclature code for GST compliance
- **Custom GST Rate**: Override default rates for specific products
- If no custom rate is specified, the system uses default rates

### 4. Client/Vendor State Information

- **State Code**: Required for inter-state vs intra-state determination
- **State Name**: For display on invoices and documents
- **GSTIN**: GST Identification Number

## How to Use

### Step 1: Enable Tax for Your Company

1. Go to **Settings** → **Company Settings**
2. Check the **"Enable Tax/GST System"** checkbox
3. Fill in your company's:
   - GSTIN (mandatory for tax invoices)
   - State Code (e.g., "07" for Delhi)
   - State Name (e.g., "Delhi")
4. Select your preferred **Tax Invoice Template**
5. Click **Update Settings**

### Step 2: Configure GST Rates

1. Go to **Settings** → **Tax & GST Settings**
2. Set your default GST rates:
   - CGST Rate (typically 9%)
   - SGST Rate (typically 9%)
   - IGST Rate (typically 18%)
3. Click **Save GST Settings**

**Note**: CGST + SGST should equal IGST (e.g., 9% + 9% = 18%)

### Step 3: Add Tax Information to Products

When adding or editing products:

1. Enter the **HSN Code** (e.g., "7113" for jewelry)
2. Optionally specify a **custom GST Rate** if different from defaults
3. If left empty, default GST rates will be used

### Step 4: Add State Information to Clients

When adding or editing clients:

1. Enter **GSTIN** (if client is GST-registered)
2. Add **State Code** (e.g., "27" for Maharashtra)
3. Add **State Name** (e.g., "Maharashtra")

This information is crucial for determining if the transaction is inter-state or intra-state.

### Step 5: Generate Tax Invoices

1. Create an invoice as usual
2. If tax is enabled, GST will be automatically calculated
3. Click **View/Print** to see the invoice
4. The system automatically determines:
   - **Intra-State**: Uses CGST + SGST
   - **Inter-State**: Uses IGST
5. Print or save the GST-compliant invoice

## GST Invoice Features

The professional GST invoice template includes:

### Header Section
- Company name and complete address
- GSTIN and PAN numbers
- "TAX INVOICE" heading

### Billing Details
- Complete supplier (your company) information
- Complete recipient (client) information
- Invoice number and date
- Place of supply
- Transaction type (Intra-state/Inter-state)

### Items Table
- Product description with HSN codes
- Quantity and rate
- Taxable value
- GST percentage
- GST amount
- Total amount including tax

### GST Breakdown Table
Shows detailed tax calculations:
- For **Intra-State** transactions: CGST + SGST breakdown
- For **Inter-State** transactions: IGST breakdown
- Tax rate-wise summary
- Total tax amount

### Footer
- Grand total including all taxes
- Terms and conditions
- Authorized signatory section

## E-Way Bill Generation

E-Way Bill is mandatory for goods movement above ₹50,000 in India.

### How to Generate E-Way Bill Document

1. Open any tax invoice
2. Click the **"E-Way Bill"** button (only visible when tax is enabled)
3. Fill in the transport details:
   - **Transport Mode**: Road, Rail, Air, or Ship
   - **Approx. Distance**: Distance in kilometers
   - **Vehicle Number**: Optional but recommended
   - **Transporter ID**: Transporter's GSTIN (optional)
4. Click **Generate E-Way Bill Document**

### What You Get

The system generates a comprehensive E-Way Bill data sheet containing:

1. **Invoice Details**: Number, date, value, tax amounts
2. **Supplier Details**: Your company information with GSTIN
3. **Recipient Details**: Client information with GSTIN
4. **Transport Details**: Mode, distance, vehicle number
5. **Item Details**: HSN codes, descriptions, quantities, values
6. **Tax Breakdown**: Complete GST calculation details

### Important Notes About E-Way Bill

- ⚠️ This generates a **reference document only**
- You must still file the actual E-Way Bill on the official GST portal: **ewaybillgst.gov.in**
- Use this document as a reference when filing on the portal
- Keep this document for your records
- E-Way Bill is mandatory for:
  - Goods movement above ₹50,000
  - Both inter-state and intra-state (in some states)

## Tax Calculation Logic

### Intra-State Transaction (Same State)
- Company State Code = Client State Code
- Tax = CGST + SGST
- Example: 18% GST = 9% CGST + 9% SGST

### Inter-State Transaction (Different States)
- Company State Code ≠ Client State Code
- Tax = IGST only
- Example: 18% GST = 18% IGST

### Product-Specific Rates
- If product has custom GST rate, that rate is used
- Otherwise, default rates from settings are applied
- Tax breakdown shown separately for each rate

## Common GST Rates in India

- **0%**: Basic necessities (exempt)
- **5%**: Essential items
- **12%**: Standard items
- **18%**: Most goods and services
- **28%**: Luxury items

### HSN Codes Examples

- **7113**: Jewelry (Gold, Silver, etc.)
- **7117**: Imitation jewelry
- **6204**: Women's apparel
- **6203**: Men's apparel
- **8471**: Computers and electronics

## Tips for Accurate Tax Invoices

1. **Always fill GSTIN**: Both yours and your client's
2. **State codes must be accurate**: Critical for tax calculation
3. **HSN codes improve compliance**: Add them to all products
4. **Review before printing**: Check if CGST+SGST or IGST is applied
5. **Keep records**: Save all tax invoices and E-Way Bill documents

## Disabling Tax

If you don't need tax calculations:

1. Go to **Settings** → **Company Settings**
2. Uncheck **"Enable Tax/GST System"**
3. Save settings

When disabled:
- No tax calculations are performed
- Invoices work as before (simple totaling)
- E-Way Bill option is hidden
- All data is preserved (can be re-enabled anytime)

## Compliance Notes

This system helps you:
- ✅ Generate GST-compliant invoices
- ✅ Calculate CGST, SGST, and IGST correctly
- ✅ Prepare E-Way Bill data
- ✅ Maintain proper records

You must still:
- ⚠️ File GST returns on the GST portal
- ⚠️ Generate actual E-Way Bills on ewaybillgst.gov.in
- ⚠️ Maintain compliance with Indian tax laws
- ⚠️ Consult a tax professional for specific scenarios

## Support

For issues or questions about the tax system:
1. Check this guide first
2. Review your settings (company, GST rates, product HSN codes)
3. Ensure state codes are correctly entered for accurate calculations
4. Contact your administrator or tax consultant for compliance questions

## Version Information

- **Tax System Version**: 1.0.0
- **Compliance**: Indian GST Rules (as of 2024)
- **Features**: Automatic CGST/SGST/IGST calculation, E-Way Bill data generation
- **Templates**: Professional GST-compliant invoice templates
