# Operations readiness

## M-Pesa Daraja

The backend can initiate M-Pesa Express (STK Push) and accept its callback. It queries Daraja before marking a payment paid, checks that the returned amount and phone match the order, and processes repeated callbacks idempotently. A private random callback token is added to the callback URL and checked before processing.

1. Copy `backend/.env.example` to `backend/.env` and set the Daraja sandbox credentials, shortcode, passkey, public HTTPS callback URL, and a long random callback secret. Do not commit `.env` or send secrets in chat.
2. Set `MPESA_ENV=sandbox` and test successful, cancelled, timed-out, duplicate, mismatched-amount, and delayed callback cases with Safaricom's sandbox.
3. Configure Safaricom production credentials and approval, then change `MPESA_ENV=production`. Production order creation is blocked when payment configuration is incomplete.
4. Make sure the API callback is publicly reachable over HTTPS before enabling production checkout. A successful payment received after its stock reservation was released is flagged for admin review.

Orders without Daraja configuration remain in development-only manual-payment mode. The admin's manual confirmation endpoint is an audited exception, not proof of an automated transaction.

## Inventory controls

Stock is reserved with a conditional atomic MongoDB update (`stock >= requested quantity`), so concurrent checkouts cannot oversell the same last units. Product creation and staff stock edits create inventory movement records. Pending or failed orders release their reservation on cancellation or failed payment. Admins can review the latest stock movements under **Admin → Activity**.

This is not a substitute for MongoDB transactions across a multi-product order. Deploy production MongoDB as a replica set, then add transaction-backed reservation and order creation before relying on strict all-or-nothing multi-item checkout during database or process failures.

## Audit trail

Staff product, category, user, settings, order-status, and payment actions are written to `AuditLog`. The activity view is admin-only and retains the most recent 100 events for viewing. Inventory movements are separately retained with before/after quantities. Audit summaries avoid passwords and address/contact values.

For production, define a retention period, export logs to an access-controlled append-only destination, and alert on audit write failures. Current application audit writes are best-effort so an audit database error does not block checkout or store operations.

## Images

Image uploads still use the local `backend/uploads` directory, as selected for this stage. The supplied `logo.jpeg` is included in the project; other uploaded files are ignored by Git. Production must mount `uploads` on persistent storage and include it in backups. Local ephemeral disks do not meet the recovery target below.

## Database backup and recovery objectives

Pilot targets selected for this store:

- **RPO: at most 1 hour** of order, payment, staff, inventory, or customer-data loss.
- **RTO: restore customer ordering and staff operations within 8 hours.**

When MongoDB Atlas is provisioned, configure continuous cloud backup with a point-in-time restore window that meets or exceeds the one-hour RPO. Also back up the image volume at least hourly, or keep the volume on storage with equivalent snapshots. Keep at least one protected copy outside the primary deployment region/account.

Run a restore drill into an isolated staging database and storage volume before launch, then at least quarterly. Record the start/end time, recovered timestamp, checks for orders/payments/products/users/images, and any gaps. A backup policy alone does not prove the 8-hour RTO; time the restore and application cutover. MongoDB documents point-in-time restore and RPO/RTO planning in its [Atlas backup guidance](https://www.mongodb.com/docs/atlas/architecture/current/backups/).

No Atlas backup policy can be applied from this codebase: it must be configured in the MongoDB deployment/project that will host production data.
