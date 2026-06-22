// ────────────────────────────────────────────────────────────────────────────
// THE itinerary — the one file to edit. The Paris days follow The Parlour's
// official "Paris Phase Trip" doc (Phase Directors, Jun 24–28); the UK / NL /
// Italy legs + bookend travel days are Brendan & Sha'Meaka's extension.
//
// `date`     — ISO yyyy-mm-dd, the calendar day we're at this location
// `lat/lon`  — the exact spot to forecast
// `timezone` — IANA tz, so "today" + sunrise/sunset are local-correct
// `plan`     — the day's activities; timed items get the forecast-at-that-hour
// `kind`     — picks the icon (see components/KindIcon.tsx)
// Grouping into countries uses the `country` field — see `countries` below.
//
// Covers Jun 23 → Jul 5: bookended by the "Headed out" (overnight Denver→Paris)
// and "Heading home" (London→Denver) travel days, with full flight details.
// ────────────────────────────────────────────────────────────────────────────

export const KIND_VALUES = [
  // getting around
  "flight", "train", "subway", "bus", "car", "walk", "bike", "boat", "layover",
  // doing things
  "food", "drinks", "sight", "show", "shopping", "outdoors", "lodging",
  "travel", // generic fallback
  "misc",
] as const;
export type ActivityKind = (typeof KIND_VALUES)[number];

export type Activity = {
  time?: string; // "09:30" 24h local; omit for all-day / flexible items
  title: string;
  note?: string;
  kind?: ActivityKind; // picks the icon (see components/KindIcon.tsx)
};

export type Stop = {
  id: string;
  city: string;
  country: string;
  label?: string;
  lat: number;
  lon: number;
  timezone: string;
  date: string;
  accent: string;
  locked?: boolean; // part of the shared owner-curated core (France); group-read-only
  plan?: Activity[];
};

// Pure place metadata, keyed by `name` (matches Stop.country). NO dates and NO
// order here — both are derived from the ordered itinerary (lib/trip.ts).
export type Country = { name: string; short: string; accent: string };

export const TRIP_NAME = "Paris Phase Trip";
export const TRIP_SUBTITLE = "Paris · London · Amsterdam · Puglia";

// Harmonized to sit under the warm cream / wine / terracotta base — still
// distinct enough for country wayfinding, but earthier and less candy.
const ACCENT = {
  paris: "#6f87a3", // dusty French blue
  versailles: "#b58a3c", // gilded gold
  london: "#9c5159", // claret (echoes the wine)
  amsterdam: "#c06a3a", // warm Dutch terracotta
  bari: "#3a8380", // muted Adriatic teal
  travel: "#8c8474", // warm stone — transit / bookend days
} as const;

export const countries: Country[] = [
  { name: "Departure", short: "Out", accent: ACCENT.travel },
  { name: "France", short: "France", accent: ACCENT.paris },
  { name: "United Kingdom", short: "UK", accent: ACCENT.london },
  { name: "Netherlands", short: "NL", accent: ACCENT.amsterdam },
  { name: "Italy", short: "Italy", accent: ACCENT.bari },
  { name: "Heading home", short: "Home", accent: ACCENT.travel },
];

export const itinerary: Stop[] = [
  {
    id: "depart-denver",
    city: "Denver → Paris",
    country: "Departure",
    label: "Delta · overnight to CDG",
    lat: 39.7392,
    lon: -104.9903,
    timezone: "America/Denver",
    date: "2026-06-23",
    accent: ACCENT.travel,
    plan: [
      {
        time: "15:15",
        title: "Delta DL957: Denver (DEN) → Atlanta (ATL)",
        note: "Airbus A321 · seat 17E · gate A49 · boarding 3:00 PM · conf G58BDT",
        kind: "flight",
      },
      { title: "Layover in Atlanta — 2h 8m", kind: "layover" },
      {
        title: "Delta DL8691: Atlanta (ATL) → Paris (CDG)",
        note: "Boeing 777-200 · seat 29K · overnight · arrive CDG 1:00 PM Jun 24 · Aerogare 2 Terminal E",
        kind: "flight",
      },
    ],
  },
  {
    id: "paris-arrival",
    locked: true,
    city: "Paris",
    country: "France",
    label: "Arrival + Moulin Rouge",
    lat: 48.8576,
    lon: 2.3053, // Hôtel du Cadran, 7th arr.
    timezone: "Europe/Paris",
    date: "2026-06-24",
    accent: ACCENT.paris,
    plan: [
      { time: "13:00", title: "Land at CDG — Delta from Denver", kind: "flight" },
      {
        time: "15:00",
        title: "Check in at Hôtel du Cadran",
        note: "Use the Parlour Uber account for airport transfers · check-in 3 PM",
        kind: "car",
      },
      {
        time: "17:15",
        title: "Meet in the lobby — share Ubers to dinner",
        note: "Save your receipts to be reimbursed",
        kind: "misc",
      },
      {
        time: "18:00",
        title: "Dinner at Pink Mamma",
        note: "~30-min car ride · 5-min walk to the show after",
        kind: "food",
      },
      {
        time: "21:00",
        title: "Moulin Rouge show",
        note: "Fancy night — dress up! Head back at your leisure after",
        kind: "show",
      },
    ],
  },
  {
    id: "versailles",
    locked: true,
    city: "Versailles",
    country: "France",
    label: "Bike & walking tours",
    lat: 48.8049,
    lon: 2.1204,
    timezone: "Europe/Paris",
    date: "2026-06-25",
    accent: ACCENT.versailles,
    plan: [
      { time: "07:00", title: "Breakfast on your own", kind: "food" },
      {
        time: "07:15",
        title: "Bike-tour group: walk to the meet-up (≈45 min)",
        note: "Guide is at the Starbucks at 2 Rue de la Pépinière (corner of Rue Pasquier), just outside Gare Saint-Lazare — there are 4 nearby, this is the one outside the station. Be 15 min early — the train to Versailles won't wait!",
        kind: "bike",
      },
      {
        time: "07:45",
        title: "Or meet in the lobby to take a car to the meet-up",
        note: "Share an Uber to the same Starbucks spot.",
        kind: "car",
      },
      {
        time: "09:40",
        title: "Walking-tour group: meet at Café Pierre Hermé",
        note: "Pl. de la Résistance · 3–3.5 hr tour · no large bags · Viator conf 1757097937",
        kind: "walk",
      },
      {
        title: "Dinner on your own",
        note: "Gene is gifting each Phase Director meal money",
        kind: "food",
      },
    ],
  },
  {
    id: "paris-wella",
    locked: true,
    city: "Paris",
    country: "France",
    label: "Wella class",
    lat: 48.8566,
    lon: 2.3522,
    timezone: "Europe/Paris",
    date: "2026-06-26",
    accent: ACCENT.paris,
    plan: [
      {
        time: "08:15",
        title: "Meet in the lobby — share Ubers to the Wella studio",
        note: "~30-min drive · save your receipts",
        kind: "car",
      },
      {
        time: "09:00",
        title: "Wella class — all Phase Directors",
        note: "9 AM – 4 PM",
        kind: "misc",
      },
      {
        title: "Partner free time",
        note: "Explore Paris while the class is in session (until ~4 PM)",
        kind: "walk",
      },
      {
        time: "18:45",
        title: "Meet in the lobby — 5-min walk to dinner",
        kind: "misc",
      },
      {
        time: "19:00",
        title: "Dinner at La Terrasse du 7",
        note: "Pre-selected menu · 2 place de l'École Militaire",
        kind: "food",
      },
    ],
  },
  {
    id: "paris-eiffel",
    locked: true,
    city: "Paris",
    country: "France",
    label: "Eiffel Tower + river cruise",
    lat: 48.8584,
    lon: 2.2945, // Eiffel Tower
    timezone: "Europe/Paris",
    date: "2026-06-27",
    accent: ACCENT.paris,
    plan: [
      { title: "Free day on your own until 4 PM", kind: "outdoors" },
      {
        time: "16:00",
        title: "Meet in the lobby — 15-min walk to the Eiffel Tower tour",
        note: "Meet-up: 41 Av. de la Bourdonnais · exchange vouchers for tickets — do NOT be late",
        kind: "walk",
      },
      {
        time: "16:45",
        title: "Eiffel Tower tour",
        note: "1.5 hrs · ends ~6:15 PM · Get Your Guide",
        kind: "sight",
      },
      { title: "Free time until dinner", kind: "misc" },
      {
        time: "20:20",
        title: "Meet in the lobby SHARP — walk to the boat",
        note: "Meet-up: 2 Rue du Ranelagh · follow the Diamant Bleu flags to the end of the pier",
        kind: "walk",
      },
      {
        time: "20:30",
        title: "Dinner + DJ river cruise",
        note: "3.5 hrs · Viator conf 1751773043",
        kind: "boat",
      },
    ],
  },
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    label: "Eurostar in · one night",
    lat: 51.5045,
    lon: -0.0949, // Southwark
    timezone: "Europe/London",
    date: "2026-06-28",
    accent: ACCENT.london,
    plan: [
      {
        time: "08:02",
        title: "Eurostar: Paris Gare du Nord → London St Pancras",
        note: "Arrive 9:30 AM · ref 2188261",
        kind: "train",
      },
      { time: "11:30", title: "Check in — Ibis Styles Southwark", kind: "lodging" },
      { time: "12:30", title: "Borough Market — coffee + wander", kind: "food" },
      {
        time: "14:00",
        title: "South Bank, Tate Modern & Tower Bridge on foot",
        kind: "walk",
      },
      { time: "15:00", title: "Westminster — Big Ben & the Abbey", kind: "sight" },
      { time: "19:00", title: "Dinner — Indian (Tower Tandoori)", kind: "food" },
    ],
  },
  {
    id: "amsterdam-arrival",
    city: "Amsterdam",
    country: "Netherlands",
    label: "Arrival · Heineken rooftop",
    lat: 52.3545,
    lon: 4.893, // De Pijp / Het Kabinet
    timezone: "Europe/Amsterdam",
    date: "2026-06-29",
    accent: ACCENT.amsterdam,
    plan: [
      { time: "07:00", title: "Check out → Heathrow (Tube)", kind: "subway" },
      {
        time: "11:45",
        title: "KLM KL1006: London (LHR) → Amsterdam (AMS)",
        note: "Arrive 2:05 PM (1h 20m) · conf Y5Q3NY",
        kind: "flight",
      },
      { time: "15:00", title: "Drop bags at Het Kabinet (De Pijp)", kind: "lodging" },
      {
        time: "17:00",
        title: "Heineken Experience — rooftop bar",
        note: "panoramic canal views",
        kind: "drinks",
      },
      { time: "18:30", title: "Dinner in De Pijp", kind: "food" },
    ],
  },
  {
    id: "amsterdam-annefrank",
    city: "Amsterdam",
    country: "Netherlands",
    label: "Anne Frank · Jordaan",
    lat: 52.3676,
    lon: 4.9041,
    timezone: "Europe/Amsterdam",
    date: "2026-06-30",
    accent: ACCENT.amsterdam,
    plan: [
      { time: "10:00", title: "Breakfast + shopping in De Pijp", kind: "shopping" },
      { time: "14:30", title: "Walk north into the Jordaan", kind: "walk" },
      {
        time: "15:00",
        title: "Nine Streets — boutiques + pastry",
        note: "pastry stop non-negotiable",
        kind: "shopping",
      },
      {
        time: "16:15",
        title: "Anne Frank House",
        note: "Prinsengracht 263 — strict 15-min entry, no late entry",
        kind: "sight",
      },
      { time: "19:30", title: "Dinner at Cafe de Klepel", kind: "food" },
      { time: "20:45", title: "Red Light District (De Wallen) walk", kind: "walk" },
    ],
  },
  {
    id: "amsterdam-departure",
    city: "Amsterdam",
    country: "Netherlands",
    label: "Last morning · evening flight to Bari",
    lat: 52.3545,
    lon: 4.893,
    timezone: "Europe/Amsterdam",
    date: "2026-07-01",
    accent: ACCENT.amsterdam,
    plan: [
      { time: "09:30", title: "Pack + breakfast in De Pijp", kind: "food" },
      { time: "12:00", title: "Albert Cuyp Market + Sarphatipark", kind: "shopping" },
      { time: "15:30", title: "Leave the hotel → Schiphol", kind: "car" },
      {
        time: "19:20",
        title: "Transavia HV5819: Amsterdam (AMS) → Bari (BRI)",
        note: "Arrive 9:50 PM · conf AF4EUD · taxi to the Bari Vecchia Airbnb",
        kind: "flight",
      },
    ],
  },
  {
    id: "lecce-ostuni",
    city: "Lecce & Ostuni",
    country: "Italy",
    label: "Day trip from Bari",
    lat: 40.3515,
    lon: 18.175, // Lecce
    timezone: "Europe/Rome",
    date: "2026-07-02",
    accent: ACCENT.bari,
    plan: [
      { time: "06:15", title: "Taxi → Bari Centrale", kind: "car" },
      {
        time: "07:45",
        title: "Train to Lecce",
        note: "Arrive ~9:15 AM",
        kind: "train",
      },
      {
        time: "09:30",
        title: "Lecce — Baroque old town & Roman amphitheatre",
        kind: "sight",
      },
      { time: "14:30", title: "Train to Ostuni, the White City", kind: "train" },
      {
        time: "16:30",
        title: "Golden hour — cathedral & sea viewpoints",
        kind: "outdoors",
      },
      { time: "18:00", title: "Aperitivo in the old town", kind: "drinks" },
      {
        time: "20:30",
        title: "Train back to Bari — nightcap in Bari Vecchia",
        kind: "train",
      },
    ],
  },
  {
    id: "polignano",
    city: "Polignano a Mare",
    country: "Italy",
    label: "Yacht + Grotta Palazzese",
    lat: 40.9956,
    lon: 17.2207,
    timezone: "Europe/Rome",
    date: "2026-07-03",
    accent: ACCENT.bari,
    plan: [
      { time: "06:00", title: "Leave the Airbnb", kind: "walk" },
      {
        time: "07:20",
        title: "Train Bari → Polignano",
        note: "Arrive 7:50 AM",
        kind: "train",
      },
      {
        time: "09:00",
        title: "Yacht cruise + swim stops",
        note: "3.5 hrs along the Adriatic coves",
        kind: "boat",
      },
      { time: "12:30", title: "Lunch + relax in Polignano", kind: "food" },
      {
        time: "17:30",
        title: "Dinner at Grotta Palazzese — sunset in a sea cave",
        kind: "food",
      },
      {
        time: "19:30",
        title: "Train back to Bari — nightcap at Botta",
        kind: "train",
      },
    ],
  },
  {
    id: "alberobello",
    city: "Alberobello",
    country: "Italy",
    label: "Trulli + departure",
    lat: 40.7826,
    lon: 17.2386,
    timezone: "Europe/Rome",
    date: "2026-07-04",
    accent: ACCENT.bari,
    plan: [
      { time: "07:00", title: "Pick up the rental car at Bari Airport", kind: "car" },
      { time: "08:15", title: "Alberobello — the trulli", kind: "sight" },
      {
        time: "13:30",
        title: "Locorotondo — flower-lined streets & coffee",
        kind: "sight",
      },
      {
        time: "18:00",
        title: "Drive back to Bari Airport",
        note: "for the flight out tonight",
        kind: "car",
      },
    ],
  },
  {
    id: "depart-italy",
    city: "Bari → London",
    country: "Heading home",
    label: "Ryanair · overnight at Stansted",
    lat: 41.1171,
    lon: 16.8719,
    timezone: "Europe/Rome",
    date: "2026-07-04",
    accent: ACCENT.travel,
    plan: [
      {
        time: "22:55",
        title: "Ryanair FR1906: Bari (BRI) → London Stansted (STN)",
        note: "10:55 PM → 12:50 AM · seats 19D & 19E · booking 917252691",
        kind: "flight",
      },
      {
        title: "Late arrival → Radisson Blu Stansted (sleep)",
        kind: "lodging",
      },
    ],
  },
  {
    id: "fly-home",
    city: "London → Denver",
    country: "Heading home",
    label: "United · nonstop",
    lat: 51.5074,
    lon: -0.1278,
    timezone: "Europe/London",
    date: "2026-07-05",
    accent: ACCENT.travel,
    plan: [
      {
        time: "08:00",
        title: "Check out — Radisson Blu Stansted",
        kind: "lodging",
      },
      {
        time: "08:45",
        title: "Stansted Express → Liverpool Street",
        note: "Arrive ~9:45 AM",
        kind: "train",
      },
      {
        time: "10:00",
        title: "Elizabeth Line → Heathrow",
        note: "Arrive ~10:45 AM",
        kind: "train",
      },
      {
        time: "14:50",
        title: "United UA263: London Heathrow (LHR) → Denver (DEN)",
        note: "Nonstop 9h 45m · 787-9 · arrive 5:35 PM · conf EXVCX6",
        kind: "flight",
      },
    ],
  },
];
