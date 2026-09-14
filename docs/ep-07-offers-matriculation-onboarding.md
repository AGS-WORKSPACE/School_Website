# EP-07: Offers, acceptance and matriculation onboarding

EP-07 extends the existing `@tau/admissions` front-end domain and mock store. It adds no API, server action, database, or external integration.

## Delivered workflows

- **ONB-01:** Versioned approved offer templates, route checks, conditional/final offers, expiry, and verification codes.
- **ONB-02:** Time-stamped candidate acceptance/decline plus UTME/Direct Entry CAPS status checks.
- **ONB-03:** Acceptance-charge assessment, reconciliation, waiver, sponsorship, and refund decisions. Payment never clears admission conditions.
- **ONB-04:** Controlled matriculation schemes, globally checked sequence allocation, permanent retirement of void numbers, and audit entries.
- **ONB-05:** Required onboarding tasks, documented exceptions, and explicit role lists for restricted medical/consent/identity records.
- **ONB-06:** One idempotent `Student_Created` event per student with retryable SIS, LMS, email, and library destinations.

## Front-end routes

- `/admissions/onboarding` in the admin console: offers, fees, students, tasks, provisioning, and audit views.
- `/admissions/offer/[verificationCode]` on the public website: verified candidate offer and response experience.

## Invariants

Policy functions in `packages/admissions/src/policy/onboarding-policy.ts` are deterministic and UI-independent. Student creation requires an accepted offer, satisfied or explicitly waived conditions, applicable CAPS acceptance, reconciled or formally relieved charges, and identity verification. The resulting student record copies identity and programme facts from the source application/offer rather than asking staff to enter them again.
