import { describe, expect, it, vi, beforeEach } from 'vitest';
import { handler } from './index.js';
import { mockNoteSightreading } from '../../mocks/notes';
import { MISSING_SCHEMA_VALUES, MONGO_CLIENT_ERROR, MONGO_CREATE_ERROR } from '../../shared/constants.js';
import * as mongoClient from '../../shared/mongo-client.js';

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

  it("returns 500 & error if Mongo connection fails", async () => {
    mongoClient.getMongoClient.mockImplementationOnce(() => {
      throw new Error(MONGO_CLIENT_ERROR);
    })
    const res = await handler({ body: mockNoteSightreading });
    expect(res.statusCode).toBe(500)
  })

  describe("Create: Insert Collection", () => {
    beforeEach(() => {
      insertOneMock.mockClear();
    })

    it("calls insertOne when a full note is in the body", async () => {
      await handler({ body: mockNoteSightreading });
      expect(insertOneMock).toHaveBeenCalled()
      expect(insertOneMock.mock.calls[0][0]).toBe(mockNoteSightreading)
    });

    it("It throws a 500 error on Mongo error", async () => {
      insertOneMock.mockImplementationOnce(() => {
        throw new Error(MONGO_CREATE_ERROR)
      })
      const res = await handler({ body: mockNoteSightreading });
      expect(res.statusCode).toBe(500)
      expect(res.body).toBe(JSON.stringify({ error: MONGO_CREATE_ERROR }))
    });

    it("returns 201 when resource is created", async () => {
      insertOneMock.mockImplementationOnce()
      const res = await handler({ body: mockNoteSightreading });
      expect(res.statusCode).toBe(201)
      expect(res.body).toBe(JSON.stringify({ ok: true }))
    });

  });

  describe("Validation", () => {

    beforeEach(() =>{
      mockNote = { ...mockNoteSightreading }
    })

    async function expectFunc(mock) {
      const res = await handler({ body: mock });
      expect(res).toStrictEqual({
        statusCode: 400,
        body: JSON.stringify({ error: MISSING_SCHEMA_VALUES })
      });
    }

    it('returns 400 if rep_id is missing', async () => {
      delete mockNote.rep_id;
      await expectFunc(mockNote);
    })

    it('returns 400 if note_id is missing', async () => {
      delete mockNote.note_id;
      await expectFunc(mockNote);
    })

    it('returns 400 if time is missing', async () => {
      delete mockNote.time;
      await expectFunc(mockNote);
    })

    it('returns 400 if time is missing', async () => {
      delete mockNote.date;
      await expectFunc(mockNote);
    })

    it('returns 400 if duration_minutes is missing', async () => {
      delete mockNote.duration_minutes;
      await expectFunc(mockNote);
    })

    it('returns 400 if entries is missing', async () => {
      delete mockNote.entries;
      await expectFunc(mockNote);
    })

    it('returns 400 if entries does not have', async () => {
      delete mockNote.entries;
      await expectFunc(mockNote);
    })

    it('returns 400 if entries does not have', async () => {
      mockNote.entries = [];
      await expectFunc(mockNote);
    })
  })
});

