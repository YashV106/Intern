# Premium Resume Builder - Implementation Tracker

## Step 1 (Backend): Entitlement + Full Resume Data
- [ ] Add GET /api/premium-resume/status?studentId=... to return unlocked + premiumStatus + resumeExists + resumeCompletion
- [ ] Extend POST /api/premium-resume/submit-form to accept full wizard resumeData (all steps) + store in Resume.resumeData
- [ ] Update backend/services/resumePdf.js to render full multi-section resume (A4, page breaks, professional typography) from resumeData + photo

## Step 2 (Frontend): Premium Resume Builder UI
- [ ] Create route /dashboard/resume (Internshala-like UI, sticky header + sidebar already provided by DashboardLayout)
- [ ] Implement multi-step wizard (10 steps), progress bar, autosave draft (localStorage), live preview
- [ ] Implement templates (4 templates) with instant template switching
- [ ] Premium gating: if not unlocked -> show lock + upgrade/pay ₹50 flow with OTP modal + Razorpay checkout
- [ ] Implement OTP modal rules (5 min expiry, resend cooldown 60s, max attempts 5)
- [ ] After payment success -> call backend verify-payment-and-generate; show success animation; enable preview/download/edit

## Step 3 (Routing Fixes)
- [ ] Create /resume-builder route (redirect to /dashboard/resume)
- [ ] Create /payment-history route placeholder (redirect to /dashboard/payment-history or /upgrade as applicable)

## Step 4 (Admin): Resume Management (Minimal)
- [ ] Add backend admin endpoints to list/search resumes and download PDF
- [ ] Add frontend admin UI for Resume Management (view student, template, payment status, download PDF)

## Step 5 (Verification)
- [ ] Run frontend + backend sanity checks
- [ ] Generate resume end-to-end: form -> OTP -> Razorpay -> PDF -> preview -> saved resume linked to profile -> apply internship attaches automatically
