# Security Policy

This repository is the source of the website <https://bonk-os.app>. The full policy, in English and French, is in [FantasmaGlad/Bonk, SECURITY.md](https://github.com/FantasmaGlad/Bonk/blob/main/SECURITY.md); it applies here too. Machine-readable policy ([RFC 9116](https://www.rfc-editor.org/rfc/rfc9116), OpenPGP-signed): <https://bonk-os.app/.well-known/security.txt>.

## Reporting a vulnerability

Do not open a public issue, discussion or pull request for a vulnerability. Use one of these private channels:

1. **GitHub private vulnerability reporting**: [Report a vulnerability](https://github.com/FantasmaGlad/Bonk/security/advisories/new), in the Bonk repository, naming the website. Only the maintainer can see the report.
2. **E-mail**: [security@bonk-os.app](mailto:security@bonk-os.app).

Please include the affected page, the steps to reproduce and the impact you observe.

Any e-mail containing exploitable details must be encrypted with the OpenPGP key below. If you cannot use PGP, use the private GitHub report rather than plain e-mail.

| | |
|---|---|
| Identity | Bonk Security `<security@bonk-os.app>` |
| Fingerprint | `A782 AC57 321A 862C 2ED8  F0FB 34F1 5332 E2A0 7A30` |
| Where to fetch it | <https://bonk-os.app/.well-known/security.asc>, [Bonk repository](https://github.com/FantasmaGlad/Bonk/blob/main/docs/security/bonk-security-public-key.asc) |

Retrieve the key from both channels and check that the fingerprint matches before use.

## Supported versions

Only the version currently served at <https://bonk-os.app> (the `main` branch) receives fixes.

## Scope

In scope: the website `bonk-os.app` and the repository's build and deployment workflow. Out of scope: third-party services (GitHub, Cloudflare, Resend), social engineering, denial of service and mass automated scans, findings without a demonstrable impact.

## Good-faith research

Research carried out in good faith within this scope will not lead to any action from us.

## Secrets found in this repository

If you find a credential, a token or a private key in the repository or its history, report it through the private channels above. Do not use it.
