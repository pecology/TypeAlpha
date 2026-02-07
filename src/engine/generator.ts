import { SeededRandom } from './seededRandom';
import type { Config } from '../types';

/**
 * Smooth-Stream Generator
 * 気持ちよさと調整の容易さを両立した文字生成エンジン
 */
export class CharacterGenerator {
  private random: SeededRandom;
  private config: Config;
  private lastFinger: number | null = null;
  private letters: string[];
  private weights: number[];

  constructor(seed: number, config: Config) {
    this.random = new SeededRandom(seed);
    this.config = config;
    
    // 文字と重みの配列を準備
    this.letters = Object.keys(config.generator.letterWeights);
    this.weights = this.letters.map(l => config.generator.letterWeights[l]);
  }

  /**
   * 指定した長さの文字列を生成
   */
  generate(length: number): string {
    let result = '';
    
    while (result.length < length) {
      // パターン挿入判定
      if (this.random.next() < this.config.generator.patternInsertRate) {
        const pattern = this.random.pick(this.config.generator.patterns);
        // パターンを追加しても長さを超えない場合のみ追加
        if (result.length + pattern.length <= length) {
          result += pattern;
          // パターンの最後の文字の指を記録
          this.lastFinger = this.getFingerForKey(pattern[pattern.length - 1]);
          continue;
        }
      }

      // 単一文字を生成
      const char = this.generateSingleChar();
      result += char;
    }

    return result;
  }

  /**
   * 単一の文字を生成（運指制約を考慮）
   */
  private generateSingleChar(): string {
    // 運指制約を考慮した重みを計算
    const adjustedWeights = this.weights.map((weight, index) => {
      const letter = this.letters[index];
      const finger = this.getFingerForKey(letter);
      
      // 同一指の場合はペナルティを適用
      if (this.lastFinger !== null && finger === this.lastFinger) {
        return weight * this.config.generator.sameFingerPenalty;
      }
      
      return weight;
    });

    // 重み付き選択
    const char = this.random.weightedPick(this.letters, adjustedWeights);
    this.lastFinger = this.getFingerForKey(char);
    
    return char;
  }

  /**
   * キーに対応する指を取得
   */
  private getFingerForKey(key: string): number {
    return this.config.fingerMap[key] ?? -1;
  }

  /**
   * 無限に文字を生成するジェネレーター
   */
  *stream(): Generator<string, never, unknown> {
    while (true) {
      yield this.generateSingleChar();
    }
  }
}

/**
 * 指定シードでジェネレーターを作成
 */
export function createGenerator(seed: number, config: Config): CharacterGenerator {
  return new CharacterGenerator(seed, config);
}
