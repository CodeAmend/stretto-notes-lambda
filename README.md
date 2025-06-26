Stretto Notes Lambda Monorepo
This repo contains all AWS Lambda functions for Stretto Notes logging and analysis.
CI/CD is handled via GitHub Actions, with each Lambda in its own folder and auto-deployed to AWS when its folder changes.

🗂 Structure
lambdas/
  log-to-notion/
    index.js          # Main Lambda handler (Notion API)
    blocks.js         # Notion block helpers
    package.json      # Per-lambda deps
  log-to-mongo/
    index.js          # Main Lambda handler (MongoDB API)
    package.json
.github/
  workflows/
    deploy-log-to-notion.yml
    deploy-log-to-mongo.yml
README.md
.env                  # Local dev only (never commit)

🚀 How Deployment Works
Each Lambda folder has its own GitHub Actions workflow.

When you push code to (for example) lambdas/log-to-notion/, only the Notion Lambda is rebuilt and deployed to AWS.

All AWS credentials are managed via GitHub repo secrets (see CI/CD & Secrets Setup).

📝 API Schema: Log to Notion Lambda
POST /strettoNotes-logEntry
Sample payload:

```ts
{
  "noteId": "UUID",
  "timestamp": "2025-07-03T13:15:00Z",
  "date": "2025-07-03",
  "time": "13:15",
  "title": "Nocturne in E-flat Major", // Notion Title property
  "composer": "Chopin",
  "piece_id": "nocturne_op9_no2",
  "duration_minutes": 50,
  "style": "Nocturne",
  "status": "Learning",
  "keys": ["E-flat Major"],
  "Time Signature": ["4/4"],
  "entries": [
    {
      "focus": {
        "section": "Main Theme",
        "measures": "m.1–16",
        "page": "1",
        "book": "Henle Edition"
      },
      "content": "Worked on voicing the melody over the accompaniment...",
      "tags": ["voicing", "pedal", "accompaniment", "touch"],
      "teacher_questions": [
        "What’s the best finger substitution for measure 5?",
        "Should I use pedal in bars 9–10 as written?"
      ]
    }
  ]
}
```

Behavior:

If piece_id exists in the Notion rep DB, notes are appended to that page.

If not, a new rep DB row is created with proper defaults (see below), then notes are appended.

Defaults for new Notion rows:

Title: from note.title or piece_id

piece_id: from note.piece_id

Composer: from note.composer (if select property)

Style, Keys, Time Signature, Status: from matching fields if present

All required status fields (e.g., Teacher (Vivid), Memorization, Control, Expression) are set to safe defaults (Needs Work, Unfamiliar, etc.)

📝 API Schema: Log to Mongo Lambda
POST /strettoNotes-logEntry
Sample payload (same or similar as above):

```ts
{
  "noteId": "UUID",
  "timestamp": "2025-07-03T13:15:00Z",
  "date": "2025-07-03",
  "time": "13:15",
  "title": "Nocturne in E-flat Major",
  "composer": "Chopin",
  "piece_id": "nocturne_op9_no2",
  "duration_minutes": 50,
  "entries": [
    {
      "focus": { ... },
      "content": "Worked on voicing...",
      "tags": ["voicing", "pedal"],
      "teacher_questions": [ ... ]
    }
  ]
}
```

Any additional columns used by Notion can also be stored in Mongo for future reporting or lookup.
