# Security Policy

## Supported versions

Curry Leaves is under active development. Security fixes are applied to the latest
release on the `main` branch. Older versions are not maintained.

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅        |
| < 1.0   | ❌        |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you believe you've found a security vulnerability in the Curry Leaves desktop
shell, report it privately using one of these channels:

- **GitHub Security Advisories** — open a private report via the
  [Security tab](https://github.com/Curry-Leaves/curry-leaves-assistant-desktop/security/advisories/new)
  of this repository (preferred).
- **Email** — `curry_leaves_ai@yahoo.com` with the subject line
  `SECURITY: curry-leaves-assistant-desktop`.

Please include:

- a description of the vulnerability and its impact,
- steps to reproduce (a proof of concept if possible),
- the affected version or commit,
- and any suggested remediation.

## What to expect

- We aim to acknowledge your report within **3 business days**.
- We'll work with you to understand and validate the issue, and keep you updated on
  progress toward a fix.
- Once a fix is available, we'll coordinate a disclosure timeline with you and credit
  you in the advisory unless you prefer to remain anonymous.

## Scope

This repository is a thin Electron shell. Vulnerabilities may also live in the sibling
repositories — the [backend](https://github.com/Curry-Leaves/curry-leaves-assistant) or
the [web UI](https://github.com/Curry-Leaves/curry-leaves-assistant-web). If your report
concerns those components, please note that, but you may still route it through the
channels above and we'll forward it appropriately.

Thank you for helping keep Curry Leaves and its users safe.
