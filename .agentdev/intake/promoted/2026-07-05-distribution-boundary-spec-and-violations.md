# 配布物参照境界: SPEC定義・既存違反303件・厳格性方針

## 観測内容

PR #1411（Epic #1403 Wave 3, Issue #1407）で `check_distribution_boundary.ts` を新設・実装した。これに伴い3つの関連課題が浮上した。

### 課題1: 検知パターン・exemption・IR catalog の正式SPEC定義

`check_distribution_boundary.ts` 実装で確定した検知パターン:
- **具体ID**: `ADR-NNNN`, `REQ-NNNN` の4桁数字パターン
- **具体パス**: `docs/(adr|requirements|specs)/<file>.md`（ただし `README.md` は許容、テンプレート表記 `{}` `<>` `*` は許容）
- **固定URL**: `github.com/<owner>/<repo>/(blob|raw)/`, `raw.githubusercontent.com/<owner>/<repo>/`

exemption 運用: テンプレートプレースホルダー（`{NNNN}`, `<NNNN>`, `<existing-spec>`, `<domain>`, `<command>`, `<spec>`, `<rule>`）を行内に含む場合は具体ID/具体パス検査をスキップ。`README.md` への参照は索引として許容。

IR catalog エントリ: 「Distribution reference boundary」を新 IR（例: IR-059）として登録するか、既存 IR-056 (project-extensions-integrity) の拡張とするかの判断が未確定。

### 課題2: 配布物既存違反303件の一括是正

`check_distribution_boundary.ts` を worktree root で実行した結果、配布 command/skill 本文に ADR/REQ/SPEC 具体参照が **303件**（concrete_id 301 + concrete_path 2、56ファイル）残存。

内訳:
- `src/opencode/commands/agentdev/**`: 17ファイル
- `src/opencode/skills/agentdev-*/**`: 39ファイル
- concrete_id 違反: 301件
- concrete_path 違反: 2件
- fixed_url 違反: 0件

多くは `REQ-NNNN-NNN` 形式（サブ要件番号）の引用。Top 5: case-auto.md (39), case-close.md (21), spec-save.md (19), req-define.md (18), req-save.md (16)。

### 課題3: SPEC 具体ID厳格定義と実態の乖離

SPEC `docs/specs/foundations/project-extensions.md` は具体ID記述を厳格に禁止する。しかし実運用では `REQ-NNNN-NNN` 形式（サブ要件番号）の引用が広く普及（303件、56ファイル）。SPEC 厳格解釈と実態が乖離している。

## 影響

- ADR-0135「具体参照禁止」決定事項と配布物実態が乖離
- SPEC に忠実な解釈では配布物本文の303件がすべて違反。しかし `REQ-NNNN-NNN` サブ要件番号はトレーサビリティのための慣行として定着
- SPEC 緩和して303件を残すか、厳格適用で generic 表記へ是正するか（traceability 喪失リスク）、中間案（extension 側で許容IDリスト定義）かの判断が必要
- 検知パターン・exemption が SPEC として確定されない場合、`check_distribution_boundary.ts` の実装依存となり将来の整合性判断基準が不明確

## 課題

- 課題1: SPEC `docs/specs/foundations/project-extensions.md` の「検知パターン」セクションを新設し、パターンを accepted として追記するか
- 課題1: 新 IR-059 を新設するか、IR-056 を拡張するか
- 課題2: 303件の一括是正を1 Issue（または機械処理 batch）として case-open するか。是正方式はサブ要件番号 `REQ-NNNN-NNN` 引用を generic 表記へ置換する機械処理スクリプトが候補
- 課題3: 以下いずれかの方向性を決定:
  - (a) SPEC 緩和: `REQ-NNNN-NNN` サブ要件番号引用を許容し、`ADR-NNNN`/`REQ-NNNN` の4桁 root ID のみ禁止
  - (b) SPEC 厳格適用: 配布物本文を一括 generic 表記へ是正し、traceability は extensions 経由で担保
  - (c) 中間: extension 側で許容対象 ID リストを定義し、検査機構が許容リストベースで判定

## 既存要件との関連

- ADR-0135（配布物参照境界・具体参照禁止）
- SPEC `docs/specs/foundations/project-extensions.md`（具体ID 記述禁止、厳格定義）
- IR-056（project-extensions-integrity、検査 #9/#10 は削除済み）
- `docs/specs/integrity/integrity-rule-catalog.md`、`docs/specs/integrity/rule-ownership.md`
- PR #1411 Findings/Capture候補 #1/#2、SPEC確定候補
