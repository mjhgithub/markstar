#!/usr/bin/env node

/**
 * MarkStar — AI 编程技能集合
 *
 * 用法：
 *   npx markstar                    自动安装到 ~/.claude/skills/
 *   npx markstar --uninstall        卸载
 *   npx markstar --help             帮助
 *   npx markstar --version          版本号
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, copyFileSync, lstatSync, realpathSync, rmSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf8'));
const SKILLS_SRC = resolve(__dirname, '..', 'skills');

function copyDirSync(src, dest) {
  let realSrc = src;
  try { realSrc = realpathSync(src); } catch {}
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(realSrc, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.DS_Store') continue;
    const srcPath = join(realSrc, entry.name);
    const destPath = join(dest, entry.name);
    let stat;
    try { stat = lstatSync(srcPath); } catch { continue; }
    if (stat.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else if (stat.isFile()) {
      copyFileSync(srcPath, destPath);
    }
  }
}

function countDirs(dir) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).length;
}

function scanSkillEntries(dir) {
  const entries = [];
  if (!existsSync(dir)) return entries;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (!name.isDirectory()) continue;
    const skillFile = resolve(dir, name.name, 'SKILL.md');
    if (!existsSync(skillFile)) continue;
    const content = readFileSync(skillFile, 'utf8');
    const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    const nameMatch = fmMatch[1].match(/^name:\s*(.+)$/m);
    const descMatch = fmMatch[1].match(/^description:\s*["']?(.+?)["']?\s*$/m);
    if (nameMatch) {
      entries.push({ name: nameMatch[1].trim(), desc: descMatch ? descMatch[1].trim() : '' });
    }
  }
  return entries;
}

function install() {
  console.log(`\n  markstar v${PKG.version} — AI 编程技能集合\n`);

  if (!existsSync(SKILLS_SRC)) {
    console.error('  skills 源目录不存在，请重新安装 markstar。');
    process.exit(1);
  }

  const dest = resolve(homedir(), '.claude', 'skills');
  mkdirSync(dest, { recursive: true });

  const srcCount = countDirs(SKILLS_SRC);
  console.log(`  ${srcCount} 个技能 → ${dest}\n`);

  copyDirSync(SKILLS_SRC, dest);

  const skillEntries = scanSkillEntries(SKILLS_SRC);
  for (const s of skillEntries) {
    console.log(`  ${s.name} — ${s.desc}`);
  }

  console.log('\n  安装完成！重启 Claude Code 即可使用。\n');
  console.log('  卸载：npx markstar --uninstall\n');
}

function uninstall() {
  console.log(`\n  markstar v${PKG.version} — 卸载\n`);

  if (!existsSync(SKILLS_SRC)) {
    console.error('  skills 源目录不存在，无法确定要卸载的技能。');
    process.exit(1);
  }

  const srcNames = new Set(
    readdirSync(SKILLS_SRC, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
  );

  const dest = resolve(homedir(), '.claude', 'skills');
  if (!existsSync(dest)) {
    console.log('  未找到已安装的技能，无需卸载。\n');
    return;
  }

  let removed = 0;
  for (const name of readdirSync(dest, { withFileTypes: true })) {
    if (name.isDirectory() && srcNames.has(name.name)) {
      rmSync(resolve(dest, name.name), { recursive: true, force: true });
      console.log(`  已删除: ${name.name}`);
      removed++;
    }
  }

  if (removed === 0) {
    console.log('  未找到已安装的 markstar 技能，无需卸载。\n');
  } else {
    console.log(`\n  卸载完成，已移除 ${removed} 个技能。\n`);
  }
}

function showHelp() {
  console.log(`
  markstar v${PKG.version} — AI 编程技能集合

  用法：
    npx markstar              安装所有技能到 ~/.claude/skills/
    npx markstar --uninstall  卸载
    npx markstar --help       帮助
    npx markstar --version    版本号

  已收录技能：${countDirs(SKILLS_SRC)} 个
`);
  const entries = scanSkillEntries(SKILLS_SRC);
  for (const s of entries) {
    console.log(`    ${s.name} — ${s.desc}`);
  }
  console.log('');
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
} else if (args.includes('--version') || args.includes('-v')) {
  console.log(PKG.version);
} else if (args.includes('--uninstall') || args.includes('-u')) {
  uninstall();
} else {
  install();
}
