import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity types and functions
type Principal = string;
type Response<T, E> = { ok: T } | { err: E };

const mockContractCalls = {
  civilizations: new Map<number, {
    owner: Principal;
    name: string;
    technologyLevel: number;
    population: number;
    resources: number;
    lastUpdate: number;
  }>(),
  civilizationCount: 0,
};

function createCivilization(name: string): Response<number, never> {
  const civilizationId = ++mockContractCalls.civilizationCount;
  mockContractCalls.civilizations.set(civilizationId, {
    owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    name,
    technologyLevel: 1,
    population: 1000000,
    resources: 1000,
    lastUpdate: 0,
  });
  return { ok: civilizationId };
}

function updateCivilization(civilizationId: number): Response<boolean, number> {
  const civilization = mockContractCalls.civilizations.get(civilizationId);
  if (!civilization) return { err: 404 };
  
  const timePassed = 100; // Simulating time passed
  const newTechnology = civilization.technologyLevel + Math.floor(timePassed / 100);
  const newPopulation = civilization.population + Math.floor(civilization.population * (timePassed / 1000));
  const newResources = civilization.resources + Math.floor(civilization.technologyLevel * (timePassed / 10));
  
  mockContractCalls.civilizations.set(civilizationId, {
    ...civilization,
    technologyLevel: newTechnology,
    population: newPopulation,
    resources: newResources,
    lastUpdate: timePassed,
  });
  
  return { ok: true };
}

function getCivilization(civilizationId: number): Response<{
  owner: Principal;
  name: string;
  technologyLevel: number;
  population: number;
  resources: number;
  lastUpdate: number;
}, number> {
  const civilization = mockContractCalls.civilizations.get(civilizationId);
  if (!civilization) return { err: 404 };
  return { ok: civilization };
}

describe('Civilization Manager Contract', () => {
  beforeEach(() => {
    mockContractCalls.civilizations.clear();
    mockContractCalls.civilizationCount = 0;
  });
  
  it('should create a new civilization', () => {
    const result = createCivilization('Test Civilization');
    expect(result).toEqual({ ok: 1 });
    expect(mockContractCalls.civilizations.size).toBe(1);
  });
  
  it('should fail to update a non-existent civilization', () => {
    const result = updateCivilization(999);
    expect(result).toEqual({ err: 404 });
  });
});

