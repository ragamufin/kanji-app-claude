#!/usr/bin/env npx tsx
/**
 * Build-time KanjiVG processor.
 *
 * Parses KanjiVG SVG files and outputs JSON bundles grouped by JLPT level.
 * Uses kanji-dictionary.json (from davidluzgouveia/kanji-data) for JLPT
 * levels and meanings, and KanjiVG SVG files for stroke path data.
 *
 * KanjiVG data is licensed under CC BY-SA 3.0: https://kanjivg.tagaini.net/
 *
 * Usage:
 *   npx tsx scripts/processKanjiVG.ts --input ./kanjivg-repo/kanji --output ./src/data/bundles
 *
 * Expected input format: directory of SVG files named by Unicode codepoint (e.g., 04e00.svg for 一)
 *
 * Output: JSON files per JLPT level (e.g., n5.json, n4.json)
 */

import * as fs from 'fs';
import * as path from 'path';

// Map jlpt_new numeric values (1-5) to level strings (N1-N5)
const JLPT_LEVEL_MAP: Record<number, string> = {
  5: 'N5',
  4: 'N4',
  3: 'N3',
  2: 'N2',
  1: 'N1',
};

interface DictionaryEntry {
  strokes: number;
  grade: number;
  freq: number;
  jlpt_old: number;
  jlpt_new: number;
  meanings: string[];
  readings_on: string[];
  readings_kun: string[];
}

interface ProcessedStroke {
  id: string;
  path: string;
  length: number;
}

interface ProcessedKanji {
  character: string;
  meaning: string;
  jlpt: string;
  grade: number;
  viewBox: string;
  strokes: ProcessedStroke[];
}

/**
 * Load kanji dictionary and build a codepoint-based lookup.
 * Returns a map from hex codepoint → { level, grade, meaning }
 */
function loadDictionary(dictPath: string): Map<string, { level: string; grade: number; meaning: string }> {
  const raw = fs.readFileSync(dictPath, 'utf-8');
  const dict: Record<string, DictionaryEntry> = JSON.parse(raw);
  const map = new Map<string, { level: string; grade: number; meaning: string }>();

  for (const [char, entry] of Object.entries(dict)) {
    if (!entry.jlpt_new) continue; // Skip kanji without JLPT level

    const level = JLPT_LEVEL_MAP[entry.jlpt_new];
    if (!level) continue;

    const codepoint = char.codePointAt(0)!.toString(16);
    const meaning = entry.meanings.length > 0
      ? entry.meanings[0].toLowerCase()
      : char;

    map.set(codepoint, {
      level,
      grade: entry.grade || 9,
      meaning,
    });
  }

  return map;
}

/**
 * Estimate SVG path length from path data string.
 * This is a rough approximation — production code should use an SVG library.
 */
function estimatePathLength(d: string): number {
  const nums = d.match(/-?\d+\.?\d*/g);
  if (!nums || nums.length < 4) return 50;

  const firstX = parseFloat(nums[0]);
  const firstY = parseFloat(nums[1]);
  const lastX = parseFloat(nums[nums.length - 2]);
  const lastY = parseFloat(nums[nums.length - 1]);

  const dx = lastX - firstX;
  const dy = lastY - firstY;
  // Multiply by ~1.5 to account for curves
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 1.5);
}

/**
 * Parse a KanjiVG SVG file and extract stroke data.
 */
function parseSVG(
  svgContent: string,
  codepoint: string,
  meta: { level: string; grade: number; meaning: string }
): ProcessedKanji | null {
  const charCode = parseInt(codepoint, 16);
  const character = String.fromCodePoint(charCode);

  // Extract viewBox
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch?.[1] ?? '0 0 109 109';

  // Extract path elements (strokes)
  const pathRegex = /<path[^>]*\bd="([^"]+)"[^>]*(?:\bid="([^"]+)")?[^>]*/g;
  const strokes: ProcessedStroke[] = [];
  let match;
  let strokeIdx = 0;

  while ((match = pathRegex.exec(svgContent)) !== null) {
    strokeIdx++;
    const pathData = match[1];
    const id = match[2] ?? `${character}-${strokeIdx}`;
    const length = estimatePathLength(pathData);

    strokes.push({ id, path: pathData, length });
  }

  if (strokes.length === 0) return null;

  return {
    character,
    meaning: meta.meaning,
    jlpt: meta.level,
    grade: meta.grade,
    viewBox,
    strokes,
  };
}

function main(): void {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');
  const outputIdx = args.indexOf('--output');
  const dictIdx = args.indexOf('--dict');

  if (inputIdx === -1 || outputIdx === -1) {
    console.log('Usage: npx tsx scripts/processKanjiVG.ts --input <dir> --output <dir> [--dict <json>]');
    console.log('');
    console.log('  --input   Directory containing KanjiVG SVG files (e.g., 04e00.svg)');
    console.log('  --output  Directory for JSON bundles per JLPT level');
    console.log('  --dict    Path to kanji-dictionary.json (default: scripts/kanji-dictionary.json)');
    process.exit(1);
  }

  const inputDir = args[inputIdx + 1];
  const outputDir = args[outputIdx + 1];
  const dictPath = dictIdx !== -1
    ? args[dictIdx + 1]
    : path.join(__dirname, 'kanji-dictionary.json');

  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(dictPath)) {
    console.error(`Dictionary not found: ${dictPath}`);
    console.error('Download from: https://github.com/davidluzgouveia/kanji-data');
    process.exit(1);
  }

  console.log(`Loading kanji dictionary from ${dictPath}...`);
  const dictionary = loadDictionary(dictPath);
  console.log(`  Dictionary has ${dictionary.size} JLPT kanji entries`);

  fs.mkdirSync(outputDir, { recursive: true });

  const files = fs.readdirSync(inputDir).filter((f) => f.endsWith('.svg'));
  console.log(`Found ${files.length} SVG files`);

  const byLevel = new Map<string, ProcessedKanji[]>();
  let processed = 0;
  let skipped = 0;

  for (const file of files) {
    // KanjiVG filenames are like "04e00.svg" (5-digit hex with leading zero)
    const codepoint = file.replace('.svg', '').replace(/^0+/, '');
    const meta = dictionary.get(codepoint);
    if (!meta) {
      skipped++;
      continue;
    }

    const svgContent = fs.readFileSync(path.join(inputDir, file), 'utf-8');
    const kanji = parseSVG(svgContent, codepoint, meta);

    if (kanji) {
      const list = byLevel.get(kanji.jlpt) ?? [];
      list.push(kanji);
      byLevel.set(kanji.jlpt, list);
      processed++;
    }
  }

  // Sort each level alphabetically by character for stable output
  for (const [, kanjiList] of byLevel) {
    kanjiList.sort((a, b) => a.character.localeCompare(b.character, 'ja'));
  }

  // Write JSON bundles per level
  const levelOrder = ['N5', 'N4', 'N3', 'N2', 'N1'];
  for (const level of levelOrder) {
    const kanjiList = byLevel.get(level);
    if (!kanjiList) continue;
    const outputPath = path.join(outputDir, `${level.toLowerCase()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(kanjiList));
    console.log(`  ${level}: ${kanjiList.length} kanji → ${outputPath}`);
  }

  console.log(`\nProcessed ${processed} kanji, skipped ${skipped} non-JLPT files`);
}

main();
