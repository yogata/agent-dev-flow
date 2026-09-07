# japanese-tech-writing 起源 baseline エントリの陳腐化

## 観測内容
ng-baseline.json に `src/opencode/skills/japanese-tech-writing/SKILL.md` 起源のエントリが残るが、該当 source path は存在せず、Skill は third-party 配置である。

## 影響
不在パスを指す baseline が永久に不発となり、baseline の実態と検出対象が乖離する。

## 課題
該当エントリを削除するか、third-party Skill を baseline 走査対象外とする運用を明文化する。IR-065/NG baseline の扱いを整合させる。

## 既存要件・正規成果物との関連
PR #2593、Issue #2570、IR-065、`.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json`。
