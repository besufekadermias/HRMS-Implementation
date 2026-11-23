# Employee frontend work

For every new employee page or feature, cross-check the existing admin portal for compatibility: visual design, corresponding employee fields and data contracts, validation rules, and workflows. Resolve relevant mismatches within the authorized employee frontend scope and document any required backend field mappings in API_CONTRACT.md. Follow the existing page-by-page frontend workflow.

Use Tailwind utility classes in JSX for all page and component styling. Keep only Tailwind imports, theme configuration, source declarations, and custom utility variants in src/styles/tailwind.css. Do not add regular CSS page/component selectors, CSS modules, @apply wrappers, or inline React style objects. Use Tailwind state/responsive utilities and classList scroll locks. Preserve the admin design and existing employee behavior.
