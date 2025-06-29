// index.test.js
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { handler } from './index.js';
import { MONGO_CLIENT_ERROR } from '../../shared/constants.js';

// Mock the mongo client module BEFORE any imports that use it
vi.mock('../../shared/mongo-client.js');

// Now import the mocked module
import { getMongoClient } from '../../shared/mongo-client.js';

const insertOneMock = vi.fn();
const mockDb = {
  collection: vi.fn(() => ({
    insertOne: insertOneMock
  }))
};

const mockClient = {
  db: vi.fn(() => mockDb)
};

describe('note-create handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock implementation
    getMongoClient.mockResolvedValue(mockClient);
  });

  it('returns validation error for empty body', async () => {
    const res = await handler({ body: {} });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Validation failed');
  });

  it('creates note with valid data', async () => {
    const validNote = {
      rep_id: 'test_piece',
      timestamp: new Date().toISOString(),
      duration: 30,
      raw_content: 'Test session',
      entries: [{ content: 'Test', type: 'discovery' }]
    };

    insertOneMock.mockResolvedValueOnce({ insertedId: '123' });
    
    const res = await handler({ body: JSON.stringify(validNote) });
    expect(res.statusCode).toBe(201);
    expect(insertOneMock).toHaveBeenCalled();
  });

  it('handles MongoDB connection failure', async () => {
    // Override the default mock for this test
    getMongoClient.mockRejectedValueOnce(new Error('Connection failed'));
    
    const validNote = {
      rep_id: 'test_piece',
      timestamp: new Date().toISOString(),
      duration: 30,
      raw_content: 'Test',
      entries: [{ content: 'Test', type: 'discovery' }]
    };
    
    const res = await handler({ body: validNote });
    expect(res.statusCode).toBe(500);
    const body = JSON.parse(res.body);
    expect(body.error).toBe(MONGO_CLIENT_ERROR);
  });
});
