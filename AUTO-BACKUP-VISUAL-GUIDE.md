# Auto-Backup Feature - Visual Guide

## Feature Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    BILLING MANAGEMENT APP                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Company A │    │  Company B   │    │  Company C    │  │
│  │   (Data)   │    │   (Data)     │    │   (Data)      │  │
│  └─────┬──────┘    └──────────────┘    └───────────────┘  │
│        │                                                     │
│        │ Selected Company                                   │
│        ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         AUTO-BACKUP FEATURE                         │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Settings                                    │  │   │
│  │  │  • Enabled: ☑                                │  │   │
│  │  │  • Frequency: Daily / Weekly / Manual        │  │   │
│  │  │  • Backup on Close: ☑                        │  │   │
│  │  │  • Last Backup: 2025-11-11 10:30 AM          │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │  Triggers:                                           │   │
│  │  1. When data is saved (if schedule is due)         │   │
│  │  2. When application closes (if enabled)            │   │
│  │                                                      │   │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                             │
│               ▼                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │     Downloads Folder                                │   │
│  │                                                      │   │
│  │  📄 backup_Company_A_2025-11-10.json                │   │
│  │  📄 backup_Company_A_2025-11-11.json                │   │
│  │  📄 backup_Company_A_2025-11-12.json                │   │
│  │                                                      │   │
│  │  ✓ Only contains Company A data                     │   │
│  │  ✓ Automatic - no prompts                           │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## User Journey Flow

### Setup Flow
```
1. User opens app
   │
   ▼
2. Select Company → Company A selected
   │
   ▼
3. Click Settings ⚙️
   │
   ▼
4. Click "Auto-Backup Settings" button
   │
   ▼
5. Settings Dialog opens
   │
   ├─→ Check "Enable Auto-Backup"
   ├─→ Select "Daily" frequency
   ├─→ Check "Backup on Application Close"
   │
   ▼
6. Click "Save Settings"
   │
   ▼
7. ✓ Auto-backup configured!
```

### Daily Usage Flow
```
Morning:
  User opens app → Works normally → Adds invoices, products, etc.
                                    │
                                    ▼
                                    Data saved
                                    │
                                    ▼
                                    Auto-backup checks:
                                    "Was last backup > 24 hours ago?"
                                    │
                                    ├─→ NO: Continue working
                                    │
                                    └─→ YES: Create backup automatically!
                                           └─→ Saved to Downloads/backup_CompanyA_2025-11-11.json
                                               │
                                               ▼
                                               Last backup date updated
                                               │
                                               ▼
                                               User continues working (no interruption)

Evening:
  User clicks Exit / Alt+F4
  │
  ▼
  App closing event triggered
  │
  ▼
  Auto-backup checks: "Is backup on close enabled?"
  │
  ├─→ NO: App closes immediately
  │
  └─→ YES: Create backup!
         └─→ Saved to Downloads/backup_CompanyA_2025-11-11.json
             │
             ▼
             Wait 2 seconds
             │
             ▼
             App closes
```

## Settings Dialog Mockup

```
┌────────────────────────────────────────────────────────┐
│  Auto-Backup Settings                            [X]   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ☑ Enable Auto-Backup                                 │
│     Automatically backup company data based on         │
│     schedule                                           │
│                                                        │
│  Backup Frequency *                                    │
│  ┌──────────────────────────────┐                     │
│  │  Daily                    ▼  │                     │
│  └──────────────────────────────┘                     │
│     How often should automatic backups be performed    │
│                                                        │
│  ☑ Backup on Application Close                        │
│     Create a backup when closing the application       │
│                                                        │
│  Last Backup                                           │
│  ┌──────────────────────────────┐                     │
│  │ 11/11/2025, 10:30:45 AM      │ [readonly]          │
│  └──────────────────────────────┘                     │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │ ℹ️ Note:                                         │   │
│  │ • Backups are saved to your Downloads folder    │   │
│  │ • Each backup is specific to the current company│   │
│  │ • Daily backups run once per day on first change│   │
│  │ • Weekly backups run once per week on first     │   │
│  │   change                                        │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│             [Save Settings]  [Cancel]                  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Settings Screen Location

```
Main Application Window:
┌────────────────────────────────────────────────┐
│  Billing & Account Management                  │
├─────────┬──────────────────────────────────────┤
│         │                                       │
│  📊 Dashboard                                   │
│  📄 Invoices                                    │
│  📦 Products                                    │
│  👤 Clients                                     │
│  🏢 Vendors                                     │
│  💰 Payments                                    │
│  📈 Reports                                     │
│  ⚙️ Settings  ← Click here                      │
│         │                                       │
└─────────┴───────────────────────────────────────┘
                ▼
    Settings Page Opens:
┌────────────────────────────────────────────────┐
│  Settings                                      │
├────────────────────────────────────────────────┤
│                                                │
│  Company Settings                              │
│  [Edit Company Info]                           │
│                                                │
│  Invoice & Report Templates                    │
│  [Configure Templates]                         │
│                                                │
│  Financial Year                                │
│  [Manage Financial Years]                      │
│                                                │
│  Data Management                               │
│  [Backup Data]                                 │
│  [Restore Data]                                │
│  [Auto-Backup Settings]  ← Click here          │
│                                                │
└────────────────────────────────────────────────┘
```

## Backup Schedule Visualization

### Daily Backup Schedule
```
Timeline (24-hour period):

Day 1:
├─ 09:00 - Last backup created
│
Day 2:
├─ 08:00 - User adds invoice → Auto-backup checks → Not yet 24 hours → No backup
├─ 09:30 - User adds product → Auto-backup checks → More than 24 hours → ✓ BACKUP CREATED
├─ 10:00 - User adds client  → Auto-backup checks → Last backup was 30 min ago → No backup
├─ 11:00 - User adds invoice → Auto-backup checks → Last backup was 1.5 hrs ago → No backup
└─ 17:00 - User closes app   → Backup on close is enabled → ✓ BACKUP CREATED

Day 3:
├─ 09:00 - User adds invoice → Auto-backup checks → More than 24 hours → ✓ BACKUP CREATED
```

### Weekly Backup Schedule
```
Timeline (7-day period):

Week 1, Monday:
├─ Last backup created

Week 1, Tuesday-Sunday:
├─ User works normally
├─ Auto-backup checks on each save
└─ But not 7 days yet → No scheduled backup
   (But backup on close still happens if enabled)

Week 2, Monday:
├─ User adds invoice
├─ Auto-backup checks → More than 7 days → ✓ BACKUP CREATED
└─ Next scheduled backup will be in another 7 days
```

## File Structure in Downloads Folder

```
C:\Users\YourName\Downloads\
│
├─ backup_MyCompany_2025-11-04.json     (7 days ago)
├─ backup_MyCompany_2025-11-05.json     (6 days ago)
├─ backup_MyCompany_2025-11-06.json     (5 days ago)
├─ backup_MyCompany_2025-11-07.json     (4 days ago)
├─ backup_MyCompany_2025-11-08.json     (3 days ago)
├─ backup_MyCompany_2025-11-09.json     (2 days ago)
├─ backup_MyCompany_2025-11-10.json     (yesterday)
└─ backup_MyCompany_2025-11-11.json     (today) ← Latest

Each file contains:
├─ Company info (name, address, GSTIN, etc.)
├─ All products
├─ All clients with balances
├─ All vendors with balances
├─ All invoices
├─ All purchases
├─ All payments
├─ All financial years
└─ Export timestamp
```

## Feature Comparison

### Before Auto-Backup Feature
```
User Workflow:
1. Work in the app
2. Remember to backup (❌ Often forgotten!)
3. Click Settings → Backup Data
4. Choose save location
5. Save file manually
6. Repeat regularly (if remembered)

Problems:
✗ Easy to forget
✗ Manual process
✗ Time consuming
✗ Risk of data loss
```

### After Auto-Backup Feature
```
User Workflow:
1. Configure once (one-time setup)
2. Work in the app normally
3. Backups happen automatically ✓
4. Close app - backup created automatically ✓

Benefits:
✓ Never forget to backup
✓ Fully automatic
✓ No time wasted
✓ Data always protected
✓ Multiple backup copies
✓ Peace of mind
```

## Key Concepts

### Company-Specific Backups
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Company A  │     │  Company B  │     │  Company C  │
│             │     │             │     │             │
│  Products   │     │  Products   │     │  Products   │
│  Clients    │     │  Clients    │     │  Clients    │
│  Invoices   │     │  Invoices   │     │  Invoices   │
└──────┬──────┘     └─────────────┘     └─────────────┘
       │
       │ When backing up Company A
       ▼
┌─────────────────────────────────┐
│  backup_Company_A_2025-11-11.json│
│                                  │
│  ✓ ONLY Company A data           │
│  ✓ All Company A products        │
│  ✓ All Company A clients         │
│  ✓ All Company A invoices        │
│                                  │
│  ✗ NO Company B data             │
│  ✗ NO Company C data             │
└──────────────────────────────────┘
```

### Smart Backup Timing
```
Scheduled Backups (Daily/Weekly):
┌────────────────────────────────────────┐
│  Trigger Condition:                    │
│  1. Auto-backup is enabled             │
│  2. Frequency is not "Manual"          │
│  3. Time since last backup ≥ threshold │
│  4. User saves data (any change)       │
│                                        │
│  Result: Backup created automatically  │
└────────────────────────────────────────┘

Backup on Close:
┌────────────────────────────────────────┐
│  Trigger Condition:                    │
│  1. Auto-backup is enabled             │
│  2. "Backup on Close" is checked       │
│  3. User closes the application        │
│                                        │
│  Result: Backup created before exit    │
└────────────────────────────────────────┘
```

## Configuration Options Summary

```
┌─────────────────────────────────────────────────────────┐
│  Configuration Option        │  Effect                  │
├──────────────────────────────┼─────────────────────────┤
│  Enable: ☐                   │  No automatic backups    │
│  Enable: ☑                   │  Automatic backups on    │
├──────────────────────────────┼─────────────────────────┤
│  Frequency: Daily            │  Backup every 24 hours   │
│  Frequency: Weekly           │  Backup every 7 days     │
│  Frequency: Manual           │  No scheduled backups    │
├──────────────────────────────┼─────────────────────────┤
│  Backup on Close: ☐          │  No backup on exit       │
│  Backup on Close: ☑          │  Backup created on exit  │
└──────────────────────────────┴─────────────────────────┘
```

## Success Indicators

### How to Know It's Working
```
1. Check Settings:
   • Open Auto-Backup Settings
   • Look at "Last Backup" field
   • Should show recent date/time ✓

2. Check Downloads Folder:
   • Navigate to C:\Users\[You]\Downloads
   • Look for backup_*.json files
   • Check file dates are recent ✓

3. Test It:
   • Make a change (add product/client)
   • Wait for appropriate time (24hr/7days)
   • Make another change
   • Check Downloads for new backup ✓

4. Close App Test:
   • Enable "Backup on Close"
   • Close the application
   • Check Downloads for new backup ✓
```

---

This visual guide helps users understand how the auto-backup feature works at a glance!
