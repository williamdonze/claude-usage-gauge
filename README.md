# Privacy Policy — Claude Usage Tracker

*Last updated: May 27, 2026*

## Overview

Claude Usage Tracker is a browser extension that displays your Claude usage gauges (session and weekly limits) directly inside the claude.ai interface. This policy explains how the extension handles data.

## Data Collection

**This extension does not collect, store, transmit, or share any personal data.**

- No data is sent to any external server
- No analytics or tracking of any kind
- No user accounts or registration required

## Data Used Locally

The extension accesses the following data **locally in your browser only**:

- **Claude usage data**: The extension reads usage information from the claude.ai API using your existing browser session. This data is only used to display the gauges on screen and is never transmitted outside your browser.
- **Local storage**: The last known usage values are cached in your browser's local storage so the popup can load instantly. This data never leaves your device.

## Permissions Explained

| Permission | Why it's needed |
|---|---|
| `*://claude.ai/*` | To inject the usage gauge UI and read usage data from claude.ai |
| `storage` | To cache usage data locally in the browser |
| `tabs` | To identify the active claude.ai tab |
| `scripting` | To inject the gauge interface into the claude.ai page |

## Third-Party Services

This extension does not use any third-party services, SDKs, or analytics tools.

## Changes to This Policy

If this policy changes, the updated version will be published in this repository with a new date.

## Contact

Open an issue on the GitHub repository if you have any questions.
