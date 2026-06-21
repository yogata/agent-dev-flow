---
description: req-define で分離された SPEC 保存対象を SPEC ファイルに保存・確定する（SPEC 対象 artifact_actions がある場合）
agent: sisyphus
---

# SPEC 保存（SPEC artifact_actions → docs/specs 永続化）

req-define で分離された SPEC 保存対象（`draft-data` の `artifact_actions` 内 `artifact: spec` entry）を `docs/specs/*.md` に保存・確定する。req-save の次、case-open の前に実行する。req-save の G02（SPEC 編集禁止）を緩和するものではなく、SPEC 保存を独立責務として切り出す。全 work_type 対象であり、`work_type` による判定は廃止する。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define が生成し req-save が REQ 保存済みのドラフト。`draft-data` の `artifact_actions` に `artifact: spec` entry を含む）

## 出力

- `docs/specs/*.md`（既存 SPEC への追記 or 新規 SPEC 作成）
- `.agentdev/drafts/req-draft-{topic-slug}.md`（SPEC artifact_actions 消費済みフラグの status 更新）

## SPEC ライフサイクル

SPEC ファイル frontmatter に `status` フィールドを導入し、ライフサイクルを管理する:

| status | 意味 | 遷移契機 |
|--------|------|----------|
| `draft` | spec-save で保存された直後の状態。 等、境界違反検査の対象外 | spec-save が新規 SPEC 作成時に付与（既定値） |
| `accepted` | case-close で SPEC 確定チェックを通過した状態。すべての integrity rule の検査対象 | case-close Step 3 で実装が SPEC 内容を検証した旨を確認時 |

既存 SPEC へ追記する場合、当該 SPEC の `status` は変更しない（既存 SPEC の成熟度を尊重）。新規 SPEC 作成時のみ `status: draft` を付与する。

## 手順

1. **事前チェック**: ドラフトの `draft-data` の `artifact_actions` から `artifact: spec` entry の有無を確認する（全 work_type 対象・`work_type` による判定は廃止）。SPEC 対象 artifact_actions がない場合は no-op で完了。ドラフトが存在しない場合はエラーで中止: `壁打ちドラフトが見つかりません。先に /agentdev/req-define を実行してください。`
2. **SPEC artifact_actions 読込**: ドラフトの `draft-data` の `artifact_actions` から `artifact: spec` の entry を読み込む。`artifact_actions` フィールドが存在しない（旧形式 draft）場合は SPEC 保存対象なしと判定し、no-op で完了（後方互換）。`artifact: spec` entry が空の場合も no-op で完了。各 action の `target`（file path または `new:{slug}`）・`operation`（create/update）・`content` を処理対象とする
3. **配置先解決**: 各 SPEC action の `target` から配置先 SPEC を解決する:
 - 既存 SPEC パス（例: `docs/specs/patterns.md`）→ 当該 SPEC へ追記（`update` 操作）
 - `new:{topic-slug}` → 新規 SPEC 作成（`create` 操作）。ファイル名は `docs/specs/{topic-slug}.md`
 - 重複候補の統合: 同一 `target` の action は1つの SPEC へ集約する
4. **SPEC 分離基準の最終確認**: 各 SPEC action が SPEC に置くべき内容の基準に適合するか再確認。安定契約例外相当の内容は REQ 側に残すべきものとして除外し、完了報告の follow-up に明示
5. **SPEC ファイル操作**: `draft-data` の `artifact_actions`（`artifact: spec`）の全 entry を処理する:
 - **create**: 新規 SPEC ファイルを frontmatter（`title`, `status: draft`, `created`, `updated`）付きで作成し、action の `content` をセクションとして記載
 - **update**: 既存 SPEC ファイルの該当セクションへ action の `content` を追記し、frontmatter `updated` を更新。`status` は変更しない
 - 各 action の `target_area`（指定時）に応じた適切なセクション見出しを用いる
6. **インデックス整合**: 新規 SPEC 作成時は `docs/specs/README.md`（SPEC 一覧）に追加する。既存 SPEC 追記時は README 更新不要
7. **DOC-MAP 影響確認**: SPEC 操作が `docs/DOC-MAP.md` に影響するか確認し、影響がある場合は更新する（`agentdev-doc-map` スキル参照）。SPEC 新規作成は探索経路の更新対象
8. **ドラフト status 更新**: ドラフトの SPEC artifact_actions 消費状態を記録する（`draft-data` に SPEC 消費済みフラグを付与）。commit/push より前に更新し、commit 対象に含める
9. **変更範囲検証**: `git diff --name-only` で `docs/specs/**` と `.agentdev/drafts/**` 以外の変更が含まれていればエラーで報告し指示を待つ（自動破棄しない）
10. **コミット・プッシュ** → `agentdev-conventional-commits` に従い main ブランチに push。Step 8 の status 変更を commit 対象に含める。並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、`git add <path>` で明示パスステージし、`git commit -- <paths>`（--only pathspec 形式）でコミットする。スイープ操作は禁止し、共有 index の他セッション変更を排出しないこと
11. **完了報告** → 完了報告 template に従い、保存した SPEC 一覧（新規/追記別）・スキップ有無・follow-up（安定契約例外で除外した候補）を出力

## ガードレール

### フェーズ制約
- G01: SPEC 対象 artifact_actions（`artifact: spec`）の有無で判定する（全 work_type 対象）。`work_type` による判定は廃止

### ファイル操作制約
- G02: ファイル編集スコープ: 以下のパスのみ作成・編集を許可: `docs/specs/**`（SPEC ファイル）、`.agentdev/drafts/**`（ドラフト status 更新用）。`docs/specs/README.md`, `docs/DOC-MAP.md` は SPEC 操作に付随する更新のみ許可
- G03: 上記以外のファイル作成・編集は禁止。REQ ファイル（`docs/requirements/**`）・ADR（`docs/adr/**`）・コマンド・スキル・テンプレートは編集禁止
- G04: SPEC 対象 artifact_actions がない場合は SPEC ファイルを一切作成・編集しない（no-op）

### SPEC ライフサイクル制約
- G05: 新規 SPEC 作成時は frontmatter `status: draft` を必ず付与すること
- G06: 既存 SPEC へ追記時は当該 SPEC の `status` を変更しないこと。`status: accepted` への昇格は case-close Step 3 の責務
- G07: SPEC status が `draft` の SPEC は （REQ/SPEC 境界違反検出）の対象外とする

### 品質制約
- G08: 各 SPEC action は SPEC 分離基準に適合すること。安定契約例外は SPEC 保存対象から除外し follow-up 扱い
- G09: SPEC ファイルは実行時非依存を維持すること。実行時コマンドが SPEC ファイルに依存する記述にしない

### 委譲・参照制約
- G10: SPEC artifact_actions の分離根拠・配置先判定は req-define（`agentdev-req-analysis`）の結果を尊重し、spec-save で再分類しないこと
- G11: SPEC status 昇格（draft → accepted）の判定は case-close の責務。spec-save は accepted を付与しない

### Issue 作成制約
- G12: spec-save は Issue を作成してはならない。Issue 作成は case-open の責務

## エラー処理

- ドラフト不備（`artifact_actions` 形式不正）→ エラーで中止し req-define 差し戻しを推奨
- 配置先 SPEC が特定できない場合 → 当該候補をスキップし follow-up に明示（全体中止しない）
- 変更範囲検証違反 → ユーザーに報告し指示を待つ（自動破棄禁止）



