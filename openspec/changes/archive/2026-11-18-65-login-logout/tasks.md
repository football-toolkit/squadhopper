# Tasks

Each task is a user-visible outcome. It's done when every scenario it lists passes in the tests, and the screens it names match the design boards.

## 1. Error popup

- [x] 1.1 An error popup shows over the page, top right on desktop and across the top on phones, with the error icon, the message and a close button in the error color. Verified by `error-popup` scenarios "Popup on desktop" and "Popup on a phone".
- [x] 1.2 An error popup stays until the user closes it, by mouse or keyboard, or tries again the action that caused it, and screen readers announce it. Verified by `error-popup` scenarios "User waits", "User closes the popup", "User tries the action again", "Popup appears with a screen reader on" and "Keyboard user closes the popup".

## 2. Login screen

- [x] 2.1 A visitor who isn't logged in sees the login screen, with the Email and Password fields, the Log in button and "Sign-ups are closed.", and no sign-up or password reset link. Verified by `login` scenario "Visitor sees the login screen" and `access` scenario "Visitor looks for a way to sign up".
- [x] 2.2 Clicking Log in with an empty or invalid field outlines it in red with its message, without the browser's bubbles, and typing in a field clears its message. Verified by `login` scenarios "Both fields empty", "Email not valid", "Password empty" and "User fixes the email".
- [x] 2.3 While logging in, the fields are locked and the button shows the spinner and "Logging in…", still under reduced motion, and they unlock when a login fails. Verified by `login` scenarios "User logs in", "User clicks again while waiting", "Reduced motion" and "The login fails".
- [x] 2.4 Correct details open the home page, with no message, wherever the visitor started, even with spaces around the email. Verified by `login` scenarios "Correct email and password", "User first opened another address" and "Email typed with spaces around it".
- [x] 2.5 Wrong details show "Wrong email or password.", keep the email and clear the password; a failed check shows "Can't log in right now. Try again in a few minutes."; neither shows the login service's own text; a new attempt closes the previous popup. Verified by `login` scenarios "Wrong password", "Unknown email", "The login service is down", "Too many attempts", "The login service returns its own message" and "User tries again after a wrong password".

## 3. Who sees what

- [x] 3.1 A visitor who isn't logged in sees the login screen at every address, including one that doesn't exist. Verified by `access` scenarios "Visitor opens the home page" and "Visitor opens an address that doesn't exist".
- [x] 3.2 A logged-in user sees the page they open, the "page not found" page at an unknown address, and the home page instead of the login screen. Verified by `access` scenarios "Logged-in user opens the home page", "Logged-in user opens an address that doesn't exist" and "Logged-in user opens the login screen".

## 4. Log out

- [x] 4.1 The home page and the "page not found" page show a Log out button in their header. Verified by `logout` scenarios "Home page" and "Page not found".
- [x] 4.2 While logging out, the button is dimmed with the spinner and "Logging out…" and ignores more clicks. Verified by `logout` scenarios "User clicks Log out" and "User clicks again while waiting".
- [x] 4.3 Logging out ends the session on this device only, from every page that has the button, even when the login service can't be reached, and shows the login screen; going back doesn't bring the home page back. Verified by `logout` scenarios "User logs out", "User logs out from the "page not found" page", "User goes back after logging out", "The login service can't be reached" and "User is logged in on two devices".

## 5. Whole journey

- [x] 5.1 Logging in, empty fields, a wrong password and logging out work end to end, in the browsers the project tests in, against a real login service with an invented test user. Verified by the end-to-end run in CI.
- [x] 5.2 The login screen, the home page and the "page not found" page, in each of their states, match the design boards at phone (390 px) and desktop (1280 px) widths. Verified by the owner's review of the preview at 390 and 1280 px against the boards attached to #65 (owner's decision, 2026-11-18: no screenshots in the pull request).

## Workflow follow-up

- Archive the change as the last commit before the pull request, then validate the specs and show the owner the specs diff.
