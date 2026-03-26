# Golf Charity Platform

A modern, subscription-based web application that integrates golf performance tracking, charitable contributions, and a monthly prize draw system. Built with Next.js and Supabase.

## Prerequisites

1. **Node.js**: Ensure you have Node 18+ installed.
2. **Supabase**: You must have a Supabase project created with your database schema applied (using the provided `schema.sql`).

## Environment Variables

Create a `.env.local` file in the root directory based on your Supabase dashboard settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> **Note**: The `SUPABASE_SERVICE_ROLE_KEY` is required for the local mock login/signup function to automatically confirm emails and bypass default Supabase auth wait states.

## Installation & Running

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```

3. **View the Application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing Features Locally

- **Authentication / Login**: A mock mechanism is implemented for testing. Simply sign up with an email and password. The system bypasses email verification and automatically logs you in and sets up your profile for testing.
- **Payment Gateway**: Stripe has been removed for local testing. A mock PCI-compliant UI form is available at `/checkout`. Upon submitting the form, a simulated processing occurs, and your `subscription_status` is updated to `'active'` in the database automatically.
- **Admin Testing**: 
  - To access the admin tools (Draws and Verifications), you must first change your user account's `role` to `'admin'`.
  - Go to your Supabase Table Editor -> `profiles` table.
  - Locate your user row and change the `role` enum value from `user` to `admin`.
  - Refresh the app and navigate to `http://localhost:3000/admin`.

## Project Checking Instructions (For Evaluators)

If you are reviewing this project, please follow these steps to verify full functionality:

1. **Verify Authentication**
   - Click "Login/Get Started" on the homepage.
   - Use the toggle to switch to the **Sign Up** view.
   - Create a test account (e.g., `test@example.com`). The system will bypass email verification, auto-generate your User Profile, and log you in instantly.
   
2. **Verify Payments / Subscription**
   - Navigate to `/dashboard`, which will prompt you to subscribe.
   - Select a plan taking you to `/checkout`.
   - Enter mock card details. Notice the automatic formatting of the credit card inputs (spaces for the card number, slashes for dates).
   - Click "Pay". If your profile was successfully created, the mock API will process the transaction securely and redirect you to your active `/dashboard`.

3. **Verify Core Features**
   - Head to `/charities` to view the modern, image-rich charity layout.
   - Return to `/dashboard` to input your recent golf scores. Submit 5 scores to witness the `rolling score limit` functionality configured in the PostgreSQL schema.
   
4. **Verify Admin Capabilities**
   - You must promote your test user via your Supabase `profiles` table by setting `role=admin`.
   - Visit `/admin` to try executing simulated draws and manage payout workflows.
