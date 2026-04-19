// ユーザーシード（PM・エンジニア・オペレーター）

import type { User } from '@/domain/types';

const now = () => new Date('2026-01-01T00:00:00+09:00').toISOString();

const defs: Array<Pick<User, 'id' | 'name' | 'email' | 'role'>> = [
  { id: 'usr_pm_001', name: '佐藤 隆志', email: 'sato@matlens.example.jp', role: 'pm' },
  { id: 'usr_pm_002', name: '田中 美咲', email: 'tanaka@matlens.example.jp', role: 'pm' },
  { id: 'usr_eng_001', name: '鈴木 健一', email: 'suzuki@matlens.example.jp', role: 'engineer' },
  { id: 'usr_eng_002', name: '高橋 優子', email: 'takahashi@matlens.example.jp', role: 'engineer' },
  { id: 'usr_eng_003', name: '伊藤 拓也', email: 'ito@matlens.example.jp', role: 'engineer' },
  { id: 'usr_op_001', name: '山本 亮介', email: 'yamamoto@matlens.example.jp', role: 'operator' },
  { id: 'usr_op_002', name: '中村 彩', email: 'nakamura@matlens.example.jp', role: 'operator' },
  { id: 'usr_admin_001', name: '管理者', email: 'admin@matlens.example.jp', role: 'admin' },
];

export const seedUsers = (): User[] =>
  defs.map((d) => ({ ...d, avatarUrl: null, createdAt: now(), updatedAt: now() }));
