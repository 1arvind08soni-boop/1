# Feature: Custom Invoice Numbers

## Problem Statement
Previously, when creating a new invoice, the invoice number was automatically generated and read-only. If a user deleted invoice #35 and wanted to recreate it with the same number, they could not do so.

## Solution
The invoice number field is now editable when creating new invoices. Users can:
- Accept the auto-generated next sequential invoice number
- Edit the invoice number to use any custom number they want
- Recreate deleted invoices with their original invoice numbers
- Fill gaps in the invoice sequence

## How It Works

### Creating a New Invoice
1. Click "New Invoice" button in the Sales Invoice screen
2. The invoice number field shows the next sequential number (e.g., INV-037)
3. **You can now edit this field** to enter any invoice number you want
4. If the invoice number already exists, an error message will be shown
5. If the invoice number is unique, the invoice will be created successfully

### Example Scenarios

#### Scenario 1: Normal Sequential Invoice
- Current invoices: INV-001, INV-002, INV-003, INV-004
- Next invoice number suggested: **INV-005**
- User accepts the suggestion
- ✓ Invoice INV-005 is created

#### Scenario 2: Recreating a Deleted Invoice
- Current invoices: INV-001, INV-002, INV-004 (INV-003 was deleted)
- Next invoice number suggested: **INV-005**
- User changes it to: **INV-003**
- ✓ Invoice INV-003 is created (recreated)

#### Scenario 3: Duplicate Invoice Number (Prevented)
- Current invoices: INV-001, INV-002, INV-003
- User tries to create invoice: **INV-002**
- ✗ Error: "Invoice number 'INV-002' already exists. Please use a different invoice number."

#### Scenario 4: Custom Invoice Format
- Current invoices: INV-001, INV-002, INV-003
- User wants to use a different format: **CUSTOM-2024-001**
- ✓ Invoice CUSTOM-2024-001 is created

## Technical Implementation

### Changes Made
1. **Invoice Number Field**: Changed from `readonly` to editable
2. **Validation**: Added duplicate invoice number checking
3. **User Guidance**: Added helper text explaining the field can be edited
4. **Error Handling**: Clear error messages when duplicate numbers are detected

### Code Changes
- Modified `showAddInvoiceModal()` - detailed invoice form
- Modified `showAddInvoiceModal()` - simplified invoice form  
- Modified `addInvoice()` - added duplicate validation
- Modified `addSimplifiedInvoice()` - added duplicate validation

### Validation Logic
```javascript
// Check for duplicate invoice number
const invoiceNo = formData.get('invoiceNo').trim();
if (!invoiceNo) {
    alert('Please enter an invoice number');
    return;
}

const duplicateInvoice = AppState.invoices.find(inv => inv.invoiceNo === invoiceNo);
if (duplicateInvoice) {
    alert(`Invoice number "${invoiceNo}" already exists. Please use a different invoice number.`);
    return;
}
```

## Benefits
- ✓ Flexibility to use any invoice numbering scheme
- ✓ Ability to recreate deleted invoices
- ✓ Fill gaps in invoice sequence
- ✓ Support for custom invoice number formats
- ✓ Protection against duplicate invoice numbers
- ✓ Maintains data integrity

## User Experience
The feature is designed to be intuitive:
- The next sequential number is pre-filled as a suggestion
- Users who want sequential numbers can simply accept the default
- Users who need custom numbers can easily edit the field
- Clear error messages guide users when issues occur
- Helper text explains the field is editable
