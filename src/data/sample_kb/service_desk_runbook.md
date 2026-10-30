# NovaRetail IT Service Desk Runbook

## Overview

This runbook documents standard procedures for the NovaRetail IT Service Desk team.

---

## Password Reset Procedure

1. Verify employee identity via employee ID + manager confirmation.
2. Initiate reset via Azure AD admin portal.
3. Communicate temporary password via a separate channel (phone call — never email).
4. Instruct employee to change password immediately on first login.
5. Log the ticket in ServiceNow with category **Access Management**.

---

## Account Unlock Procedure

1. Confirm identity.
2. Unlock account via Azure AD.
3. Verify MFA device is still registered.
4. Ask employee to sign in and confirm access.

---

## New Employee Onboarding Checklist

- [ ] Create Azure AD account.
- [ ] Assign to correct security groups (department + role).
- [ ] Provision Microsoft 365 license.
- [ ] Enroll device in Intune MDM.
- [ ] Configure GlobalProtect VPN profile.
- [ ] Send welcome email with IT Portal link.

---

## Software Request Escalation

If the requested software is not on the approved list:

1. Route to the Software Review Board (SRB).
2. SRB reviews within 5 business days.
3. If approved, IT packages and deploys via Intune.
4. If rejected, notify employee with reasoning.

---

## Escalation Matrix

| Issue Severity | First Response | Escalate To |
|---|---|---|
| P1 — Service outage | 15 min | IT Manager + CISO |
| P2 — Major degradation | 1 hour | Senior Engineer |
| P3 — Individual issue | 4 hours | Tier-2 Support |
| P4 — General request | 1 business day | Standard queue |

---

## Common Ticket Types and Resolution

| Issue | Resolution |
|---|---|
| VPN not connecting | Reinstall GlobalProtect; check firewall rules |
| Email not loading | Check Microsoft 365 service health; clear Outlook cache |
| MFA device lost | Verify identity; reset MFA device in Azure AD |
| Printer not found | Check network connectivity; re-add printer via IT Portal |
| Slow device | Run disk cleanup; check startup programs; escalate if unresolved |

