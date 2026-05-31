# integrity-check 検出 document-drift 修正（6件）

## 概要

integrity-check（2026-05-31）で検出された document-drift 6件を一括修正する。
いずれも旧REQ番号体系からの移行残存・ステータス不整合であり、機能への影響はないが
ドキュメントの正確性を損ねている。

## 修正対象

### 1. docs/adr/README.md L19 — retired REQ 参照

- **現状**: `REQ-0004-066`（retired）を README 位置づけの権限として引用
- **修正**: 当該参照を active な REQ（REQ-0101 等）に更新、または権限記述の再確認
- **検出元**: integrity-check F-06

### 2. docs/adr/README.md L17 — ADR-0009 ステータス不整合

- **現状**: ADR一覧テーブルで ADR-0009 が `proposed`
- **修正**: `proposed` → `accepted` に更新（frontmatter・Status View セクションと整合させる）
- **検出元**: integrity-check F-01

### 3. docs/adr/ADR-0002.md L35 — 旧スキル名残存

- **現状**: `tips-capture` という旧名称が記載
- **修正**: `agentdev-learning-capture` に更新
- **検出元**: integrity-check F-05

### 4. docs/adr/ADR-0009.md L71, L75 — 旧REQ番号残存

- **現状**: `REQ-0042〜0049`, `REQ-0041` が記載
- **修正**: 実際の採番 `REQ-0101〜0109`, `REQ-0109`（REQ体系定義）に更新
- **検出元**: integrity-check F-04

### 5. docs/specs/system.md L212 — REQ範囲表記誤り

- **現状**: `REQ-0101〜0049` と誤記
- **修正**: `REQ-0101〜0109` に修正
- **検出元**: integrity-check F-02

### 6. docs/specs/system.md L214-225 — REQ-0109 行欠落

- **現状**: REQ構成テーブルが REQ-0101〜0108 の8行で REQ-0109 が欠落
- **修正**: REQ-0109（REQ再構成運用）の行を追加
- **検出元**: integrity-check F-03

## 影響範囲

- ドキュメントのみ（機能コードへの影響なし）
- 修正ファイル: `docs/adr/README.md`, `docs/adr/ADR-0002.md`, `docs/adr/ADR-0009.md`, `docs/specs/system.md`
- 各修正は独立しており、部分的な適用も可能

## 既存要件との関連

- REQ-0101（AgentDevFlow namespace 統一）: 旧名称・旧番号の残存は移行不完全の残渣
- REQ-0103（Intake pipeline）: integrity-check → intake pipeline の正常動作の証左

## 備考

- Item 1（case-close Step 8b リセットロジック不備）は別途 req-define で処理
- 修正後、integrity-check 再実行で F-01〜F-06 の解消を確認すべき
