# Almonte Curling Club 50/50 Draw

A single-page app (`index.html`) for the club's weekly 50/50 draw.

- **Live:** GitHub Pages serves `main` at https://lascellk.github.io/ACC-5050/ . The club's Google Site
  (sites.google.com/almontecurling.ca/almontecurlingclub5050) shows that address with Embed → By URL, so a
  commit to `main` goes live there within a minute or two. Nobody has to paste code into the Site.
- **Members:** loaded from the "ACC Members 2026-27" Google Sheet (published as CSV). Entries with Paid = `Yes`
  count toward the pot and can win. The e-Transfer Tracker keeps that Sheet up to date.
- **Prize:** This Week's Pot = paid members × $1.00 (`POT_PER_PAID_MEMBER`). Winner Share = This Week's Pot +
  carryover. If the person drawn hasn't paid, the Winner Share carries over to the next draw.
- **Results:** each draw is logged to the "DrawResults V2" Google Sheet through an Apps Script web app. The next
  draw number and carryover are read back from that Sheet.

## Branches

- `main`: what's live. It started as v2.2, the version that was pasted into the Google Site.
- `cast`: v2.4, which adds a Cast button and a TV screen (`?display=tv`). It hasn't been used live yet. See
  [CAST_SETUP.md](CAST_SETUP.md). Merge it into `main` once it's been tested.
