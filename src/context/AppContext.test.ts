import { describe, it, expect } from 'vitest';
import { dbReducer, DB_ACTIONS } from './AppContext';
import type { Material } from '../types';

function makeMaterial(overrides: Partial<Material> = {}): Material {
  return {
    id: 'MAT-9999',
    name: 'Test Material',
    cat: '金属合金',
    hv: 200,
    ts: 500,
    el: 100,
    pf: 300,
    el2: 15,
    dn: 7.5,
    comp: 'Fe-C',
    batch: 'B-001',
    date: '2026-04-01',
    author: 'Tester',
    status: '登録済',
    ai: false,
    memo: 'test memo',
    ...overrides,
  };
}

const baseState: Material[] = [
  makeMaterial({ id: 'MAT-0001', name: 'Alpha' }),
  makeMaterial({ id: 'MAT-0002', name: 'Beta', status: 'レビュー待' }),
  makeMaterial({ id: 'MAT-0003', name: 'Gamma', status: 'レビュー待' }),
];

describe('dbReducer', () => {
  describe('ADD action', () => {
    it('adds a record to the beginning of the array', () => {
      const newRecord = makeMaterial({ id: 'MAT-0004', name: 'Delta' });
      const result = dbReducer(baseState, { type: 'ADD', record: newRecord });
      expect(result).toHaveLength(baseState.length + 1);
      expect(result[0]).toEqual(newRecord);
    });

    it('does not mutate the original state', () => {
      const original = [...baseState];
      const newRecord = makeMaterial({ id: 'MAT-0004' });
      dbReducer(baseState, { type: 'ADD', record: newRecord });
      expect(baseState).toEqual(original);
    });

    it('preserves existing records after the new one', () => {
      const newRecord = makeMaterial({ id: 'MAT-0004' });
      const result = dbReducer(baseState, { type: 'ADD', record: newRecord });
      expect(result.slice(1)).toEqual(baseState);
    });
  });

  describe('UPDATE action', () => {
    it('updates the matching record by id', () => {
      const updated = makeMaterial({ id: 'MAT-0002', name: 'Beta Updated', hv: 999 });
      const result = dbReducer(baseState, { type: 'UPDATE', record: updated });
      const found = result.find(r => r.id === 'MAT-0002');
      expect(found!.name).toBe('Beta Updated');
      expect(found!.hv).toBe(999);
    });

    it('does not change other records', () => {
      const updated = makeMaterial({ id: 'MAT-0002', name: 'Beta Updated' });
      const result = dbReducer(baseState, { type: 'UPDATE', record: updated });
      expect(result.find(r => r.id === 'MAT-0001')).toEqual(baseState[0]);
      expect(result.find(r => r.id === 'MAT-0003')).toEqual(baseState[2]);
    });

    it('keeps array length the same', () => {
      const updated = makeMaterial({ id: 'MAT-0002', name: 'Beta Updated' });
      const result = dbReducer(baseState, { type: 'UPDATE', record: updated });
      expect(result).toHaveLength(baseState.length);
    });

    it('merges partial updates onto the existing record', () => {
      const partial = { id: 'MAT-0001', memo: 'new memo' } as Material;
      const result = dbReducer(baseState, { type: 'UPDATE', record: partial });
      const found = result.find(r => r.id === 'MAT-0001');
      expect(found!.memo).toBe('new memo');
      expect(found!.name).toBe('Alpha');
    });
  });

  describe('DELETE action', () => {
    it('removes the record with the given id', () => {
      const result = dbReducer(baseState, { type: 'DELETE', id: 'MAT-0002' });
      expect(result).toHaveLength(baseState.length - 1);
      expect(result.find(r => r.id === 'MAT-0002')).toBeUndefined();
    });

    it('keeps other records intact', () => {
      const result = dbReducer(baseState, { type: 'DELETE', id: 'MAT-0002' });
      expect(result.find(r => r.id === 'MAT-0001')).toEqual(baseState[0]);
      expect(result.find(r => r.id === 'MAT-0003')).toEqual(baseState[2]);
    });

    it('returns same-length array if id not found', () => {
      const result = dbReducer(baseState, { type: 'DELETE', id: 'MAT-XXXX' });
      expect(result).toHaveLength(baseState.length);
    });
  });

  describe('BULK_DELETE action', () => {
    it('removes all records whose ids are in the Set', () => {
      const ids = new Set(['MAT-0001', 'MAT-0003']);
      const result = dbReducer(baseState, { type: 'BULK_DELETE', ids });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('MAT-0002');
    });

    it('does nothing if the Set is empty', () => {
      const ids = new Set<string>();
      const result = dbReducer(baseState, { type: 'BULK_DELETE', ids });
      expect(result).toHaveLength(baseState.length);
    });

    it('handles ids not present in state gracefully', () => {
      const ids = new Set(['MAT-XXXX']);
      const result = dbReducer(baseState, { type: 'BULK_DELETE', ids });
      expect(result).toHaveLength(baseState.length);
    });
  });

  describe('BULK_APPROVE action', () => {
    it('changes status to 承認済 for all matching ids', () => {
      const ids = new Set(['MAT-0002', 'MAT-0003']);
      const result = dbReducer(baseState, { type: 'BULK_APPROVE', ids });
      expect(result.find(r => r.id === 'MAT-0002')!.status).toBe('承認済');
      expect(result.find(r => r.id === 'MAT-0003')!.status).toBe('承認済');
    });

    it('does not change status of records not in the Set', () => {
      const ids = new Set(['MAT-0002']);
      const result = dbReducer(baseState, { type: 'BULK_APPROVE', ids });
      expect(result.find(r => r.id === 'MAT-0001')!.status).toBe('登録済');
    });

    it('preserves array length', () => {
      const ids = new Set(['MAT-0002']);
      const result = dbReducer(baseState, { type: 'BULK_APPROVE', ids });
      expect(result).toHaveLength(baseState.length);
    });
  });

  describe('IMPORT action', () => {
    it('prepends imported records to state', () => {
      const imports = [
        makeMaterial({ id: 'MAT-0010', name: 'Import A' }),
        makeMaterial({ id: 'MAT-0011', name: 'Import B' }),
      ];
      const result = dbReducer(baseState, { type: 'IMPORT', records: imports });
      expect(result).toHaveLength(baseState.length + imports.length);
      expect(result[0].id).toBe('MAT-0010');
      expect(result[1].id).toBe('MAT-0011');
    });

    it('existing records appear after imported ones', () => {
      const imports = [makeMaterial({ id: 'MAT-0010' })];
      const result = dbReducer(baseState, { type: 'IMPORT', records: imports });
      expect(result.slice(1)).toEqual(baseState);
    });

    it('handles empty import array', () => {
      const result = dbReducer(baseState, { type: 'IMPORT', records: [] });
      expect(result).toHaveLength(baseState.length);
    });
  });

  describe('unknown action', () => {
    it('returns the same state for an unknown action type', () => {
      const result = dbReducer(baseState, { type: 'UNKNOWN' } as any);
      expect(result).toBe(baseState);
    });
  });
});
