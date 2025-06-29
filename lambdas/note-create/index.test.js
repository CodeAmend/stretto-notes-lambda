import { describe, expect, it, vi, beforeEach } from 'vitest';
import { handler } from './index.js';
import { mockNoteSightreading } from '../../mocks/notes';
import { MISSING_SCHEMA_VALUES } from '../../shared/constants.js';

const insertOneMock = vi.fn();

vi.mock('../../shared/mongo-client.js', () => ({
  getMongoClient: vi.fn(() => ({
    db: () => ({
      collection: () => ({
        insertOne: insertOneMock
      })
    })
  }))
}));

describe('note-create Lambda', () => {
  let mockNote;

  // describe("Create: Insert Collection", () => {

  //   it("calls insertOne when a full note is in the body", () => {
  //     await handler({ body: JSON.})
  //   })



  // });

  describe("Validation", () => {
    beforeEach(() =>{
      mockNote = { ...mockNoteSightreading }
    })

    it('returns 400 if rep_id is missing', async () => {
      delete mockNote.rep_id;
      const res = await handler({ body: mockNote });
      expect(res).toStrictEqual({
        statusCode: 400,
        body: JSON.stringify({ error: MISSING_SCHEMA_VALUES })
      });
    })

    it('returns 400 if note_id is missing', async () => {
      delete mockNote.note_id;
      const res = await handler({ body: mockNote });
      expect(res.statusCode).toBe(400);
    })

    it('returns 400 if time is missing', async () => {
      delete mockNote.time;
      const res = await handler({ body: mockNote });
      expect(res.statusCode).toBe(400);
    })

    it('returns 400 if time is missing', async () => {
      delete mockNote.date;
      const res = await handler({ body: mockNote });
      expect(res.statusCode).toBe(400);
    })

    it('returns 400 if duration_minutes is missing', async () => {
      delete mockNote.duration_minutes;
      const res = await handler({ body: mockNote });
      expect(res.statusCode).toBe(400);
    })

    it('returns 400 if entries is missing', async () => {
      delete mockNote.entries;
      const res = await handler({ body: mockNote });
      expect(res.statusCode).toBe(400);
    })

    it('returns 400 if entries does not have', async () => {
      delete mockNote.entries;
      const res = await handler({ body: mockNote });
      expect(res.statusCode).toBe(400);
    })

    it('returns 400 if entries does not have', async () => {
      mockNote.entries = [];
      const res = await handler({ body: mockNote });
      expect(res.statusCode).toBe(400);
    })
  })
});

