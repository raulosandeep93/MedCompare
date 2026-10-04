---
trigger: always_on
description: "Security and credentials handling rules"
---

# Security Rules

- **Zero Hardcoded Secrets**:
  - Never commit API keys, SMTP passwords, tokens, or private credentials to git.
  - Store all sensitive environment variables in `server/.env`.
  - Maintain public templates with placeholder values in `server/.env.example`.
- **Input Sanitization**:
  - Sanitize user-provided text from the report issue modal before rendering in HTML emails or JSON files.
  - Strip spaces and validate formatting on email and password inputs.
- **External API Safety**:
  - Set timeouts on outbound `axios` requests to prevent hanging threads.
  - Set appropriate User-Agent headers when querying public resources like OpenStreetMap Nominatim.
