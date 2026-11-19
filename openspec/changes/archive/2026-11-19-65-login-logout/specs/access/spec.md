# Spec Delta

## Purpose

Decides who can see the app: only logged-in users see its pages, so the teams' matches stay with their players, and everyone else sees the login screen.

## ADDED Requirements

### Requirement: Visitors who aren't logged in see only the login screen

The app SHALL show the login screen to a visitor who isn't logged in, at every address of the app, whether the address exists or not. Nothing else of the app SHALL be visible to them.

#### Scenario: Visitor opens the home page

- **WHEN** a visitor who isn't logged in opens the home page
- **THEN** they see the login screen, not the home page

#### Scenario: Visitor opens an address that doesn't exist

- **WHEN** a visitor who isn't logged in opens an address that doesn't exist
- **THEN** they see the login screen, not the "page not found" page

### Requirement: Logged-in users see the app's pages

The app SHALL show a logged-in user the page at the address they open. An address that doesn't exist SHALL show the "page not found" page.

#### Scenario: Logged-in user opens the home page

- **WHEN** a logged-in user opens the home page
- **THEN** they see the home page

#### Scenario: Logged-in user opens an address that doesn't exist

- **WHEN** a logged-in user opens an address that doesn't exist
- **THEN** they see the "page not found" page

### Requirement: Logged-in users skip the login screen

The app SHALL send a logged-in user who opens the login screen to the home page.

#### Scenario: Logged-in user opens the login screen

- **WHEN** a logged-in user opens the login screen's address
- **THEN** they see the home page instead

### Requirement: Users can't sign themselves up

The app SHALL offer no way to create an account or reset a password. The owner adds each user by hand, and the login screen SHALL say that sign-ups are closed.

#### Scenario: Visitor looks for a way to sign up

- **WHEN** a visitor looks at the login screen
- **THEN** they see no sign-up or "forgot password" link, and a note that sign-ups are closed
