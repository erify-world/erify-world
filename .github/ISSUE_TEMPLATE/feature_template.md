---
name: '✨ Add New Feature'
description: 'Propose a new feature for the ERIFY™ ecosystem'
title: '[Feature] <short description>'
labels: ['feature', 'needs-review', 'good first issue']
assignees: []

body:
  - type: textarea
    id: description
    attributes:
      label: '🔥 Task Description'
      description: 'Describe the feature you want to add.'
      placeholder: 'What is the feature? Why is it important for ERIFY™?'
    validations:
      required: true

  - type: textarea
    id: acceptance
    attributes:
      label: '💎 Acceptance Criteria'
      description: 'Define what will make this feature complete.'
      placeholder: "- [ ] Criteria 1\n- [ ] Criteria 2"
    validations:
      required: true

  - type: dropdown
    id: priority
    attributes:
      label: '📌 Priority'
      options:
        - Low
        - Medium
        - High
    validations:
      required: true
...
