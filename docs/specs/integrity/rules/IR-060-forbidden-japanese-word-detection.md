---
status: accepted
---

# IR-060: forbidden Japanese word detection

現行自然言語文書（Markdown 本文）における禁止語（forbidden）の機械検出。REQ-0140-035 が定める置換辞書運用区分のうち、forbidden 区分語を docs-check / inspect-docs の検査対象とする。review 区分語は本ルールの対象外とし、`agentdev-doc-writing` 查読観点（REQ-0140-033）で人手確認する。

| Field | Value |
|-------|-------|
| rule_id | IR-060 |
| description | 現行自然言語文書（Markdown 本文）における禁止語（forbidden）の機械検出。forbidden 区分語は日本語本文中に出現した場合、即時 finding とする |
| severity | heuristic |
| category | document-drift |
| detection_method | 完全一致検出（forbidden 語リスト正: `src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md` の forbidden 区分）。backticks 内、fenced code block 内、YAML frontmatter、ファイルパス、識別子（enum 値、コマンド名、スキル名、YAMLキー）は文脈除外対象 |
| affected_artifacts | [docs/**/*.md（docs/requirements/retired/, docs/adr/retired/ を除く）, src/opencode/{commands,skills}/**/*.md, AGENTS.md] |
| related_req | [REQ-0140（REQ-0140-033, REQ-0140-035, REQ-0140-036）, REQ-0108（REQ-0108-256 文意判断は docs-check 対象外、本ルールは完全一致検出に限定）] |
| related_spec | [../responsibilities/document-type-responsibilities.md（不自然表現検出分類 P0〜P4）, ../../../src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md（forbidden 語リスト正）, integrity-rule-catalog.md] |
| gate_level | delta-guard |
| false_positive_risk | backticks 内、コードブロック内、frontmatter、YAMLキー、ファイルパス、識別子（enum 値、コマンド名、スキル名）での forbidden 語出現は正当使用。文脈除外ロジックで対応。例: `` `source-of-trought` `` が backticks 内で例示される場合は検出対象外 |
| regression_test | (未実装) |
| baseline_status | new |
| finding_route | req-define |
| triage_action | forbidden 語を推奨訳へ置換。文脈で推奨訳が変わる場合は `agentdev-doc-writing` 查読（REQ-0140-033）で確定。review 区分語は本ルールの対象外とし、查読観点へ振り向ける |
| last_verified | (未検証) |

## 検知対象詳細

### 検知対象

forbidden 区分語（正: [japanese-replacement-dictionary.md](../../../src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md)）。主な対象:

- 中国語簡体字・中国語由来: `而非`, `统一`, `陈述形式`, `定位`, `候选`, `路径`, `一致性`, `来源`
- 文字化け・誤字: `破綾`, `監査証跠`, `成果成果物`, `本来件`, `測可能性`, `進捰`
- 直訳独自語: `単独根`, `自己完束`
- 英語混在（識別子以外）: `source-of-trought`, `要件doc`

カタログへは具体語をコピーせず、参照資料を正とする（語彙レジストリと同様の方針）。

### exemption 条件

以下の文脈での forbidden 語出現は正当使用として検出対象外とする。

- backticks（`` ` ``）で囲まれた部分（例示、コード値の提示）
- fenced code block（` ``` ` または `~~~`）の内部
- YAML frontmatter（`---` で囲まれた部分）
- ファイルパス・ディレクトリパスの一部
- 識別子（enum 値、コマンド名、スキル名、YAMLキー）

## IR-045 との関係

IR-045（削除済み）は「docs 日本語表現、文意整合検査」を担っていたが、REQ-0108-256 等により docs-check は意味判断を要する文意整合検査を保持しない方針となり削除された。IR-060 はこの方針を継承し、意味判断を要する検出（review 区分語、文意品質判断）は扱わず、完全一致検出（forbidden 区分語）のみを担う。IR-045 で扱っていた文意品質検出対象語は `vocabulary-registry.md`「文意品質検出対象語（IR-045）」で参照として残る。

## review 区分語の扱い

review 区分語（`正規のXX`, `局所物理分離`, `責務境界浄化`, `純化`, `浄化`, `具象参照抽象化`, `repo-local` 等）は本ルールの機械検出対象外とし、`agentdev-doc-writing` 查読観点（REQ-0140-033）で人手確認する。文脈によって推奨訳が変わるため、機械的な完全一致検出では誤検知リスクが高く、查読へ委任する。

## 関連

- [../../../src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md](../../../src/opencode/skills/agentdev-doc-writing/references/japanese-replacement-dictionary.md): 置換辞書（forbidden 語リスト正）
- [../responsibilities/document-type-responsibilities.md](../responsibilities/document-type-responsibilities.md): 不自然表現検出分類 P0〜P4
- [../integrity-rule-catalog.md](../integrity-rule-catalog.md): 整合性ルールカタログ
