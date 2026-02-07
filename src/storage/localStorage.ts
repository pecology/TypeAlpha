import type { GameRecord } from '../types';

const STORAGE_KEY = 'typealpha_scores';

/**
 * 全てのゲーム記録を取得
 */
export function getAllRecords(): GameRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as GameRecord[];
  } catch {
    console.error('Failed to load records from localStorage');
    return [];
  }
}

/**
 * ゲーム記録を保存
 */
export function saveRecord(record: GameRecord): void {
  try {
    const records = getAllRecords();
    records.push(record);
    // 最新100件のみ保持
    const trimmed = records.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    console.error('Failed to save record to localStorage');
  }
}

/**
 * Dailyモードのハイスコアを取得
 */
export function getDailyHighScore(): GameRecord | null {
  const records = getAllRecords().filter(r => r.mode === 'daily');
  if (records.length === 0) return null;
  return records.reduce((best, current) => 
    current.wpm > best.wpm ? current : best
  );
}

/**
 * Practiceモードのハイスコアを取得
 */
export function getPracticeHighScore(): GameRecord | null {
  const records = getAllRecords().filter(r => r.mode === 'practice');
  if (records.length === 0) return null;
  return records.reduce((best, current) => 
    current.wpm > best.wpm ? current : best
  );
}

/**
 * 今日のDailyスコアを取得
 */
export function getTodayDailyRecord(): GameRecord | null {
  const today = new Date().toISOString().split('T')[0];
  const records = getAllRecords().filter(r => 
    r.mode === 'daily' && r.date.startsWith(today)
  );
  if (records.length === 0) return null;
  return records.reduce((best, current) => 
    current.wpm > best.wpm ? current : best
  );
}

/**
 * 苦手キーの分析
 */
export function getWeakKeys(limit: number = 5): Array<{ key: string; accuracy: number; count: number }> {
  const records = getAllRecords();
  const keyStats: Record<string, { correct: number; total: number }> = {};

  for (const record of records) {
    for (const [key, stats] of Object.entries(record.keyStats)) {
      if (!keyStats[key]) {
        keyStats[key] = { correct: 0, total: 0 };
      }
      keyStats[key].correct += stats.correct;
      keyStats[key].total += stats.correct + stats.miss;
    }
  }

  return Object.entries(keyStats)
    .filter(([, stats]) => stats.total >= 10) // 十分なサンプルがあるもののみ
    .map(([key, stats]) => ({
      key,
      accuracy: stats.correct / stats.total,
      count: stats.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
}

/**
 * 最近のスコア推移を取得
 */
export function getRecentScores(count: number = 10): GameRecord[] {
  return getAllRecords().slice(-count);
}

/**
 * ユニークIDを生成
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
