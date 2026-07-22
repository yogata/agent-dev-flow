---
name: agentdev-req-file-manager
description: Manages REQ numbering and requirement file operations (CREATE/APPEND/UPDATE). USE FOR: creating requirement files, appending sections, updating existing requirements, matching existing requirements for CREATE/APPEND/UPDATE judgment, or deleting requirement unit files. DO NOT USE FOR: analyzing requirement quality, creating ADR files, general document management, or requirement gathering.
---

# REQファイル管理

このスキルは要件ファイル（REQ）の管理に関する**知識ベース**として機能する。

- **このスキル（知識）**: REQ番号採番ルール、ファイル操作モード、判定基準
- **適用先**: `req-define`（要件定義時）、`req-save`（REQ保存時）、`case-open`（Issue作成時のREQ参照）、`case-run`（実行時のREQ参照）、`case-update`（要件更新時）、`case-close`（完了時のREQ参照）

---

## 原本（SSoT）

本スキルの原本仕様は [`agentdev-req-file-manager` SPEC](../../../../docs/specs/skills/agentdev-req-file-manager.md) である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）と DOC-MAP.md のみを前提とし、`docs/specs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-req-file-manager.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## REQ番号採番と要件行記述

REQ番号は `REQ-{NNNN}`（4桁ゼロ埋め、欠番埋め禁止、max+1）。要件行は `REQ-{NNNN}-{MMM}` 形式で、要件の振る舞い・制約・状態のみを記述し、実装指示（ファイル編集、コード断片、ステップ手順）は含めない。REQ-ID 安定ID 規約、要件行ID定義、REQ本文内メタデータ規約の詳細は [references/numbering-and-validation.md](references/numbering-and-validation.md) 参照。

---

## ファイル操作モード

REQファイルは CREATE（新規）、APPEND（要件行追加）、UPDATE（既存セクション修正）の3モードで操作する。廃止宣言 APPEND の precedent 利用、APPEND/UPDATE判定フロー、状況判定基準の詳細は [references/create-append-update-flow.md](references/create-append-update-flow.md) 参照。

| 状況 | モード |
|------|--------|
| 全く新しい要件（対応REQなし） | CREATE |
| 既存Issueに追加要件（REQファイルあり、要件行追加） | APPEND |
| 既存Issueの要件修正（REQファイルあり、内容変更） | UPDATE |

---

## 既存REQ照合と整合性

req-define では壁打ち意向把握後に既存REQとの照合を行い、CREATE/APPEND/UPDATE を分類する。照合の判定要素（タイトル、目的、要件内容）、操作分類の5軸評価、REQファイルの照合用情報記述規則は [references/matching-and-merge.md](references/matching-and-merge.md) 参照。Issue/ADR/README との整合性チェック、マージ競合対応パターンも同ファイル参照。

---

## ファイル配置規約とバリデーション

`docs/requirements/REQ-{NNNN}.md` を永続基準ファイルとし、frontmatter は `id`/`title`/`created`/`updated` の4フィールド。ファイル名と id の一致、`YYYY-MM-DD` 日付フォーマット、`updated ≥ created` を検証する。分類ゲート（反映作業のみの要件行除外）と HOW 除去後の acceptance criteria 順位検証の詳細ルールは [references/numbering-and-validation.md](references/numbering-and-validation.md) 参照。

bugfix ではREQファイルを作成せず Issue 本文のみで要件管理する。REQファイル修正が必要なバグ修正は feature に昇格する（work_type 分岐は `agentdev-workflow-lifecycle` 参照）。

---

## Scripts（決定的処理）

`scripts/` 配下の決定的スクリプトが、本スキルが規定する REQ/ADR 採番、要件行 ID 採番を機械的に実行する（design-principles.md 第5節「Script は決定的でテスト可能な処理を担う」、REQ/160、AG-002/006）。
LLM 推論で実行していた決定的処理をスクリプトへ委譲することで、番号の重複、欠番埋めを確実に防止する。

配置先: `src/opencode/skills/agentdev-req-file-manager/scripts/`（REQ/ADR 固有採番）。
実装は TypeScript、決定的（純粋関数）、テスト付き（`tests/*.test.ts`、REQ）。

> **移管済み script**:
> - `search-target-area.ts`（SPEC ファイル内 target_area 見出し検索）は `agentdev-spec-file-manager` へ移管済み（REQ-0136-029/032）。SPEC 固有処理は同 skill の公開操作契約経由で呼び出す。
> - 文書種別横断の検証 script（`check-frontmatter-consistency`、`check-entry-existence`、`check-change-impact`）と共有 lib は `agentdev-artifact-validation` へ移管済み（AG-003、AG-009、AG-019、RU-20260722-01 合意）。本スキルは公開検証契約へ委譲し、内部 script パスを直接参照しない。

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
| `alloc-adr-number.ts` | ADR番号採番（max+1、欠番埋め禁止） | argv[2]=ADR dir | `{ ok, allocated: "ADR-NNNN", max }` |
| `alloc-composite-id.ts` | 要件行ID採番（REQ-NNNN-MMM、max+1） | argv[2]=REQ file, argv[3]=req番号（省略可） | `{ ok, allocated: "REQ-NNNN-MMM", req, max }` |
> `search-target-area.ts`（SPEC 固有）は `agentdev-spec-file-manager` へ移管済み（REQ-0136-029/032）。target_area 見出し検索は同 skill の公開操作契約経由で呼び出す。

> frontmatter id↔ファイル名整合性（`check-frontmatter-consistency`）、エントリ存在確認（`check-entry-existence`）、変更範囲検証（`check-change-impact`）は `agentdev-artifact-validation` へ移管済みであり、同 skill の公開検証契約へ委譲する（AG-019）。詳細は同 SKILL.md 参照。

### 実行方法

```bash
# bun 経由で直接実行（REQ: LLM は bash 経由で呼び出し）
bun src/opencode/skills/agentdev-req-file-manager/scripts/src/alloc-req-number.ts docs/requirements

# テスト実行（npm test または bun test）
cd src/opencode/skills/agentdev-req-file-manager/scripts && npm test
```

### req-save / spec-save からの呼び出し

req-save と spec-save は、REQ番号、ADR番号、要件行IDの採番を `agentdev-req-file-manager` の決定的スクリプトとして bash 経由で呼び出し、JSON 結果を parse して意味判断（NG 時の対応等）を行う（REQ）。
target_area 見出し検索は、SPEC 固有処理として `agentdev-spec-file-manager` 配下のスクリプトで実行する（REQ-0136-029/032）。
frontmatter 整合性確認、エントリ存在確認、変更範囲検証は、`agentdev-artifact-validation` の公開検証契約経由で呼び出す（AG-019）。詳細は req-save / spec-save command の各 Step 参照。

---

## REQ-ID 安定ID とメタデータ

REQ-ID（`REQ-{NNNN}`）は安定IDであり、ファイル配置や要件の分割・統合に依存せず不変（area 情報は含めない）。REQ単位の関連情報（Status、Related artifacts、Related ADRs、Supersedes、Superseded by）は frontmatter ではなく本文内に記述する。詳細は [references/numbering-and-validation.md](references/numbering-and-validation.md) 参照。

REQ間の関連（置き換え、関連、分割元/分割先）は REQ本文の「関連情報」セクションに記載する。詳細は [references/matching-and-merge.md](references/matching-and-merge.md) 参照。

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
- **補助セクション（任意）**: `SPEC候補`（req-define が REQ 要件行候補から分離した SPEC 相当行と想定配置先 SPEC を記載。req-save が REQ ファイル保存時に本セクションを除去し、内容は `draft-meta.spec-candidates` 経由で spec-save が消費する。最終 REQ ファイルに本セクションは残さない）

---

## 検出事項と REQ の関係

要件レビューの検出事項は REQ ファイルへの保存操作ではなく、要件体系の再構成候補を一時的に保持する中間アーティファクトである。

- **保存先**: `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`（REQファイルと同じ `docs/requirements/` には保存しない）
- **次工程**: 検出事項は req-define の明示入力ファイルとして渡され、正式な要件変更（CREATE/APPEND/UPDATE）に変換される
- **SPLIT 検出時**: req-save が SPLIT を検出した場合、保存可能範囲を実行した後に検出事項を作成する
- **詳細**: `agentdev-workflow-lifecycle` reference の `requirements-review-finding-protocol.md` を参照

---

## See Also

- **agentdev-req-analysis**: 要件分析手法（要件の展開観点、必達要件記述ガイダンス、壁打ちメソドロジー）
- **agentdev-adr-file-manager**: ADRファイル管理（REQ ↔ ADR整合性チェック）
- **agentdev-adr-guidelines**: ADR作成の必要性判定基準
- **agentdev-doc-writing**: ADR/REQ/SPEC横断の文書品質査読ゲート（文書種別責務、要件性、文意品質、粒度）

## references 一覧

SKILL.md 本文から遅延読み込みされる詳細資料。各ファイルの冒頭に本文への文脈宣言を備える（REQ-0113-010）。

| ファイル | 内容 |
|----------|------|
| [references/numbering-and-validation.md](references/numbering-and-validation.md) | REQ番号採番、要件行ID、REQ-ID 安定ID、ファイル配置、frontmatterバリデーション、分類ゲート、HOW 除去後の acceptance criteria 順位検証 |
| [references/create-append-update-flow.md](references/create-append-update-flow.md) | CREATE/APPEND/UPDATE 操作モード、状況判定、APPEND/UPDATE判定フロー、廃止宣言 APPEND の precedent 利用 |
| [references/matching-and-merge.md](references/matching-and-merge.md) | 既存REQ照合方法論、整合性チェック、関連情報管理、マージ競合対応パターン |
| [references/req-save-procedure.md](references/req-save-procedure.md) | req-save の詳細手順（分類ゲート検査、文書分類適合確認、REQファイル操作、インデックス/ハブ更新、リモート同期と hash 検証、RU パス保存禁止） |

