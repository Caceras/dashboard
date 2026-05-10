---
seo:
  title: Works — operations cockpit
  description: Plan SEO, clients, projects, tools, expenses, and the calendar from one calm surface.
---

::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
---
orientation: horizontal
---

#title
Run your shop from [one cockpit]{.text-primary}.

#description
Works is the operator's manual and the live console — both. SEO movers, client status, project pipeline, tool spend, expenses, and the calendar all sit one click apart. This documentation is the field manual: short, opinionated, written for the person actually doing the work.

#links
  :::u-button
  ---
  to: /docs/getting-started
  size: xl
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::

  :::u-button
  ---
  icon: i-lucide-layout-dashboard
  color: neutral
  variant: outline
  size: xl
  to: /
  ---
  Open dashboard
  :::

#default
  :::prose-pre
  ---
  code: |
    pnpm dev
    # Today      → /
    # SEO        → /seo
    # Clients    → /clients
    # Projects   → /projects
    # Tools      → /tools
    # Expenses   → /expenses
    # Calendar   → /calendar
    # Docs       → /docs
  filename: Works
  ---

  ```bash [Works]
  pnpm dev
  # Today      → /
  # SEO        → /seo
  # Clients    → /clients
  # Projects   → /projects
  # Tools      → /tools
  # Expenses   → /expenses
  # Calendar   → /calendar
  # Docs       → /docs
  ```
  :::
::

::u-page-section{class="dark:bg-neutral-950"}
#title
Six pillars, one surface

#description
Each domain has a deep page in the dashboard and a doc here. The dashboard is for doing. The docs are for deciding.

#features
  :::u-page-feature
  ---
  icon: i-lucide-search
  to: /docs/seo/keyword-research
  ---
  #title
  SEO

  #description
  Keyword research workflow, audit checklist, and what to do with rank movers each Monday.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-users
  to: /docs/clients/onboarding
  ---
  #title
  Clients

  #description
  Onboard a prospect in under thirty minutes. Contracts, statuses, and when to archive.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-folder-kanban
  to: /docs/projects/playbook
  ---
  #title
  Projects

  #description
  The five-status playbook. What "review" actually means. When to mark blocked.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-toolbox
  to: /docs/tools/stack
  ---
  #title
  Tools

  #description
  The current stack at a glance, why each tool earns its keep, and what we'd switch to.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-receipt
  to: /docs/expenses/categories
  ---
  #title
  Expenses

  #description
  Category definitions so the books reconcile without thinking. Billable vs reimbursed clarified.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-compass
  to: /docs/getting-started
  ---
  #title
  Rituals

  #description
  Daily, weekly, and monthly rituals. The single page everyone reads first.
  :::
::

::u-page-section{class="dark:bg-neutral-950"}
#title
Built on Nuxt UI + Nuxt Content

#description
The same prose, navigation, and search components used by the entire Nuxt ecosystem.

#links
  :::u-button
  ---
  color: neutral
  size: lg
  target: _blank
  to: https://ui.nuxt.com
  trailingIcon: i-lucide-arrow-right
  variant: subtle
  ---
  Explore Nuxt UI
  :::

#features
  :::u-page-feature
  ---
  icon: i-lucide-palette
  ---
  #title
  100+ UI components

  #description
  Every page in Works renders with Nuxt UI. Accessible, themed, dark-mode ready out of the box.
  :::

  :::u-page-feature
  ---
  icon: i-simple-icons-markdown
  ---
  #title
  MDC enhanced markdown

  #description
  Drop hero blocks, callouts, code groups, and steps into any doc page. Vue components inside markdown.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-search
  ---
  #title
  Built-in full-text search

  #description
  ⌘K opens the docs search. No external service. Indexed at build, fuzzy at runtime.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-navigation
  ---
  #title
  Smart navigation

  #description
  Sidebar nav, sticky table of contents, and prev/next links — all auto-generated from frontmatter.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-database
  ---
  #title
  Content database

  #description
  Query pages with a typed API. Filter, sort, and surface excerpts anywhere in the app.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-moon
  ---
  #title
  Dark mode ready

  #description
  Every doc page respects system preferences. Smooth transitions, persistent across sessions.
  :::
::

::u-page-section{class="dark:bg-gradient-to-b from-neutral-950 to-neutral-900"}
  :::u-page-c-t-a
  ---
  links:
    - label: Read the rituals
      to: /docs/getting-started
      trailingIcon: i-lucide-arrow-right
    - label: Open dashboard
      to: /
      variant: subtle
      icon: i-lucide-layout-dashboard
  title: Stop juggling tabs.
  description: Works pulls SEO, clients, projects, tools, expenses, and the calendar onto one surface. The docs explain the why. The dashboard does the work.
  class: dark:bg-neutral-950
  ---
  :::
::
