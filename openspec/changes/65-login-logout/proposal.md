# Proposal

## Why

Anyone who opens the app sees everything in it. The teams' matches are meant only for their players, so the app has to know who is using it and keep everyone else out, before any match data goes in.

## What Changes

- A visitor who isn't logged in sees the login screen at every address of the app, including addresses that don't exist.
- A new login screen: email, password and a Log in button. It checks the fields itself and shows a message under each empty or invalid one.
- While logging in, the fields and the button are locked, and the button shows a spinner and "Logging in…".
- A wrong email or password, or a login the app can't check right now, shows an error popup with a plain message. The popup never says which of email or password was wrong.
- After logging in, the user always lands on the home page. A logged-in user who opens the login screen goes to the home page.
- A Log out button in the header of the home page and the "page not found" page. Logging out ends the session on this device only and shows the login screen.
- A new error popup that later features can reuse for other errors.
- No sign-up and no password reset: the owner adds each user by hand, and the login screen says that sign-ups are closed.

## Capabilities

### New Capabilities

- `access`: who can see the app: only logged-in users see its pages; everyone else sees the login screen.
- `login`: the login screen, its field checks, the waiting state, and what happens on success, wrong credentials or a failed check.
- `logout`: the Log out button, its waiting state, and ending the session on this device.
- `error-popup`: the popup that shows an error message until the user closes it or tries again, and is announced to screen readers.

### Modified Capabilities

None.

## Impact

- Players have to log in once on each device before they see anything. People who aren't users of the app see only the login screen.
- Nobody can create their own account or reset a forgotten password; they ask the owner.
- Logging out on one device doesn't log the user out anywhere else.
- When the login service is busy or down, nobody can log in, and the login screen says to try again in a few minutes.
