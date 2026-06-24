---
title: spec-save SPEC
status: draft
created: 2026-06-21
updated: 2026-06-25
---

# spec-save SPEC

## 目的

req-define で分離された SPEC 保存対象（`draft-data` の `artifact_actions` 内 `artifact: spec` entry）を `docs/specs/*.md` に保存、確定する。
req-save の次、case-open の前に実行する。
全 work_type 対象であり、`work_type` による判定は廃止する（REQ-0138-009）。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define が生成し req-save が REQ 保存済みのドラフト、`draft-data` の `artifact_actions` に `artifact: spec` entry を含む）

## 出力

- `docs/specs/*.md`（既存 SPEC への追記 or 新規 SPEC 作成）
- `.agentdev/drafts/req-draft-{topic-slug}.md`（SPEC artifact_actions 消費済みフラグの status 更新）

## 副作用

- ファイル作成/更新: `docs/specs/**`, `.agentdev/drafts/**`（status 更新用）。`docs/specs/README.md`, `docs/DOC-MAP.md` は SPEC 操作に付随する更新のみ許可
- git 操作: commit + push（`agentdev-conventional-commits` + `agentdev-git-worktree` 並列実行安全ステージング）
- Issue 作成: 行わない（G12、case-open 責務）

## 現在の動作

- Step 1: 事前チェック（`draft-data` の `artifact_actions` から `artifact: spec` entry の有無を確認）。なければ no-op 完了。ドラフト不存在時はエラー中止
- Step 2: SPEC artifact_actions 読込（`artifact: spec` entry を読込）。`artifact_actions` フィールド不存在（旧形式 draft）の場合は SPEC 保存対象なしと判定し no-op 完了（後方互換）。各 action の `target`（file path または `new:{slug}`）、`operation`（create/update）、`content` を処理対象とする
- Step 3: 配置先解決（既存 SPEC パス（例: `docs/specs/patterns.md`）→ update 操作）。`new:{topic-slug}` → 新規 SPEC 作成（`docs/specs/{topic-slug}.md`）。同一 `target` の action は1つの SPEC へ集約
- Step 4: SPEC 分離基準の最終確認（各 action が REQ-0101-055（SPEC に置くべき内容の基準）に適合するか再確認）。安定契約例外（REQ-0101-069）相当は除外し follow-up に明示
- Step 5: SPEC ファイル操作
  - create: 新規 SPEC ファイルを frontmatter（`title`, `status: draft`, `created`, `updated`）付きで作成し、action の `content` をセクションとして記載
  - update: `target_area` 指定時は対象セクションを `content` で置換、未指定時は該当セクションへ `content` を追記。frontmatter `updated` を更新。`status` は変更しない。詳細は「target_area ベースのセクション置換ロジック」セクション参照
  - 各 action の `target_area`（指定時）に応じた適切なセクション見出しを用いる
- Step 6: インデックス整合（新規 SPEC 作成時は `docs/specs/README.md`（SPEC 一覧）に追加）。既存 SPEC 追記時は README 更新不要
- Step 7: DOC-MAP 影響確認（SPEC 操作が `docs/DOC-MAP.md` に影響するか確認し、影響がある場合は更新（`agentdev-doc-map`））
- Step 8: ドラフト status 更新（`draft-data` に SPEC 消費済みフラグを付与）。commit/push より前に更新し commit 対象に含める
- Step 9: 変更範囲検証（`git diff --name-only` で `docs/specs/**` と `.agentdev/drafts/**` 以外の変更を検出したらエラー報告、指示待ち（自動破棄しない））
- Step 10: コミット、プッシュ（`agentdev-conventional-commits` + `agentdev-git-worktree` 並列実行安全ステージング）
- Step 11: 完了報告（保存した SPEC 一覧（新規/追記別）、スキップ有無、follow-up（安定契約例外で除外した候補））

## target_area ベースのセクション置換ロジック

`operation: update` / `operation: spec-update` において action の `target_area` が指定された場合、spec-save は対象 SPEC ファイル内で `target_area` に一致する見出し行を検索し、セクション置換を行う（REQ-0136-027）。

### マッチング規則

- 対象 SPEC ファイル内の見出し行を走査し、`target_area` と完全一致する見出し行を検索する
- 当該見出し行から次の同レベル（または上位レベル）見出し行の直前までを「セクション」として特定する
  - 例: `### X` で検索した場合、次の `###` または `##` または `#` 見出しの直前までを範囲とする
- 特定したセクションを action の `content` で置換する

### 複数マッチ時の挙動

`target_area` に一致する見出しが複数存在する場合、最初のマッチを採用し warn を出力する。

### 未検出時の挙動

`target_area` に一致する見出しが存在しない場合、当該 action をスキップし、follow-up として「target_area 未検出、operation を spec-create へ切り替えを推奨」を報告する（全体中止しない）。

### 後方互換（target_area 未指定）

`target_area` が未指定の draft（旧形式）、または `operation` が create/spec-create の場合は従来の「追記」動作を維持する（REQ-0136-028）。`target_area` が指定された場合のみ「置換」動作を適用し、既存 draft の破壊を防ぐ。

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（フェーズ定義、コマンド分類）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（artifact_actions 工程分岐、DOC-MAP 影響規則）
- [quality-gates.md](../quality-gates.md)（SPEC lifecycle 連携（QG-4 で accepted 昇格））
- [document-type-responsibilities.md](../document-type-responsibilities.md)（SPEC body 品質検査）
- [req-health-metrics.md](../req-health-metrics.md)（SPEC 分離基準との連携）

## 対象外

- SPEC 対象 artifact_actions（`artifact: spec`）がない場合の SPEC ファイル作成、編集（G01、G04、no-op）
- `docs/specs/**`, `.agentdev/drafts/**`, `docs/specs/README.md`, `docs/DOC-MAP.md` 以外のファイル作成、編集（G02、G03）。REQ ファイル（`docs/requirements/**`）、ADR（`docs/adr/**`）、コマンド、スキル、テンプレート編集禁止
- SPEC 対象 artifact_actions がない場合の SPEC ファイル作成、編集（G04）
- 新規 SPEC 作成時の `status: draft` 省略（G05）
- 既存 SPEC 追記時の `status` 変更（G06、`status: accepted` 昇格は case-close Step 3 責務）
- SPEC status が `draft` の SPEC を IR-044（REQ/SPEC 境界違反検出）の対象に含めること（G07）
- REQ-0101-055（SPEC 分離基準）不適合 action の保存（G08、安定契約例外 REQ-0101-069 は follow-up 扱い）
- 実行時コマンドが SPEC ファイルに依存する記述（G09、ADR-0104 実行時非依存維持）
- SPEC artifact_actions の分離根拠、配置先判定の再分類（G10、req-define `agentdev-req-analysis` 結果を尊重）
- SPEC status 昇格（draft → accepted）の判定（G11、case-close 責務）
- Issue 作成（G12、case-open 責務）

## 検証観点

- SPEC 分離基準適合性（REQ-0101-055）: 各 action の content が SPEC に置くべき内容か
- frontmatter 完全性: 新規作成時の `title`, `status: draft`, `created`, `updated`
- 配置先解決の正確性: 既存パス vs `new:{slug}` の判定、重複候補統合
- 変更範囲検証: `docs/specs/**` と `.agentdev/drafts/**` 以外の変更を含まないこと

## case-auto 並列委譲モデル（REQ-0114-087〜093）

spec-save は複数 SPEC ファイルの変更案作成、検査を並列化できる（REQ-0114-091）。
異なる target パスの SPEC create/update は L0（完全独立）のため並列可能（最大5件）。
同一 SPEC ファイルへの複数 action のみ順序依存のため直列サブセットとして分離。
最終的な commit/push は REQ-0137 の明示パス指定で一括実行。

## See Also

- [req-define.md](req-define.md)（前段コマンド（SPEC 候補分離））
- [req-save.md](req-save.md)（前段コマンド（REQ/ADR 保存））
- [case-open.md](case-open.md)（後続コマンド（Issue 作成））
- `agentdev-doc-map` skill（DOC-MAP 影響確認）
- `agentdev-conventional-commits` skill（コミットメッセージ規約）
- `agentdev-git-worktree` skill（並列実行安全 git 操作）
- REQ-0136（REQ/SPEC 責務分離の徹底と spec-save 新設）
- REQ-0138（構造化 req_draft 契約）
- ADR-0123（SPEC lifecycle（draft/accepted））
