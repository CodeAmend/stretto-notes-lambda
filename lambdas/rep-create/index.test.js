import { describe, expect, it, vi, beforeEach } from 'vitest';
import { handler } from './index.js';
import {
  ERROR_MISSING_ID,
  ERROR_MISSING_TITLE,
  ERROR_MISSING_TYPE,
  ERROR_MISSING_CREATED_AT,
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

describe('generic resource creation Lambda', () => {
  let mockResource;

  beforeEach(() => {
    // This mock represents a rep resource
    mockResource = {
      rep_id: 'resource_1',
      title: 'Generic Resource',
      type: 'type_a',
      created_at: '2025-06-30'
    };
  });

  async function expectFailedValidation(mock, expectedError) {
    const res = await handler({ body: mock });
    expect(res).toStrictEqual({
      statusCode: 400,
      body: JSON.stringify({ ok: false, error: expectedError })
    });
  }

  describe("Mongo Connection Failure", () => {
    it("returns 500 & error if Mongo connection fails", async () => {
      mongoClient.getMongoClient.mockImplementationOnce(() => {
        throw new Error(MONGO_CLIENT_ERROR);
      });
      const res = await handler({ body: mockResource });
      expect(res.statusCode).toBe(500);
      expect(res.body).toBe(JSON.stringify({ ok: false, error: MONGO_CLIENT_ERROR }));
    });
  });

  describe("Validation", () => {
    it('returns 400 if id is missing', async () => {
      delete mockResource.rep_id;
      await expectFailedValidation(mockResource, ERROR_MISSING_ID);
    });

    it('returns 400 if title is missing', async () => {
      delete mockResource.title;
      await expectFailedValidation(mockResource, ERROR_MISSING_TITLE);
    });

    it('returns 400 if type is missing', async () => {
      delete mockResource.type;
      await expectFailedValidation(mockResource, ERROR_MISSING_TYPE);
    });

  });

  describe("Create: Insert Collection", () => {
    beforeEach(() => {
      insertOneMock.mockClear();
    });

    it("calls insertOne when a full resource is in the body", async () => {
      await handler({ body: mockResource });
      expect(insertOneMock).toHaveBeenCalled();
      expect(insertOneMock.mock.calls[0][0]).toBe(mockResource);
    });

    it("throws a 500 error on Mongo error", async () => {
      insertOneMock.mockImplementationOnce(() => {
        throw new Error(MONGO_CREATE_ERROR);
      });
      const res = await handler({ body: mockResource });
      expect(res.statusCode).toBe(500);
      expect(res.body).toBe(JSON.stringify({ ok: false, error: MONGO_CREATE_ERROR }));
    });

    it("returns 201 when resource is created successfully", async () => {
      insertOneMock.mockImplementationOnce(() => {});  // No error
      const res = await handler({ body: mockResource });
      expect(res.statusCode).toBe(201);
      expect(res.body).toBe(JSON.stringify({ ok: true }));
    });
  });
});
