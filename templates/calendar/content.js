// Agent-editable content. Read AGENTS.md first. Full source names: docs/full-schedule.json.
const CALENDAR_CONTENT = {
  year: 2026,
  start: '2026-11-29',
  end: '2026-12-18',
  themes: {
    machines: {title: 'MACHINES\nWEEK', color: '#795E4B', ink: '#795E4B'},
    life: {title: 'LIFE\nWEEK', color: '#00B3FA', ink: '#00B3FA'},
    intelligence: {title: 'INTELLIGENCE\nWEEK', color: '#E6A0E6', ink: '#E6A0E6'}
  },
  // Public Notion Default view, fully loaded 2026-11-10.
  // Date fields override stale summaries. See sources/README.md.
  days: [
  [
    "Opening\nday",
    "",
    true,
    ""
  ],
  [
    "Robotics\nDay",
    "",
    false,
    ""
  ],
  [
    "Robot OS\nDay",
    "",
    false,
    "TBC"
  ],
  [
    "Huaqiu\nVisit",
    "",
    false,
    ""
  ],
  [
    "Edge AI\n& AI\nAssurance",
    "",
    false,
    ""
  ],
  [
    "Chaihuo\nVisit",
    "",
    true,
    ""
  ],
  [
    "Startup\nGrind\nOpen Mic",
    "",
    false,
    ""
  ],
  [
    "ClawCon",
    "",
    true,
    ""
  ],
  [
    "Longevity",
    "",
    true,
    ""
  ],
  [
    "Synthetic\nBiology",
    "",
    false,
    ""
  ],
  [
    "Drug\nDiscovery",
    "",
    false,
    ""
  ],
  [
    "Wearables\n& BCI",
    "",
    false,
    ""
  ],
  [
    "Life\nBeyond the\nBody",
    "",
    false,
    ""
  ],
  [
    "Education\n& Robotics",
    "",
    true,
    ""
  ],
  [
    "Future Life\nor Hiking",
    "",
    false,
    "TBC"
  ],
  [
    "To be\nannounced",
    "",
    false,
    ""
  ],
  [
    "Open\nAgent Day",
    "",
    true,
    ""
  ],
  [
    "Games &\nFDE",
    "",
    false,
    ""
  ],
  [
    "SmallWod\nOpen Mic",
    "",
    false,
    "TBC"
  ],
  [
    "Closing\nCeremony",
    "",
    true,
    ""
  ]
]
};

const EXTRA_CARDS = [
  [
    0,
    0,
    "DATE TBC",
    "BODY &\nWELLBEING",
    false
  ],
  [
    1,
    0,
    "12/12 · TBC",
    "MAKERFAIR\nOR HIKING",
    true
  ],
  [
    2,
    0,
    "12/07 & 11 · TBC",
    "MORNING\nPRACTICE",
    false
  ],
  [
    4,
    0,
    "DATE TBC",
    "FUTURE\nSTORIES",
    true
  ],
  [
    5,
    0,
    "11/29 & 12/06",
    "CITY\nEXPLORATION",
    false
  ],
  [
    2,
    1,
    "12/04",
    "CLAWCOFFEE",
    true
  ],
  [
    3,
    1,
    "DATE TBC",
    "CITY\nQUEST",
    false
  ],
  [
    5,
    1,
    "DATE TBC",
    "FUTURE\nEDUCATION",
    true
  ]
];
const PHOTO_ASSETS = {body: "body-practice", outdoor: "shenzhen-hiking", city: "oct-loft"};
