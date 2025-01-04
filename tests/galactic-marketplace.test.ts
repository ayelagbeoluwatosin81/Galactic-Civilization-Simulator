import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity types and functions
type Principal = string;
type Response<T, E> = { ok: T } | { err: E };

const mockContractCalls = {
  listings: new Map<number, {
    seller: Principal;
    itemType: string;
    price: number;
    expiration: number;
  }>(),
  listingNonce: 0,
};

function createListing(seller: Principal, itemType: string, price: number): Response<number, never> {
  const listingId = ++mockContractCalls.listingNonce;
  mockContractCalls.listings.set(listingId, {
    seller,
    itemType,
    price,
    expiration: 10000, // Simulated block height
  });
  return { ok: listingId };
}

function purchaseListing(listingId: number, buyer: Principal): Response<boolean, number> {
  const listing = mockContractCalls.listings.get(listingId);
  if (!listing) return { err: 404 };
  if (listing.expiration <= 0) return { err: 400 };
  // Simulating STX transfer
  mockContractCalls.listings.delete(listingId);
  return { ok: true };
}

function cancelListing(listingId: number, seller: Principal): Response<boolean, number> {
  const listing = mockContractCalls.listings.get(listingId);
  if (!listing) return { err: 404 };
  if (listing.seller !== seller) return { err: 403 };
  mockContractCalls.listings.delete(listingId);
  return { ok: true };
}

describe('Galactic Marketplace Contract', () => {
  beforeEach(() => {
    mockContractCalls.listings.clear();
    mockContractCalls.listingNonce = 0;
  });
  
  it('should create a new listing', () => {
    const result = createListing('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'Starship', 1000);
    expect(result).toEqual({ ok: 1 });
    expect(mockContractCalls.listings.size).toBe(1);
  });
  
  it('should purchase an existing listing', () => {
    createListing('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'Starship', 1000);
    const result = purchaseListing(1, 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ ok: true });
    expect(mockContractCalls.listings.size).toBe(0);
  });
  
  it('should cancel a listing', () => {
    createListing('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'Starship', 1000);
    const result = cancelListing(1, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ ok: true });
    expect(mockContractCalls.listings.size).toBe(0);
  });
  
  it('should fail to purchase a non-existent listing', () => {
    const result = purchaseListing(999, 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ err: 404 });
  });
  
  it('should fail to cancel a listing by non-owner', () => {
    createListing('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'Starship', 1000);
    const result = cancelListing(1, 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ err: 403 });
  });
});

