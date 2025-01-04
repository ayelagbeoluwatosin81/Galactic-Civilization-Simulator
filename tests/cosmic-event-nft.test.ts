import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity types and functions
type Principal = string;
type Response<T, E> = { ok: T } | { err: E };

const mockContractCalls = {
  events: new Map<number, Principal>(),
  eventUris: new Map<number, string>(),
  eventTypes: new Map<number, string>(),
  eventIdNonce: 0,
};

function mint(recipient: Principal, eventUri: string, eventType: string): Response<number, never> {
  const eventId = ++mockContractCalls.eventIdNonce;
  mockContractCalls.events.set(eventId, recipient);
  mockContractCalls.eventUris.set(eventId, eventUri);
  mockContractCalls.eventTypes.set(eventId, eventType);
  return { ok: eventId };
}

function transfer(eventId: number, sender: Principal, recipient: Principal): Response<boolean, number> {
  if (!mockContractCalls.events.has(eventId)) return { err: 404 };
  if (mockContractCalls.events.get(eventId) !== sender) return { err: 403 };
  mockContractCalls.events.set(eventId, recipient);
  return { ok: true };
}

function getOwner(eventId: number): Response<Principal, number> {
  const owner = mockContractCalls.events.get(eventId);
  if (!owner) return { err: 404 };
  return { ok: owner };
}

function getEventUri(eventId: number): Response<string, number> {
  const uri = mockContractCalls.eventUris.get(eventId);
  if (!uri) return { err: 404 };
  return { ok: uri };
}

function getEventType(eventId: number): Response<string, number> {
  const type = mockContractCalls.eventTypes.get(eventId);
  if (!type) return { err: 404 };
  return { ok: type };
}

describe('Cosmic Event NFT Contract', () => {
  beforeEach(() => {
    mockContractCalls.events.clear();
    mockContractCalls.eventUris.clear();
    mockContractCalls.eventTypes.clear();
    mockContractCalls.eventIdNonce = 0;
  });
  
  it('should mint a new cosmic event NFT', () => {
    const result = mint('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'https://example.com/event/1', 'Supernova');
    expect(result).toEqual({ ok: 1 });
    expect(mockContractCalls.events.size).toBe(1);
    expect(mockContractCalls.eventUris.size).toBe(1);
    expect(mockContractCalls.eventTypes.size).toBe(1);
  });
  
  it('should transfer an event NFT', () => {
    mint('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'https://example.com/event/1', 'Supernova');
    const result = transfer(1, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ ok: true });
    expect(getOwner(1)).toEqual({ ok: 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' });
  });
  
  it('should get the event URI and type', () => {
    mint('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'https://example.com/event/1', 'Supernova');
    expect(getEventUri(1)).toEqual({ ok: 'https://example.com/event/1' });
    expect(getEventType(1)).toEqual({ ok: 'Supernova' });
  });
  
  it('should fail to transfer a non-existent event', () => {
    const result = transfer(999, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ err: 404 });
  });
});

