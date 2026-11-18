# error-popup Specification

## Purpose

Shows the user an error message over the page, in one consistent place and look, and keeps it there until they close it or try again what caused it. Login uses it first; later features reuse it for their errors.

## Requirements

### Requirement: Error popup look and place

The error popup SHALL appear over the page, at the top right on desktop and across the top on phones. It SHALL show an error icon, the message and a close (×) button, with its border and icon in the error color. The error color SHALL be used only for errors.

#### Scenario: Popup on desktop

- **WHEN** an error popup appears on a screen 1280 px wide
- **THEN** it sits at the top right, over the page, with the error icon, the message and the close button

#### Scenario: Popup on a phone

- **WHEN** an error popup appears on a screen 390 px wide
- **THEN** it spans the top of the screen, over the page

### Requirement: An error popup stays until the user closes it or tries again

An error popup SHALL stay on screen until the user closes it with its close button, or until the user tries again the action that caused it. It SHALL NOT go away by itself.

#### Scenario: User waits

- **WHEN** an error popup has been on screen for a minute
- **THEN** it is still there

#### Scenario: User closes the popup

- **WHEN** the user clicks the popup's close button
- **THEN** the popup goes away

#### Scenario: User tries the action again

- **WHEN** an error popup is on screen and the user tries again the action that caused it
- **THEN** the popup goes away, and only the new attempt's result shows

### Requirement: Screen readers announce the popup

The error popup's message SHALL be announced by screen readers when it appears, and its close button SHALL be reachable and named "Close" for keyboard and screen reader users.

#### Scenario: Popup appears with a screen reader on

- **WHEN** an error popup appears while the user runs a screen reader
- **THEN** the screen reader reads its message without the user moving to it

#### Scenario: Keyboard user closes the popup

- **WHEN** a keyboard user moves to the popup's close button and presses Enter
- **THEN** the popup goes away
