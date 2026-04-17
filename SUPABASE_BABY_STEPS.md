# Supabase Setup - Baby Steps

## Task 1: Run SQL Schema in Supabase Dashboard (3 minutes)

### Step 1.1: Open Supabase Dashboard
1. Open your web browser (Chrome, Edge, Firefox, etc.)
2. Type this URL in the address bar: `https://supabase.com/dashboard`
3. Press Enter
4. If you're not logged in:
   - Click "Sign in" button (top right)
   - Enter your email and password
   - Click "Sign in"
5. If you see a list of projects, skip to Step 1.3
6. If you don't see projects, continue to Step 1.2

### Step 1.2: Select Your Project
1. Look for a project named something like "hsadukhmcclwixuntqwu"
2. Click on that project card
3. Wait for the project dashboard to load (may take 5-10 seconds)

### Step 1.3: Open SQL Editor
1. Look at the left sidebar (dark vertical bar on the left)
2. Find the icon that looks like a code terminal or says "SQL Editor"
3. Click on it
4. A white/gray text editor area will appear on the right

### Step 1.4: Copy the SQL Schema
1. Go back to Windsurf (your code editor)
2. Open the file: `supabase_schema_v2.sql`
3. Press `Ctrl+A` to select all the text
4. Press `Ctrl+C` to copy the text

### Step 1.5: Paste and Run SQL
1. Go back to your browser (Supabase SQL Editor)
2. Click inside the white/gray text editor area
3. Press `Ctrl+V` to paste the SQL code
4. Look for a button that says "Run" or "Execute" (usually top right or bottom right)
5. Click the "Run" button
6. Wait for the green success message (usually takes 2-5 seconds)
7. If you see "Success" or a green checkmark, you're done with this task!

### Step 1.6: Create Storage Bucket (Important!)
1. In Supabase Dashboard, look at the left sidebar again
2. Find the icon that looks like a folder or says "Storage"
3. Click on it
4. Click the "New bucket" button (usually top right)
5. In the "Name" field, type exactly: `build-mode-images`
6. Make sure "Public bucket" is unchecked (not selected)
7. Click the "Create bucket" button
8. Wait for the success message

---

## Task 2: Create Admin User in Supabase Auth (1 minute)

### Step 2.1: Open Authentication Section
1. In Supabase Dashboard, look at the left sidebar
2. Find the icon that looks like a lock or says "Authentication"
3. Click on it

### Step 2.2: Go to Users
1. In the Authentication section, you'll see sub-menu options
2. Click on "Users" (it might be the default view)
3. You should see a list of users (or it might be empty)

### Step 2.3: Create New User
1. Look for a button that says "Add user" or "Create user" (top right)
2. Click that button
3. A popup window will appear

### Step 2.4: Fill in User Details
1. In the "Email" field, type: `mahdialmuntadhar1@gmail.com`
2. In the "Password" field, type a password (choose something secure, remember it!)
3. In the "Confirm password" field, type the same password again
4. Make sure "Auto Confirm User" is checked (this is usually default)
5. Click the "Create user" button
6. Wait for the success message
7. Close the popup if it doesn't close automatically

### Step 2.5: Set User as Admin
1. In Supabase Dashboard, look at the left sidebar
2. Find the icon that looks like a grid/table or says "Table Editor"
3. Click on it
4. You'll see a list of tables on the left
5. Find and click on the table named `profiles`
6. Look for the row with your email (mahdialmuntadhar1@gmail.com)
7. Find the column named `role`
8. Click on that cell
9. Type: `admin`
10. Press Enter or click outside the cell to save
11. Wait for the save indicator (usually a small checkmark)

---

## Done! ✅

You've completed both tasks:
- ✅ SQL schema run in Supabase
- ✅ Storage bucket created
- ✅ Admin user created
- ✅ User set as admin role

Now you can test your app at: http://localhost:3000

---

## Quick Troubleshooting

**SQL Run Failed:**
- Make sure you copied the entire SQL file (all lines)
- Check if tables already exist (if so, you might need to drop them first)

**Can't Find Storage Icon:**
- It might be called "Files" in some versions
- Look for a folder icon in the left sidebar

**Can't Find profiles Table:**
- The SQL schema should have created it
- Go back to SQL Editor and run the schema again
- Refresh the Table Editor page

**User Creation Failed:**
- Make sure email format is correct
- Try a different email if the one you used already exists
- Make sure password meets requirements (usually 6+ characters)
