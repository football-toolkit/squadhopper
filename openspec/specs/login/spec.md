# login Specification

## Purpose

Lets a user the owner has added log in with their email and password, and tells them clearly when a field is missing, the details are wrong, or the login can't be checked.

## Requirements

### Requirement: Login screen

The login screen SHALL show the app's wordmark and tagline, an Email field, a Password field, and a Log in button with a log-in icon. It has no header and no Log out button.

#### Scenario: Visitor sees the login screen

- **WHEN** a visitor who isn't logged in opens the app
- **THEN** they see the Email and Password fields and the Log in button

### Requirement: The login screen checks the fields itself

When the user clicks Log in, the screen SHALL check the fields before trying to log in. Each empty or invalid field SHALL be outlined in the error color, with its message under it. The browser's own validation bubbles SHALL NOT appear.

#### Scenario: Both fields empty

- **WHEN** the user clicks Log in with both fields empty
- **THEN** the Email field shows "Enter your email" and the Password field shows "Enter your password", both outlined in the error color, and no login is tried

#### Scenario: Email not valid

- **WHEN** the user clicks Log in with "ana.example" in the Email field and a password
- **THEN** the Email field shows "Enter a valid email address", outlined in the error color, and no login is tried

#### Scenario: Password empty

- **WHEN** the user clicks Log in with a valid email and an empty Password field
- **THEN** only the Password field shows "Enter your password", outlined in the error color

### Requirement: A field's message goes away when the user types in it

A field's message and outline SHALL go away as soon as the user types in that field. The other field's message SHALL stay.

#### Scenario: User fixes the email

- **WHEN** both fields show their message and the user types in the Email field
- **THEN** the Email field's message and outline go away, and the Password field's message stays

### Requirement: Logging in shows a waiting state

While the app checks the email and password, both fields SHALL be locked, and the Log in button SHALL be dimmed and show a spinner and "Logging in…", so the user can't send the login twice. The spinner SHALL stand still when the user's system asks for reduced motion.

#### Scenario: User logs in

- **WHEN** the user clicks Log in with a valid email and a password
- **THEN** the fields are locked, and the button is dimmed and shows the spinner and "Logging in…" until the check finishes

#### Scenario: User clicks again while waiting

- **WHEN** the user clicks the button again while it shows "Logging in…"
- **THEN** no second login is sent

#### Scenario: Reduced motion

- **WHEN** the user's system asks for reduced motion and the user logs in
- **THEN** the spinner shows but doesn't spin

#### Scenario: The login fails

- **WHEN** a login fails, for any reason
- **THEN** the fields and the Log in button can be used again

### Requirement: A new login attempt closes the previous error popup

When the user clicks Log in again, any error popup still on screen from an earlier attempt SHALL go away, so at most one login error shows at a time.

#### Scenario: User tries again after a wrong password

- **WHEN** the "Wrong email or password." popup is on screen and the user clicks Log in again
- **THEN** that popup goes away, and only the new attempt's result shows

### Requirement: Correct details open the home page

When the email and password are correct, the app SHALL log the user in and show the home page, whatever address they first opened. No success message SHALL appear.

#### Scenario: Correct email and password

- **WHEN** a user the owner added logs in with their correct email and password
- **THEN** they see the home page, with no success message

#### Scenario: User first opened another address

- **WHEN** a visitor opens an address other than the home page, sees the login screen, and logs in
- **THEN** they land on the home page

#### Scenario: Email typed with spaces around it

- **WHEN** the user types their correct email with a space before or after it, and their correct password
- **THEN** they see the home page

### Requirement: Wrong details show an error popup

When the email or the password is wrong, the app SHALL show the error popup "Wrong email or password." without saying which of the two was wrong. The email SHALL stay filled in, and the password SHALL be cleared.

#### Scenario: Wrong password

- **WHEN** the user logs in with a known email and a wrong password
- **THEN** the error popup says "Wrong email or password.", the email stays filled in, and the Password field is empty

#### Scenario: Unknown email

- **WHEN** the user logs in with an email the owner hasn't added
- **THEN** the error popup says "Wrong email or password.", the same message as for a wrong password

### Requirement: A failed check shows an error popup

When the app can't check the login, because the login service fails, is paused, or has had too many attempts, it SHALL show the error popup "Can't log in right now. Try again in a few minutes."

#### Scenario: The login service is down

- **WHEN** the user logs in while the login service can't be reached
- **THEN** the error popup says "Can't log in right now. Try again in a few minutes."

#### Scenario: Too many attempts

- **WHEN** the user logs in after the login service has refused further attempts for a while
- **THEN** the error popup says "Can't log in right now. Try again in a few minutes."

### Requirement: Messages never show the login service's own text

The screen SHALL show only its own messages, listed in this spec. It SHALL NOT show error text that comes from the login service.

#### Scenario: The login service returns its own message

- **WHEN** a login fails and the login service gives a reason in its own words
- **THEN** the user sees only "Wrong email or password." or "Can't log in right now. Try again in a few minutes."
