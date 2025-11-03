# Financial Year Management - Test Plan

## Manual Testing Guide

This document outlines how to manually test the financial year management features.

## Prerequisites
- Application installed and running
- At least one company created
- Sample data (clients, vendors, products) available

## Test Scenarios

### Test 1: View Default Financial Year
**Objective**: Verify default FY is created correctly

**Steps**:
1. Create a new company or open existing company
2. Check sidebar for FY display
3. Go to Settings → Manage Financial Years

**Expected Results**:
- Sidebar shows "FY: YYYY-YYYY" (based on current date)
- Financial Year Management modal shows one FY
- FY is marked as "Current"
- Dates follow April-March pattern (or current date-based)

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 2: Create New Financial Year
**Objective**: Create a custom financial year

**Steps**:
1. Settings → Manage Financial Years
2. Click "Create New Financial Year"
3. Enter name: "2025-2026"
4. Set start date: 2025-04-01
5. Set end date: 2026-03-31
6. Check "Make this the current financial year"
7. Click Create

**Expected Results**:
- New FY appears in list
- Marked as current (with green indicator)
- Previous FY no longer marked as current
- Sidebar updates to show "FY: 2025-2026"

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 3: Edit Financial Year Dates
**Objective**: Modify current FY date range

**Steps**:
1. Settings → Manage Financial Years
2. Click "Edit Current FY Dates"
3. Change start date to different date
4. Change end date to different date
5. Click Update

**Expected Results**:
- Dates are updated in FY list
- No errors occur
- Modal closes successfully

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 4: Switch Between Financial Years
**Objective**: View different FY data

**Steps**:
1. Create 2-3 financial years
2. Create invoices in different date ranges
3. Switch to FY 2024-2025
4. Check dashboard
5. Switch to FY 2023-2024
6. Check dashboard again

**Expected Results**:
- Sidebar updates to show selected FY
- Dashboard shows only data within FY date range
- Switching is smooth and immediate
- Data correctly filtered by date

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 5: Year-End Process - View Balances
**Objective**: Verify balance calculations

**Setup**:
1. Create clients with opening balances
2. Create some invoices
3. Record some payments

**Steps**:
1. Settings → Manage Financial Years
2. Click "Year-End Process"
3. Review closing balances shown

**Expected Results**:
- Client balances = Opening + Invoices - Payments
- Vendor balances = Opening + Purchases - Payments
- All calculations accurate
- Modal shows all clients and vendors

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 6: Year-End Process - Execute
**Objective**: Complete year-end closing

**Steps**:
1. Click "Year-End Process"
2. Enter new FY name: "2026-2027"
3. Set dates: 2026-04-01 to 2027-03-31
4. Click "Process Year-End"
5. Confirm action

**Expected Results**:
- Success message displayed
- Current FY is closed (shows "Closed on: [date]")
- New FY is created and marked as current
- Sidebar shows new FY
- Client/vendor opening balances updated
- Can still switch to view closed FY

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 7: Opening Balances Carry Forward
**Objective**: Verify balances carried forward correctly

**Setup**: After completing Test 6

**Steps**:
1. View client ledger before year-end
2. Note closing balance
3. After year-end, edit the client
4. Check opening balance field

**Expected Results**:
- New opening balance = Previous closing balance
- All clients updated
- All vendors updated
- Values match exactly

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 8: Product Opening Stock
**Objective**: Test opening stock field

**Steps**:
1. Products → Add New Product
2. Enter all required fields
3. Set "Opening Stock" to 100
4. Save product
5. Edit the same product
6. Check opening stock value

**Expected Results**:
- Opening stock saves correctly
- Field displays correct value when editing
- Field accepts decimal values
- Field defaults to 0 if empty

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 9: Delete Financial Year
**Objective**: Test FY deletion

**Setup**:
1. Create test FY with some invoices
2. Switch to different FY (so test FY is not current)

**Steps**:
1. Settings → Manage Financial Years
2. Find test FY
3. Click "Delete"
4. Confirm deletion
5. Check if invoices from that period are gone

**Expected Results**:
- Confirmation dialog appears
- FY is removed from list
- All transactions in that date range deleted
- Cannot delete current FY
- Cannot delete closed FY
- Warning message clearly states data will be deleted

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 10: Backup and Restore
**Objective**: Test data persistence

**Steps**:
1. Create multiple FYs with data
2. Settings → Backup Data
3. Save backup file
4. Delete one FY
5. Settings → Restore Data
6. Load the backup file
7. Confirm restore

**Expected Results**:
- Backup includes all FYs
- Restore recovers all FYs
- All data restored correctly
- Application reloads after restore

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 11: Backward Compatibility
**Objective**: Test old backup restoration

**Steps**:
1. Create a backup from old version (if available)
2. Restore it in new version
3. Check FY management

**Expected Results**:
- Old backup loads without errors
- Default FY created from old data
- All transactions preserved
- No data loss

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 12: Data Filtering by FY
**Objective**: Verify transactions filter correctly

**Steps**:
1. Create invoices with dates in FY 2024-2025
2. Create invoices with dates in FY 2025-2026
3. Switch to FY 2024-2025
4. View Sales Report
5. Switch to FY 2025-2026
6. View Sales Report again

**Expected Results**:
- Only invoices within FY date range shown
- Dashboard totals reflect only current FY
- Reports show correct filtered data
- No cross-FY data contamination

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 13: UI Consistency
**Objective**: Check UI updates consistently

**Steps**:
1. Switch between multiple FYs
2. Check sidebar display
3. Check dashboard values
4. Open Financial Year Management repeatedly

**Expected Results**:
- Sidebar always shows correct FY
- No stale data displayed
- UI updates immediately
- No visual glitches

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 14: Edge Cases
**Objective**: Test boundary conditions

**Test Cases**:

**A. Empty Data**
- New company with no data
- Year-end process should work
- Balances should be zero

**B. Same Dates**
- Create FY with same start and end date
- Should accept or reject appropriately

**C. Overlapping Dates**
- Create FY with overlapping dates
- System should allow (no validation)

**D. Very Long FY Names**
- Enter 100+ character name
- Should handle or limit appropriately

**E. Special Characters**
- Use special chars in FY name
- Should save and display correctly

**Expected Results**:
- System handles edge cases gracefully
- No crashes or errors
- Appropriate validations in place

**Status**: ⬜ Pass / ⬜ Fail

---

### Test 15: Multi-User Simulation
**Objective**: Test concurrent operations

**Steps**:
1. Open app in one window
2. Make backup
3. Open app in another window using backup
4. Create FY in first window
5. Create FY in second window
6. Close both
7. Reopen and check

**Expected Results**:
- Last write wins (expected behavior for localStorage)
- No corruption of data
- Application handles it gracefully

**Status**: ⬜ Pass / ⬜ Fail

---

## Performance Tests

### Test P1: Large Dataset
**Objective**: Test with large amounts of data

**Setup**:
- 10 financial years
- 100+ clients
- 100+ products
- 500+ invoices

**Steps**:
1. Load Financial Year Management
2. Switch between FYs
3. Run year-end process

**Expected Results**:
- UI remains responsive
- Operations complete in reasonable time (<5 seconds)
- No browser freezing

**Status**: ⬜ Pass / ⬜ Fail

---

### Test P2: Memory Leak
**Objective**: Check for memory issues

**Steps**:
1. Open browser dev tools
2. Switch FYs 20 times
3. Monitor memory usage
4. Open/close FY management 20 times

**Expected Results**:
- Memory usage stays stable
- No continuous memory growth
- No memory leaks

**Status**: ⬜ Pass / ⬜ Fail

---

## Security Tests

### Test S1: Data Isolation
**Objective**: Verify FYs don't leak data

**Steps**:
1. Create invoice in FY 2024-2025
2. Switch to FY 2025-2026
3. Try to view/edit the invoice

**Expected Results**:
- Invoice not visible in different FY
- Cannot access cross-FY data
- Proper data isolation

**Status**: ⬜ Pass / ⬜ Fail

---

### Test S2: Input Validation
**Objective**: Test for XSS and injection

**Steps**:
1. Enter `<script>alert('XSS')</script>` as FY name
2. Enter SQL injection strings
3. Enter very long strings
4. Enter special characters

**Expected Results**:
- No script execution
- Data properly escaped
- Input sanitized
- No security vulnerabilities

**Status**: ⬜ Pass / ⬜ Fail

---

## Regression Tests

### Test R1: Existing Features
**Objective**: Ensure old features still work

**Features to Test**:
- [ ] Create invoice (detailed mode)
- [ ] Create invoice (simple mode)
- [ ] Add client
- [ ] Add vendor
- [ ] Add product
- [ ] Record payment
- [ ] Generate reports
- [ ] Export to CSV
- [ ] Print invoice
- [ ] Company switching

**Expected Results**:
- All features work as before
- No functionality broken
- Data saves correctly

**Status**: ⬜ Pass / ⬜ Fail

---

## Test Summary

**Total Tests**: 15 + Performance + Security + Regression
**Tests Passed**: ___
**Tests Failed**: ___
**Tests Skipped**: ___
**Critical Issues**: ___
**Minor Issues**: ___

## Issue Log

| Test # | Issue Description | Severity | Status |
|--------|------------------|----------|--------|
|        |                  |          |        |
|        |                  |          |        |

## Sign-off

**Tested By**: _______________
**Date**: _______________
**Version**: 1.0.0
**Status**: ⬜ Approved / ⬜ Needs Fixes

## Notes

Additional observations and comments:
