import { describe, expect, it, vi, beforeEach } from 'vitest';
import { handler } from './index.js';
import { MONGO_CLIENT_ERROR } from '../../shared/constants.js';


// Mock the mongo client module
vi.mock('../../shared/mongo-client.js');
import { getMongoClient } from '../../shared/mongo-client.js';

const insertOneMock = vi.fn();
const findOneMock = vi.fn();
const mockDb = {
  collection: vi.fn(() => ({
    insertOne: insertOneMock,
    findOne: findOneMock
  }))
};

const mockClient = {
  db: vi.fn(() => mockDb)
};

describe('repertoire-create handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMongoClient.mockResolvedValue(mockClient);
    findOneMock.mockResolvedValue(null); // Default: no existing repertoire
  });

  it('returns validation error for empty body', async () => {
    const res = await handler({ body: {} });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Validation failed');
  });

  it('creates repertoire with valid data', async () => {
    const validRepertoire = {
      rep_id: 'chopin_waltz_op18',
      name: 'Waltz in E-flat major, Op. 18',
      display_name: 'Chopin Waltz Op. 18'
    };

    insertOneMock.mockResolvedValueOnce({ insertedId: '123' });
    
    const res = await handler({ body: JSON.stringify(validRepertoire) });
    expect(res.statusCode).toBe(201);
    expect(insertOneMock).toHaveBeenCalled();
    
    const responseBody = JSON.parse(res.body);
    expect(responseBody.ok).toBe(true);
    expect(responseBody.rep_id).toBe('chopin_waltz_op18');
  });

  it('returns 409 if rep_id already exists', async () => {
    const existingRepertoire = {
      rep_id: 'chopin_waltz_op18',
      name: 'Existing piece'
    };
    
    findOneMock.mockResolvedValueOnce(existingRepertoire);
    
    const newRepertoire = {
      rep_id: 'chopin_waltz_op18',
      name: 'Waltz in E-flat major, Op. 18',
      display_name: 'Chopin Waltz Op. 18'
    };
    
    const res = await handler({ body: newRepertoire });
    expect(res.statusCode).toBe(409);
    const body = JSON.parse(res.body);
    expect(body.error).toContain('already exists');
  });

  it('handles MongoDB connection failure', async () => {
    getMongoClient.mockRejectedValueOnce(new Error('Connection failed'));
    
    const validRepertoire = {
      rep_id: 'chopin_waltz_op18',
      name: 'Waltz in E-flat major, Op. 18',
      display_name: 'Chopin Waltz Op. 18'
    };
    
    const res = await handler({ body: validRepertoire });
    expect(res.statusCode).toBe(500);
    const body = JSON.parse(res.body);
    expect(body.error).toBe(MONGO_CLIENT_ERROR);
  });
});
