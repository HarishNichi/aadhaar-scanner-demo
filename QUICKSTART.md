# Quick Start Guide - Aadhaar QR Reader

## Setup Instructions

### 1. Prerequisites
- Node.js 18 or higher
- npm (comes with Node.js)
- A modern web browser

### 2. Installation

The project has already been initialized with Next.js and all dependencies installed.

To verify everything is set up:
```bash
npm install
```

### 3. Run the Application

Start the development server:
```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### 4. How to Use

1. Visit http://localhost:3000 in your web browser
2. Paste the decimal representation of an Aadhaar Secure QR code in the textarea
3. Click the "Decode QR" button
4. The decoded information will appear below

### 5. Build for Production

To create an optimized production build:
```bash
npm run build
npm start
```

## Project Files

- **src/app/page.js** - Main landing page that imports AadhaarQRReader
- **src/components/AadhaarQRReader.jsx** - The QR decoder component
- **src/app/globals.css** - Global styles
- **package.json** - Project dependencies and scripts

## Features Included

✅ BigInt to Uint8Array conversion
✅ Zlib decompression using pako
✅ Field parsing with 255-byte delimiters
✅ Support for both old and new Aadhaar formats
✅ Personal information extraction (name, DOB, gender, address)
✅ Email/Mobile indicator detection
✅ Reference ID support for old Aadhaar

## Troubleshooting

**Issue: "pako module not found"**
- Run: `npm install pako`

**Issue: Port 3000 already in use**
- Run: `npm run dev -- -p 3001` (to use port 3001 instead)

**Issue: React not working**
- Ensure the component has `'use client';` directive at the top
- This is already included in AadhaarQRReader.jsx

## Next Steps

- Customize styling in `src/components/AadhaarQRReader.jsx`
- Add error handling enhancements as needed
- Deploy to Vercel for free: `npm i -g vercel` then `vercel`

Enjoy using the Aadhaar QR Reader!
