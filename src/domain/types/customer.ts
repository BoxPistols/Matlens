import type { ID, Timestamps } from './common';

export interface Customer extends Timestamps {
  id: ID;
  name: string;
  nameKana: string;
  industryTagIds: ID[];
  mainContact: {
    name: string;
    email: string;
    phone: string | null;
  };
  notes: string | null;
}
