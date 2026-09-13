import assert from "node:assert/strict";
import test from "node:test";
import {
  getCapturedAnalyticsEvents,
  resetAnalyticsForTests,
  setAnalyticsConsent,
  trackEvent,
} from "./analytics";

test("does not emit analytics before consent or after consent is denied", () => {
  resetAnalyticsForTests();
  trackEvent("search", { queryLength: 8, resultCount: 2 });
  assert.equal(getCapturedAnalyticsEvents().length, 0);

  setAnalyticsConsent("denied");
  trackEvent("programme_view", { slug: "medicine" });
  assert.equal(getCapturedAnalyticsEvents().length, 0);
});

test("emits allowlisted programme, search, and conversion events after consent", () => {
  resetAnalyticsForTests();
  setAnalyticsConsent("granted");
  trackEvent("programme_view", { slug: "medicine", surface: "detail" });
  trackEvent("programme_filter", { activeFilterCount: 2, filterKeys: "level,mode", resultCount: 3 });
  trackEvent("search", { queryLength: 9, resultCount: 1, hasResults: true });
  trackEvent("news_view", { slug: "research-update", category: "Research" });
  trackEvent("event_view", { slug: "open-day", category: "Admissions" });
  trackEvent("programme_application_click", { programmeSlug: "medicine", surface: "programme_card" });
  trackEvent("enquiry_started", { surface: "contact", programmeSlug: "medicine" });
  trackEvent("application_started", { surface: "application", programmeSlug: "medicine" });

  assert.deepEqual(getCapturedAnalyticsEvents().map((event) => event.name), [
    "programme_view",
    "programme_filter",
    "search",
    "news_view",
    "event_view",
    "programme_application_click",
    "enquiry_started",
    "application_started",
  ]);
});

test("excludes sensitive enquiry fields from payloads", () => {
  resetAnalyticsForTests();
  setAnalyticsConsent("granted");
  trackEvent("enquiry_submitted", {
    enquiryType: "Admissions",
    hasProgramme: true,
    success: true,
    name: "Ada Okafor",
    email: "ada@example.com",
    phone: "+2348000000000",
    message: "My private enquiry message",
    rawForm: "must never be sent",
  });

  const payload = getCapturedAnalyticsEvents()[0]?.payload;
  assert.deepEqual(payload, { enquiryType: "Admissions", hasProgramme: true, success: true });
});
