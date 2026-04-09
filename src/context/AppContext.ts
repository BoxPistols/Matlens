import { createContext } from 'react';
import type { AppContextValue, Material, DbAction } from '../types';

export const AppCtx = createContext<AppContextValue | null>(null);

export const DB_ACTIONS = {
  ADD: 'ADD', UPDATE: 'UPDATE', DELETE: 'DELETE',
  BULK_DELETE: 'BULK_DELETE', BULK_APPROVE: 'BULK_APPROVE',
  IMPORT: 'IMPORT',
} as const;

export function dbReducer(state: Material[], action: DbAction): Material[] {
  switch(action.type) {
    case DB_ACTIONS.ADD:    return [action.record, ...state];
    case DB_ACTIONS.UPDATE: return state.map(r => r.id === action.record.id ? {...r,...action.record} : r);
    case DB_ACTIONS.DELETE: return state.filter(r => r.id !== action.id);
    case DB_ACTIONS.BULK_DELETE: return state.filter(r => !action.ids.has(r.id));
    case DB_ACTIONS.BULK_APPROVE: return state.map(r => action.ids.has(r.id) ? {...r,status:'承認済'} : r);
    case DB_ACTIONS.IMPORT: return [...action.records, ...state];
    default: return state;
  }
}
