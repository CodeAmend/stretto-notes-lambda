import { describe, expect, it, vi, beforeEach } from 'vitest';
import { handler } from './index.js';
import { mockNoteSightreading } from '../../mocks/notes';
import {
  ERROR_MISSING_REP_ID,
  ERROR_MISSING_NOTE_ID,
  ERROR_MISSING_TIME,
  ERROR_MISSING_DATE,
  ERROR_MISSING_DURATION,
  ERROR_ENTRIES_NOT_ARRAY,
  MONGO_CLIENT_ERROR,
  MONGO_CREATE_ERROR
} from '../../shared/constants.js';
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
  });

  describe("Create: Insert Collection", () => {
    beforeEach(() => {
      insertOneMock.mockClear();
    });

    it("calls insertOne when a full note is in the body", async () => {
      await handler({ body: mockNoteSightreading });
      expect(insertOneMock).toHaveBeenCalled()
      expect(insertOneMock.mock.calls[0][0]).toBe(mockNoteSightreading)
    });

    it("throws a 500 error on Mongo error", async () => {
      insertOneMock.mockImplementationOnce(() => {
        throw new Error(MONGO_CREATE_ERROR)
      })
      const res = await handler({ body: mockNoteSightreading });
      expect(res.statusCode).toBe(500)
      expect(res.body).toBe(JSON.stringify({ ok: false, error: MONGO_CREATE_ERROR }))
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

    async function expectFailedValidation(mock, expectedError) {
      const res = await handler({ body: mock });
      expect(res).toStrictEqual({
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: expectedError })
      });
    }

    it('returns 400 if rep_id is missing', async () => {
      delete mockNote.rep_id;
      await expectFailedValidation(mockNote, ERROR_MISSING_REP_ID);
    });

    it('returns 400 if note_id is missing', async () => {
      delete mockNote.note_id;
      await expectFailedValidation(mockNote, ERROR_MISSING_NOTE_ID);
    });

    it('returns 400 if time is missing', async () => {
      delete mockNote.time;
      await expectFailedValidation(mockNote, ERROR_MISSING_TIME);
    });

    it('returns 400 if date is missing', async () => {
      delete mockNote.date;
      await expectFailedValidation(mockNote, ERROR_MISSING_DATE);
    });

    it('returns 400 if duration_minutes is missing', async () => {
      delete mockNote.duration_minutes;
      await expectFailedValidation(mockNote, ERROR_MISSING_DURATION);
    });

    it('returns 400 if entries is missing', async () => {
      delete mockNote.entries;
      await expectFailedValidation(mockNote, ERROR_ENTRIES_NOT_ARRAY);
    });

    it('returns 400 if entries is not an array', async () => {
      mockNote.entries = "not-an-array";
      await expectFailedValidation(mockNote, ERROR_ENTRIES_NOT_ARRAY);
    });

    it('returns 400 if entries is an empty array', async () => {
      mockNote.entries = [];
      await expectFailedValidation(mockNote, ERROR_ENTRIES_NOT_ARRAY);
    });
  });
});

