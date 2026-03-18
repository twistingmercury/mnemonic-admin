---
name: Test Authentication Pattern
description: A pattern for handling JWT-based authentication in backend services
language: typescript
domain: backend
---

[//]: pattern (authentication)

## Overview

This pattern describes how to validate JWT tokens at the service boundary before
allowing access to protected resources.

## Implementation

Check for a valid Bearer token in the Authorization header, verify the signature,
and extract claims before passing to downstream handlers.
