/**
 * ACC 50/50 Draw Server. The draw app (GitHub Pages) talks only to this web app, which runs as treasurer@.
 * Every request carries the PIN; without the right one nothing is read or written.
 *
 *   load: the member list (ID, name, paid; no emails or cities) and every draw so far.
 *   draw: records a draw in DrawResults V2, looking up the winner's email itself.
 *
 * Script properties (Project Settings > Script properties):
 *   PIN         required. The draw app's PIN. Change it here to change the PIN.
 *   MEMBERS_ID  optional. The member list's link or id, for a new season.
 *   RESULTS_ID  optional. The draw results Sheet's link or id, for a new season.
 * treasurer@ needs view access to the member list and edit access to the results Sheet.
 */

const MEMBERS_DEFAULT = '1BJzoMt14pEuDa8Bqp5IDD06dV-aZ4L4oUdYuKZj-bp4'; // ACC Members 2026-27
const MEMBERS_TAB = 'Current_Members';
const RESULTS_DEFAULT = '1FyZH_Y4ttMUx20S2K0OkvxCjo4Gb8Cyp2XGgAGOQ1uU'; // DrawResults V2
const RESULTS_HEADERS = ['Draw #', 'Draw Date', 'First Name', 'Last Name', 'Email', 'Winner Amount', 'Carryover Amount'];
const MAX_FAILS = 10;        // wrong PINs allowed...
const LOCK_SECONDS = 15 * 60; // ...in this long, before every request is refused until it passes
// Who is emailed when a lockout starts. The LOCKOUT_EMAIL script property can name someone else.
const LOCKOUT_EMAIL = 'clubmgr@almontecurling.ca';

function doPost(e) {
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    checkPin_(req.pin);
    if (req.action === 'load') return json_({ ok: true, members: members_(), draws: draws_() });
    if (req.action === 'draw') return json_(Object.assign({ ok: true }, recordDraw_(req)));
    throw new Error('Unknown request.');
  } catch (err) {
    return json_({ ok: false, error: err.message, wrongPin: !!err.wrongPin });
  }
}

function doGet() {
  return json_({ ok: false, error: 'Open the 50/50 draw app instead.' });
}

/** Run once from the editor, signed in as treasurer@, to grant access and check the setup. */
function checkSetup() {
  if (!PropertiesService.getScriptProperties().getProperty('PIN')) throw new Error('Add the PIN script property.');
  Logger.log(members_().length + ' members, ' + draws_().length + ' draws. All set.');
}

function checkPin_(pin) {
  const want = PropertiesService.getScriptProperties().getProperty('PIN');
  if (!want) throw new Error('The server has no PIN set yet.');
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get('fails') || 0);
  if (fails >= MAX_FAILS) throw new Error('Too many wrong PINs. Try again in 15 minutes.');
  if (String(pin || '') !== want) {
    cache.put('fails', String(fails + 1), LOCK_SECONDS);
    if (fails + 1 === MAX_FAILS) emailLockout_('');
    Utilities.sleep(1000);
    const err = new Error('Wrong PIN.');
    err.wrongPin = true;
    throw err;
  }
}

/** Tells the club manager a lockout has started, once per lockout. A failed email never stops the request. */
function emailLockout_(note) {
  const to = PropertiesService.getScriptProperties().getProperty('LOCKOUT_EMAIL') || LOCKOUT_EMAIL;
  const when = Utilities.formatDate(new Date(), 'America/Toronto', "EEEE, MMMM d 'at' h:mm a");
  try {
    MailApp.sendEmail({
      to: to,
      subject: 'ACC 50/50 draw app: PIN locked after ' + MAX_FAILS + ' wrong PINs',
      body: 'The 50/50 draw server had ' + MAX_FAILS + ' wrong PINs, the last on ' + when + (note ? ' (' + note + ')' : '') + '.\n\n' +
        'Every request, including ones with the right PIN, is now refused for 15 minutes after the last wrong one, ' +
        'so the draw app cannot load or record a draw until then.\n\n' +
        'If it was someone at the club mistyping, it clears by itself, or open the "ACC 50-50 Draw Server" script ' +
        '(as treasurer@), choose clearPinLockout and click Run to lift it now.\n\n' +
        'If someone may be guessing the PIN, change PIN in Project Settings > Script properties, then tell the ' +
        'people who run the draw the new one.\n\n' +
        'Google does not say where the requests came from, so this email cannot say who it was.'
    });
  } catch (err) {
    console.error('Could not email the PIN lockout: ' + err.message);
  }
}

/** Run once from the editor to approve sending email, and to check the lockout email arrives. */
function testLockoutEmail() {
  emailLockout_('a test from the editor');
  Logger.log('Sent a test lockout email to ' + (PropertiesService.getScriptProperties().getProperty('LOCKOUT_EMAIL') || LOCKOUT_EMAIL) + '.');
}

/** Run from the editor to lift a PIN lockout straight away. */
function clearPinLockout() {
  CacheService.getScriptCache().remove('fails');
  Logger.log('PIN lockout cleared.');
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function open_(prop, fallback, what) {
  const v = PropertiesService.getScriptProperties().getProperty(prop) || fallback;
  try {
    return SpreadsheetApp.openById((v.match(/[-\w]{25,}/) || [''])[0]);
  } catch (err) {
    throw new Error('Cannot open the ' + what + '. Share it with treasurer@.');
  }
}

/** Rows of the first matching tab as objects by header. */
function table_(sheet) {
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0].map((h) => String(h).trim());
  return values.slice(1).filter((r) => r.join('').trim()).map((r) => {
    const o = {};
    headers.forEach((h, i) => (o[h] = String(r[i]).trim()));
    return o;
  });
}

/** Everyone on the list, with the full row kept server side for the email lookup. */
function memberRows_() {
  const ss = open_('MEMBERS_ID', MEMBERS_DEFAULT, '50/50 member list');
  return table_(ss.getSheetByName(MEMBERS_TAB) || ss.getSheets()[0])
    .map((r, i) => Object.assign(r, { id: r['ID'] || 'row' + (i + 1) }))
    .filter((r) => (r['First Name'] + r['Last Name']).trim());
}

function members_() {
  return memberRows_().map((r) => ({
    id: r.id, firstName: r['First Name'], lastName: r['Last Name'],
    paid: /^(yes|true)$/i.test(r['Paid']) ? 'Yes' : 'No',
  }));
}

function resultsSheet_() {
  return open_('RESULTS_ID', RESULTS_DEFAULT, '50/50 draw results Sheet').getSheets()[0];
}

function money_(v) {
  const n = parseFloat(String(v || '').replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function draws_() {
  return table_(resultsSheet_()).filter((r) => r['Draw #']).map((r) => ({
    num: parseInt(r['Draw #'], 10) || 0, date: r['Draw Date'],
    name: (r['First Name'] + ' ' + r['Last Name']).trim(),
    won: money_(r['Winner Amount']), carryover: money_(r['Carryover Amount']),
  }));
}

/** Adds the draw unless that draw number is already recorded (e.g. sent twice). */
function recordDraw_(req) {
  const num = parseInt(req.drawNum, 10);
  const won = Number(req.winnerAmount);
  const carry = Number(req.carryoverAmount);
  if (!(num > 0) || !(won >= 0) || !(carry >= 0) || !/^\d{4}-\d{2}-\d{2}$/.test(req.drawDate || '')) {
    throw new Error('The draw details are incomplete.');
  }
  const m = memberRows_().filter((r) => r.id === String(req.memberId))[0];
  if (!m) throw new Error('That member is not on the list.');

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = resultsSheet_();
    const last = draws_().reduce((n, d) => Math.max(n, d.num), 0);
    if (num <= last) throw new Error('Draw #' + num + ' is already recorded.');
    const p = req.drawDate.split('-').map(Number);
    const row = sheet.getLastRow() + 1;
    sheet.getRange(row, 1, 1, RESULTS_HEADERS.length).setValues([[
      num, new Date(p[0], p[1] - 1, p[2]), m['First Name'], m['Last Name'], m['Email'] || '', won, carry,
    ]]);
    sheet.getRange(row, 2).setNumberFormat('yyyy-mm-dd');
    sheet.getRange(row, 6, 1, 2).setNumberFormat('$#,##0.00');
    return { drawNum: num };
  } finally {
    lock.releaseLock();
  }
}
