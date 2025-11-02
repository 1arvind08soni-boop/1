# Quick Test Guide - Account Ledger Verification

## Quick Testing Steps (10 Minutes)

### Step 1: Create Company & Setup (2 min)
1. Launch application
2. Create company: "Test Company ABC"
3. Click "Add New Company"

### Step 2: Add Clients with Opening Balance (2 min)
1. Go to **Clients** tab
2. Add Client 1:
   - Code: CL001
   - Name: Test Client A
   - Opening Balance: 10000
3. Add Client 2:
   - Code: CL002
   - Name: Test Client B
   - Opening Balance: 5000

### Step 3: January 2024 Transactions (3 min)

#### Create Invoices:
1. Go to **Sales Invoice** tab
2. Create Invoice 1:
   - Date: 2024-01-05
   - Client: Test Client A
   - Amount: 15000 (use simplified invoice if detailed invoicing is disabled)
3. Create Invoice 2:
   - Date: 2024-01-15
   - Client: Test Client B
   - Amount: 12000

#### Record Receipts:
1. Go to **Payments** tab
2. Add Receipt 1:
   - Type: Receipt
   - Date: 2024-01-20
   - Client: Test Client A
   - Amount: 12000
   - Method: Cash
3. Add Receipt 2:
   - Type: Receipt
   - Date: 2024-01-25
   - Client: Test Client B
   - Amount: 10000
   - Method: Bank

### Step 4: Generate January Ledger (1 min)
1. Go to **Reports** > **Account Ledger**
2. Select:
   - Account Type: Client
   - Account: Test Client A
   - Filter: Current Month (or Custom: 2024-01-01 to 2024-01-31)
3. Click "Generate Ledger"

#### Expected Results for Client A (January):
- Opening Balance: ₹10,000.00
- Invoice (Jan 5): ₹15,000.00 (Debit)
- Receipt (Jan 20): ₹12,000.00 (Credit)
- **Closing Balance: ₹13,000.00**

### Step 5: February 2024 Transactions (1 min)

#### Create Invoice:
1. Go to **Sales Invoice**
2. Create Invoice 3:
   - Date: 2024-02-10
   - Client: Test Client A
   - Amount: 18000

#### Record Receipt:
1. Go to **Payments**
2. Add Receipt 3:
   - Type: Receipt
   - Date: 2024-02-20
   - Client: Test Client A
   - Amount: 20000
   - Method: Bank

### Step 6: Generate February Ledger (1 min)
1. Go to **Reports** > **Account Ledger**
2. Select:
   - Account Type: Client
   - Account: Test Client A
   - Date Filter: Custom
   - From Date: 2024-02-01
   - To Date: 2024-02-29
3. Click "Generate Ledger"

#### Expected Results for Client A (February):
- **Opening Balance: ₹13,000.00** ← Should match January closing!
- Invoice (Feb 10): ₹18,000.00 (Debit)
- Receipt (Feb 20): ₹20,000.00 (Credit)
- **Closing Balance: ₹11,000.00**

### Step 7: Verify with Trial Balance
1. Go to **Reports** > **Trial Balance**
2. As On Date: 2024-02-29
3. Click "Generate Trial Balance"

#### Expected Results:
- Test Client A: ₹11,000.00 Dr.
- Test Client B: ₹7,000.00 Dr. (if transactions added)
- Sales: ₹45,000.00 Cr.
- Cash: Amount Dr.
- Bank: Amount Dr.
- **Status: ✓ Trial Balance is balanced!**

### Step 8: Check Transaction Journal
1. Go to **Reports** > **Transaction Journal**
2. Select date range: 2024-01-01 to 2024-02-29
3. Click "Generate Journal"

#### Should Show:
- All invoices with Debit to Client, Credit to Sales
- All receipts with Debit to Cash/Bank, Credit to Client
- Chronological order
- All amounts matched

---

## Verification Checklist

- [ ] January closing balance = February opening balance
- [ ] All transactions appear in correct month
- [ ] Trial balance is balanced (debits = credits)
- [ ] Transaction journal shows all entries
- [ ] Summary section shows correct net change
- [ ] Opening balance calculated correctly for February
- [ ] Closing balance highlighted in ledger
- [ ] No missing transactions

---

## Success Criteria

✅ **PASS**: February opening balance exactly matches January closing balance
✅ **PASS**: Trial balance shows "✓ Trial Balance is balanced!"
✅ **PASS**: All transactions appear in journal with proper Dr./Cr.
✅ **PASS**: Ledger shows clear opening and closing balances
✅ **PASS**: Period totals are accurate

---

## Quick Calculation Verification

### Client A Balance Calculation:

**January:**
```
Opening:        10,000
+ Invoice:      15,000
- Receipt:      12,000
= Closing:      13,000
```

**February:**
```
Opening:        13,000  ← From Jan closing
+ Invoice:      18,000
- Receipt:      20,000
= Closing:      11,000
```

**Combined (Jan 1 to Feb 29):**
```
Opening:        10,000
+ Invoices:     33,000
- Receipts:     32,000
= Final:        11,000
```

---

## Common Test Scenarios

### Scenario 1: Month-End to Month-Start
- Generate ledger for Jan 25 to Feb 5
- Verify opening balance includes all transactions before Jan 25
- Verify transactions appear in correct order

### Scenario 2: Quarterly Report
- Generate ledger for entire quarter (Jan 1 to Mar 31)
- Verify opening balance is from the very beginning
- Verify closing balance is cumulative

### Scenario 3: Multiple Accounts
- Create transactions for multiple clients
- Generate individual ledgers
- Sum all client balances
- Verify total matches Sales - Total Receipts

---

## What to Look For

### In Account Ledger:
1. **Opening Balance Row** (Blue background)
   - Clearly labeled
   - Shows correct calculated amount
   
2. **Transaction Rows**
   - Chronological order
   - Correct debit/credit columns
   - Running balance updates correctly

3. **Closing Balance Row** (Yellow background)
   - Clearly labeled
   - Matches opening + debits - credits

4. **Summary Section**
   - Shows period totals
   - Shows net change
   - Explains balance carry-forward

### In Trial Balance:
1. All accounts listed
2. Correct account types
3. Debit/Credit in correct columns
4. Totals are equal
5. Balance status shows ✓

### In Transaction Journal:
1. All transactions present
2. Chronological order
3. Proper Dr./Cr. notation
4. Double entry for each transaction
5. Account names clear

---

## Print Testing

1. Generate each report
2. Click "Print" button
3. Verify print preview shows:
   - Professional formatting
   - All data visible
   - Proper page breaks
   - Company name/period shown

---

## Quick Reference: Expected Balances

If you follow the exact test data above:

| Account | Jan 31 Closing | Feb 1 Opening | Feb 29 Closing |
|---------|---------------|---------------|----------------|
| Client A | ₹13,000 | ₹13,000 | ₹11,000 |
| Client B | ₹7,000 | ₹7,000 | ₹7,000 |

**Key Test**: Feb 1 Opening MUST equal Jan 31 Closing for same account!
