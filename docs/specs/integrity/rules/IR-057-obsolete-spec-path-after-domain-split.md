---
status: accepted
updated: 2026-07-21
---

# IR-057: obsolete-spec-path-after-domain-split

| Field | Value |
|-------|-------|
| rule_id | IR-057 |
| description | `docs/specs/integrity/obsolete-path-map.yaml` に登録された旧SPEC直下パス（`docs/specs/<name>.md` 形式）が現行文書、原本、配置先、検査スクリプトに残っていないことを検証する（REQ-0108-280）。同時に link mode 統一（ADR-0131）に伴い廃止確定となった直接生成方式語彙を検出する。語彙は「単独検出語」（即 ng）と「近接条件つき検出語」（同一ファイル内または近接行に旧 local 生成方式文脈語がある場合のみ ng）に分離する。単独検出語: `src/opencode-local/generation-flow.md`、`src/opencode-local/transform/`、`transform/generate.md`、`transform/review.md`、`transform/spec.md`、`local-opencode-transform`、`直接生成方式`、`生成フロー`。近接条件つき検出語: `再生成`、`上書き保護`、`generated_by`。`generated_by` + `local-opencode-transform` 組み合わせ検出は `generated_by_combination_rule` で維持する |
| severity | strict |
| category | broken-reference |
| detection_method | `check_integrity.ts` による `obsolete-path-map.yaml` ロード、各エントリ `old` パターンの正規表現マッチング（行単位走査）。`scope.include`、`scope.exclude` で検査対象を絞り込む。語彙検出は `legacy_local_generation_vocabulary`（単独検出語: severity=ng）と `legacy_local_generation_conditional_vocabulary`（近接条件つき検出語: proximity_required=true）に分離し、後者は同一ファイル内または近接行に旧 local 生成方式文脈語がある場合のみ検出する。`generated_by` + `local-opencode-transform` の組み合わせ検出は `generated_by_combination_rule` で維持する |
| affected_artifacts | [AGENTS.md, README.md, docs/requirements/**/*.md, docs/adr/**/*.md, docs/specs/**/*.md, src/opencode/**/*.md, src/opencode-local/**/*.md, .opencode/skills/**/*.md, .opencode/commands/**/*.md] |
| related_req | [REQ-0108-280, REQ-0108-282, REQ-0156-006, REQ-0141-004, REQ-0108-265, REQ-0144-024] |
| related_spec | [../integrity/integrity-rule-catalog.md, obsolete-path-map.yaml, ../local/local-generation.md] |
| gate_level | full-audit, delta-guard, impact-guard |
| false_positive_risk | 低。`scope.exclude` で履歴参照領域（`docs/requirements/retired/**`、`docs/adr/retired/**`）を除外する。現行ADRに歴史的経緯として旧パスを記載する場合は rule 側で例外登録を明示する（後述「例外登録」）。コードブロック内の例示は exemption とする |
| regression_test | (未実装)。`obsolete-path-map.yaml` の全エントリについて、旧パスを含む fixture と含まない fixture を用意し、`check_integrity.ts` が正しく fail/pass を報告することを検証する |
| baseline_status | new |
| finding_route | intake（既知違反の段階解消は別途処理） |
| triage_action | 新規検出時は baseline に追加し、delta guard で新規増加を fail 対象とする。本ルールは新規導入のため baseline 0 で開始し、full audit を即 fail gate 化する |
| last_verified | 2026-07-03 |

## 検査項目

`check_integrity.ts` が以下を検査する。

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | `obsolete-path-map.yaml` の `entries[].old` に列挙された旧SPEC直下パスが `scope.include` 配下のファイルに出現しないこと | strict fail |
| 2 | `obsolete-path-map.yaml` の `legacy_local_generation_vocabulary[].term`（単独検出語）が出現しないこと | strict fail |
| 3 | `obsolete-path-map.yaml` の `legacy_local_generation_conditional_vocabulary[].term`（近接条件つき検出語）は、同一ファイル内または近接行に旧 local 生成方式文脈語がある場合のみ検出すること。文脈語がない場合は検出しない | conditional fail |
| 4 | `generated_by` と `local-opencode-transform` が同一ファイルに共存しないこと（`generated_by_combination_rule`） | strict fail |
| 5 | 検出時は旧パス、現行パス（該当時）、検出ファイル、行番号を出力すること | - |

## 検査対象範囲（scope）

| 区分 | パターン |
|------|----------|
| include | `AGENTS.md`、`README.md`、`docs/**`、`src/**`、`.opencode/**` |
| exclude | `docs/requirements/retired/**`、`docs/adr/retired/**` |

`scope.include` / `scope.exclude` は `obsolete-path-map.yaml` の `scope` フィールドで宣言し、`check_integrity.ts` はこれを読み込んで検査対象を絞り込む。

## exemption（検出対象外）

以下の exemption は `check_changed_docs.ts`（targeted guard）の旧直下パス検出（`checkObsoleteSpecPath`）と legacy vocabulary 検出（`checkLegacyVocab`）の両方に適用する。`check_integrity.ts`（full audit）も同等の exemption を実装する。

| 対象 | 理由 |
|------|------|
| コードブロック内の例示（明示的検査 fixture） | 例示、パターン説明は検出対象外（既存の code-block exemption に準拠） |
| `obsolete-path-map.yaml` 自体 | 旧パス、廃止語彙を対照表として列挙する正当なファイル |
| IR-057 ルール説明としての旧パス例 | ルール定義内の例示は検出対象外 |
| `integrity-rule-catalog.md`、`vocabulary-registry.md` | 検出ルール自体の記述、正規語彙の対照表 |
| `rule-ownership.md` | ルール所有権マトリックス。各ルールが検出・管理する語彙を説明する検出ルール記述 |
| `check_integrity.ts`（検査スクリプト本体） | IR-057 検出を実装するスクリプト。検出語・旧パスを文字列リテラル、コメント、エラーメッセージとして含む（テスト fixture と同等） |
| `docs/guides/glossary.md` | 用語集。廃止語彙の歴史的識別子値を定義する語彙参照文書 |
| `retired/` 配下 | 履歴参照領域 |
| テスト fixture（`*.test.ts` 等） | 検査ロジックのテストデータは検出対象外 |
| `local/local-generation.md` | link mode 移行 SPEC。廃止経緯、削除資産、移行手順の正本文書であり、廃止語彙を歴史的経緯として記載する正当なファイル（REQ-0141-028/029） |
| `IR-046`、`IR-048` ルールファイル | 廃止識別子（`generated_by: local-opencode-transform`）を検出対象とする整合性ルール。検出対象語彙をルール定義として参照する正当なファイル |
| `REQ-0141` | link mode 移行に伴う廃止確定を定義する REQ。廃止対象資産のパス、語彙を要件文として記載する正当なファイル |
| `REQ-0158` | IR-057 検出を定義していた旧 REQ（retired）。検出対象語彙一覧、検出仕様を要件文として記載する正当なファイル（現在は `docs/requirements/retired/REQ-0158.md` へ移動） |
| 現行ADRに履歴として旧パスを記載する場合 | rule 側で例外登録を明示する（後述） |

## 通常検出対象

以下は例外適用後の通常検出対象である。

- command 本文の実行手順
- skill 本文 / references 参照先
- docs 現行本文の通常説明
- README / DOC-MAP 探索導線
- 保存工程テンプレートの生成実パス例

## link mode 廃止旧語彙の分類基準（REQ-0144-024）

link mode 統一（ADR-0131）に伴い廃止確定となった旧語彙（直接生成方式、生成フロー、`transform/` 配下資産、`local-opencode-transform` 識別子等）が出現した場合、以下の基準で「歴史経緯（免除対象）」か「現行機能の記述（修正対象）」かを判定する。

| 分類 | 判定基準 | 処理 |
|------|----------|------|
| 歴史経緯（免除） | 廃止機能の経緯、移行手順、検出ルール定義、廃止確定要件の記述文脈で旧語彙を参照している。上記 exemption 表に該当するファイル、または ADR の履歴記載 exemption に該当する | exemption 適用（baseline 免除）。文脈明示が不要なファイルは exemption 表へ登録済み |
| 現行機能の記述（修正） | command 本文、skill 本文、README、DOC-MAP 等の現行動線で旧語彙を現行機能の用語として使用している | 旧語彙を現行語彙（link mode、`.opencode/` 接続等）に置換 |

**判定手順**:
1. 検出箇所のファイルが exemption 表に登録されているか確認する
2. 登録されていない場合、当該行が廃止機能の説明文脈（履歴マーカー: `旧`、`廃止`、`移行`、`前提`、`legacy`、`deprecated` 等を含む）か、現行機能の手順記述かを判定する
3. 歴史経緯と判定した場合、exemption 表へ追記する（REQ-0144-024）
4. 現行機能の記述と判定した場合、旧語彙を現行語彙へ置換する

現在のリポジトリでは、旧語彙の出現は全て歴史経緯（免除対象）に該当する。`src/opencode/`、`.opencode/` 配下の現行 command、skill に旧語彙の残存はない（link mode への移行完了済み）。

## 例外登録（現行ADRの履歴記載）

現行 ADR（`docs/adr/ADR-*.md`、retired を除く）が移行経緯を説明するために旧SPEC直下パスを記載する場合は exemption とする。`check_integrity.ts` は該当 ADR ファイルの frontmatter `status` が `accepted` または `superseded` であり、かつ当該行が履歴説明コンテキスト（「旧」「移行前」「廃止」「前提」等の履歴マーカーを含む）であることを条件に免除する。`superseded` ADR は後継 ADR へ置き換えられた履歴文書であり、旧パス、廃止語彙を含むことが前提であるため免除対象に含める。

履歴マーカー: `旧`、`移行前`、`廃止`、`前提`、`historical`、`legacy`、`deprecated`。

## 段階導入運用

本ルールは `obsolete-path-map.yaml` 新規導入に伴うものであり、baseline 0 で開始する。full audit を即 fail gate 化する。

## エントリ追記手順（REQ-0156-010）

`docs/specs/` 配下でドメイン分割による移送が発生した場合、移送実行者は移送単位で `obsolete-path-map.yaml` の `entries` へ旧パス（`old`）と新パス（`new`）の対応を追記する。追記後、`check_integrity.ts` で IR-057 を実行し、旧パス混入が検出できることを確認する（REQ-0156-012）。スキーマ詳細および手順の逐次ステップは `obsolete-path-map.yaml` ヘッダコメントの「運用手順（REQ-0156-010）」セクションを参照。

## See Also

- [obsolete-path-map.yaml](../obsolete-path-map.yaml)
- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [rule-ownership.md](../rule-ownership.md)
