# Almonte Curling Club 50/50 Draw

A single-page app (`index.html`) for the club's weekly 50/50 draw, plus the draw server it talks to (`server/`).

- **Live:** GitHub Pages serves `main` at https://lascellk.github.io/ACC-5050/ . A commit to `main` goes live
  within a minute or two.
- **Members:** the "ACC Members 2026-27" Google Sheet. Entries with Paid = `Yes` count toward the pot and can
  win. The e-Transfer Tracker keeps that Sheet up to date.
- **Prize:** This Week's Pot = paid members × $1.00 (`POT_PER_PAID_MEMBER`). Winner Share = This Week's Pot +
  carryover. If the person drawn hasn't paid, the Winner Share carries over to the next draw.
- **Results:** each draw is added to the "DrawResults V2" Google Sheet. The next draw number and carryover are
  read back from it.

## PIN and the draw server

The page holds no Sheet links and no member data. It talks only to the **draw server**, an Apps Script web app
in `server/` that runs as treasurer@ (script "ACC 50-50 Draw Server"). Every request carries the PIN, and the
server checks it before anything is read or written:

- **load**: the member list (ID, name, paid; no emails or cities) and every draw in DrawResults V2.
- **draw**: adds the draw to DrawResults V2 and looks up the winner's email itself. A draw number that's
  already recorded is refused, so a draw can't be recorded twice.

After 10 wrong PINs in 15 minutes, the server refuses every request until those 15 minutes are up.

Each device remembers the PIN once it works. **Lock** makes that device forget it.

**Change the PIN:** in the script, open Project Settings > Script properties and edit `PIN`. Every device then
asks for the new one. For a new season, the optional `MEMBERS_ID` and `RESULTS_ID` properties point at the new
Sheets.

**Update the server:**

```
cd server
clasp push --force --user treasurer
clasp redeploy AKfycby0iLW5LvUA6jiQ1jzOh4bzata91_zDJ6KFvKimwSNujBNuyBhgtoeVVDj19_2zZJfLhA -d "what changed" --user treasurer
```

treasurer@ needs view access to ACC Members 2026-27 and edit access to DrawResults V2. Neither Sheet needs to
be published to the web or shared by link.

## Branches

- `main`: what's live.
- `cast`: v2.4, which adds a Cast button and a TV screen (`?display=tv`). It hasn't been used live yet and
  doesn't have the PIN or the draw server. See [CAST_SETUP.md](CAST_SETUP.md).
