# Spec Delta

## Purpose

Lets a logged-in user end their session on the device they're using, so the next person on that device has to log in.

## ADDED Requirements

### Requirement: Log out button

The header of the home page and of the "page not found" page SHALL show a Log out button with a log-out icon.

#### Scenario: Home page

- **WHEN** a logged-in user sees the home page
- **THEN** the header shows the Log out button

#### Scenario: Page not found

- **WHEN** a logged-in user opens an address that doesn't exist
- **THEN** the "page not found" page's header shows the Log out button

### Requirement: Logging out shows a waiting state

While logging out, the Log out button SHALL be dimmed and show the same spinner as logging in and "Logging out…", and SHALL NOT react to more clicks. The spinner SHALL stand still when the user's system asks for reduced motion.

#### Scenario: User clicks Log out

- **WHEN** the user clicks Log out
- **THEN** the button is dimmed and shows the spinner and "Logging out…" until logging out finishes

#### Scenario: User clicks again while waiting

- **WHEN** the user clicks the button again while it shows "Logging out…"
- **THEN** nothing more happens

### Requirement: Logging out ends the session on this device only

Logging out SHALL end the user's session on the device they're using and show the login screen, with no "logged out" message. Their sessions on other devices SHALL stay logged in.

#### Scenario: User logs out

- **WHEN** the user clicks Log out and logging out finishes
- **THEN** they see the login screen, with no "logged out" message

#### Scenario: User logs out from the "page not found" page

- **WHEN** a logged-in user on the "page not found" page clicks Log out
- **THEN** they see the login screen

#### Scenario: User goes back after logging out

- **WHEN** the user has logged out and then goes back to the home page, by the browser's Back button or by its address
- **THEN** they see the login screen, not the home page

#### Scenario: The login service can't be reached

- **WHEN** the user clicks Log out while the login service can't be reached
- **THEN** this device is still logged out, and they see the login screen

#### Scenario: User is logged in on two devices

- **WHEN** the user is logged in on a phone and a computer, and logs out on the phone
- **THEN** the computer stays logged in

### Requirement: A logout that can't reach the app shows an error popup

If logging out can't reach the app, the user SHALL stay logged in on the page they're on, the Log out button SHALL work again, and an error popup SHALL say "Can't log out right now. Try again."

#### Scenario: The app can't be reached

- **WHEN** the user clicks Log out and the app can't be reached
- **THEN** an error popup says "Can't log out right now. Try again.", and they stay on the page, still logged in, with the Log out button ready again
