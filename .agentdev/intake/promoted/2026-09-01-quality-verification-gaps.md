# 品質・検証ギャップの整備（8件統合）

## 背景

archive-builder の flaky・並行衝突、checkExtensions の worktree junction failure、配布物への対応宣言配置規則未明文化、REQ 文書品質候補、QG-4 bun test 正規形の tools/plugins 拡張、AUTOGEN 計測例鮮度、git-worktree-test-fallback の title 不一致が指摘されている（8件）。

## 問題

検証の信頼性・再現性を損なうギャップが複数残存する（flaky テスト、時間依存、環境差、未反映の正規形）。

## 望ましい変更

| item | 対応 |
|---|---|
| archive-builder-staging-test-timing-flaky | staging テストの時間依存揺らぎ解消（テスト設計は req-define で確定） |
| archive-builder-tempdir-parallel-collision | tempdir 並行衝突の解消（上と統合評価） |
| checkextensions-worktree-junction-fail | worktree junction failure の fallback 方針確定 |
| distribution-declaration-placement-rule-undocumented | 配布物への対応宣言配置規則を rule-ownership.md へ明文化 |
| req004-006-036-mechanical-doc-quality-findings | REQ-004:67・REQ-006:27-32・REQ-036:10,41 の文書品質是正（方針は req-define で判断） |
| qg4-bun-test-canonical-form-tools-plugins | QG-4 正規形の tools/plugins 拡張方式（スイート D vs B 拡張の判断） |
| req-health-metrics-autogen-stale-regeneration | 計測例再生成（inspect F-13 と統合・機械的） |
| git-worktree-test-fallback-title-stem-mismatch | テストの title 先頭識別子不一致修正 |

## 対象範囲

### 対象

- 上表8件（検証実装・Design 明文化・機械的再生成）

### 対象外

- checker 仕様変更（方針確定後の別 Case）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| test | archive-builder・check_extensions・git-worktree-test-fallback 関連テスト | flaky・衝突・title 修正 |
| spec | docs/designs/integrity/rule-ownership.md、docs/designs/skills/agentdev-quality-gates.md | 配置規則明文化・正規形拡張 |
| docs | docs/requirements/REQ-004.md・REQ-006.md・REQ-036.md、docs/designs/quality/req-health-metrics.md | 文書品質是正・AUTOGEN 再生成 |

## 既存対策確認

- **確認結果**: 検出は既存（flaky 検出・QG-4）、是正未了
- **ギャップ分類**: fix gap

## 制約

- flaky 解消はテストの意図（検出力）を維持する
- REQ 文書品質是正は REQ-034/REQ-050 系の他是正と競合しないよう backlog-review で統合判断

## 受け入れ条件

- [ ] flaky・衝突・title 不一致が解消されている
- [ ] 配置規則が rule-ownership.md に明文化されている
- [ ] AUTOGEN 計測例が再生成されている（F-13 と一体）

## 元learning item / 根拠

- **根拠**: 各 intake item の現状確認（行番号・テスト実行実証済み）
- **横展開可能性**: 検証実装・QG 運用全般

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: quality
- **関連Issue**: なし
