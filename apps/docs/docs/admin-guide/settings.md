---
sidebar_position: 8
title: Settings
---

# Settings

**Settings** under **System** is seven cards, each with a status pill that says how it stands
today: the **AI provider token**, **AI features**, **AI retrieval**, **Outbound email**,
**Working days**, the **Global announcement** and the **Maintenance notice**. It needs the site-admin role.

Two more cards appear at the bottom for the people who may use them: **Compliance module**
(compliance managers and the site admin) and **Hard reset of compliance data** (site admins).
They are described under **Compliance module** and **Hard reset of compliance data** below.

## 🤖 AI

- **AI provider token** shows **Set** or **Not set**. The token is stored securely and can't be
  read back; you can only replace it, or **Clear token**, which asks first because it turns the AI
  integration off for everyone until a new token is set.
- **AI features** turns AI on or off for everyone. Site admins always keep AI available. The card
  names the model in use.
- **AI retrieval** sets how many results AI retrieves per question.

:::note
Whether a module (AI, compliance reporting, ethics reporting) is available at all is decided at
install time. Settings has no switch for AI or ethics reporting beyond what the cards above say.
The one module with its own on/off switch here is the Compliance module, below.
:::

## 🗓 Working days

The **Working days** card is the site's work calendar. A workflow stage's **Due within N working
days** counts whole working days on it, so a stage is not due on a weekend or a holiday.

- **Working days** are the weekdays that count, Monday to Sunday; at least one must be checked.
  The pill shows them, for example "Mon–Fri · UTC".
- **Time zone** is the zone whose midnight ends a day. Pick it from the list of zone names.
- **Holidays** are dates that do not count even when the weekday does. **Add holiday**, pick the
  date and, if you like, give it a label of up to 80 characters; the label can stay empty. Each
  date can appear once, and the card says so before you save. **Remove** (the cross) takes a row
  off.

**Save** stores the calendar with the rest of the settings. If Steward refuses the calendar, the
card shows its message.

## 📣 Announcement and maintenance

The announcement card shows a live preview of the strip as you type. An **announcement** is a short, leveled (info or warning) message shown as a strip across the
top of every page, in both apps and on sign-in. People can dismiss an info announcement (it stays
hidden for them until the message changes); a warning can't be dismissed. Both are off until you turn them on, and both can carry an empty message to simply
hide the banner again.

**Maintenance** locks Steward down. While it is on, everyone who opens the staff app sees a
calm full-page **"SYSTEM DOWN FOR SCHEDULED MAINTENANCE"** screen with your message (or "The
system is temporarily unavailable for scheduled maintenance." when you leave it empty), and the
page reconnects by itself once maintenance ends. Site admins also get **Go to admin portal →**:
the admin console stays open to them, with the maintenance banner at the top, so they can turn
maintenance off again. Anyone else signed in to the admin console sees the same lockdown
screen.

## ✉️ Outbound email

The card's pill says **On** while email goes through this service, or **SMTP fallback** when it's
off and email goes through the SMTP relay. **Clear key** asks first. The platform email
transport's non-secret configuration (provider, domain, region, from
address) lives here, alongside whether a sending key is currently stored. The key itself is
**write-only**: saving one replaces it, and no query ever reads it back. Leave the key field
blank to keep the stored key unchanged while editing the other fields.

## 🛡 Compliance module

The **Compliance module** card has one switch. While the module is **On**, people can submit
reports and compliance staff can work cases. While it is **Off**, every report and case call is
refused: nobody can submit a report or open a case, and the staff app's reporting screens say
**Reporting is turned off**. Nothing is deleted when you turn it off, and turning it back on
brings everything back.

Moving the switch asks first, either way. If Steward refuses the change, the card says why in
plain words.

## 🧨 Hard reset of compliance data

The **Hard reset of compliance data** card is for site admins. It permanently deletes every
compliance case and everything that belongs to one. It cannot be undone. Settings and the module's off switch are kept, and one
audit record is kept that holds no case and no reporter information.

A reset needs two people and several steps, in this order:

1. **Turn the Compliance module off** on the card above, so no report arrives while the data is
   deleted. A reset cannot run while the module is on.
2. **The root admin asks.** Type a reason under **Ask for a hard reset** and choose **Request
   hard reset**. Only the root admin can ask. One request can be open at a time.
3. **A different site admin approves.** Open Settings, find the request under **Requests** and
   choose **Approve**. The person who asked cannot approve their own request, so with one root
   admin another site admin must do this. The requester can **Cancel request** at any point
   before it runs. A request that waits too long expires, and so does an approval that is not
   used; ask again if so.
4. **The root admin runs it.** Choose **Run the reset** on the approved request. First **export
   what you need to keep**: Steward cannot export from this window, so open the reports screen in
   the staff app and export every case you want to keep. Then tick that you have exported, or
   that you accept the loss, type `RESET COMPLIANCE DATA` exactly, and choose **Delete all
   compliance data**.

When it finishes, the card says how many cases were deleted and who asked and who approved. The
module stays off until you turn it on again.

A **legal hold** on any one case blocks the whole reset: nothing is deleted until every hold is
released. The card also explains the other refusals in words: the phrase did not match, the
module is still on, there is no approved request left to use, or the person is not the root
admin.
