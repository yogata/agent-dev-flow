# Proxy Request Package — DEL-3281-1 (PR creation blocked by gh exit 66)

- request_kind: pr_create_proxy
- delegation_id: DEL-3281-1
- workflow_phase: case-run (case-auto orchestration stage 3, Epic #3280 Wave 1)
- created_at (JST): 2026-10-01T06:07+09:00 実装開始 / package 作成は完了報告時
- result_state: blocked (infra-transient)
- recovery_path: Supervisor write-proxy executes the operation below → PR URL 受領 → completed-pr 確定

## Exact operation

- operation: pr_create
- head: `docs/issue-3281` (pushed to origin; HEAD = 02e905cbb7400dcb787cbcd9ada0c118d5bff8b9)
- base: `main`
- title: `Wave 1: RA-004 トレーサビリティ整合・v4 責務分類語彙移行・正典参照更新（Case #3278 OU-001）`
- body_file (絶対パス): `C:\Users\ogatay\work\agent-dev-flow\.worktrees\3281-docs\.agentdev\tmp\pr-body-3281.md`
- body encoding: UTF-8 (no BOM), LF

## 事前条件

- branch `docs/issue-3281` が origin に push 済み（HEAD 02e905cb）
- 同一 head/base の PR が未作成であること（本委譲内の pr_create 試行は gh exit 66 で失敗しており、PR は未作成の前提。作成済みなら本 package は不要）
- body_file が存在し UTF-8 で読取可能であること

## read-back 期待値

- pr_read で title が上記 title と一致すること
- pr_read で head=`docs/issue-3281`、base=`main` であること
- pr_read の body に `adf_delegation: DEL-3281-1`（実行識別情報セクション）が含まれること
- pr_read の body に `## 検証差分`、`## Findings / Capture候補`、`## Design確定候補` セクションが含まれること
- 変更ファイル数が 39 件（+119/-119）であること（pr_changed_files で確認可能）

## failure context

- agentdev_gh pr_create 1回試行 → gh exited with code 66（stderr 空、startup environment failure 疑い）
- 再試行禁止（委譲契約）のため本 package で親に引き渡す

---

# PR body (verbatim, byte-exact copy of worktree .agentdev/tmp/pr-body-3281.md — Supervisor assembly for git durability, 2026-10-01)

<!-- ADF-COVERS(implementation): REQ-096-023 -->
# Wave 1: RA-004 トレーサビリティ整合・v4 責務分類語彙移行・正典参照更新（Case #3278 OU-001）

## 実行識別情報

- adf_case: #3280
- adf_execution_unit: standard
- adf_delegation: DEL-3281-1
- 対象 Issue: #3281
- ブランチ: `docs/issue-3281`
- worktree: `.worktrees/3281-docs`
- PR base: `main`

## 概要

Issue #3281（Epic #3280 Wave 1、RA-004）の実行契約に従い、v4 責務分類語彙の機械移行と正典参照の付け替えを実施した。意味判断の新規導入なし（写像の正本: `docs/designs/foundations/v4-responsibility-boundaries.md`「v4 責務分類語彙の後継」節の機械適用のみ）。

## 変更内容（39ファイル、+119/-119）

### スコープ1: traceability/ sidecars・policy.yaml（REQ-003-055/056 → REQ-096 追随）
- 変更なし。REQ-003-055/056 参照は Definition PR #3279 で追随済み（sidecar・policy.yaml とも残存 0件を検証で確認）

### スコープ2: docs/designs/skills/_template.md（3区分書式更改）
- 3区分書式を新語彙（意味判断担当〔閉じた意味評価・開いた推論を所有〕/ 決定的処理委譲先 / 知識提供）へ更改
- 様式説明から「semantic 6 項目の該当項目」「deterministic 11 項目の該当処理」の旧列挙参照を除去

### スコープ3: docs/designs/skills/ 配下 33件 skill Design（「v4 責務分類」節語彙一括移行）
- 共通導入文 32件（正典: DEC-036 → DEC-048 + 同 Design「v4 責務分類語彙の後継」節。Root Case #3011 正典参照を除去・新語彙3区分へ）
- agentdev-doc-diagnostics.md は異形書式のため個別適用
- 区分ラベル: `**semantic 担当**` → `**意味判断担当**`、`**deterministic 委譲先**` → `**決定的処理委譲先**`（33件）
- agentdev-workflow-orchestration.md の「（deterministic 11 項目該当）」→「（決定的処理該当）」
- 判断単位名（adversarial review、semantic classification 等）は写像表に機械写像が定義されないため確定値として維持

### スコープ4: 5 Design 文書の二分法語彙・正典参照更新
- `docs/designs/workflows/workflow-skill-model.md`: 97行（Capability Skill 判定基準の語彙正典を DEC-048/後継節へ）、150行（deterministic checker → 決定的 checker）、164行（列挙正典参照を DEC-048/後継節へ、semantic Skill / deterministic code → 意味判断 Skill / 決定的処理 code）
- `docs/designs/foundations/v4-runtime-execution-model.md`: 80行（deterministic 項目分類参照 → 決定的処理・DEC-048/後継節、semantic 判断 → 意味判断、Harness/Backend adapter 境界は DEC-036 決定(2) と明示して維持）
- `docs/designs/integrity/rule-ownership.md`: 29-31行（節見出し・本文を判断方法3分類・DEC-048 正典へ）
- `docs/designs/README.md`: 156行（v4-lifecycle-state-machine 責務列の deterministic/semantic gate 分離 → 決定的処理・意味判断の gate 分離）、182行（v4-responsibility-boundaries 行を新語彙へ、タイトル列を frontmatter title に整合）
- `docs/designs/foundations/v4-responsibility-boundaries.md`: frontmatter title・H1（semantic Skill / deterministic code → 意味判断 Skill / 決定的処理 code）、14-20行（節見出し・旧列挙を後継節への参照形式へ統合）、24行（知識提供層節の新語彙化・Root Case 正典参照除去）。「v4 責務分類語彙の後継」節（旧語彙との写像表・移管記録）と「semantic contract」（DEC-036 決定(2) 概念名）は維持

### スコープ5: docs/designs/commands/（REQ-003-055/056・DEC-036(1) 参照更新）
- 変更なし。REQ-003-055/056 参照は promote系3 Design が #3279 で更新済み。case-auto.md の DEC-036 参照2箇所（160行・167行「現行の責務体制は DEC-036（DEC-038/039 が補完）」）は責務体制参照であり DEC-036 決定(1) の二分法を明示引用しないため DEC-036 維持（DEC-048 部分置換境界に整合）

### ADF-COVERS 宣言
- 既存 ADF-COVERS 宣言行は削除・変更なし（参照先更新のみが許容であり、本変更は宣言内容に影響しない）。本 PR の実装対応宣言: `<!-- ADF-COVERS(implementation): REQ-096-023 -->`（producer 側 Design 変更・旧用語整理の実現面に相当）

## 検証差分

| 実行工程 | 検証種別 | 検証結果 | finding 差分 |
|---|---|---|---|
| case-run | TS-021 スライス (a): REQ-003-055/056 残存検索（traceability/・skills/・5 Design 文書） | pass（残存 0件。v4-responsibility-boundaries.md の移管記録行 2箇所は対象外） | 新規: なし |
| case-run | TS-021 スライス (b): semantic 6 項目・deterministic 11 項目・semantic 担当・deterministic 委譲先 正典参照残存検索 | pass（自スコープ残存 0件。v4-responsibility-boundaries.md の写像定義本体〔102-112行〕は検索対象外・移行先定義として必須） | 新規: なし |
| case-run | TS-004: REQ-096-005 と v4-responsibility-boundaries Design「人間判断への引き上げ条件」完全一覧の正典整合、変更対象ファイル内の旧 REQ-003-055 委任正典参照 | pass（引き上げ条件 1〜5 は REQ-096-005 の8要素に整合。変更対象ファイル内の 055 正典参照 0件） | 新規: なし |
| case-run | agentdev-traceability check（REQ-096-001〜030、`--root` worktree 明示） | pass（malformed-declarations・unknown-roles・unknown-req-refs・invalid-artifact-paths・missing-design・policy-invalid・duplicate-inconsistencies の 7検査 pass。missing-design 増分 0件・policy-invalid 0件） | 新規: なし |
| case-run | 同 check の main baseline 比較（fa6f37b7 = origin/main で同一コマンド実行） | 確認（missing-implementation 25行・missing-verification 30行の REQ-096 findings は main と完全同一〔pass 7 / fail 2〕。pre-existing であり増分 0件・REQ-096 findings 状態の非変化を維持） | 既出: REQ-096 missing-implementation / missing-verification（本 Issue スコープ外。Findings 記載） |
| case-run | targeted docs guard（check_changed_docs.ts --workflow case-run、--files 39件〔コミット前〕・--base-ref origin/main〔コミット後・push 前〕の2回実行） | pass（failures 0・warnings 0。design_readme_update_required は frontmatter title 変更検出の常時 flag — README タイトル列を新 title へ更新し対応済み） | 新規: なし |
| case-run | textlint final gate（gate.ts --root worktree） | PASS（544 対象、hard violations 0件） | 新規: なし |
| case-run | UTF-8 健全性（BOM・CR・U+FFFD、docs/designs 配下 318 md 全件機械検査） | pass（3件とも 0件） | 新規: なし |
| case-run | AUTOGEN 級再生成（generate_indexes.ts、worktree 内） | no changes（既存索引と一致） | 新規: なし |
| case-run | distribution boundary gate | SKIP（src/opencode/{commands,skills} 変更なし。事前・最終 gate とも SKIP 条件成立を git status で確認） | 新規: なし |

## adversarial-review 非発動記録

- 判定理由: Issue #3281「adversarial-review 発動契約（任意）: 該当なし（ユーザー明示指定なし）」により非発動。発動条件はユーザー明示指定のみで、本委譲にも明示指定なし
- 代替自己反証（却下案）: 33件 skill Design の判断単位名（semantic classification、learning evaluation 等）の全般訳語化 — 写像の正本に個別訳語写像が定義されず、判断を伴うため「機械適用・意味判断導入なし」の実行契約に反するとして却下（判断単位名は確定値として維持）
- 緩和策: v4-responsibility-boundaries.md の旧列挙（15-20行）を完全削除せず「v4 責務分類語彙の後継」節の写像表への参照形式へ統合し、旧分類の履歴継承可能性を保持
- unresolved な本質的争点・ユーザー判断事項: なし

## Findings / Capture候補

- REQ-096 の missing-implementation（25行）・missing-verification（30行）findings が main baseline で既出（pre-existing）。Definition PR #3279 で REQ-096 を追加した時点から存在する残課題であり本 Issue（RA-004 語彙移行）スコープ外。promote系以外の REQ-096 行への implementation 対応と policy.yaml optional 列挙の追加（verification 必要性の確定）を後続 Wave または別起票での対応候補とする
- 「semantic contract」（DEC-036 決定(2) 概念名）と判断単位名に含まれる英字語（semantic classification 等）は本移行の対象外であり、v4-responsibility-boundaries Design 写像表に機械写像が定義されるまで残存する。全般訳語化は意味判断を伴うため後続の意思決定候補

## Design確定候補

- なし（語彙移行の機械適用のみで、新規 schema・enum・判定表・内部アルゴリズムの発見なし）

## 関連

- Issue: #3281（Epic #3280 Wave 1）
- Definition PR: #3279
- Root Case: #3278
