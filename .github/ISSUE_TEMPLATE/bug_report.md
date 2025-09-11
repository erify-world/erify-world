---
name: 🐛 Bug Report
description: Report a bug to help us improve the ERIFY™ ecosystem
title: "[Bug]: "
labels: [bug, needs-triage]
assignees:
  - erify-world
body:
  - type: markdown
    attributes:
      value: |
        ## 💎 Thank you for reporting a bug!
        
        Your feedback helps us maintain the luxury standards of the ERIFY™ ecosystem. Please provide detailed information to help us resolve this issue quickly.

  - type: textarea
    id: bug-description
    attributes:
      label: 🐛 Bug Description
      description: A clear and concise description of what the bug is.
      placeholder: Describe the bug...
    validations:
      required: true

  - type: textarea
    id: reproduction-steps
    attributes:
      label: 🔄 Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. Scroll down to '...'
        4. See error
    validations:
      required: true

  - type: textarea
    id: expected-behavior
    attributes:
      label: ✅ Expected Behavior
      description: A clear and concise description of what you expected to happen.
      placeholder: What should have happened?
    validations:
      required: true

  - type: textarea
    id: actual-behavior
    attributes:
      label: ❌ Actual Behavior
      description: A clear and concise description of what actually happened.
      placeholder: What actually happened?
    validations:
      required: true

  - type: dropdown
    id: component
    attributes:
      label: 🏗️ Component
      description: Which part of the ERIFY™ ecosystem is affected?
      options:
        - Documentation
        - GitHub Actions/Workflows
        - Scheduling Templates (Node.js)
        - Scheduling Templates (Cloudflare Workers)
        - Style Guide
        - Community Files
        - Other
    validations:
      required: true

  - type: textarea
    id: environment
    attributes:
      label: 🌍 Environment
      description: Please provide relevant environment details
      placeholder: |
        - OS: [e.g. Windows 11, macOS 13, Ubuntu 22.04]
        - Node.js version: [e.g. 18.17.0]
        - Browser: [e.g. Chrome 115, Safari 16]
        - Other relevant details...
    validations:
      required: false

  - type: textarea
    id: additional-context
    attributes:
      label: 📋 Additional Context
      description: Add any other context about the problem here, including screenshots or logs.
      placeholder: Any additional information, screenshots, or logs that might help...
    validations:
      required: false

  - type: checkboxes
    id: terms
    attributes:
      label: ✅ Checklist
      description: Please confirm the following
      options:
        - label: I have searched existing issues to ensure this bug hasn't been reported before
          required: true
        - label: I have provided all the requested information
          required: true
        - label: I understand this will be reviewed according to ERIFY™'s luxury standards
          required: true