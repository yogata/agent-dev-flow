# 参照整合性修正

## 観測

複数ファイルで参照先不存在、legacy namespace 残存、廃止スキル参照、非 accepted ADR 引用が混在。command 実行時の誤動作リスクがある。

## 影響

- command が存在しない reference を参照（agent 実行時の情報欠落・誤動作）
- bare slash 形式がユーザーの誤操作を誘発
- 廃止スキル `agentdev-workflow-reporting` 参照が残存
- REQ-0112 が superseded/deprecated ADR を根拠引用

## 課題

### 1. 参照パス不存在・リンク切れ（10件）

| 参照元ファイル | 行 | 不在パス |
|--------------|-----|---------|
| `case-close.md` | 34, 41, 55, 64 | `references/git-common-procedures.md` |
| `case-close.md` | 61 | `references/capture-boundaries.md` |
| `case-run.md` | 143 | `references/capture-boundaries.md` |
| `integrity-check.md` | 34 | `references/git-common-procedures.md` |
| `req-define.md` | 40 | `templates/doc_requirement.md` |
| `REQ-0108.md` | - | `REQ-NNNN.md`（プレースホルダ） |
| `system.md` | - | `capture-boundaries.md` へのリンク切れ |

### 2. bare slash command 残存（14件）

legacy namespace 形式（`/case-open` 等）が7ファイルに残存:
- `agentdev-workflow-orchestration/SKILL.md`: `/case-run`
- `case-close.md`: `/case-close`
- `case-open.md`: `/case-open`
- `case-update.md`: `/case-update`
- `req-define.md`: `/req-define`
- `req-save.md`: `/req-save`
- `system.md`: `/case-close`, `/req-define`

### 3. 残存参照（req-backlog 4件 + 廃止スキル 3件）

- req-backlog 参照 4件: Wave 3 で検出、テンプレートパス・実行コンテキスト内の残存
- `agentdev-workflow-reporting` 参照 3件: 廃止済みスキルへの参照

### 4. 非 accepted ADR 現行根拠引用（4件）

| 引用先ファイル | ADR | ステータス |
|--------------|-----|----------|
| `REQ-0112.md` | ADR-0004 | superseded |
| `REQ-0112.md` | ADR-0009 | deprecated |
| `REQ-0112.md` | ADR-0014 | superseded |
| `patterns.md` | ADR-0001 | proposed |

## 既存要件との関連

- REQ-0108-045: 非リンク placeholder 記法
- ADR-0005: AgentDevFlow plugin namespace
- ADR-0001: proposed ステータス（patterns.md 引用）

## 優先度

高（実行時障害の直接原因を含む）

## 対応方針

1. 参照パス不存在: 各 reference の行方確認 → 新規作成 または 参照元修正
2. bare slash: `/agentdev/{cmd}` 形式へ統一（templates/ 配下は除外考慮）
3. req-backlog + 廃止スキル参照: 除去・置換
4. 非 accepted ADR: 現行受け継ぎ先（superseded-by 先）への置換。ADR-0001 (proposed) は patterns.md の参照先として受け入れるか昇格

## 元 item

- `2026-06-04-integrity-broken-references.md`
- `2026-06-04-integrity-bare-slash-remnants.md`
- `2026-06-06-epic580-residual-references.md`
- `2026-06-04-integrity-non-accepted-adr-citation.md`
