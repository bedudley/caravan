# Our European Vacation

> One trusted itinerary for the trip, useful in the moment and meaningful to the people following along.

**Trip:** Brendan and Sha'Meaka's European vacation  
**Dates:** June 23–July 5, 2026  
**Destinations:** Paris, Versailles, London, Amsterdam, and Puglia  
**Document role:** Product cornerstone and decision guide  
**Last updated:** June 21, 2026

## Why this exists

Our European Vacation is the shared home for our trip. It combines the itinerary, timely weather, and notes in one place so that:

- Brendan and Sha'Meaka can quickly answer “What are we doing, when, and what do we need to know?”
- Our parents, family, and friends can understand where we are and follow the story without needing a stream of separate messages.
- We can keep private planning and personal memories beside the trip without exposing them to followers.

The application should feel like a living travel companion—not a spreadsheet, a generic weather dashboard, or a social network.

## Product promise

At any point before, during, or after the vacation, the app should present the right trip context with as little effort as possible:

1. **What is happening:** the itinerary for the relevant day.
2. **What conditions to expect:** weather tied to the place and time of the plan.
3. **What we want to share:** text and image updates for the people following us.
4. **What stays between us:** private notes for planning, reflection, and details that should not be public.

If a feature does not strengthen one of these jobs, it is secondary.

## Audiences

### Travelers: Brendan and Sha'Meaka

We are the owners and authors of the trip. We need a fast, mobile-first view while moving through unfamiliar places, often with limited attention or connectivity. We can view the full itinerary, use both notes lanes, and create, edit, or remove our own trip content.

Our experience prioritizes the current day, local time, actionable details, and clear private controls.

### Followers: parents, family, and friends

Followers are invited into the shared story of the trip. They need a simple, reassuring view of where we are, what the day generally holds, the local weather, and anything we have chosen to share.

They do not need operational secrets, private planning, or an interface that asks them to manage the trip. Their experience is primarily read-only and should remain useful even when we have not posted a note recently.

## The experience over time

### Before the trip

The app is a planning and anticipation tool. The itinerary is the anchor; forecasts may be unavailable or uncertain. Private notes are likely to contain reminders, decisions, and preparation details. Shared notes can set context for followers.

### During the trip

The app becomes an in-the-moment companion. Today and the next relevant activity come first. Weather, local time, navigation between days, and quick note creation should require very little effort. Followers see the trip unfold through shared notes without needing direct updates from us.

### After the trip

The app becomes a record of the vacation. The itinerary and shared notes preserve the story; private notes remain private. The experience should not lose meaning merely because live weather is no longer relevant.

## Core product principles

### Today is the default

During the trip, the app should orient people to the current day and location before showing the full schedule. Before and after the trip, it should provide an intentional beginning or ending rather than pretending the trip is live.

### One trip, two perspectives

Travelers and followers use the same underlying itinerary, but not the same information. Shared context should stay consistent while private and operational details remain restricted.

### Privacy must be visible and structural

A note's audience must be obvious before it is saved and whenever it is viewed or edited. Privacy cannot depend on color alone, a remembered default, or a client-side filter. Private content and media must be protected by authorization at the data boundary.

### Sharing is deliberate

Moving a note from private to shared is a meaningful publishing action. The app must not silently cross-post, infer an audience from note content, or change visibility as a side effect of editing.

### Useful beats exhaustive

Show the details that help someone make the next decision. Dense booking data, long-range weather precision, and administrative controls should not compete with the current plan.

### Calm under imperfect conditions

Weather APIs fail, forecasts do not cover the full trip, images upload slowly, and connectivity disappears. The itinerary and existing notes should remain readable, and failure states should say what is unavailable without making the whole app feel broken.

### Mobile is the primary environment

The interface should work one-handed, outdoors, and at a glance. Touch targets, contrast, load time, and legibility take priority over decorative density. Larger screens should improve comfort, not introduce a separate product.

### Local context is authoritative

Dates, “today,” activity times, sunrise, and sunset are evaluated in the destination's local timezone. The app should label times clearly when travel crosses timezones.

## Core experience

### Trip board

The trip board gives the whole journey shape while emphasizing the relevant day. It includes trip status, destinations, dates, a useful weather summary, and a clear path into each day.

### Day view

The day view combines the place, date, weather, and ordered activities. It should answer the immediate questions without requiring users to reconcile separate itinerary and weather screens.

### Notes

Notes belong to the trip and may optionally be associated with a day or itinerary stop. They support text, images, or both. The two lanes are a trust boundary, not merely an organizational filter.

#### Shared lane

This is the outward-facing trip journal: updates, observations, photos, and messages that Brendan or Sha'Meaka intentionally publish for followers.

- Travelers can create, view, edit, and delete shared notes.
- Followers can view shared notes.
- Shared content should be clearly presented as published.
- A note may be edited after publishing, but its audience must remain visible.

#### Private lane

This is the travelers' space for planning, reminders, candid reflections, and sensitive details.

- Only Brendan and Sha'Meaka can view or manage private notes.
- Private is the safe default when audience intent is unclear.
- Private text, image URLs, thumbnails, metadata, and search results must never be returned to followers.
- Publishing a private note requires an explicit visibility change and confirmation.

Lane names in the interface may evolve, but their audiences and guarantees do not.

### Conceptual note model

The product requires each note to have:

- a stable identifier;
- an author;
- `shared` or `private` visibility;
- text, one or more images, or both;
- created and last-edited timestamps;
- an optional itinerary day or stop association; and
- an explicit lifecycle, including deletion behavior.

The data model may add fields, but it must not allow ambiguous or missing visibility.

## Access and information safety

The public-safe itinerary may include locations, activity times, general transit information, and flight routes. It must not expose credentials or details that could be used to change, access, or impersonate our travel arrangements.

Keep the following traveler-only unless deliberately reviewed and approved for sharing:

- booking and confirmation codes;
- account, ticket, or check-in links;
- lodging entry instructions and access codes;
- passport, identity, payment, and contact information;
- precise private location data beyond what the itinerary needs; and
- private note content or media in any derived form.

Authentication mechanics and whether follower access is invite-only or link-based are implementation decisions still to be made. Whatever mechanism is chosen must enforce the same audience boundary on the server and in media storage.

## Product voice and visual character

The app should feel personal, warm, calm, and specific to this vacation. Language is direct and human. It may be playful in small moments, but never at the expense of clarity around time, travel, weather, or privacy.

The established visual direction—warm ivory, oxblood, terracotta, editorial display type, and destination accents—supports that character. Destination color helps with wayfinding; it must not be the only carrier of meaning.

## Definition of a successful first release

The first complete release succeeds when:

- travelers and followers can understand the itinerary on a phone without explanation;
- the app reliably emphasizes the correct day in the correct local timezone;
- useful weather appears alongside the days and activities it affects, with graceful unavailable states;
- Brendan and Sha'Meaka can quickly create a text or image note and confidently choose its audience;
- followers can read shared notes but cannot retrieve private notes or private media;
- travelers can distinguish shared from private content at a glance without relying only on color;
- no public view or response exposes booking credentials or other traveler-only details; and
- the itinerary and existing notes remain useful when live weather or uploads fail.

## Out of scope for the first release

Unless they become necessary to the promise above, these are later considerations:

- a general-purpose trip builder for other travelers;
- follower comments, reactions, or social feeds;
- collaborative itinerary editing by followers;
- automatic publishing to external social platforms;
- algorithmic recommendations or itinerary generation;
- a full photo-library replacement; and
- fine-grained audiences beyond shared and private.

## Current implementation context

The current application is a Next.js mobile web app with a code-defined itinerary and Open-Meteo forecasts refreshed every 30 minutes. It already provides a trip board, per-day timelines, destination-local dates, and weather views. This describes the present implementation; it is not a permanent constraint on the product.

Before any follower-facing release, the existing itinerary data needs a privacy audit. It currently contains booking references and seat details that do not meet the public-safe itinerary rule above.

## Open decisions

The following should be resolved through feature design or short decision records without weakening the principles in this document:

- How do Brendan and Sha'Meaka authenticate?
- Do followers authenticate, use an invite link, or access a deliberately public view?
- Can either traveler edit or delete the other's notes?
- What image storage, size limits, compression, and retention policy should apply?
- How should drafts and failed uploads behave with intermittent connectivity?
- How prominently should shared notes appear on the trip board versus each day?
- What should remain available, editable, or exportable after the trip?

## Decision rule

When requirements compete, choose the option that best preserves, in order:

1. the private/shared trust boundary;
2. correct and useful in-the-moment trip context;
3. fast traveler use on a phone;
4. a clear, low-effort follower experience; and
5. the warm, personal character of the vacation.

This document should change only when the product's purpose, audiences, or durable principles change. Feature behavior, schemas, and implementation choices belong in supporting specifications and decision records.
