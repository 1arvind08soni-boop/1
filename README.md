# Billing & Account Management System

A comprehensive desktop application for Windows that helps manage billing, invoicing, clients, vendors, products, and accounts with secure multi-user authentication.

## Features

- **🆕 Multi-User Management**: Secure authentication with role-based access control (Admin, Manager, Staff)
- **Multi-Company Support**: Manage multiple companies with separate data and user access
- **Financial Year Management**: Track multiple financial years, carry forward balances, and maintain historical data
- **Product Management**: Track products with categories, pricing, opening stock, and client-specific pricing
- **Client & Vendor Management**: Maintain client and vendor databases with ledgers and opening balances
- **Sales Invoicing**: Create and manage sales invoices with detailed line items
- **Purchase Management**: Track purchases from vendors
- **Payment Tracking**: Record receipts and payments
- **Reports & Ledgers**: Generate sales, purchase, payment, and account ledgers
- **Year-End Process**: Automated closing of financial years with balance carry forward
- **Data Export**: Export data to CSV/Excel format
- **Backup & Restore**: Backup and restore company data with full financial year support
- **Auto-Backup**: Automatic backups with configurable schedules (daily/weekly) and backup-on-close option

## New: Multi-User Authentication System

The application now includes a comprehensive user management system:

- **Secure Login**: Username and password authentication with encrypted password storage
- **Role-Based Access Control**: Three user roles with different permission levels
  - **Admin/Manager**: Full system access including user management, settings, and all operations
  - **Staff**: Limited access for basic billing operations and view-only reports
- **User Management**: Admins can add, edit, disable/enable users and change passwords
- **Company Isolation**: Each user can only access their assigned company's data
- **Default Credentials**: New companies get a default admin user (username: `admin`, password: `admin123`)

📖 **Documentation**: See [Roles and Permissions Matrix](ROLES-AND-PERMISSIONS.md) for complete permission details

### User Roles and Permissions

| Feature | Admin/Manager | Staff |
|---------|:-------------:|:-----:|
| Create Invoices | ✓ | ✓ |
| View/Print Invoices | ✓ | ✓ |
| Edit/Delete Invoices | ✓ | ✗ |
| Manage Products/Clients/Vendors | ✓ | ✗ (View Only) |
| Manage Purchases/Payments | ✓ | ✗ |
| View Reports | ✓ | ✓ (View Only) |
| User Management | ✓ | ✗ |
| System Settings | ✓ | ✗ |

## New: Auto-Backup Feature

The application now includes intelligent automatic backup capabilities:

- **Company-Specific Backups**: Each backup contains only the selected company's data
- **Flexible Scheduling**: Choose daily, weekly, or manual backup frequency
- **Backup on Close**: Automatically create backups when closing the application
- **Automatic Storage**: Backups saved directly to your Downloads folder
- **Smart Timing**: Backups trigger based on your schedule when data changes

📖 **Documentation**: See [Auto-Backup Guide](AUTO-BACKUP-GUIDE.md) for complete setup and usage instructions

## Financial Year Management

The application supports comprehensive financial year management:

- **Create Multiple Financial Years**: Define custom start and end dates for each financial year
- **Year-End Processing**: Automated closing with balance carry forward for clients and vendors
- **Historical Data**: View and manage data from previous financial years
- **Opening Balances**: Track opening balances for clients, vendors, and product stock
- **Data Segregation**: Transactions automatically filtered by financial year dates
- **Compliance Ready**: Maintain historical records for auditing and compliance

📖 **Documentation**: See [Financial Year Management Guide](FINANCIAL-YEAR-MANAGEMENT.md) for detailed information
📖 **Quick Guide**: See [Financial Year User Guide](FINANCIAL-YEAR-USER-GUIDE.md) for step-by-step instructions

## Getting Started

### First Time Setup
1. Install and launch the application
2. Create a new company or login with default credentials
3. Default admin credentials: 
   - Username: `admin`
   - Password: `admin123`
4. **Important**: Change the default password immediately after first login
5. Add additional users as needed (recommended 2-3 staff users per company)

### Creating Additional Users
1. Login as Admin/Manager
2. Navigate to Settings → User Management
3. Click "Add User" and fill in the details
4. Assign appropriate role (Admin, Manager, or Staff)
5. Set a secure password (minimum 6 characters)

## Windows Installation

### For End Users:
1. Download the latest release installer (.exe file) from the [Releases](../../releases) page
2. Run the installer
3. Follow the installation wizard
4. Launch "Billing & Account Management" from your Start Menu or Desktop

### For Developers:

#### Prerequisites:
- Node.js (v14 or higher) - Download from [nodejs.org](https://nodejs.org/)
- npm (comes with Node.js)
- Git (optional, for cloning the repository)

#### Setup Instructions:

1. **Clone or Download the Repository**
   ```bash
   git clone https://github.com/soniarvind08-glitch/FINAL.git
   cd FINAL
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run in Development Mode**
   ```bash
   npm start
   ```
   This will launch the application in development mode.

4. **Build Windows Installer**
   ```bash
   npm run build
   ```
   This will create a Windows installer in the `dist` folder.
   - The installer will be named something like: `Billing & Account Management Setup 1.0.0.exe`

5. **Build Unpacked (for testing)**
   ```bash
   npm run build:dir
   ```
   This creates an unpacked version in `dist/win-unpacked` for testing without installation.

## Build Output

After running `npm run build`, you'll find in the `dist` folder:
- **`Billing & Account Management Setup 1.0.0.exe`** - The installer for distribution
- This is a standard Windows installer (NSIS) that:
  - Allows users to choose installation directory
  - Creates desktop and start menu shortcuts
  - Includes an uninstaller
  - Works on Windows 7, 8, 10, and 11 (64-bit)

## Application Icons

The application uses icon files for branding. To customize:
1. Create a 256x256 PNG image (icon.png)
2. Convert to ICO format (icon.ico)
3. See `ICONS-README.md` for detailed instructions

## Data Storage

- All data is stored locally using browser's localStorage
- Each company's data is isolated and stored separately
- Data persists between application restarts
- Use the built-in backup/restore feature to save your data

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Desktop Framework**: Electron
- **Packaging**: electron-builder
- **Data Storage**: LocalStorage (browser-based)

## Development Scripts

- `npm start` - Run the application in development mode
- `npm run build` - Build Windows installer (.exe)
- `npm run build:dir` - Build unpacked application for testing
- `npm run dist` - Build for all configured platforms

## Troubleshooting

### Application won't start:
- Make sure you have the latest version installed
- Try running as administrator
- Check Windows Event Viewer for errors

### Data not saving:
- The application uses localStorage - ensure you have disk space
- Use the backup feature regularly to prevent data loss

### Build errors:
- Make sure Node.js v14+ is installed
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Ensure you have write permissions in the project directory

## Distribution

To distribute your application:
1. Run `npm run build`
2. Find the installer in the `dist` folder
3. Share the `.exe` file with users
4. Users can install it like any other Windows application

## License

This project is licensed under the ISC License - see LICENSE.txt for details.

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: [Your support email/contact]

## Version History

- **v1.0.0** - Initial release
  - Complete billing and accounting features
  - Windows desktop application
  - Multi-company support
  - Export and backup functionality