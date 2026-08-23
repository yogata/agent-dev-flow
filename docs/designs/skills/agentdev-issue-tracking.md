---
title: `agentdev-issue-tracking` Design
status: accepted
created: 2026-08-23
updated: 2026-08-23
---
<!-- ADF-COVERS(implementation): REQ-049-005, REQ-049-006, REQ-049-007, REQ-049-008, REQ-049-009, REQ-049-010, REQ-049-011, REQ-049-012, REQ-049-013, REQ-049-014, REQ-049-015, REQ-049-016, REQ-049-017, REQ-049-018, REQ-049-023, REQ-049-024, REQ-049-025, REQ-049-026, REQ-049-027, REQ-049-028, REQ-049-029 -->

# `agentdev-issue-tracking` Design

課題管理 Capability Skill `agentdev-issue-tracking` の Design。

- 課題ファイル形式の詳細: 課題 ID の接頭辞、採番規則、ファイル名規則(GitHub Issue 番号と
  明確に識別できること)、frontmatter スキーマ、状態の具体的保存値(未着手、検討中、保留、
  解決済み、クローズ済みの5意味の表現)、保持情報(課題 ID、件名、状態、課題内容、背景、影響、
  関連成果物、選択肢、判断材料・証拠、不足情報、担当、期限、再評価条件、検討経過、結論、反映先、
  クローズ確認)の格納形式、保留状態における再評価条件の記述形式。
- 操作能力(検知、新規起票、検索・参照、更新、検討経過追加、保留、再評価、解決、反映確認、
  クローズ、再オープン)の実行手順と Skill 内構成(操作単位の references/ 分割または単一 Skill 構成。
  単なる操作差だけを理由とした不必要な細分化禁止)。
- 既存 GitHub Issue 管理 skill(agentdev-issue-management)との命名・責務境界の明示
  (新スキルは docs/issue-list/ 課題管理を、既存スキルは GitHub Issue 操作手続きを担う)。
- 複数 workflow からの利用契約(/agentdev/issue 明示実行を必須としない共有能力としての公開方法)。
- 効率的到達機構: 全 ADF コマンド実行時の docs/issue-list/ 全文読込を要求しない設計
  (課題 ID、状態、関連成果物、再評価条件を利用した索引・検索手段)。
- 反映追跡と委譲: 反映先成果物の所有する ADF 能力への更新委譲、クローズ前の反映確認手順、
  解決済み未反映課題のクローズ抑止。
- 検査対象区分: 課題ファイルを検討経過を保持する履歴系文書として定義し、
  文意品質検査の現行文書基準との適用区分を明示。

## 確定事項

Issue #2409（PR #2412）の実装により確定した設計事項。実装レベルの正は配布物
`src/opencode/skills/agentdev-issue-tracking/`（SKILL.md、references、scripts）と
`docs/issue-list/README.md` が保持する。

1. **課題 ID 体系**: `ISL-{NNN}`。接頭辞 `ISL` は正規配置先 `docs/issue-list/` に由来する。3桁ゼロ埋め、単調増加、欠番維持。`^ISL-\d{3}$` と GitHub Issue 番号参照 `^#?\d+$` は交差しないため機械的にも人間にも混同不能。既存 REQ/DEC/RU/IR/OU の識別子と衝突しない
2. **ファイル名規則**: 課題 ID + `.md`（`ISL-{NNN}.md`）。1課題1ファイル、状態によるディレクトリ移動なし
3. **状態保存値**: frontmatter `status` に `open`（未着手）/ `in-progress`（検討中）/ `on-hold`（保留）/ `resolved`（解決済み）/ `closed`（クローズ済み）の5値。`resolved`（結論出た）と `closed`（反映確認完了）を区別する
4. **frontmatter スキーマ**: 必須 = `id`, `title`, `status`, `created`, `updated`。任意 = `related_artifacts`（インラインリスト、`--related` 到達の対象）, `owner`, `due`。条件付き必須 = `reevaluation`（`on-hold` 時、再評価条件の要約）
5. **保持情報の格納形式**: 機械到達用を frontmatter、詳細を本文 H2 セクション（課題内容、背景、影響、関連成果物、選択肢、判断材料・証拠、不足情報、再評価条件、検討経過（追記専用・日付エントリ）、結論、反映先、クローズ確認）。起票テンプレートに反映先・クローズ確認を含めない（REQ-049-003 決め打ち回避）
6. **保留の再評価条件の記述形式**: 本文 `## 再評価条件` 配下に `### 判断保留の理由`（なぜ判断できないか）と `### 再評価条件`（何が成立すれば再評価するか）の2サブセクション。frontmatter `reevaluation` は索引用の要約
7. **効率的到達機構の形式**: 永続索引ファイルは持たず、決定的スクリプト `scripts/src/list.ts` が要求時に frontmatter のみを解析する（ID・状態・関連成果物・再評価条件による到達）。全文読込を要求しない。`--validate` で状態別必須項目を機械検査する（fail 時 exit 2）。索引ファイル方式は鮮度管理と二重管理のコストが上回るため不採用
8. **Skill 内構成**: 単一 Skill（`agentdev-issue-tracking`）。references は issue-file-format（形式）と operations（11操作と反映委譲）の2分割、scripts は lib（解析コア）+ src（CLI）。操作差のみを理由とした skill 分割は行わない
9. **反映追跡と委譲**: 反映先は所有する ADF 能力へ委譲する（Decision → `agentdev-decision-file-manager`、REQ → `agentdev-req-file-manager`、Design → `agentdev-design-file-manager`、RU 化 → intake パイプライン + `/agentdev/backlog-review`、実装・検証 → Case パイプライン）。課題側は `## 反映先` の状況（未反映/反映済み/反映不要）と `## クローズ確認` で追跡する。クローズ抑止は手順の前提確認と `--validate`（`closed-requires-reflection`、`closed-requires-close-confirmation`）の二層
10. **検査区分**: 課題ファイル = 履歴系文書（文意品質検査の現行文書基準の適用対象外）。`docs/issue-list/README.md` 自体は現行文書として適用対象。docs/issue-list/README.md（配置基準・運用規則）と skill references/issue-file-format.md（実行時形式の正）の SSoT 分担を README が宣言する
