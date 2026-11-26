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

After 10 wrong PINs in 15 minutes, the server refuses every request until those 15 minutes are up. When that
starts, it emails clubmgr@almontecurling.ca (or whoever the `LOCKOUT_EMAIL` script property names) with what to
do. To lift a lockout straight away, run `clearPinLockout` in the script. After the server's permissions change,
run `testLockoutEmail` once as treasurer@ to approve sending email and check that it arrives.

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

## Cast to the TV

The Cast button in the header (Chrome on an Android phone or a computer) shows the draw on the clubhouse TV,
the same way as the Bonspiel Manager. The Chromecast opens https://lascellk.github.io/ACC-5050/?display=tv ,
which hides the controls and skips the PIN. The phone or laptop still runs the draw and sends each screen to the
TV over a private Cast channel, so the TV never talks to the draw server. Cast App ID `D972DF58`
(`CAST_APP_ID`). Setup and troubleshooting: [CAST_SETUP.md](CAST_SETUP.md).

## Branches

- `main`: what's live.
- `cast`: the old v2.4 Cast version, from before the PIN and the draw server. Its Cast code is now on `main`;
  the branch is kept only for reference.
