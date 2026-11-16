---
status: accepted
date: 2026-11-16
decision-makers: repository owner
---

# 0020: Show popups with Base UI Toast

## Context and problem statement

Login needs an error popup that stays until the user closes it, and later Features reuse it. Issue #65 named Sonner, the library shadcn/ui used for this. Which component should show the popups?

## Decision drivers

- It stays until closed, and screen readers hear it right away, because an error is urgent.
- Few new dependencies: the project already uses Base UI through shadcn/ui ([0012](0012-keep-the-design-system-in-code.md)).
- It follows shadcn/ui's current guidance for Base UI projects.

## Considered options

1. **Base UI Toast**, through shadcn/ui
2. Sonner

## Decision outcome

Chosen option: **"Base UI Toast"**. The owner chose it over Sonner on 2026-11-16, and the issue was updated to say so.

- **shadcn/ui points here.** shadcn's Sonner page redirects Base UI projects to its [Base UI Toast](https://ui.shadcn.com/docs/components/base/toast), added with `npx shadcn add toast`.
- **It announces urgently.** With the installed `@base-ui/react` 1.9.0, a toast with `timeout: 0` "will prevent the toast from being dismissed automatically", and `priority: 'high'` is "announced urgently" (announced through an alert region). Sonner announces only politely.
- **No extra dependencies.** `@base-ui/react` is already installed. shadcn's Sonner wrapper pulls in `sonner` and `next-themes`, and the project has one theme ([0014](0014-ship-one-dark-theme.md)), so `next-themes` would do nothing.
- **Our wrapper.** `src/components/error-toaster.tsx` has `showError(message)`, which adds an error toast with `timeout: 0` and `priority: "high"` and returns its id, and `closeError(id)`, which closes it. The look is in the [design guide](../../reference/design-guide.md#error-popup).

### Consequences

- Good, because the popup stays until closed and is announced as an alert.
- Good, because there is no new dependency.
- Good, because it follows what shadcn/ui now recommends.
- Bad, because the generated Toast animates and sits at the bottom, so our wrapper overrides its position and slide to put it at the top.
- Bad, because Base UI Toast has a smaller community than Sonner, so there are fewer examples to copy.

### Confirmation

- Unit tests check the popup's alert role, that it is still there after 60 seconds, and that the close button and `closeError` close it.
- The end-to-end test for a wrong password checks that the popup stays until it is closed.

## Pros and cons of the options

### Sonner

- Good, because it is popular and simple.
- Bad, because it announces only politely, and shadcn's wrapper adds `sonner` and `next-themes`.
- Bad, because shadcn no longer points Base UI projects to it.

## More information

- Related: [0012](0012-keep-the-design-system-in-code.md), [0014](0014-ship-one-dark-theme.md)
