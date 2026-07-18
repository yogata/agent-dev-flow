# Intake Item: inspect 系コマンドでのドリフト検出機構導入検討結果（AG-004）

## 発生源

- Issue: #1554 (OU-002, AG-004)
- PR: 当該 PR（case-run OU-002）
- 発生 phase: case-run AG-004 検討（Issue 完了条件 AG-004-1/2/3）
- capture 分類: intake（後続 case で実装検討すべき具現化候補）

## 背景

Issue #1554 の完了条件 AG-004-1/2/3 は「inspect 系コマンド（inspect-docs, inspect-extensions, inspect-promote, inspect-skills）で、廃止コマンド参照の README listing 要求・エンコーディング不整合等の同種ドリフトを finding 化する仕組みの導入可否」の検討と記録。

Issue 本文 AG-004-1 には「inspect-commands, inspect-skills 等」と記載されていたが、実際の inspect 系コマンドは inspect-docs.md, inspect-extensions.md, inspect-promote.md, inspect-skills.md の4件（inspect-commands.md は存在しない）。本検討では実際の4件を対象とする（stale-reference）。

## AG-004-1: inspect 系4コマンドの現状機能調査結果

各コマンドが現在サポートする検出観点と、対象ドリフト（廃止コマンド参照・エンコーディング不整合）の検出可否。

| コマンド | 現状の検出観点 | 廃止コマンド参照検出 | エンコーディング不整合検出 | 拡張経路 |
|----------|---------------|----------------------|----------------------------|----------|
| inspect-docs | REQ/ADR/SPEC/guides/DOC-MAP 意味診断 + Step 11 配布物整合性検査（docs-spec-rebuild-integrity SPEC extension 経由、構文健全性・文意保持・責務整合） | なし（明示的） | なし（明示的） | docs-spec-rebuild-integrity SPEC extension へ検査パターン追加で拡張可能 |
| inspect-extensions | extensions 機構の8項目検査（extension 一覧化・YAML 構造・kind と配置・id と対象対応・context.paths 実在確認・rules/checks の skill 存在確認・旧 doc-inputs 残存・上書き記述） | 部分（検査5 context.paths 実在確認が廃止 path の一部検出可能。README listing 突き合わせはなし） | なし | 8項目リストへの検査追加。ただし標準責務範囲（検査1-6）の拡張判定が別途必要 |
| inspect-promote | 検出事項の分類・採用・却下（検出自体は行わない） | N/A（検出対象外） | N/A（検出対象外） | 本件スコープ外。検出機能の追加対象ではない |
| inspect-skills | Command/Skill 参照妥当性 + Step 3 配布物構文健全性・責務整合診断（docs-spec-rebuild-integrity SPEC extension 経由、frontmatter 重複・見出し重複・Markdown 構文破損・壊れた括弧・責務説明矛盾） | なし（明示的） | なし（明示的） | docs-spec-rebuild-integrity SPEC extension へ検査パターン追加で拡張可能 |

所見: 4コマンド中、inspect-docs と inspect-skills は docs-spec-rebuild-integrity SPEC extension を経由した配布物整合性検査を既に持ち、本 extension に検査パターンを追加すれば両コマンドへ一括拡張できる。inspect-extensions は責務範囲が明示的に「検査1-6まで」と限定されており、本件ドリフト検出追加には責務範囲拡張の判断が別途必要。inspect-promote は検出・診断コマンドではなく分類・採用コマンドのため本件スコープ外。

## AG-004-2: 検出機構導入の可否・対象範囲・実装方針

### 検出可能ドリフト種別

1. **廃止コマンド参照**
   - README listing（src/opencode/commands/agentdev/README.md、リポジトリルート README.md）で存在しないコマンドを listing
   - コマンド本文内の相互参照（markdown link `[text](./xxx.md)` 等）で存在しないコマンドを指す
   - 典型例: 本 Issue CONTEXT の stale-reference（inspect-commands.md は存在しない）
2. **エンコーディング不整合**
   - UTF-8 BOM 付きファイル（先頭 3 byte: 0xEF 0xBB 0xBF）。Windows 環境の一部ツールが付与
   - CRLF/LF 改行コード混在

### 検出方法

1. **廃止コマンド参照**
   - README.md, src/opencode/commands/agentdev/README.md の listing セクション・リンクからコマンド名を抽出
   - src/opencode/commands/agentdev/*.md の実ファイル群と突き合わせ（集合差分で不在コマンドを抽出）
   - markdown link のリンク先実在確認
2. **エンコーディング不整合**
   - 各配布物ファイルの先頭 3 byte を読み BOM 判定
   - 改行コード確認（bytes 単位で 0x0D 0x0A の有無）

### 推奨実装方針

| 選択肢 | 対象 | メリット | デメリット | 推奨度 |
|--------|------|----------|------------|--------|
| A: docs-spec-rebuild-integrity SPEC extension への検査パターン追加 | inspect-docs Step 11, inspect-skills Step 3（両コマンドで共通利用） | 既存の配布物整合性検査フローに乗る、重複実装回避、両コマンドへ一括拡張 | SPEC extension の検査項目肥大化可能性 | 推奨 |
| B: inspect-extensions の検査項目追加 | inspect-extensions の8項目リストへ検査9/10追加 | 構造確認・path 実在確認と同種の機械的検査に位置付け可能 | 「標準責務範囲は検査1-6まで」との整合性調整が必須、inspect-docs/skills との重複 | 中（A 採用時は不要） |
| C: 新規コマンド新設（inspect-distribution 等） | 新規コマンド | スコープ分離 | inspect-docs/skills の配布物整合性検査と重複、保守コスト増 | 非推奨 |

推奨は A。docs-spec-rebuild-integrity SPEC extension に「廃止コマンド参照検出」「エンコーディング不整合検出」の2パターンを追加することで、inspect-docs/inspect-skills 両方へ一括拡張でき、重複実装を回避できる。

### 推定作業規模（後続 case）

- docs-spec-rebuild-integrity SPEC extension への検査データ追加（2種）: 約0.5日
- inspect-docs/inspect-skills での参照確認（extension 経由で自動適用されるか動作確認）: 約0.5日
- テスト・検証（既存テストへの追加、サンプルドリフトでの検出確認）: 約0.5日
- 合計: 約1.5日、standard スケール

## AG-004-3: 後続 case 引継ぎ状態

本 intake item が .agentdev/intake/inbox/ に保存済み。後続 case は以下を実施する想定:

1. 本 intake item を intake-promote で採用判断（promote/ defer/ reject）
2. 採用された場合、backlog-review で RU-*.md 化
3. req-define → req-save → case-open → case-run で推奨実装方針 A を実装
4. 実装時の検証項目: README listing の stale-reference 解消、BOM/CRLF 混在の検出確認

## 推奨修正対象

現時点では修正不要（検討結果の記録のみ）。後続 case で推奨実装方針 A の採用を検討。

昇格先候補: intake-promote で採否判断。採用時は backlog-review で RU 化、req-define で要件化。

## 関連

- Issue: #1554 (AG-004)
- 対象 inspect 系コマンド（実ファイル）:
  - src/opencode/commands/agentdev/inspect-docs.md（Step 11 配布物整合性検査）
  - src/opencode/commands/agentdev/inspect-skills.md（Step 3 配布物構文健全性・責務整合診断）
  - src/opencode/commands/agentdev/inspect-extensions.md（8項目検査、標準責務範囲は検査1-6）
  - src/opencode/commands/agentdev/inspect-promote.md（分類・採用コマンド、本件スコープ外）
- 関連 SPEC: docs-spec-rebuild-integrity（extension 経由、推奨実装方針 A の拡張先）
- 関連 intake item:
  - .agentdev/intake/inbox/intake-2026-07-18-distribution-reference-boundary-violations.md（配布物参照境界違反、本 item と一部重複するが別問題: 具体 REQ/ADR ID・パス参照の除去 vs コマンド存在・エンコーディング検出）
- 関連知見: Windows 環境での UTF-8 BOM 付きファイル生成事象（AGENTS.md「Windows 環境で既存 UTF-8（BOM なし）ファイルを編集する際は edit ツールを優先」参照）
