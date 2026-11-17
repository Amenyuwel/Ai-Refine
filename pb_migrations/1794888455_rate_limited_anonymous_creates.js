/// <reference path="../pb_data/types.d.ts" />
// Both collections allow anonymous create (no login on SHARE or the contact form),
// so cap how often one IP can create records. Limits are per client IP per window.
const guestCreateRules = [
  { "label": "uploaded_images:create", "audience": "@guest", "duration": 3600, "maxRequests": 10 },
  { "label": "contact_messages:create", "audience": "@guest", "duration": 3600, "maxRequests": 3 },
]

const isGuestCreateRule = (rule) =>
  guestCreateRules.some((guestRule) => guestRule.label === rule.label && guestRule.audience === rule.audience)

migrate((app) => {
  const settings = app.settings()

  // Replace rules with the same label and audience instead of duplicating them
  const otherRules = settings.rateLimits.rules.filter((rule) => !isGuestCreateRule(rule))

  unmarshal({
    "rateLimits": {
      "enabled": true,
      "rules": [...otherRules, ...guestCreateRules],
    },
  }, settings)

  return app.save(settings)
}, (app) => {
  const settings = app.settings()

  const otherRules = settings.rateLimits.rules.filter((rule) => !isGuestCreateRule(rule))

  // PocketBase ships with rate limiting disabled
  unmarshal({
    "rateLimits": {
      "enabled": false,
      "rules": otherRules,
    },
  }, settings)

  return app.save(settings)
})
