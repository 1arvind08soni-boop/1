# GST/Tax System - Quick Reference

## Quick Setup (5 Steps)

### 1. Enable Tax for Company
**Settings → Company Settings**
- ✅ Check "Enable Tax/GST System"
- ✅ Enter GSTIN: `22AAAAA0000A1Z5` (example format)
- ✅ Enter State Code: `07` (for Delhi, for example)
- ✅ Enter State Name: `Delhi`
- ✅ Select Tax Invoice Template: `GST Professional Template`

### 2. Configure GST Rates
**Settings → Tax & GST Settings**
- CGST: `9` %
- SGST: `9` %  
- IGST: `18` %

### 3. Add HSN to Products
**Products → Add/Edit Product**
- HSN Code: `7113` (for jewelry)
- GST Rate: `18` (or leave empty for default)

### 4. Add State Info to Clients
**Clients → Add/Edit Client**
- GSTIN: `27AAAAA1234B1Z2` (if GST registered)
- State Code: `27` (for Maharashtra)
- State Name: `Maharashtra`

### 5. Generate Tax Invoice
- Create invoice normally
- Tax automatically calculated
- View/Print shows GST breakdown
- Click "E-Way Bill" for transport documents

---

## How It Works

### Tax Calculation
```
If Company State = Client State:
    → Intra-State → CGST (9%) + SGST (9%)
    
If Company State ≠ Client State:
    → Inter-State → IGST (18%)
```

### Invoice Elements

**GST Invoice Includes:**
- ✅ TAX INVOICE header
- ✅ Supplier GSTIN & details
- ✅ Recipient GSTIN & details  
- ✅ HSN codes per item
- ✅ Taxable value
- ✅ GST rate per item
- ✅ GST amount per item
- ✅ Tax breakdown table
- ✅ Grand total with tax

### E-Way Bill

**When to Generate:**
- Goods value > ₹50,000
- Transport across or within states

**What It Includes:**
- Invoice details
- Supplier & recipient info
- Transport mode & distance
- Vehicle number (optional)
- Item details with HSN
- Complete tax breakdown

**Important:** Still file on **ewaybillgst.gov.in**

---

## Common GST Rates

| Rate | Category | Examples |
|------|----------|----------|
| 0% | Exempt | Basic food items |
| 5% | Essential | Household necessities |
| 12% | Standard | Processed foods |
| 18% | Standard | Most goods/services |
| 28% | Luxury | Cars, AC, luxury items |

---

## Common HSN Codes

| HSN | Category |
|-----|----------|
| 7113 | Gold/Silver Jewelry |
| 7117 | Imitation Jewelry |
| 6203 | Men's Apparel |
| 6204 | Women's Apparel |
| 8471 | Computers |
| 8517 | Mobile Phones |

---

## Troubleshooting

### Wrong tax type (CGST+SGST vs IGST)?
→ Check state codes match for intra-state
→ Different state codes trigger inter-state

### Tax not calculating?
→ Enable tax in Company Settings
→ Check GSTIN is entered
→ Verify GST rates in settings

### No E-Way Bill button?
→ Tax must be enabled in Company Settings
→ Button only shows when tax is ON

### Missing HSN codes on invoice?
→ Add HSN codes to products
→ Leave blank if not applicable

---

## Template Selection

You can select different templates per company:

1. **GST Professional** (Recommended)
   - Full GST breakdown
   - Professional appearance
   - All compliance details

2. **GST Detailed**
   - Extra details
   - Verbose format

3. **GST Compact**
   - Space-saving
   - Essential info only

Change in: **Settings → Company Settings → Tax Invoice Template**

---

## Compliance Checklist

Before going live:

- [ ] GSTIN entered correctly
- [ ] State codes accurate
- [ ] HSN codes added to products
- [ ] GST rates configured
- [ ] Test invoices generated
- [ ] E-Way Bill tested
- [ ] Consult tax professional
- [ ] File returns on GST portal
- [ ] Keep backup of all documents

---

## Support Resources

- **GST Portal**: https://www.gst.gov.in/
- **E-Way Bill**: https://ewaybillgst.gov.in/
- **HSN Codes**: Search "HSN code finder" online
- **Tax Rates**: Consult your tax advisor
- **Help**: See GST-TAX-SYSTEM-GUIDE.md for detailed info

---

## Data Safety

**Your tax data is safe:**
- ✅ Stored locally on your computer
- ✅ Not sent to any external server
- ✅ Can be disabled anytime
- ✅ Preserved when disabled
- ✅ Included in backups

**To disable:**
Settings → Company Settings → Uncheck "Enable Tax/GST System"

---

## Version Info

- **Feature**: GST & Tax System
- **Version**: 1.0.0
- **Compliance**: Indian GST Rules (2024)
- **Templates**: Professional tax invoices
- **E-Way Bill**: Reference document generation
