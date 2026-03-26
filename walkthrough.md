# Golf Charity Platform - Project Walkthrough

## 1. Project Requirements & Objectives
The primary objective of this project was to construct a modern, emotion-driven, subscription-based web application integrating golf performance tracking with charitable contributions and a monthly prize draw system. 

**Key functional requirements included:**
- **Authentication System**: Secure user registration, authentication, and profile tracking.
- **Subscription Engine**: Gate platform access behind a subscription wall (monthly and annual variants).
- **Mock Payment Gateway**: Provide a secure-looking checkout experience that simulates payment processing without handling real funds.
- **Golf Score Tracking**: Allow users to input their recent golf performance, specifically enforcing a rolling limit of tracking only the last 5 scores.
- **Charity Integration**: Provide a responsive directory of charities and allow users to select an organization to support.
- **Administrator Tooling**: An exclusive portal for admins to manage monthly prize draws and verify winner payouts.

---

## 2. Implemented Functionalities

- **Custom Authentication Flow (`/login`)**: Built an aesthetic UI dynamically toggling between "Login" and "Sign Up". Uses Supabase Admin logic locally to auto-confirm testing accounts, bypassing default confirmation delays.
- **Dynamic Dashboard (`/dashboard`)**: The central control hub where users can see their active subscription metadata, view their top matches, input scores, and update their charity preferences.
- **Format-Aware Mock Checkout (`/checkout`)**: A sleek, PCI-compliant-styled UI. Features automatic input formatting for credit card numbers (spacing, slashes) and connects to a mock Next.js API route that simulates backend latency before instantly activating the user's subscription.
- **Database-Level Enforcements**:
  - Implementation of **Row-Level Security (RLS)** in PostgreSQL ensures users can only read/write their personal profile and score tables.
  - A custom **PostgreSQL Trigger** automatically prunes old rows to strictly maintain the 5-score limit per user.
- **Admin Control Panel (`/admin`)**: A visually distinct administration interface restricted by a role-check. It allows admins to monitor global stats, execute "Simulation" or "Publish" lottery draws, and formally approve/reject pending payout claims.

---

## 3. Comprehensive Checking Guide (How to verify)

If you are grading or reviewing this application, follow these precise steps to check all core functionalities:

### A. Testing Authentication
1. Navigate to `http://localhost:3000/login`.
2. Toggle the link to "Sign Up" and enter a test email and password.
3. Observe the system bypass email verification, instantly create your user profile, and securely redirect you to your `/dashboard`.

### B. Testing the Logic & Mock Payments
1. On your newly created `/dashboard`, notice the "Inactive" subscription wall preventing further interaction.
2. Click **Review Plans** -> Select a plan -> Proceed to **Secure Checkout**.
3. In the checkout form, type mock card details. Notice the responsive UI input formatting (e.g. spaces auto-inserting on the card number).
4. Click **Pay**. Wait for the simulated delay, after which you are redirected to the dashboard, and your account status accurately updates to "Active".

### C. Testing Core User Features
1. Navigate to the **Charity Directory** (`/charities`) to verify the responsive grid layout of the pre-seeded mock foundations.
2. Return to the `/dashboard`. Try submitting a new golf score (pick a number between 1 and 45).
3. **Verify Trigger Logic**: Submit 6 distinct scores sequentially. Notice that the display dynamically updates, but uniquely retains ONLY the 5 newest entries, confirming the PostgreSQL database trigger is actively working.

### D. Testing Administration
1. Open your real **Supabase Dashboard** -> Table Editor -> `profiles`.
2. Locate your current user row, double-click the `role` cell, and manually change it from `"user"` to `"admin"`.
3. Back in the app, navigate to `http://localhost:3000/admin`. (If the role wasn't changed, the page securely bounces you back to the dashboard).
4. **Draw Engine**: Execute a "Simulation" draw. Verify it populates a new row in the Draw History table correctly calculating the mock prize pools.
5. If there were manual payouts, they will appear at the bottom for you to "Approve" or "Reject".
