# IR-055 baseline の再生成と baseline 陈腐化検知の仕組み化

## 観測内容

IR-055 baseline（`.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json`）が最終更新（1be0adb3、#2583）以降の配布物 .md 変更（#2630/#2646/#2647/#2668/#2675）を反映しておらず、新規 delta 違反4件（worktree-operations.md、agentdev-issue-management/SKILL.md、qg-4-final-acceptance.md）が **main の integrity suite（bun test split1）を fail させ続けている**。Epic #2686 Wave 1 の case-run で known-defect として分類された main 起因の既知欠陥である。

## 影響

- main の integrity suite が赤のまま継続し、新規変更の検証ノイズと「赤を無視する」習慣化のリスクがある
- baseline 未更新のまま配布物 .md を変更する PR が今後も同様の delta 違反を生む

## 変更候補

- ir-055-baseline.json の再生成（現行 main の配布物 .md 状態に一致させる）、または該当箇所の参照解消（配布物 .md 側の該当表現修正）
- baseline 更新漏れを検出する仕組み（配布物 .md 変更 PR での IR-055 delta 前置確認等）の検討

## 既存要件・成果物との関連

- `.opencode/skills/repo-agentdev-integrity/`（IR-055 チェッカーと baseline）
- learning promoted 成果物「update-distribution-boundary-id-writing-discipline」（配布物 .md 変更時の書き込み規律）が予防面を補完する
- 優先度: main suite 赤継続のため高優先

## 出所

- 元 intake item: `2026-09-08-ir-055-baseline-stale-delta-violations-2691.md`（PR #2691 TS-014 / bun test split1 由来、Issue #2687・Epic #2686 Wave 1）
