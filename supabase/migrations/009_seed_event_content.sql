-- Phase 4: Event schedule + camp map content blocks

INSERT INTO admin_content_blocks (key, content) VALUES
(
  'event_schedule',
  $json${
    "days": [
      {
        "id": "2026-09-26",
        "label": "Fri Sep 26",
        "items": [
          { "time": "8:00", "title": "Breakfast", "category": "meal" },
          { "time": "9:30", "title": "Opening circle & village framing", "category": "ceremony" },
          { "time": "11:00", "title": "Open Space — propose sessions", "category": "open_space" },
          { "time": "12:30", "title": "Lunch", "category": "meal" },
          { "time": "14:00", "title": "Camp activities (staff-led)", "category": "free_time" },
          { "time": "17:30", "title": "Free time on the land", "category": "free_time" },
          { "time": "18:30", "title": "Dinner", "category": "meal" },
          { "time": "20:00", "title": "Evening gathering & music", "category": "ceremony" }
        ]
      },
      {
        "id": "2026-09-27",
        "label": "Sat Sep 27",
        "items": [
          { "time": "8:00", "title": "Breakfast", "category": "meal" },
          { "time": "9:30", "title": "Morning Open Space sessions", "category": "open_space" },
          { "time": "12:30", "title": "Lunch", "category": "meal" },
          { "time": "14:00", "title": "Waterfront & camp activities", "category": "free_time" },
          { "time": "17:00", "title": "Village check-in circle", "category": "ceremony" },
          { "time": "18:30", "title": "Dinner", "category": "meal" },
          { "time": "20:30", "title": "Campfire stories", "category": "ceremony" }
        ]
      },
      {
        "id": "2026-09-28",
        "label": "Sun Sep 28",
        "items": [
          { "time": "8:00", "title": "Breakfast", "category": "meal" },
          { "time": "9:30", "title": "Co-creation teams meet", "category": "open_space" },
          { "time": "12:30", "title": "Lunch", "category": "meal" },
          { "time": "14:00", "title": "Afternoon Open Space", "category": "open_space" },
          { "time": "17:30", "title": "Rest & wander", "category": "free_time" },
          { "time": "18:30", "title": "Dinner", "category": "meal" },
          { "time": "20:00", "title": "Closing reflections (informal)", "category": "ceremony" }
        ]
      },
      {
        "id": "2026-09-29",
        "label": "Mon Sep 29",
        "items": [
          { "time": "8:00", "title": "Breakfast", "category": "meal" },
          { "time": "9:30", "title": "Harvest & integration circle", "category": "ceremony" },
          { "time": "11:00", "title": "Pack-down & gratitude", "category": "free_time" },
          { "time": "12:30", "title": "Lunch & farewell", "category": "meal" },
          { "time": "13:00", "title": "Main gathering concludes", "category": "ceremony" }
        ]
      },
      {
        "id": "2026-09-30",
        "label": "Tue Sep 30 — Now What",
        "items": [
          { "time": "8:00", "title": "Breakfast", "category": "meal" },
          { "time": "9:30", "title": "\"Now What\" day — open conversation", "category": "open_space" },
          { "time": "12:30", "title": "Lunch", "category": "meal" },
          { "time": "14:00", "title": "Checkout by 2pm", "category": "free_time" }
        ]
      }
    ]
  }$json$
),
(
  'camp_map',
  '{"imageUrl":"/camp-map.svg","caption":"Camp Ki-Wa-Y site map — Paradise Post (dining hall) has Wi-Fi. Waterfront access only with lifeguard on duty."}'
)
ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();
