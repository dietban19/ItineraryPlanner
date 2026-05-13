/**
 * Dummy trip data for local development.
 *
 * Shape mirrors the Trip / Day / Activity schemas in src/models/schemas.js.
 * Replace this with real API calls when the backend is ready.
 *
 * Trips included:
 *   - Santorini, Greece  (status: 'ongoing')
 *   - Hawaii, USA        (status: 'planning')
 *   - Tokyo, Japan       (status: 'planning')
 *   - Amalfi, Italy      (status: 'planning')
 */

// ─── Santorini ────────────────────────────────────────────────────────────────
export const SANTORINI_TRIP = {
  _id: 'trip_santorini_001',
  title: '5 Days in Santorini',
  destination: 'Santorini, Greece',
  dateRange: {
    start: '2026-06-12',
    end: '2026-06-16',
    label: 'Jun 12 – 16',
  },
  people: 2,
  image:
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=900&q=80',
  coverImage:
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=900&q=80',
  budget: { total: 3000, used: 1850, currency: 'USD' },
  status: 'ongoing',
  days: [
    {
      _id: 'day_s1',
      dayNum: 1,
      dayName: 'Fri',
      date: 'Jun 12',
      title: 'Arrival Day',
      activities: [
        {
          _id: 'act_s1_1',
          name: 'Check-in at Oia Castle Hotel',
          time: '3:00 PM',
          image:
            'https://images.unsplash.com/photo-1590537003300-fa2e7f84f20b?q=80&w=900',
          rating: null,
          type: 'activity',
          status: 'done',
          reviews: [
            {
              _id: 'rev_s1_1a',
              userId: null,
              userName: 'Alex',
              photos: [],
              rating: 5,
              comment: 'Amazing views right from the room!',
              addedAt: '2026-06-12T15:30:00.000Z',
            },
            {
              _id: 'rev_s1_1b',
              userId: null,
              userName: 'Jordan',
              photos: [],
              rating: 5,
              comment: 'The infinity pool overlooking the caldera was breathtaking.',
              addedAt: '2026-06-12T16:00:00.000Z',
            },
          ],
        },
        {
          _id: 'act_s1_2',
          name: 'Sunset in Oia',
          time: '7:45 PM',
          image:
            'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=900',
          rating: 4.9,
          type: 'activity',
          status: 'done',
          reviews: [
            {
              _id: 'rev_s1_2a',
              userId: null,
              userName: 'Alex',
              photos: [],
              rating: 5,
              comment: 'The most beautiful sunset I have ever seen.',
              addedAt: '2026-06-12T20:00:00.000Z',
            },
            {
              _id: 'rev_s1_2b',
              userId: null,
              userName: 'Jordan',
              photos: [],
              rating: 5,
              comment: 'Hundreds of people but it felt magical anyway. Sky went deep orange and pink.',
              addedAt: '2026-06-12T20:15:00.000Z',
            },
          ],
        },
        {
          _id: 'act_s1_3',
          name: 'Dinner at Metaxi Mas',
          time: '9:00 PM',
          image:
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900',
          rating: 4.8,
          type: 'restaurant',
          status: 'done',
          reviews: [
            {
              _id: 'rev_s1_3a',
              userId: null,
              userName: 'Alex',
              photos: [],
              rating: 5,
              comment: 'Best grilled octopus ever.',
              addedAt: '2026-06-12T22:00:00.000Z',
            },
            {
              _id: 'rev_s1_3b',
              userId: null,
              userName: 'Jordan',
              photos: [],
              rating: 4,
              comment: 'Great food, a bit pricey but totally worth it for a special night.',
              addedAt: '2026-06-12T22:30:00.000Z',
            },
          ],
        },
      ],
    },
    {
      _id: 'day_s2',
      dayNum: 2,
      dayName: 'Sat',
      date: 'Jun 13',
      title: 'Caldera Views',
      activities: [
        {
          _id: 'act_s2_1',
          name: 'Blue Dome Viewpoint',
          time: '9:00 AM',
          image:
            'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=900',
          rating: 4.7,
          type: 'activity',
          status: 'done',
          reviews: [
            {
              _id: 'rev_s2_1a',
              userId: null,
              userName: 'Alex',
              photos: [],
              rating: 4,
              comment: 'Crowded in the morning but absolutely worth it.',
              addedAt: '2026-06-13T10:00:00.000Z',
            },
          ],
        },
        {
          _id: 'act_s2_2',
          name: 'Fira Old Town Stroll',
          time: '11:30 AM',
          image:
            'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?q=80&w=900',
          rating: 4.6,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_s2_3',
          name: 'Lauda Restaurant',
          time: '8:00 PM',
          image:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=900',
          rating: 4.7,
          type: 'restaurant',
          status: 'planned',
          reviews: [],
        },
      ],
    },
    {
      _id: 'day_s3',
      dayNum: 3,
      dayName: 'Sun',
      date: 'Jun 14',
      title: 'Beach Day',
      activities: [
        {
          _id: 'act_s3_1',
          name: 'Red Beach',
          time: '10:00 AM',
          image:
            'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?q=80&w=900',
          rating: 4.5,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_s3_2',
          name: 'Ammoudi Bay Swim',
          time: '1:00 PM',
          image:
            'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=900',
          rating: 4.8,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_s3_3',
          name: 'Pelican Restaurant',
          time: '3:00 PM',
          image:
            'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?q=80&w=900',
          rating: 4.6,
          type: 'restaurant',
          status: 'planned',
          reviews: [],
        },
      ],
    },
    {
      _id: 'day_s4',
      dayNum: 4,
      dayName: 'Mon',
      date: 'Jun 15',
      title: 'Wine & Villages',
      activities: [
        {
          _id: 'act_s4_1',
          name: 'Santo Wines Winery',
          time: '11:00 AM',
          image:
            'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?q=80&w=900',
          rating: 4.6,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_s4_2',
          name: 'Pyrgos Village Walk',
          time: '2:00 PM',
          image:
            'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=900',
          rating: 4.4,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_s4_3',
          name: 'Roka Taverna',
          time: '7:30 PM',
          image:
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=900',
          rating: 4.5,
          type: 'restaurant',
          status: 'planned',
          reviews: [],
        },
      ],
    },
    {
      _id: 'day_s5',
      dayNum: 5,
      dayName: 'Tue',
      date: 'Jun 16',
      title: 'Last Day',
      activities: [
        {
          _id: 'act_s5_1',
          name: 'Morning Caldera Spa',
          time: '9:00 AM',
          image:
            'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=900',
          rating: null,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_s5_2',
          name: 'Perissa Black Beach',
          time: '12:00 PM',
          image:
            'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?q=80&w=900',
          rating: 4.5,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_s5_3',
          name: 'Farewell Dinner at Oia',
          time: '8:30 PM',
          image:
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900',
          rating: null,
          type: 'restaurant',
          status: 'planned',
          reviews: [],
        },
      ],
    },
  ],
};

// ─── Hawaii ───────────────────────────────────────────────────────────────────
export const HAWAII_TRIP = {
  _id: 'trip_hawaii_001',
  title: 'Hawaiian Island Hop',
  destination: 'Hawaii, USA',
  dateRange: {
    start: '2026-07-20',
    end: '2026-07-26',
    label: 'Jul 20 – 26',
  },
  people: 4,
  image:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80',
  coverImage:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80',
  budget: { total: 6000, used: 1200, currency: 'USD' },
  status: 'planning',
  days: [
    {
      _id: 'day_h1',
      dayNum: 1,
      dayName: 'Sun',
      date: 'Jul 20',
      title: 'Aloha!',
      activities: [
        {
          _id: 'act_h1_1',
          name: 'Waikiki Beach Walk',
          time: '4:00 PM',
          image:
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900',
          rating: 4.7,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_h1_2',
          name: "Duke's Waikiki",
          time: '7:00 PM',
          image:
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900',
          rating: 4.5,
          type: 'restaurant',
          status: 'planned',
          reviews: [],
        },
      ],
    },
    {
      _id: 'day_h2',
      dayNum: 2,
      dayName: 'Mon',
      date: 'Jul 21',
      title: 'Diamond Head',
      activities: [
        {
          _id: 'act_h2_1',
          name: 'Diamond Head Crater Hike',
          time: '7:00 AM',
          image:
            'https://images.unsplash.com/photo-1542259009477-d625272157b7?q=80&w=900',
          rating: 4.8,
          type: 'activity',
          status: 'done',
          reviews: [
            {
              _id: 'rev_h2_1a',
              userId: null,
              userName: 'Sam',
              photos: [],
              rating: 5,
              comment: 'Incredible views from the summit. Start early to beat the heat!',
              addedAt: '2026-07-21T09:00:00.000Z',
            },
            {
              _id: 'rev_h2_1b',
              userId: null,
              userName: 'Taylor',
              photos: [],
              rating: 5,
              comment: 'Took about 1.5 hours round trip. Views of Honolulu from the top are unreal.',
              addedAt: '2026-07-21T09:20:00.000Z',
            },
          ],
        },
        {
          _id: 'act_h2_2',
          name: 'Hanauma Bay Snorkeling',
          time: '11:00 AM',
          image:
            'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=900',
          rating: 4.9,
          type: 'activity',
          status: 'done',
          reviews: [
            {
              _id: 'rev_h2_2a',
              userId: null,
              userName: 'Sam',
              photos: [],
              rating: 5,
              comment: 'Crystal clear water, sea turtles everywhere!',
              addedAt: '2026-07-21T13:00:00.000Z',
            },
            {
              _id: 'rev_h2_2b',
              userId: null,
              userName: 'Taylor',
              photos: [],
              rating: 4,
              comment: 'Beautiful bay, had to book in advance. Definitely recommend the guided tour.',
              addedAt: '2026-07-21T13:30:00.000Z',
            },
          ],
        },
        {
          _id: 'act_h2_3',
          name: 'Matsumoto Shave Ice',
          time: '2:30 PM',
          image:
            'https://images.unsplash.com/photo-1488474376822-4fed4e3a33e0?q=80&w=900',
          rating: 4.7,
          type: 'restaurant',
          status: 'planned',
          reviews: [],
        },
      ],
    },
    {
      _id: 'day_h3',
      dayNum: 3,
      dayName: 'Tue',
      date: 'Jul 22',
      title: 'North Shore',
      activities: [
        {
          _id: 'act_h3_1',
          name: 'Banzai Pipeline',
          time: '9:00 AM',
          image:
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=900',
          rating: 4.8,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_h3_2',
          name: 'Waimea Bay',
          time: '11:30 AM',
          image:
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900',
          rating: 4.7,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_h3_3',
          name: "Giovanni's Shrimp Truck",
          time: '1:00 PM',
          image:
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=900',
          rating: 4.6,
          type: 'restaurant',
          status: 'planned',
          reviews: [],
        },
      ],
    },
    {
      _id: 'day_h4',
      dayNum: 4,
      dayName: 'Wed',
      date: 'Jul 23',
      title: 'Volcano Day',
      activities: [
        {
          _id: 'act_h4_1',
          name: "Hawai'i Volcanoes National Park",
          time: '8:00 AM',
          image:
            'https://images.unsplash.com/photo-1578244093421-e5c9f80b7e85?q=80&w=900',
          rating: 4.9,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_h4_2',
          name: 'Lava Field Walk',
          time: '1:00 PM',
          image:
            'https://images.unsplash.com/photo-1578244093421-e5c9f80b7e85?q=80&w=900',
          rating: 4.7,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
      ],
    },
    {
      _id: 'day_h5',
      dayNum: 5,
      dayName: 'Thu',
      date: 'Jul 24',
      title: 'Road to Hana',
      activities: [
        {
          _id: 'act_h5_1',
          name: 'Road to Hana Scenic Drive',
          time: '7:30 AM',
          image:
            'https://images.unsplash.com/photo-1565118531796-763e5082d113?q=80&w=900',
          rating: 4.9,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_h5_2',
          name: 'Twin Falls',
          time: '9:00 AM',
          image:
            'https://images.unsplash.com/photo-1551524559-8af4e6624178?q=80&w=900',
          rating: 4.6,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_h5_3',
          name: "Mama's Fish House",
          time: '6:30 PM',
          image:
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900',
          rating: 4.8,
          type: 'restaurant',
          status: 'planned',
          reviews: [],
        },
      ],
    },
    {
      _id: 'day_h6',
      dayNum: 6,
      dayName: 'Fri',
      date: 'Jul 25',
      title: 'Water Sports',
      activities: [
        {
          _id: 'act_h6_1',
          name: 'Surfing Lesson',
          time: '9:00 AM',
          image:
            'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?q=80&w=900',
          rating: 4.8,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_h6_2',
          name: 'Catamaran Snorkel Tour',
          time: '1:00 PM',
          image:
            'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?q=80&w=900',
          rating: 4.7,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_h6_3',
          name: 'Sunset Luau',
          time: '6:00 PM',
          image:
            'https://images.unsplash.com/photo-1559628233-100c798642b6?q=80&w=900',
          rating: 4.6,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
      ],
    },
    {
      _id: 'day_h7',
      dayNum: 7,
      dayName: 'Sat',
      date: 'Jul 26',
      title: 'Pearl Harbor & Farewell',
      activities: [
        {
          _id: 'act_h7_1',
          name: 'Pearl Harbor Memorial',
          time: '9:00 AM',
          image:
            'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?q=80&w=900',
          rating: 4.8,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_h7_2',
          name: 'Ala Moana Shopping',
          time: '1:00 PM',
          image:
            'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=900',
          rating: 4.3,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
      ],
    },
  ],
};

// ─── Tokyo ────────────────────────────────────────────────────────────────────
export const TOKYO_TRIP = {
  _id: 'trip_tokyo_001',
  title: 'Tokyo Adventure',
  destination: 'Tokyo, Japan',
  dateRange: {
    start: '2026-08-03',
    end: '2026-08-10',
    label: 'Aug 3 – 10',
  },
  people: 3,
  image:
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=80',
  coverImage:
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=80',
  budget: { total: 4500, used: 0, currency: 'USD' },
  status: 'planning',
  days: [
    {
      _id: 'day_t1',
      dayNum: 1,
      dayName: 'Sun',
      date: 'Aug 3',
      title: 'Arrival',
      activities: [
        {
          _id: 'act_t1_1',
          name: 'Shibuya Crossing',
          time: '6:00 PM',
          image:
            'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=900',
          rating: 4.8,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_t1_2',
          name: 'Ichiran Ramen',
          time: '8:00 PM',
          image:
            'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=900',
          rating: 4.7,
          type: 'restaurant',
          status: 'planned',
          reviews: [],
        },
      ],
    },
    {
      _id: 'day_t2',
      dayNum: 2,
      dayName: 'Mon',
      date: 'Aug 4',
      title: 'Temples & Shrines',
      activities: [
        {
          _id: 'act_t2_1',
          name: 'Senso-ji Temple',
          time: '9:00 AM',
          image:
            'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=900',
          rating: 4.9,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_t2_2',
          name: 'Meiji Shrine',
          time: '2:00 PM',
          image:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=900',
          rating: 4.8,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
      ],
    },
  ],
};

// ─── Amalfi Coast ─────────────────────────────────────────────────────────────
export const AMALFI_TRIP = {
  _id: 'trip_amalfi_001',
  title: 'Amalfi Coast Road Trip',
  destination: 'Amalfi, Italy',
  dateRange: {
    start: '2026-09-20',
    end: '2026-09-25',
    label: 'Sep 20 – 25',
  },
  people: 4,
  image:
    'https://images.unsplash.com/photo-1612698093158-e07ac200d44e?w=900&q=80',
  coverImage:
    'https://images.unsplash.com/photo-1612698093158-e07ac200d44e?w=900&q=80',
  budget: { total: 5000, used: 0, currency: 'USD' },
  status: 'planning',
  days: [
    {
      _id: 'day_a1',
      dayNum: 1,
      dayName: 'Sun',
      date: 'Sep 20',
      title: 'Arrival in Positano',
      activities: [
        {
          _id: 'act_a1_1',
          name: 'Positano Beach',
          time: '4:00 PM',
          image:
            'https://images.unsplash.com/photo-1612698093158-e07ac200d44e?q=80&w=900',
          rating: 4.8,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_a1_2',
          name: 'La Sponda Restaurant',
          time: '8:00 PM',
          image:
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900',
          rating: 4.7,
          type: 'restaurant',
          status: 'planned',
          reviews: [],
        },
      ],
    },
    {
      _id: 'day_a2',
      dayNum: 2,
      dayName: 'Mon',
      date: 'Sep 21',
      title: 'Ravello & Amalfi',
      activities: [
        {
          _id: 'act_a2_1',
          name: 'Villa Rufolo Ravello',
          time: '10:00 AM',
          image:
            'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=900',
          rating: 4.7,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
        {
          _id: 'act_a2_2',
          name: 'Amalfi Cathedral',
          time: '2:00 PM',
          image:
            'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?q=80&w=900',
          rating: 4.6,
          type: 'activity',
          status: 'planned',
          reviews: [],
        },
      ],
    },
  ],
};

// ── All trips ordered by start date ────────────────────────────────────────────
export const DUMMY_TRIPS = [
  SANTORINI_TRIP,
  HAWAII_TRIP,
  TOKYO_TRIP,
  AMALFI_TRIP,
];

/**
 * Suggested activities and restaurants per destination — used by the
 * AddActivityDrawer inside ItineraryTab. Keyed by destination string.
 *
 * Replace / extend with an API call when backend is ready.
 */
export const DESTINATION_SUGGESTIONS = {
  'Santorini, Greece': {
    activities: [
      {
        _id: 'sugg_s1',
        name: 'Sunset in Oia',
        time: '6:45 PM',
        rating: 4.9,
        type: 'activity',
        image:
          'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=900',
      },
      {
        _id: 'sugg_s2',
        name: 'Ammoudi Bay Swim',
        time: '2:00 PM',
        rating: 4.8,
        type: 'activity',
        image:
          'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=900',
      },
      {
        _id: 'sugg_s3',
        name: 'Blue Dome Viewpoint',
        time: '10:30 AM',
        rating: 4.7,
        type: 'activity',
        image:
          'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=900',
      },
      {
        _id: 'sugg_s4',
        name: 'Fira Old Town Stroll',
        time: '4:00 PM',
        rating: 4.6,
        type: 'activity',
        image:
          'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?q=80&w=900',
      },
    ],
    restaurants: [
      {
        _id: 'sugg_sr1',
        name: 'Metaxi Mas',
        time: '8:00 PM',
        rating: 4.8,
        type: 'restaurant',
        image:
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900',
      },
      {
        _id: 'sugg_sr2',
        name: 'Lauda Restaurant',
        time: '7:30 PM',
        rating: 4.7,
        type: 'restaurant',
        image:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=900',
      },
      {
        _id: 'sugg_sr3',
        name: 'Pelican Restaurant',
        time: '12:30 PM',
        rating: 4.6,
        type: 'restaurant',
        image:
          'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?q=80&w=900',
      },
      {
        _id: 'sugg_sr4',
        name: 'Roka Taverna',
        time: '1:00 PM',
        rating: 4.5,
        type: 'restaurant',
        image:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=900',
      },
    ],
  },
  'Hawaii, USA': {
    activities: [
      {
        _id: 'sugg_h1',
        name: 'Diamond Head Hike',
        time: '7:00 AM',
        rating: 4.8,
        type: 'activity',
        image:
          'https://images.unsplash.com/photo-1542259009477-d625272157b7?q=80&w=900',
      },
      {
        _id: 'sugg_h2',
        name: 'Hanauma Bay Snorkeling',
        time: '10:00 AM',
        rating: 4.9,
        type: 'activity',
        image:
          'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=900',
      },
      {
        _id: 'sugg_h3',
        name: 'Road to Hana',
        time: '7:30 AM',
        rating: 4.9,
        type: 'activity',
        image:
          'https://images.unsplash.com/photo-1565118531796-763e5082d113?q=80&w=900',
      },
      {
        _id: 'sugg_h4',
        name: 'Banzai Pipeline',
        time: '9:00 AM',
        rating: 4.8,
        type: 'activity',
        image:
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=900',
      },
    ],
    restaurants: [
      {
        _id: 'sugg_hr1',
        name: "Duke's Waikiki",
        time: '7:00 PM',
        rating: 4.5,
        type: 'restaurant',
        image:
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900',
      },
      {
        _id: 'sugg_hr2',
        name: "Mama's Fish House",
        time: '6:30 PM',
        rating: 4.8,
        type: 'restaurant',
        image:
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900',
      },
    ],
  },
  'Tokyo, Japan': {
    activities: [
      {
        _id: 'sugg_t1',
        name: 'Shibuya Crossing',
        time: '6:00 PM',
        rating: 4.8,
        type: 'activity',
        image:
          'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=900',
      },
      {
        _id: 'sugg_t2',
        name: 'Senso-ji Temple',
        time: '9:00 AM',
        rating: 4.9,
        type: 'activity',
        image:
          'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=900',
      },
    ],
    restaurants: [
      {
        _id: 'sugg_tr1',
        name: 'Ichiran Ramen',
        time: '8:00 PM',
        rating: 4.7,
        type: 'restaurant',
        image:
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=900',
      },
    ],
  },
  'Amalfi, Italy': {
    activities: [
      {
        _id: 'sugg_a1',
        name: 'Positano Beach',
        time: '10:00 AM',
        rating: 4.8,
        type: 'activity',
        image:
          'https://images.unsplash.com/photo-1612698093158-e07ac200d44e?q=80&w=900',
      },
      {
        _id: 'sugg_a2',
        name: 'Villa Rufolo Ravello',
        time: '10:00 AM',
        rating: 4.7,
        type: 'activity',
        image:
          'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=900',
      },
    ],
    restaurants: [
      {
        _id: 'sugg_ar1',
        name: 'La Sponda Restaurant',
        time: '8:00 PM',
        rating: 4.7,
        type: 'restaurant',
        image:
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900',
      },
    ],
  },
};

export const DEFAULT_SUGGESTIONS = {
  activities: [],
  restaurants: [],
};
