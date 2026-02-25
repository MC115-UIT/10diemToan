# Payment Integration with PayOS

This document defines the process for integrating PayOS for seamless VietQR payments in the Smart Deep-Learning Exam Trainer. PayOS provides an excellent developer experience for Vietnamese bank transfers.

## 1. Payment Flow

### Step 1: User Initiates Checkout
- The user clicks "Upgrade to Premium".
- The frontend sends a request to the `.NET Core Backend`: `POST /api/billing/checkout`
- The backend generates a unique `orderCode` (BigInt, maximum 53 bits).

### Step 2: Create Payment Link
- The backend uses the `PayOS.Net` SDK to call the PayOS API to create a payment link.
- **Payload:**
  - `orderCode`: Generated in Step 1.
  - `amount`: e.g., 99000 (VND).
  - `description`: "Premium Upgrade - [UserEmail]".
  - `returnUrl`: URL to redirect the user after successful payment.
  - `cancelUrl`: URL to redirect the user if they cancel.

### Step 3: Frontend QR Display
- The backend returns the `checkoutUrl` to the frontend.
- The frontend redirects the user to the `checkoutUrl` (PayOS hosted page), which displays the VietQR code.
- Alternatively, we can embed the QR code directly into our UI if we parse the returned data.

### Step 4: Webhook Notification (Crucial)
- When the user scans and pays, the bank notifies PayOS.
- PayOS immediately sends a webhook `POST` to our backend: `POST /api/webhooks/payos`
- The backend MUST:
  1. Verify the webhook signature using the `Checksum Key` from PayOS to prevent spoofing.
  2. Find the transaction in the database by `orderCode`.
  3. Mark the transaction as `success`.
  4. Find the associated `user_id`.
  5. Update the `subscriptions` table to grant Premium access.
  6. Return `200 OK` to PayOS.

## 2. Security Considerations
- Never trust the `returnUrl` for fulfilling the order. Users can manipulate browser redirects. **Always rely on the Webhook.**
- Store PayOS `Client_Id`, `Api_Key`, and `Checksum_Key` securely in Azure Key Vault or Environment Variables.

## 3. Database Updates
- A record is created in the `transactions` table when checkout is initiated (`status = 'pending'`).
- The `status` is updated to `'success'` or `'failed'` via the webhook.