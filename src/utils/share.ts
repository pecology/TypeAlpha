import type { GameResult } from '../types';

/**
 * Twitter共有URLを生成
 */
export function createTwitterShareUrl(result: GameResult): string {
  const modeText = result.mode === 'daily' ? '🎯 Daily Challenge' : '🔄 Practice';
  const text = `【Type Alpha】
${modeText}
⌨️ WPM: ${Math.round(result.wpm)}
✅ ACC: ${result.accuracy.toFixed(1)}%
#TypeAlpha`;

  const url = new URL('https://twitter.com/intent/tweet');
  url.searchParams.set('text', text);
  
  return url.toString();
}

/**
 * 共有ボタンを開く
 */
export function shareToTwitter(result: GameResult): void {
  const url = createTwitterShareUrl(result);
  window.open(url, '_blank', 'width=550,height=420');
}

/**
 * クリップボードにコピー
 */
export async function copyResultToClipboard(result: GameResult): Promise<boolean> {
  const modeText = result.mode === 'daily' ? 'Daily Challenge' : 'Practice';
  const text = `Type Alpha - ${modeText}
WPM: ${Math.round(result.wpm)}
ACC: ${result.accuracy.toFixed(1)}%`;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
