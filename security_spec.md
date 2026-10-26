# Security Specification

## 1. Data Invariants
- Tickets must have a valid ID format, region, customerName, equipmentName, status, and createdAt.
- Only authenticated users can read and write tickets, technicians, and accounts.
- The admin account `nahs640761@gmail.com` possesses elevated administrator privileges.
- Document IDs must conform to regex `^[a-zA-Z0-9_\-]+$`.
- Deletion of tickets and team management require administrative authorization or authenticated operations.
- Array sizes and string lengths are bounded to prevent Denial of Wallet exhaustion attacks.

## 2. Dirty Dozen Test Cases
1. Anonymous unauthenticated write to `/tickets/TK-1` -> PERMISSION_DENIED
2. Malformed ticket ID with invalid characters `/tickets/../../bad` -> PERMISSION_DENIED
3. Extremely large string payload exceeding limits -> PERMISSION_DENIED
4. Missing required fields in ticket creation -> PERMISSION_DENIED
5. Direct write to unknown subcollection `/unknown/doc` -> PERMISSION_DENIED
6. Spoofed email without verification for privileged action -> PERMISSION_DENIED
7. Unbounded array injection into partsUsed -> PERMISSION_DENIED
8. Invalid status enum transition or injection -> PERMISSION_DENIED
9. Arbitrary unauthorized role elevation in accounts -> PERMISSION_DENIED
10. Technician document update with negative counters -> PERMISSION_DENIED
11. Unauthorized cross-tenant modification -> PERMISSION_DENIED
12. Blank root catch-all bypass attempt -> PERMISSION_DENIED
