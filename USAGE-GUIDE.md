# User Guide: Creating Invoices with Custom Numbers

## Overview
You can now create invoices with custom invoice numbers, including recreating deleted invoices with their original numbers.

## Step-by-Step Instructions

### Creating a Normal Invoice (Sequential Number)

1. Click on **Sales Invoice** in the sidebar
2. Click the **New Invoice** button
3. You'll see a form with the invoice number field showing the next number (e.g., "INV-037")
4. You can either:
   - Leave the number as is (recommended for normal flow)
   - OR edit it to any number you want
5. Fill in the rest of the invoice details (client, products, etc.)
6. Click **Create Invoice**

### Recreating a Deleted Invoice

Let's say you have invoices: INV-001, INV-002, INV-034, INV-036
Notice that INV-035 is missing (it was deleted).

To recreate INV-035:

1. Click on **Sales Invoice** in the sidebar
2. Click the **New Invoice** button
3. The invoice number field will show "INV-037" (the next sequential number)
4. **Edit the invoice number field** to "INV-035"
5. Fill in the rest of the invoice details
6. Click **Create Invoice**
7. ✓ Invoice INV-035 is now created!

### Using Custom Invoice Number Formats

You can use any invoice number format you prefer:

**Examples:**
- `INV-2024-001` (Year-based numbering)
- `CUSTOM-001` (Custom prefix)
- `2024/03/001` (Date-based format)
- `SALES-001` (Different prefix)

**Steps:**
1. Click the **New Invoice** button
2. Clear the suggested invoice number
3. Type your custom invoice number
4. Fill in the rest of the invoice details
5. Click **Create Invoice**

### What Happens if You Use a Duplicate Number?

If you try to create an invoice with a number that already exists:

1. Enter a duplicate invoice number (e.g., "INV-036" when it already exists)
2. Fill in the form and click **Create Invoice**
3. ❌ You'll see an error message: "Invoice number 'INV-036' already exists. Please use a different invoice number."
4. Edit the invoice number to a unique value
5. Try again

## Visual Indicators

### Before (Old Behavior)
```
Invoice Number: [INV-037] ← Read-only, cannot edit
```

### After (New Behavior)
```
Invoice Number: [INV-037] ← Editable, can change to any number
You can edit this to use a specific invoice number
```

## Tips and Best Practices

✓ **For Normal Operations**: Just accept the suggested number for sequential invoicing

✓ **For Deleted Invoices**: Edit the number to match the deleted invoice

✓ **For Custom Formats**: Change the entire format to match your needs

✓ **Check for Duplicates**: The system will prevent you from creating duplicate numbers

⚠️ **Be Careful**: Once an invoice is created, the invoice number cannot be modified to maintain audit integrity

## Common Scenarios

### Scenario 1: Sequential Invoicing
- **Goal**: Create invoices in order (INV-001, INV-002, INV-003, etc.)
- **Action**: Accept the suggested invoice number
- **Result**: Invoices are created sequentially

### Scenario 2: Filling Gaps
- **Goal**: You deleted INV-035 by mistake and want to recreate it
- **Action**: Change the suggested number to "INV-035"
- **Result**: The gap is filled, you now have INV-035 again

### Scenario 3: Custom Numbering
- **Goal**: Use a different invoice numbering scheme
- **Action**: Edit the invoice number to your preferred format
- **Result**: Your custom format is used

### Scenario 4: Year-Based Reset
- **Goal**: Reset invoice numbers each year (2024-001, 2024-002, etc.)
- **Action**: Edit the invoice number to include the year
- **Result**: Your year-based numbering is maintained

## Frequently Asked Questions

**Q: Will this affect my existing invoices?**
A: No, existing invoices are not affected. This only applies to new invoices.

**Q: Can I change the invoice number after creating it?**
A: No, the invoice number field is read-only when editing an invoice to maintain audit integrity.

**Q: What if I want to go back to automatic numbering?**
A: Just accept the suggested invoice number when creating new invoices.

**Q: Can I use any format for invoice numbers?**
A: Yes! You can use any text format. The only restriction is that it must be unique.

**Q: What happens if I enter spaces in the invoice number?**
A: Leading and trailing spaces are automatically trimmed. "  INV-037  " becomes "INV-037".

**Q: Is there a maximum length for invoice numbers?**
A: There is no hard limit, but keep it reasonable for printing and display purposes.

## Support

If you encounter any issues or have questions about this feature, please refer to:
- FEATURE-DEMO.md for technical details
- The main README.md for general application help
