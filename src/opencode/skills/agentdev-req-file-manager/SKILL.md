---
name: agentdev-req-file-manager
description: Manages REQ numbering and requirement file operations (CREATE/APPEND/UPDATE). USE FOR: creating requirement files, appending sections, updating existing requirements, matching existing REQs for CREATE/APPEND/UPDATE judgment, deleting requirement unit files. DO NOT USE FOR: analyzing requirement quality, creating Decision files, requirement gathering.
---

# REQファイル管理

このスキルは要件ファイル（REQ）の管理に関する**知識ベース**として機能する。

- **このスキル（知識）**: REQ番号採番ルール、ファイル操作モード、判定基準
- **適用先**: `req-define`（要件定義時）、`req-save`（REQ保存時）、`case-open`（Issue作成時のREQ参照）、`case-run`（実行時のREQ参照）、`case-update`（要件更新時）、`case-close`（完了時のREQ参照）

---

## REQ番号採番と要件行記述

REQ番号は `REQ-{NNNN}`（4桁ゼロ埋め、欠番埋め禁止、max+1）。
要件行は `REQ-{NNNN}-{MMM}` 形式で、要件の振る舞い・制約・状態のみを記述し、実装指示（ファイル編集、コード断片、ステップ手順）は含めない。
REQ-ID 安定ID 規約、要件行ID定義、REQ本文内メタデータ規約の詳細は [references/numbering-and-validation.md](references/numbering-and-validation.md) 参照。

---

## ファイル操作モード

REQファイルは CREATE（新規）、APPEND（要件行追加）、UPDATE（既存セクション修正）の3モードで操作する。
廃止宣言 APPEND の precedent 利用、APPEND/UPDATE判定フロー、状況判定基準の詳細は [references/create-append-update-flow.md](references/create-append-update-flow.md) 参照。

| 状況 | モード |
|------|--------|
| 全く新しい要件（対応REQなし） | CREATE |
| 既存Issueに追加要件（REQファイルあり、要件行追加） | APPEND |
| 既存Issueの要件修正（REQファイルあり、内容変更） | UPDATE |

---

## 既存REQ照合と整合性

req-define では壁打ち意向把握後に既存REQとの照合を行い、CREATE/APPEND/UPDATE を分類する。
照合の判定要素（タイトル、目的、要件内容）、操作分類の5軸評価、REQファイルの照合用情報記述規則は [references/matching-and-merge.md](references/matching-and-merge.md) 参照。
Issue/ADR/README との整合性チェック、マージ競合対応パターンも同ファイル参照。

---

## ファイル配置規約とバリデーション

`docs/requirements/REQ-{NNNN}.md` を永続基準ファイルとし、frontmatter は `id`/`title`/`created`/`updated` の4フィールド。
ファイル名と id の一致、`YYYY-MM-DD` 日付フォーマット、`updated ≥ created` を検証する。
分類ゲート（反映作業のみの要件行除外）と HOW 除去後の acceptance criteria 順位検証の詳細ルールは [references/numbering-and-validation.md](references/numbering-and-validation.md) 参照。

bugfix ではREQファイルを作成せず Issue 本文のみで要件管理する。
REQファイル修正が必要なバグ修正は feature に昇格する（work_type 分岐は `agentdev-workflow-lifecycle` 参照）。

---

## Scripts（決定的処理）

`scripts/` 配下の決定的スクリプトが、本スキルが規定する REQ/ADR 採番、要件行 ID 採番を機械的に実行する（design-principles.md 第5節「Script は決定的でテスト可能な処理を担う」、REQ、AG-{NNN}/{NNN}）。
LLM 推論で実行していた決定的処理をスクリプトへ委譲することで、番号の重複、欠番埋めを確実に防止する。

配置先: `.opencode/skills/agentdev-req-file-manager/scripts/`（REQ/ADR 固有採番）。
実装は TypeScript、決定的（純粋関数）、テスト付き（`tests/*.test.ts`、REQ）。

> **移管済み script**:
> - `search-target-area.ts`（Design ファイル内 target_area 見出し検索）は `agentdev-design-file-manager` へ移管済み。
> Design 固有処理は同 skill の公開操作契約経由で呼び出す。
> - 文書種別横断の検証 script（`check-frontmatter-consistency`、`check-entry-existence`、`check-change-impact`）と共有 lib は `agentdev-artifact-validation` へ移管済み（AG-{NNN}、AG-{NNN}、AG-{NNN}、RU-{NNNN}-01 合意）。
> 本スキルは公開検証契約へ委譲し、内部 script パスを直接参照しない。

### I/O 契約（REQ）

| 項目 | 規約 |
|------|------|
| 入力 | argv（ファイル/ディレクトリパス）または stdin（JSON） |
| 出力 | stdout に JSON |
| エラー | 非ゼロ終了コード + stderr にエラーメッセージ |
| 副作用 | なし（純粋関数、ファイル I/O は入力読み込みのみ） |

### スクリプト一覧

| スクリプト | 役割 | 入力 | 出力 JSON |
|-----------|------|------|-----------|
| `alloc-req-number.ts` | REQ番号採番（max+1、欠番埋め禁止） | argv[2]=REQ dir | `{ ok, allocated: "REQ-NNNN", max }` |
| `alloc-composite-id.ts` | 要件行ID採番（REQ-NNNN-MMM、max+1） | argv[2]=REQ file, argv[3]=req番号（省略可） | `{ ok, allocated: "REQ-NNNN-MMM", req, max }` |
> `search-target-area.ts`（Design 固有）は `agentdev-design-file-manager` へ移管済み。
> target_area 見出し検索は同 skill の公開操作契約経由で呼び出す。
> `alloc-decision-number.ts`（Decision 固有）は `agentdev-decision-file-manager` へ移管済み（OU-{NNN}）。
> Decision 番号採番は同 skill の公開操作契約経由で呼び出す。

> frontmatter id↔ファイル名整合性（`check-frontmatter-consistency`）、エントリ存在確認（`check-entry-existence`）、変更範囲検証（`check-change-impact`）は `agentdev-artifact-validation` へ移管済みであり、同 skill の公開検証契約へ委譲する（AG-{NNN}）。
> 詳細は同 SKILL.md 参照。

### 実行方法

```bash
# bun 経由で直接実行（REQ: LLM は bash 経由で呼び出し）
bun src/opencode/skills/agentdev-req-file-manager/scripts/src/alloc-req-number.ts docs/requirements

# テスト実行（npm test または bun test）
cd src/opencode/skills/agentdev-req-file-manager/scripts && npm test
```

### req-save / design-save からの呼び出し

req-save と design-save は、REQ番号、ADR番号、要件行IDの採番を `agentdev-req-file-manager` の決定的スクリプトとして bash 経由で呼び出し、JSON 結果を parse して意味判断（NG 時の対応等）を行う（REQ）。
target_area 見出し検索は、Design 固有処理として `agentdev-design-file-manager` 配下のスクリプトで実行する。
frontmatter 整合性確認、エントリ存在確認、変更範囲検証は、`agentdev-artifact-validation` の公開検証契約経由で呼び出す（AG-{NNN}）。
詳細は req-save / design-save command の各 Step 参照。

---

## REQ-ID 安定ID とメタデータ

REQ-ID（`REQ-{NNNN}`）は安定IDであり、ファイル配置や要件の分割・統合に依存せず不変（area 情報は含めない）。
REQ単位の関連情報（Status、Related artifacts、Related ADRs、Supersedes、Superseded by）は frontmatter ではなくREQ本文内に記述する（REQ標準構成 `## 目的`/`## 要件`/`## 適用範囲` 以外に専用セクションは仮定しない）。
詳細は [references/numbering-and-validation.md](references/numbering-and-validation.md) 参照。

REQ間の関連（置き換え、関連、分割元/分割先）もREQ本文内に記載する（専用セクションは仮定しない、記述規約は numbering-and-validation.md「REQ本文内メタデータ規約」参照）。
詳細は [references/matching-and-merge.md](references/matching-and-merge.md) 参照。

---

## APPEND/UPDATE判定基準

```
操作対象は既存REQファイルか？
  ├── NO → CREATE
  └── YES → 既存セクションの「内容」を変更するか？
             ├── NO（新規要件行・セクション追加） → APPEND
             └── YES（テキスト置換・フィールド更新） → UPDATE
```

要件行ID `REQ-{NNNN}-{MMM}` の採番、APPEND条件、UPDATE条件、廃止宣言 APPEND の precedent 利用の詳細は [references/create-append-update-flow.md](references/create-append-update-flow.md) 参照。

---

## テンプレート参照

要件定義テンプレートは以下のパスで参照可能:

@.opencode/skills/`agentdev-req-file-manager`/templates/doc_requirement.md

テンプレート構成:
- **frontmatter**: `id`, `title`, `created`, `updated`
- **必須セクション**: `目的`, `要件`（テーブル形式）, `適用範囲`（対象/対象外）
- **補助セクション（任意）**: `Design候補`（req-define が REQ 要件行候補から分離した Design 相当行と想定配置先 Design を記載。req-save が REQ ファイル保存時に本セクションを除去し、内容は `draft-meta.spec-candidates` 経由で design-save が消費する。最終 REQ ファイルに本セクションは残さない）

---

## 検出事項と REQ の関係

要件レビューの検出事項は REQ ファイルへの保存操作ではなく、要件体系の再構成候補を一時的に保持する中間アーティファクトである。

- **保存先**: `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`（REQファイルと同じ `docs/requirements/` には保存しない）
- **次工程**: 検出事項は req-define の明示入力ファイルとして渡され、正式な要件変更（CREATE/APPEND/UPDATE）に変換される
- **SPLIT 検出時**: req-save が SPLIT を検出した場合、保存可能範囲を実行した後に検出事項を作成する
- **詳細**: `agentdev-workflow-lifecycle` reference の `requirements-review-finding-protocol.md` を参照

---

## STEP model 連携（REQ-{NNNN}-{NNN}、DEC-{N}）

本スキルは Capability Skill として、req-save / case-open / case-update / case-close 等の Workflow Skill が所有する STEP から呼び出される（`<workflows/workflow-skill-model>` Design）。
本スキル自身は STEP を所有しない。

### 永続成果物と Input Resolution

本スキルが操作する REQ ファイル（`docs/requirements/REQ-{NNNN}.md`）は永続状態の最上位（SSoT 再構成）に位置する。
REQ-ID（`REQ-{NNNN}`）は identifier 保持として安定 ID として扱う。
優先順位の詳細は `<workflows/input-resolution-and-durable-state>` Design 参照。

呼出元 STEP は本スキルの操作結果（REQ ファイル更新、要件行 ID 採番結果）を STEP の result evidence として扱い、次 STEP の Input Resolution で SSoT 再構成または identifier 保持から再取得できる。
STEP reference 8 要素は `<workflows/step-reference-contract>` Design 参照。

## See Also

- **agentdev-req-analysis**: 要件分析手法（要件の展開観点、必達要件記述ガイダンス、壁打ちメソドロジー）
- **agentdev-decision-file-manager**: Decisionファイル管理（REQ ↔ Decision整合性チェック）
- **agentdev-decision-guidelines**: Decision作成の必要性判定基準
- **agentdev-doc-writing**: Decision/REQ/Design横断の文書品質査読ゲート（文書種別責務、要件性、文意品質、粒度）

## 参考文献

SKILL.md 本文から遅延読み込みされる詳細資料。
各ファイルの冒頭に本文への文脈宣言を備える。

| ファイル | 内容 |
|----------|------|
| [references/numbering-and-validation.md](references/numbering-and-validation.md) | REQ番号採番、要件行ID、REQ-ID 安定ID、ファイル配置、frontmatterバリデーション、分類ゲート、HOW 除去後の acceptance criteria 順位検証 |
| [references/create-append-update-flow.md](references/create-append-update-flow.md) | CREATE/APPEND/UPDATE 操作モード、状況判定、APPEND/UPDATE判定フロー、廃止宣言 APPEND の precedent 利用、機械置換手順の3段階適用と参照検査観点（参照実在確認、変動値分離） |
| [references/matching-and-merge.md](references/matching-and-merge.md) | 既存REQ照合方法論、整合性チェック、関連情報管理、マージ競合対応パターン |
| [references/req-save-procedure.md](references/req-save-procedure.md) | req-save の詳細手順（分類ゲート検査、文書分類適合確認、REQファイル操作、インデックス/ハブ更新、リモート同期と hash 検証、RU パス保存禁止） |
