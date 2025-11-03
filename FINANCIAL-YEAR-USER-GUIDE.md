# Financial Year Management - Quick User Guide

## Getting Started with Financial Year Management

### What is Financial Year Management?

Financial Year Management allows you to:
- Track business data across multiple financial years
- Carry forward client and vendor balances to new years
- Maintain historical records for compliance
- Close and archive old financial years

### First Time Setup

When you first use the system, a default financial year is automatically created based on the current date (April-March cycle for Indian fiscal year).

## How to Use

### View Current Financial Year

The current financial year is displayed in the sidebar below the company name:
```
Company Name
FY: 2024-2025
```

### Access Financial Year Settings

1. Click **Settings** in the sidebar
2. Click **Manage Financial Years** button
3. Financial Year Management window opens

### Create a New Financial Year

1. In Financial Year Management, click **Create New Financial Year**
2. Fill in the form:
   - **Name**: e.g., "2025-2026"
   - **Start Date**: e.g., April 1, 2025
   - **End Date**: e.g., March 31, 2026
   - **Make Current**: Check if you want to switch to this FY immediately
3. Click **Create**

### Edit Financial Year Dates

1. In Financial Year Management, click **Edit Current FY Dates**
2. Modify the start and/or end dates
3. Click **Update**

**Note**: Only the current financial year dates can be edited.

### Switch Between Financial Years

To view historical data:

1. In Financial Year Management, find the year you want to view
2. Click **Switch** button next to that year
3. The system will switch to that financial year
4. Dashboard and all reports now show data for that period

To switch back to current year:
1. Open Financial Year Management
2. Click **Switch** next to the current year

### Year-End Process (Annual Closing)

**Important**: This is typically done once per year at the end of your fiscal year.

#### When to Use
- End of fiscal year (e.g., March 31)
- Before starting new fiscal year
- When ready to carry forward balances

#### Steps

1. **Prepare**
   - Verify all transactions are entered
   - Review client and vendor balances
   - Check product opening stock

2. **Execute Year-End**
   - Go to Settings → Manage Financial Years
   - Click **Year-End Process**
   - Review the closing balances shown:
     - Client balances (what they owe you)
     - Vendor balances (what you owe them)
   
3. **Create New Year**
   - Enter new financial year name (e.g., "2025-2026")
   - Set start date (e.g., April 1, 2025)
   - Set end date (e.g., March 31, 2026)
   - Click **Process Year-End**

4. **What Happens**
   - Current year is closed (marked as completed)
   - Client balances → Opening balances for new year
   - Vendor balances → Opening balances for new year
   - Product data is retained
   - New financial year becomes current
   - You can now start fresh transactions

#### After Year-End
- Current FY is now the new year
- Old year is preserved and marked as "Closed"
- You can switch back to view historical data
- Opening balances are automatically set

### Delete a Financial Year

**Warning**: This permanently deletes all data for that period!

1. In Financial Year Management, find the year to delete
2. Click **Delete** button
3. Confirm the deletion

**Notes**:
- Cannot delete current financial year
- Cannot delete closed financial year
- All invoices, purchases, and payments in that period are deleted
- This action cannot be undone!

**When to Use**:
- Remove test data
- Clean up very old years (check compliance requirements first)
- Free up storage space

## Understanding Opening Balances

### Client & Vendor Opening Balances

**What are they?**
- Starting balance at the beginning of financial year
- Represents what was owed at the start

**How are they set?**
- **Manual Entry**: When adding new client/vendor
- **Year-End Process**: Automatically calculated and carried forward

**Example**:
```
Client ABC
FY 2024-2025 Opening Balance: ₹10,000
Total Invoices: ₹50,000
Total Payments Received: ₹45,000
Closing Balance: ₹15,000

After year-end process:
FY 2025-2026 Opening Balance: ₹15,000 (automatically set)
```

### Product Opening Stock

**What is it?**
- Quantity of product available at start of financial year
- Used for inventory tracking

**How to set?**
- When creating product: Enter in "Opening Stock" field
- When editing product: Update "Opening Stock" field
- During year-end: Manually update before closing year

## Tips & Best Practices

### Daily Use
- Always check which FY is current before entering transactions
- The FY name in sidebar shows which year you're working in

### Before Year-End
1. **Verify Balances**
   - Review client ledgers
   - Review vendor ledgers
   - Check for any outstanding invoices
   - Verify payment records

2. **Backup Data**
   - Go to Settings → Backup Data
   - Save the backup file safely
   - Keep backups for multiple years

3. **Physical Verification**
   - Count actual product stock
   - Update opening stock quantities
   - Reconcile with physical inventory

### After Year-End
- Verify opening balances are correct
- Check that new FY is active
- Test creating a new invoice in new FY
- Keep old FY for reference (don't delete)

### Data Organization
- Use consistent FY naming: "YYYY-YYYY" format
- Keep FY periods non-overlapping
- Don't create gaps between FYs

## Common Scenarios

### Scenario 1: Mid-Year Start
**Situation**: You start using the software mid-year

**Solution**:
1. Create FY with current dates (e.g., Oct 2024 - March 2025)
2. Enter opening balances manually
3. Next year-end will carry forward normally

### Scenario 2: Different Fiscal Year
**Situation**: Your company uses Jan-Dec fiscal year

**Solution**:
1. Create FY: "2024" with dates Jan 1 - Dec 31, 2024
2. Edit dates to match your fiscal year
3. Year-end process works the same

### Scenario 3: View Last Year's Data
**Situation**: Need to check last year's invoice

**Solution**:
1. Settings → Manage Financial Years
2. Click Switch next to last year
3. View the data you need
4. Switch back to current year

### Scenario 4: Wrong FY Created
**Situation**: Created FY with wrong dates

**Solution**:
- If not current: Delete it and recreate
- If current: Edit dates or switch to correct FY first, then delete wrong one

## Frequently Asked Questions

**Q: What happens to my old data when I create a new FY?**
A: Nothing is deleted. Old data is preserved and can be viewed by switching FYs.

**Q: Can I have multiple current financial years?**
A: No, only one FY can be current at a time. Current FY is where new transactions are entered.

**Q: Can I edit transactions from a closed FY?**
A: Technically yes, but not recommended. Better to create adjustments in current FY.

**Q: How do I know which FY I'm in?**
A: Check the sidebar - it shows "FY: YYYY-YYYY" below company name.

**Q: Can I undo year-end process?**
A: No, it's permanent. Always backup before year-end.

**Q: What if I forget to run year-end?**
A: You can run it anytime. Just make sure to review balances before processing.

**Q: Can I change opening balances?**
A: Yes, edit the client/vendor and update opening balance field.

**Q: What happens if I delete a FY?**
A: All transactions (invoices, purchases, payments) in that period are permanently deleted.

## Getting Help

If you encounter issues:
1. Check this guide first
2. Backup your data regularly
3. Contact support with specific details
4. Never delete data without backup

## Summary Checklist

### Monthly
- [ ] Enter all transactions
- [ ] Verify balances

### Year-End
- [ ] Verify all transactions entered
- [ ] Backup data
- [ ] Review closing balances
- [ ] Run year-end process
- [ ] Verify new FY is active
- [ ] Check opening balances

### As Needed
- [ ] Switch FY to view historical data
- [ ] Update product opening stock
- [ ] Edit FY dates if needed
- [ ] Create new FY if planning ahead
