# Analytics Events — Canonical List (Updated 2026-01-30)

This document lists canonical analytics events used across the platform. It reflects events implemented and instrumented in branch `Codex-Features-30-01-2026` and maps legacy ad-hoc event names to the canonical names.

## Principles
- Event names use dot.case: `{domain}.{action}` (e.g., `listing.boost`).
- Payload: { event, timestamp, actorId?, context?, properties? }
- PII: `email`, `phone`, `name` fields are redacted before sending (see `src/lib/analytics`).
- Analytics are fire-and-forget and non-blocking; failed sends retry once.

---

## Canonical Events (current coverage)

- `page.view` — User viewed a page (properties: { path, title })
- `lead.created` — Lead created (properties: { leadId })
- `lead.stage_changed` — Lead stage advanced (properties: { leadId, from, to })
- `sla.nudge_shown` — SLA nudge shown in leads view (properties: { leadId? })
- `listing.view` — Listing viewed (properties: { listingId })
- `listing.save` — Listing saved/bookmarked (properties: { listingId })
- `listing.inquiry` — Inquiry/contact form submitted (properties: { listingId, inquiryId })
- `listing.boost` — Listing boost workflow started/confirmed (properties: { listingId, cost, duration })
- `openhouse.create` — Open house created for listing (properties: { listingId, opensAt })
- `credit.consume_started` — Credits consumption started (properties: { ledgerId, amount })
- `credit.consume_confirmed` — Credits consumed successfully (properties: { ledgerId, amount })
- `chat.message_sent` — Chat message sent (properties: { threadId, messageId, length })
- `chat.attachment_upload` — Attachment uploaded in chat (properties: { threadId, filename })
- `integration.connect` — Integration connected (properties: { integration, accountId })
- `integration.disconnect` — Integration disconnected (properties: { integration, accountId })
- `integration.action_start` — Integration action started (properties: { integration, action })
- `integration.action_error` — Integration action errored (properties: { integration, action, error })
- `profile.view` — Profile viewed (properties: { profileId })
- `profile.complete_step` — User completed an onboarding/profile step (properties: { step })
- `cx.feedback_added` — CX feedback added (properties: { subject, rating })
- `appointment.no_show` — Appointment marked no-show (properties: { appointmentId })
- `contact.list_view` — Contact list viewed
- `contact.view` — Contact detail viewed (properties: { contactId })
- `contact.created` — Contact created (properties: { contactId })
- `contact.merge_success` — Contact merge executed (properties: { contactId, mergedIds })
- `contact.lead_created_from_contact` — Lead created from contact (properties: { contactId, leadId })
- `notifications.prefs_saved` — Notification preferences saved
- `notifications.silenced` — Notifications silenced by quiet hours
- `lead.spam_marked` — Lead marked as spam (properties: { leadId })
- `lead.spam_restored` — Lead restored from spam (properties: { leadId })


## Mapping: legacy -> canonical
- `sla.nudge_shown` (existing ad-hoc dispatch) → `sla.nudge_shown`
- `credit_consumption_started` / `credit_consumption_confirmed` → `credit.consume_started` / `credit.consume_confirmed`
- `chat.attachment_upload` (existing) → `chat.attachment_upload` (kept)
- `listing.boost` (existing) → `listing.boost` (kept)

---

## Testing guidance
- Unit tests should mock fetch or MSW and assert the payload body contains the canonical `event` and that PII keys are redacted.
- See `src/lib/analytics/index.test.ts` for examples.

---

If you want, I can continue by instrumenting the remaining components to call `track()` directly (replacing `window.dispatchEvent` ad-hoc calls) and add integration tests for each major flow (leads, listings, chat, credits). ✅
