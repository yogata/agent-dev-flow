---
description: req-define で分離された SPEC 保存対象を SPEC ファイルに保存、確定する（SPEC 対象 artifact_actions がある場合）
agent: sisyphus
---

# SPEC 保存（SPEC artifact_actions → docs/specs 永続化）

req-define で分離された SPEC 保存対象（`draft-data` の `artifact_actions` 内 `artifact: spec` entry）を `docs/specs/**/*.md` に保存、確定する。
req-save の次、case-open の前に実行する。
req-save の G02（SPEC 編集禁止）を緩和するものではなく、SPEC 保存を独立責務として切り出す。
全 work_type 対象であり、`work_type` による判定は廃止する。

## 入力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（req-define が生成し req-save が REQ 保存済みのドラフト。`draft-data` の `artifact_actions` に `artifact: spec` entry を含む）

## 出力

- `docs/specs/**/*.md`（既存 SPEC への追記 or 新規 SPEC 作成）
- `.agentdev/drafts/req-draft-{topic-slug}.md`（SPEC artifact_actions 消費済みフラグの status 更新）

## SPEC ライフサイクル

SPEC ファイル frontmatter に `status` フィールドを導入し、ライフサイクルを管理する（3状態: `draft` / `accepted` / `superseded`）:

| status | 意味 | 遷移契機 |
|--------|------|----------|
| `draft` | spec-save で保存された直後の状態。境界違反検査の対象外 | spec-save が新規 SPEC 作成時に付与（既定値） |
| `accepted` | case-close で SPEC 確定チェックを通過した状態。すべての integrity rule の検査対象 | case-close Step 3 で実装が SPEC 内容を検証した旨を確認時 |
| `superseded` | 後継 SPEC へ移行した廃止状態。`superseded_by` で後継 SPEC を明示。通常内容検査の対象外 | spec-save または case-close が後継 SPEC への移行を確定した時 |

既存 SPEC へ追記する場合、当該 SPEC の `status` は変更しない（既存 SPEC の成熟度を尊重）。
新規 SPEC 作成時のみ `status: draft` を付与する。
`draft` から `accepted` への昇格は case-close の責務。後継 SPEC への移行を確定する場合、元 SPEC へ `status: superseded` と `superseded_by` を設定する。`superseded_by` を持つ SPEC は通常内容検査の対象から除外する。
`status` 欠落は後方互換のため `accepted` 相当として扱う。

## 手順

### Step 1: 事前チェック

本コマンドは project extensions 手順（ADR）に従う:
1. `.agentdev/extensions/commands/spec-save.yaml` を読み込む（存在しない場合は標準動作で続行）
2. extension の `context` / `rules` / `checks` / `acceptance_gates` / `must_not` を本コマンドの標準動作に追加・拡張として扱う（上書きではない）
3. extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
4. extension に列挙されていない `docs/specs/**` 内部パスを固定知識として読みに行かない

ドラフトの `draft-data` の `artifact_actions` から `artifact: spec` entry の有無を確認する（全 work_type 対象、`work_type` による判定は廃止）。
SPEC 対象 artifact_actions がない場合は no-op で完了。
ドラフトが存在しない場合はエラーで中止: `壁打ちドラフトが見つかりません。
先に /agentdev/req-define を実行してください。
`


### Step 2: SPEC artifact_actions 読込


ドラフトの `draft-data` の `artifact_actions` から `artifact: spec` の entry を読み込む。
`artifact_actions` フィールドが存在しない（旧形式 draft）場合は SPEC 保存対象なしと判定し、no-op で完了（後方互換）。
`artifact: spec` entry が空の場合も no-op で完了。
各 action の `target`（file path または `new:{slug}`）、`operation`（create/update）、`content` を処理対象とする

### Step 3: 配置先解決

各 SPEC action の `target`（または `target_spec: {operation, domain, slug}` 構造化）から配置先 SPEC を解決する:
- 既存 SPEC パス（例: `docs/specs/{domain}/<existing-spec>.md`、または `target_spec: {operation: update, domain, slug}`）→ 当該 SPEC へ追記（`update` 操作）
- `target_spec: {operation: create, domain, slug}` → 新規 SPEC 作成（`create` 操作）。ファイル名は `docs/specs/{domain}/{slug}.md`
- 重複候補の統合: 同一 `target` の action は1つの SPEC へ集約する

**決定的処理のスクリプト呼出（REQ、AG-002、design-principles.md 第5節）**: 配置先 SPEC が既存か新規か、`target_area` が存在するかの判定は `agentdev-req-file-manager/scripts/` の決定的スクリプトを bash 経由で呼び出して実行する（SKILL.md「Scripts（決定的処理）」セクション参照）。
LLM 推論で代替しない。
`update` 操作かつ `target_area` 指定時は、配置先候補 SPEC に対して `search-target-area.ts` を実行し、`target_area` 見出しの存在を確認する（結果は Step 5 のセクション置換で再利用）:

```bash
# 配置先候補 SPEC 内の target_area 見出し検索
bun .opencode/skills/agentdev-req-file-manager/scripts/src/search-target-area.ts \
  "target_area文字列" docs/specs/{domain}/<existing-spec>.md
# → stdout: { ok: true, matches: [{file, line, text}] }
# matches 空 → target_area 未検出（Step 5 で follow-up 報告、operation を create 系に切り替え推奨）
# matches 複数 → warning（G09 で置換拒否の根拠）

# stdin JSON 入力（複数 SPEC 横断検索）も可能。target_area は見出しテキスト部（# プレフィクス不含）
echo '{"target_area":"パターン","files":["docs/specs/{domain}/<existing-spec>.md"]}' | \
  bun .opencode/skills/agentdev-req-file-manager/scripts/src/search-target-area.ts
```

### Step 4: SPEC 分離基準の最終確認

各 SPEC action が SPEC に置くべき内容の基準に適合するか再確認。安定契約例外相当の内容は REQ 側に残すべきものとして除外し、完了報告の follow-up に明示

### Step 5: SPEC ファイル操作

`draft-data` の `artifact_actions`（`artifact: spec`）の全 entry を処理する:
- **create**: 新規 SPEC ファイルを frontmatter（`title`, `status: draft`, `created`, `updated`）付きで作成し、action の `content` をセクションとして記載
- **update**:
 - `target_area` 指定時（operation が `update`/`spec-update`）: 対象 SPEC ファイル内で `target_area` に一致する見出し行を検索し、セクション置換を行う（REQ）。詳細は後述「target_area ベースのセクション置換ロジック」
 - `target_area` 未指定時: 既存 SPEC ファイルの該当セクションへ action の `content` を追記（後方互換、REQ）
 - frontmatter `updated` を更新。`status` は変更しない
- 各 action の `target_area`（指定時）に応じた適切なセクション見出しを用いる

**target_area 見出し検索のスクリプト呼出（REQ、AG-002）**: `update` 操作における `target_area` 見出し検索は決定的スクリプトで実行する。
Step 3 で得た `search-target-area.ts` の結果（`matches`）を用いてセクション範囲を特定し、`content` で置換する。
`matches` が空の場合はスキップして follow-up に記録し、複数マッチの場合は G09 に従い置換を拒否する:

```bash
# target_area 検索（Step 3 と同一スクリプト、Step 5 では置換位置特定に使用）
bun .opencode/skills/agentdev-req-file-manager/scripts/src/search-target-area.ts \
  "target_area文字列" docs/specs/{domain}/<existing-spec>.md
# → stdout: { ok: true, matches: [{file, line, text}] }
# matches[0].line から次の同レベル見出し行の直前までをセクションとして特定し、content で置換
```

**Step 5-1**: 複数 SPEC action の並列化（REQ/093）。
異なる `target` パスの SPEC create/update は並列化可能。
同一 SPEC ファイルへの複数 action は順序依存のため直列サブセットとして分離する。
詳細は後述「case-auto 並列委譲モデル」セクション参照

### Step 6: インデックス整合

新規 SPEC 作成時は `docs/specs/README.md`（SPEC 一覧）に追加する。既存 SPEC 追記時は README 更新不要

**エントリ存在確認のスクリプト呼出（REQ、AG-002）**: 新規 SPEC 作成後に、当該 SPEC が `docs/specs/README.md` に正しく登録されたかを決定的スクリプトで検証する:

```bash
# 新規 SPEC が SPEC 一覧に存在するか確認
bun .opencode/skills/agentdev-req-file-manager/scripts/src/check-entry-existence.ts \
  patterns docs/specs/README.md
# → stdout: { ok: boolean, errors: string[], warnings: string[], found: string[] }

# stdin JSON 入力も可能
echo '{"id":"patterns","files":["docs/specs/README.md"]}' | \
  bun .opencode/skills/agentdev-req-file-manager/scripts/src/check-entry-existence.ts
```

### Step 7: DOC-MAP 影響確認

SPEC 操作が `docs/DOC-MAP.md` に影響するか確認し、影響がある場合は更新する（`agentdev-doc-map` スキル参照）。SPEC 新規作成は探索経路の更新対象

**extension 更新要否の確認（REQ）**: SPEC の追加、移動、分割が `.agentdev/extensions/**` に影響するか確認する。移動または分割により extension 参照先 SPEC パスが変わる場合、当該 extension の context paths を更新する。extension 参照先 SPEC を移動した場合はエラーとし、spec-save 自身は移動を完了させずユーザー判断を仰ぐ（IR-056 check #5 strict 違反を防止）。SPEC 新規作成で既存 command/skill の実行時参照が増える場合、対応 extension の `context` への追加をユーザーに提案する（spec-save 自身は extension を直接編集しない）。

**targeted docs guard（REQ）**: 変更された SPEC ファイルと連動ファイル（`docs/specs/README.md`、`docs/DOC-MAP.md`）に対し targeted docs guard を実行する。実行コマンド:

```bash
bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts \
  --workflow spec-save --files <changed SPEC files> --json
```

JSON 出力の `failures` に strict severity が含まれる場合は保存工程を継続せず、対象ファイルを修正して再実行する。`spec_readme_update_required` または `doc_map_update_required` が true の場合は Step 6/7 の更新要否判定に反映する。`full_docs_check_recommended` が true の場合は `/repo/docs-check` の実行をユーザーに提案する。

### Step 8: ドラフト status 更新

ドラフトの SPEC artifact_actions 消費状態を記録する（`draft-data` に SPEC 消費済みフラグを付与）。commit/push より前に更新し、commit 対象に含める

### Step 9: 変更範囲検証

**決定的処理のスクリプト呼出（REQ、AG-002）**: `git diff --name-only` で変更ファイル一覧を取得し、許可パスリスト（G02）との照合を決定的スクリプトで実行する。許可範囲外の変更を検出したらエラーで報告し指示を待つ（自動破棄しない）:

```bash
# git diff --name-only をファイルに出力し、許可パスリストと照合
git diff --name-only > /tmp/changed-paths.txt
cat > /tmp/allowed-paths.txt <<EOF
docs/specs/**
.agentdev/drafts/**
EOF
bun .opencode/skills/agentdev-req-file-manager/scripts/src/check-change-impact.ts \
  /tmp/changed-paths.txt /tmp/allowed-paths.txt
# → stdout: { ok: boolean, errors: string[], warnings: string[], violations: string[] }

# stdin JSON 入力も可能
echo '{"changed":["docs/specs/{domain}/<existing-spec>.md"],"allowed":["docs/specs/**"]}' | \
  bun .opencode/skills/agentdev-req-file-manager/scripts/src/check-change-impact.ts
```

`violations` が空でない場合は G02 違反としてユーザーに報告し、指示を待つ

### Step 10: コミット、プッシュ

`agentdev-conventional-commits` に従い main ブランチに push。
Step 8 の status 変更を commit 対象に含める。
並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い、`git add <path>` で明示パスステージし、`git commit -- <paths>`（--only pathspec 形式）でコミットする。
スイープ操作は禁止し、共有 index の他セッション変更を排出しないこと

### Step 11: 完了報告

完了報告 template に従い、保存した SPEC 一覧（新規/追記別）、スキップ有無、follow-up（安定契約例外で除外した候補）を出力

## 検証観点

- **品質ゲート（適用結果の整合性検証、AG-004、REQ）**: spec-save の品質ゲートは「適用結果の整合性検証」として実行する。検証項目: `target_area` 置換結果の整合性（Step 5 の `search-target-area.ts` 結果と置換後本体の一致）、SPEC status の整合性（新規作成時 `status: draft` 付与、既存追記時 `status` 変更なし）、インデックスの整合性（`docs/specs/README.md` エントリと新規 SPEC の一致、Step 6 の `check-entry-existence.ts` 結果）、変更範囲の妥当性（Step 9 の `check-change-impact.ts` 結果）。各検証は決定的スクリプトの JSON 結果で機械的に確認する。**REQ**: spec-save の品質ゲートは内容の品質（SPEC 分離基準適合性等）を再検証せず、内容の品質は req-define の QG-1 の責務とする（Step 4 SPEC 分離基準の最終確認は実施するが、これは分離基準の最終チェックであり内容品質の再審査ではない）
- **SPEC 分離基準適合性（REQ）**: 各 action の `content` が SPEC に置くべき内容か（Step 4）
- **frontmatter 完全性**: 新規作成時の `title`, `status: draft`, `created`, `updated`（G05）
- **配置先解決の正確性**: 既存パス vs `new:{slug}` の判定、重複候補統合（Step 3）
- **変更範囲検証**: `docs/specs/**` と `.agentdev/drafts/**` 以外の変更を含まないこと（Step 9）

## target_area ベースのセクション置換ロジック（REQ/028）

`operation: update` / `operation: spec-update` で action の `target_area` が指定された場合、spec-save は対象 SPEC ファイル内で `target_area` に一致する見出し行を検索し、セクション置換を行う。

### マッチング規則

- 対象 SPEC ファイル内の見出し行を走査し、`target_area` と完全一致する見出し行を検索する（見出しテキスト部分の一致）
- 当該見出し行から次の同レベル（または上位レベル）見出し行の直前までを「セクション」として特定する
 - 例: `### X` で検索した場合、次の `###` / `##` / `#` 見出し行の直前までを範囲とする
- 特定したセクションを action の `content` で置換する

### 複数マッチ時の挙動

`target_area` に一致する見出しが複数存在する場合、最初のマッチを採用し warn を出力する。

### 未検出時の挙動

`target_area` に一致する見出しが存在しない場合、当該 action をスキップし、follow-up として「target_area 未検出、operation を spec-create へ切り替えを推奨」を報告する（全体中止しない）。

### 後方互換（target_area 未指定）

`target_area` が未指定の draft（旧形式）、または `operation` が `create`/`spec-create` の場合は従来の「追記」動作を維持する（REQ）。
`target_area` が指定された場合のみ「置換」動作を適用し、既存 draft の破壊を防ぐ。

## case-auto 並列委譲モデル（REQ/093）

spec-save は複数 SPEC ファイルの変更案作成、検査を並列化できる（REQ）:

- 異なる `target` パスの SPEC create/update は L0（完全独立）のため並列可能（最大5件）
- 同一 SPEC ファイルへの複数 action のみ順序依存のため、直列サブセットとして分離する
- 直列集約対象（採番、index 更新、draft 更新、commit、push）は並列委譲の完了を待ってから実行する（REQ）
- 最終的な commit/push は REQ の明示パス指定（`git add <path>` + `git commit -- <paths>`）で一括実行する

## 廃止時の下流横断クリーンアップ（追加候補）

本セクションは SPEC 廃止確定時（SPEC ライフサイクルの `superseded` 遷移、または物理削除）に、下流（配布 Command/Skill 群、Guide 群、REQ 群）へ残る旧 SPEC パス、ID 参照の横断クリーンアップを実行するステップの**追加候補**を記録する。既存の spec-save 手順（Step 1〜11）に代わるものではなく、既存フローを破壊しない追加ステップである。本候補は REQ-0124-024（廃止 REQ/SPEC 由来記述残置検出カテゴリ）および integrity-rule-catalog.md の新規 IR 候補（retired-reference-residual）と整合する。本候補の実行可否、タイミングは別途 SPEC 確定を待って確定する。

### 対象トリガ

- SPEC の廃止確定時（`status: superseded` 遷移、物理削除）
- 廃止 SPEC パス、ID に由来する下流参照の有無確認が前提

### クリーンアップ手順（候補）

1. **廃止 SPEC リスト作成**: 当該 spec-save 操作で廃止確定した SPEC パス、ID のリストを作成する。`superseded_by` frontmatter で後継 SPEC が明示されている場合は後継パスも併記する
2. **下流参照検索**: 廃止 SPEC パス、ID をソースに配布 Command/Skill 群、Guide 群、REQ 群を横断検索する。活性 SPEC への言及は対象外とする（REQ-0124-024 準拠）
3. **参照更新候補の分類**:
   - supersede 元への妥当な文脈参照（`superseded_by` で後継を明示する記述等） → finding 扱い（人間確認）。自動更新しない
   - 廃止 SPEC パスのまま残置 → 当該ドキュメントの後継 SPEC パスへ更新、または文脈次第で削除
4. **更新適用範囲**: spec-save の G02（SPEC ファイル、ドラフト status 更新用、SPEC インデックス、DOC-MAP の各編集許可範囲）範囲外のため、本ステップでは候補の提示に留め、更新適用は後続の別工程（case-update、inspect-promote 経由の intake、または手動修正）で実施する
5. **Findings 記録**: 抽出した参照更新候補を完了報告の follow-up に記録し、intake/inspect 経由で処理可能な状態で残す

### 既存フローとの関係

本ステップは既存の spec-save 手順（Step 1〜11）に代わるものではなく、廃止操作時に追加で実行される候補ステップである。本ステップの実行有無、実行タイミングは今後の SPEC 確定（REQ-0124/REQ-0125 関連）を待って確定する。現時点では本候補の記録のみを行い、自動実行は行わない。既存の G02（ファイル操作制約）、G09（SPEC 実行時非依存）に違反しない範囲で運用される。

## ガードレール

### フェーズ制約
- G01: SPEC 対象 artifact_actions（`artifact: spec`）の有無で判定する（全 work_type 対象）。`work_type` による判定は廃止

### ファイル操作制約
- G02: ファイル編集スコープ: 以下のパスのみ作成、編集を許可: `docs/specs/**`（SPEC ファイル）、`.agentdev/drafts/**`（ドラフト status 更新用）。`docs/specs/README.md`, `docs/DOC-MAP.md` は SPEC 操作に付随する更新のみ許可
- G03: 上記以外のファイル作成、編集は禁止。REQ ファイル（`docs/requirements/**`）、ADR（`docs/adr/**`）、コマンド、スキル、テンプレートは編集禁止
- G04: SPEC 対象 artifact_actions がない場合は SPEC ファイルを一切作成、編集しない（no-op）

### SPEC ライフサイクル制約
- G05: 新規 SPEC 作成時は frontmatter `status: draft` を必ず付与すること
- G06: 既存 SPEC へ追記時は当該 SPEC の `status` を変更しないこと。`status: accepted` への昇格は case-close Step 3 の責務
- G07: SPEC status が `draft` の SPEC は REQ/SPEC 境界違反検出の対象外とする

### 品質制約
- G08: 各 SPEC action は SPEC 分離基準に適合すること。安定契約例外は SPEC 保存対象から除外し follow-up 扱い
- G09: SPEC ファイルは実行時非依存を維持すること。実行時コマンドが SPEC ファイルに依存する記述にしない

### 委譲、参照制約
- G10: SPEC artifact_actions の分離根拠、配置先判定は req-define（`agentdev-req-analysis`）の結果を尊重し、spec-save で再分類しないこと
- G11: SPEC status 昇格（draft → accepted）の判定は case-close の責務。spec-save は accepted を付与しない

### Issue 作成制約
- G12: spec-save は Issue を作成してはならない。Issue 作成は case-open の責務

## エラー処理

- ドラフト不備（`artifact_actions` 形式不正）→ エラーで中止し req-define 差し戻しを推奨
- 配置先 SPEC が特定できない場合 → 当該候補をスキップし follow-up に明示（全体中止しない）
- 変更範囲検証違反 → ユーザーに報告し指示を待つ（自動破棄禁止）



