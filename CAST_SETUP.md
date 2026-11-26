# Cast Setup – Almonte Curling Club 50/50 App

These steps let the **Cast** button send the draw to the clubhouse TV from Chrome on an **Android phone** or a computer.
It's a one-time setup of about 30 minutes, plus a short wait for Google.

**Done so far (2026-11-26):** the Cast app is registered with Application ID **`D972DF58`**, and that ID is
already in `index.html` (`CAST_APP_ID`). Steps 1 and 4 are done. Check that steps 2 and 3 match what's below.
The receiver URL must be exactly `https://lascellk.github.io/ACC-5050/?display=tv`.

---

## What you'll need

- The GitHub Pages address: `https://lascellk.github.io/ACC-5050/`
- A Google account (any one, e.g. the club's)
- A credit card for Google's **one-time US $5** developer registration fee
- The Chromecast's **serial number** (see step 3)

---

## Step 1 – Upload the new version

1. Go to your `acc-5050` repository on GitHub.
2. Click **Add file → Upload files**.
3. Drag in the new `index.html`. It replaces the old one.
4. Click **Commit changes**.

---

## Step 2 – Register a Cast app with Google

1. Go to **https://cast.google.com/publish** and sign in.
2. Accept the terms and pay the US $5 registration fee.
3. Click **Add New Application** → choose **Custom Receiver**.
4. Fill in:
   - **Name:** `ACC 50/50 Draw`
   - **Receiver Application URL:** `https://lascellk.github.io/ACC-5050/?display=tv`
     (capital `ACC`, as GitHub shows it)
5. Click **Save**.
6. Google shows an **Application ID**, 8 letters and numbers like `A1B2C3D4`. **Copy it.**

> The `?display=tv` address is the same app file in "TV mode". It hides all the controls and listens for the draw sent from the phone or laptop.

---

## Step 3 – Register your Chromecast as a test device

New Cast apps start out **unpublished**. Unpublished apps only run on Chromecasts you've registered as test devices. (Step 6 removes this limit.)

1. Find the Chromecast's serial number. It's printed on the Chromecast itself or on its box. On a Chromecast with Google TV, look in **Settings → System → About**.
2. In the Cast Developer Console, click **Add New Device**.
3. Enter the serial number and a description (e.g. "Clubhouse TV"), then click **OK**.
4. **Wait about 15 minutes**, then **restart the Chromecast** by unplugging its power for 10 seconds.

---

## Step 4 – Put the Application ID into the app

1. In your GitHub repository, click **`index.html`**, then click the **pencil icon** (Edit) at the top right of the file.
2. Press **Ctrl+F** (Windows) or **Cmd+F** (Mac) and search for:
   ```
   const CAST_APP_ID = '';
   ```
3. Paste your Application ID between the quotes:
   ```
   const CAST_APP_ID = 'A1B2C3D4';
   ```
4. Click **Commit changes…** → **Commit changes**.
5. Wait about a minute for GitHub Pages to update.

---

## Step 5 – Test it

**On an Android phone**
1. Connect the phone to the **same Wi-Fi** as the Chromecast.
2. Open your GitHub Pages address in **Chrome**. Other browsers, like Samsung Internet, won't work.
3. Tap **Cast** and pick the TV.
4. The TV shows "Next Draw Coming Up" (no PIN screen: the TV only shows what the phone sends). Tap **Draw Member** on the phone and watch the TV.

**On a computer**
1. Open the address in Chrome and press **Ctrl+Shift+R** / **Cmd+Shift+R** to load the new version.
2. Click **Cast** and pick the TV. Casting from a computer now uses the same Cast app.

While casting, the Cast icon turns gold. To stop, tap it and confirm.

---

## Step 6 – Publish the app (optional, recommended)

Publishing lets the app run on **any** Chromecast, such as a different TV at the club, without registering each one.

1. In the Cast Developer Console, open **ACC 50/50 Draw**.
2. Click **Publish**.
3. Google can take a little while to roll it out. Restart the Chromecast if it doesn't pick it up right away.

---

## Troubleshooting

| What you see | What to try |
|---|---|
| "The TV couldn't open the draw app" | The device isn't registered yet, or hasn't been restarted since. Re-check step 3, or publish the app (step 6). |
| "No Cast devices found" | The phone/laptop and Chromecast must be on the same Wi-Fi. Guest networks often block casting. |
| TV opens but stays on "Next Draw Coming Up" during a draw | Check the Receiver URL in step 2 ends in `?display=tv` and matches your GitHub Pages address exactly. |
| Tapping Cast says casting needs Chrome | You're on an iPhone/iPad, a non-Chrome browser, or the app is inside the Google Sites embed. Open the GitHub Pages address directly in Chrome. |
| Old behaviour after updating | Hard-refresh (**Ctrl+Shift+R** / **Cmd+Shift+R**). On a phone, close the tab and reopen it. |
| Test device never works | In the **Google Home** app, open the Chromecast's settings and make sure it is allowed to send its serial number to Google (needed for test devices on some models). |

---

## Not supported

- **iPhones and iPads:** Chrome on iOS can't use Google Cast from a web page.
- **Firefox and Safari** on any device.
