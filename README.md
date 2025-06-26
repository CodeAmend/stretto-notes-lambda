# 🎹 Stretto Notes - Practice Log Lambda

This AWS Lambda function is part of the Stretto Notes project. It receives structured piano practice logs via an HTTP POST request (via API Gateway), and inserts them into the `practice_logs` collection in a MongoDB Atlas database (`stretto_notes_gpt`).

---

## 🚀 Purpose

This Lambda is designed to:

- Accept a well-structured practice log as JSON via HTTP `POST`
- Validate the presence of required fields
- Insert the record directly into the MongoDB `practice_logs` collection
- Return a response confirming the insertion

---

## 🔗 API Endpoint

```http
POST https://<api-id>.execute-api.us-east-1.amazonaws.com/default/strettoNotes-logEntry


Replace `<your-api-id>` with your actual API Gateway ID.

---

## 📥 JSON Payload Specification

### ✅ Minimum Required Fields

The following top-level fields are **required**:

| Field             | Type     | Required | Description                              |
|------------------|----------|----------|------------------------------------------|
| `date`           | `string` | ✅       | Practice date (ISO 8601: `YYYY-MM-DD`)   |
| `piece`          | `string` | ✅       | Title or name of the piece practiced     |
| `piece_id`       | `string` | ✅       | A short ID or slug for the piece         |
| `duration_minutes` | `integer` | ✅     | Total time spent in minutes              |
| `entries`        | `array`  | ✅       | One or more log entries with detail      |

Each `entry` object must include at minimum:

| Field             | Type     | Required | Description                              |
|------------------|----------|----------|------------------------------------------|
| `content`        | `string` | ✅       | Freeform notes about the practice        |

---

### 🧩 Full Schema Example

```json
{
  "date": "2025-06-25",
  "piece": "Prelude in C Major",
  "composer": "J.S. Bach",
  "piece_id": "bwv846",
  "duration_minutes": 30,
  "entries": [
    {
      "focus": {
        "measures": "m.1–4",
        "page": "1",
        "section": "Intro",
        "book": "Well-Tempered Clavier I"
      },
      "content": "Worked on voicing and even tempo.",
      "tags": ["tempo", "touch"],
      "teacher_questions": ["How should I approach the left hand voicing?"]
    }
  ]
}

