# New Features Guide

## Overview of Changes

This update introduces several important improvements to the billing management system:

1. **Single Copy Printing**: Invoices now print in a single copy instead of duplicate (Original and Duplicate)
2. **Save to PDF**: Save invoices and reports as HTML/PDF files to local folders
3. **Custom Template Import**: Import your own invoice templates from HTML files

---

## 1. Single Copy Printing

### What Changed
- Previously, invoices printed 2 copies with watermarks (ORIGINAL and DUPLICATE)
- Now, invoices print as a single clean copy without watermarks
- This reduces paper waste and simplifies the printing process

### How to Use
1. Navigate to **Sales Invoice** section
2. Click **View** or **Print** on any invoice
3. Select your preferred template and size
4. Click **Print** to print a single copy

---

## 2. Save to PDF Feature

### What's New
Invoices and reports can now be saved as HTML files (which can be opened and printed as PDFs) to organized folders on your computer.

### Folder Structure
- **Invoices**: Saved to `invoice` folder in the application data directory
- **Reports**: Saved to `reports` folder in the application data directory

### Location
Files are saved to your user data directory:
- Windows: `%APPDATA%\billing-management-system\`
- Linux: `~/.config/billing-management-system/`
- macOS: `~/Library/Application Support/billing-management-system/`

### How to Save Invoices
1. Open any invoice for viewing
2. Select your preferred template and size
3. Click **Save as PDF** button (green button)
4. The invoice will be saved automatically to the `invoice` folder
5. A confirmation message will show the file location

### How to Save Reports
All report types support PDF saving:
- Sales Ledger
- Purchase Ledger
- Payment Report
- Account Ledger

**Steps:**
1. Generate the report by selecting filters and clicking "Generate Report"
2. Review the generated report
3. Click **Save as PDF** button (green button)
4. The report will be saved to the `reports` folder
5. You'll see a confirmation with the file path

---

## 3. Custom Template Import

### Prerequisites
⚠️ **Important**: The template import feature is **only available in the desktop application**. It will not work if running the app in a web browser.

### What's New
You can now import your own custom invoice templates to personalize the look of your invoices.

### Template Format
- Templates must be in HTML format (`.html` or `.htm`)
- Use the provided `custom-invoice-template-example.html` as a reference
- Templates can include custom CSS styling

### Template Variables
Use these placeholders in your custom template. They will be replaced with actual data:
- `{{COMPANY_NAME}}` - Your company name
- `{{COMPANY_ADDRESS}}` - Company address
- `{{COMPANY_PHONE}}` - Company phone number
- `{{COMPANY_EMAIL}}` - Company email
- `{{CLIENT_NAME}}` - Client name
- `{{CLIENT_ADDRESS}}` - Client address
- `{{CLIENT_CONTACT}}` - Client contact
- `{{INVOICE_NO}}` - Invoice number
- `{{INVOICE_DATE}}` - Invoice date
- `{{INVOICE_ITEMS}}` - Table rows with invoice items
- `{{SUBTOTAL}}` - Subtotal amount
- `{{TAX_AMOUNT}}` - Tax amount
- `{{TOTAL}}` - Total amount

### How to Import a Template
1. Go to **Settings** → **Invoice & Report Templates**
2. Scroll to the **Custom Templates** section
3. Click **Import Custom Template**
4. Select your HTML template file
5. The template will be imported and saved
6. You'll receive a confirmation message

### Notes
- Custom templates are stored in the application settings
- The import feature is only available in the desktop application
- Ensure your template follows the structure of the example template for best results

---

## Technical Details

### File Saving
- Files are saved as HTML with embedded CSS
- HTML files can be opened in any browser
- Use your browser's "Print to PDF" function to convert to PDF if needed
- Files are organized by type (invoice/reports) in separate folders

### Print Dialog
- Print dialogs now open with the single copy ready to print
- After printing or canceling, the print window automatically closes
- All existing template options (Modern, Classic, Professional, Minimal, Compact) are still available

### Security
- IPC (Inter-Process Communication) is used for secure file operations
- Context isolation is maintained for security
- File operations are sandboxed to the user data directory

---

## Troubleshooting

### "File saving is only available in the desktop application" Error
- This feature requires the Electron desktop app
- If running in a web browser, this feature won't work
- Download and install the desktop version

### Cannot Find Saved Files
Check the user data directory for your operating system:
```
Windows: %APPDATA%\billing-management-system\invoice\
         %APPDATA%\billing-management-system\reports\

Linux:   ~/.config/billing-management-system/invoice/
         ~/.config/billing-management-system/reports/

macOS:   ~/Library/Application Support/billing-management-system/invoice/
         ~/Library/Application Support/billing-management-system/reports/
```

### Template Import Not Working
- Ensure the file has `.html` or `.htm` extension
- Check that the file contains valid HTML
- Try using the example template (`custom-invoice-template-example.html`) as a starting point

---

## Example Workflow

### Saving an Invoice
1. Create or select an invoice from **Sales Invoice**
2. Click **View** button
3. Choose template: "Modern Template"
4. Choose size: "A5 Size"
5. Review the preview
6. Click **Save as PDF**
7. Check the success message for file location
8. Navigate to the folder to verify the file

### Generating and Saving a Report
1. Go to **Reports** → **Sales Ledger**
2. Select client (or leave as "All Clients")
3. Choose date range
4. Click **Generate Report**
5. Review the data
6. Click **Save as PDF**
7. File is saved to the reports folder

---

## Benefits

1. **Environmental**: Reduces paper usage by eliminating duplicate copies
2. **Organization**: Automatic folder organization for invoices and reports
3. **Flexibility**: Import custom templates to match your brand
4. **Efficiency**: Quick save to PDF without manual printing
5. **Record Keeping**: Easy archival of all invoices and reports

---

## Support

For additional help or to report issues:
- Check the application settings
- Refer to the main README.md
- Contact support team

Last Updated: 2025-10-26
