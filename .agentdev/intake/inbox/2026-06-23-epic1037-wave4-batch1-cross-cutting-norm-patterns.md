# AG-009 Wave 4 Batch 1 横断規範逸脱パターン: 横断修正 Issue の検討

## 発生源

- Epic: #1037 (Wave 4 Batch 1 close)
- Issues: #1041, #1042, #1043, #1044, #1045 (AG-009 カタログ作成・全 completed)
- PRs: #1051, #1052, #1053, #1054, #1055 (全 squash merged)
- カタログ（`.agentdev/inspect/inbox/`）:
  - compliance-catalog-opencode-local.md (9 件)
  - compliance-catalog-commands.md (6 件)
  - compliance-catalog-skills.md (10 件)
  - compliance-catalog-adr.md (6 件)
  - compliance-catalog-guides.md (11 件)
- 発生日: 2026-06-23

## 内容

AG-009 Wave 4 Batch 1 の 5 カタログ作成 (#1041-#1045) を通じ、複数ディレクトリに共通出現する規範逸脱パターンを検出した。各カタログは個別ディレクトリの見える化が目的のため修正を含まず、横断パターンは個別 Issue ではなく横断 Issue での一括対応を推奨する。

### 横断パターン一覧

| ID | パターン | 出現カタログ | 規範 | 推奨対応 |
|----|---------|-------------|------|---------|
| X-1 | 中黒（・）による日本語並列 | 全 5 カタログ（opencode-local F-008・commands F-003・skills F-002・adr F-003・guides F-005） | 整形（中黒を日本語の並列で使わない） | 用語政策系の横断 Issue で一括対応 |
| X-2 | em-dash（—）使用（関連 ADR 箇条書き） | adr F-001（16 ファイル） | 整形（em-dash の日本語地の文使用回避） | 表記揺れ是正の機械的修正 Issue で一括対応 |
| X-3 | LLM 表現「包括的」「不可欠」等の空虚な形容 | skills F-005・adr F-002 | LLM 表現禁止（空虚な形容） | LLM 表現禁止修正 Issue で一括対応 |
| X-4 | 複数文を 1 行に併記 | skills F-001（high・20+ ファイル）・guides F-009 | 整形（一文一行） | 横断 Issue で一括対応 |
| X-5 | 空虚な動詞「決定する/解決する/適用する/掘り下げる/触れる」 | guides F-001・skills F-003 | LLM 表現禁止（空虚な動詞） | 横断 Issue で一括対応 |

### 個別ディレクトリ固有の検出事項（横断対象外）

各カタログには横断パターン以外のディレクトリ固有検出事項も含まれる（opencode-local の段落重複 F-001/F-002・case-file.md の不完全文 F-004 等）。これらは各カタログを入力とした個別修正 Issue で処理する。

## 推奨対応先

本 intake は横断パターン (X-1〜X-5) を束ねた横断 Issue 化の検討材料。整備時は以下のいずれかを採る:

1. **横断 Issue 5 件を個別起票**（X-1 中黒・X-2 em-dash・X-3 LLM 形容・X-4 複数文併記・X-5 空虚動詞）。修正範囲が明確で並列実行可能
2. **単一横断 Issue に集約**（規範別サブタスク分割）。修正ファイルが重なる場合は直列制約が必要

整備判断は backlog-review を経て RU 化する。現時点では blocker ではなく検討候補。Epic #1037 はカタログ作成（見える化）が完了すれば完結する（個別修正は後続 Issue）。

## 現在の追跡状態

- 5 カタログ: `.agentdev/inspect/inbox/compliance-catalog-{opencode-local,commands,skills,adr,guides}.md` に作成済み
- 横断パターンの集約: 本 intake に集約（初出）
- 残 Wave: #1046 (docs/requirements/)・#1047 (docs/specs/) が未完了。これらのカタログ作成後に横断パターンの出現有無を再評価する

## 関連 intake

- `2026-06-23-epic1037-wave2-ag009-ai-slop-coverage-mapping.md` — AI-slop 削除基準と japanese-tech-writing の覆盖関係。本 intake の X-3（LLM 表現）と関連する查読基準の安定化候補
