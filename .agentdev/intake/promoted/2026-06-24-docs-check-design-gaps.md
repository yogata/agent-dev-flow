# docs-check と command file format の SPEC・検査境界に残る 3 つの設計ギャップ

## 観測内容

バンドル元 inbox 項目 3 件。共通テーマは docs-check と command file format まわりで、検査対象・検査ルール・SPEC 定義の整備に未確定箇所が並んでいること。いずれも `/repo/docs-check` 実行時の NG 通知、または将来的な CI 拡張に直結する設計レベルの残課題。

- `.agentdev/intake/inbox/2026-06-22-epic1018-wave3-adr0113-deprecated-decision-violation.md`
- `.agentdev/intake/inbox/2026-06-22-issue1013-case-close-epic-wave-lettered-prefix.md`
- `.agentdev/intake/inbox/2026-06-21-issue1011-docs-check-backend-category-scope.md`

### (a) deprecated ADR に対する docs-check 検出の扱いが未確定

OU-002 Wave 3 (#1021 / PR #1025) の横断検出で `docs/adr/ADR-0113.md` に REQ-0101-043/044 違反を見つけた。

- ファイル: `docs/adr/ADR-0113.md`
- 違反箇所: title「診断ワークフロー導入とレビュー系コマンド完全削除」、Decision セクション `### 2. docs-review / skill-review の完全削除`
- 違反基準: REQ-0101-043/044（廃止・削除・移行は Decision 主題にせず結果・影響セクションに位置づける）

Wave 3 の constraint「Do NOT edit REQ/ADR files」により未修正。検出のみ実施し PR #1025 Findings に記録した。

ADR-0113 自体は 2026-06-16 付で `status: deprecated`（OU-07）。diagnostics → inspect 改名により現行根拠ではない。それでも `/repo/docs-check` が本違反を含む事前存在 NG findings を報告し続けている。REQ-0101-043/044 の機械判定ルールが deprecated ADR を検出対象に含めるか除外するか、まだ決まっていない。

### (b) case-close の Epic Wave クローズ E1〜E6 が SPEC で未定義の lettered prefix 形式

PR #1014 (Issue #1013 / REQ-0143) で全 command 定義ファイルを `docs/specs/command-file-format.md` の Step 形式へ準拠させた際、`case-close.md` の Epic Wave クローズフロー（`## 手順` → `### Epic Wave クローズ` 配下）が `**E1.**` `**E2.**` ... の lettered prefix 形式を使っていることが分かった。

これらは `### Step N:` 見出しではなく、代替フロー（Epic Issue 入力時）のサブステップとして機能している。今回の準拠作業では手つかず。現在の `check_command_format.ts` は `### Step N:` 形式のみを主手順として扱い、`**EN.**` 形式を検査対象外にしている。

- SPEC: `docs/specs/command-file-format.md` は `### Step N:` と `Step N-M` のみ定義
- 対象: `src/opencode/commands/agentdev/case-close.md`（Epic Wave クローズ E1-E6）
- チェッカー: `src/opencode/skills/repo-agentdev-integrity/scripts/check_command_format.ts`

### (c) 配布物整合性検査が docs-check バックエンド（check_integrity.ts）に未実装

PR #1012 (Issue #1011 / REQ-0142) で、`docs/specs/docs-spec-rebuild-integrity.md` が定義する配布物整合性検査パターン（構文健全性・文意保持・責務整合）を `inspect-docs` / `inspect-skills` / `req-structure-diagnostics` の各 skill 内に実装した。一方で `check_integrity.ts`（`repo-agentdev-integrity` skill の docs-check バックエンド）への同カテゴリ追加は見送った。

追加を見送った理由は、実装すると `skill-category-gap` NG が新カテゴリで汚染され、既存の「配布物↔スキルカテゴリ一致」チェック項目のターゲットングが隠退化するため。docs-check の項目役割範囲（スクリプト修正を含める範囲 vs 含めない範囲・command/skill 定義レベル）の境界が SPEC に明文化されていない。

- SPEC: `docs/specs/docs-spec-rebuild-integrity.md`
- バックエンド: `src/opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`
- 既存ルール: `skill-category-gap` NG（`repo-agentdev-integrity` で実装）

## 影響

3 件とも docs-check または将来的な CI 自動化が NG を出し続けるか、逆に検出漏れを抱える状態に直結する。

(a) deprecated で現行根拠でもない ADR-0113 に対する NG が消えない。ノイズが増え、本当に直すべき ADR 違反が埋もれるリスクがある。

(b) command file format の一貫性が完全ではない。Epic Wave クローズという主要フローの一部が SPEC 未定義の表現に依存しており、将来のフォーマット拡張で許容・統合・SPEC 明記のいずれにするかが未定。`check_command_format.ts` の検査対象を拡張するかどうかも未定。

(c) 配布物整合性 NG（構文破損・壊れた括弧等）が `check_integrity.ts` で直接検出されず、`inspect-docs` / `inspect-skills` の手動実行に依存する状態が残る。CI 等で継続監視する場合、`check_integrity.ts` 拡張と `skill-category-gap` ルール調整の両方が必要になる。

## 課題

docs-check が扱う検査対象の範囲と、command file format SPEC が許容する手順表現の一貫性を、SPEC と実装の両面で確定する必要がある。

具体的には次の 3 点をそろえて解消したい。

1. deprecated ADR を docs-check の機械判定対象に含めるか除外するか。含める場合の SPEC 上の根拠、除外する場合のフラグ定義（frontmatter 等）。
2. `**EN.**` lettered prefix を「代替フロー内サブステップ」として SPEC 公式に許容するか、`### Step N:` へ再構成するか。
3. docs-check の項目役割範囲（スクリプト修正を含める範囲 vs 含めない範囲）を SPEC で明文化するか。明文化する場合、配布物整合性を `check_integrity.ts` に追加するか、inspect-* skill 側のみで運用するか。

## 既存要件との関連

- REQ-0101-043, REQ-0101-044: 廃止・削除・移行の Decision 主題化禁止。(a) の違反基準。deprecated ADR をどう扱うかは未確定。
- REQ-0142: 配布物整合性検査の実装。(c) では inspect-* skill に実装済み、`check_integrity.ts` には未追加。
- REQ-0143: command file format Step 形式への準拠。(b) はこの適用時に発覚した SPEC ギャップ。
- SPEC `docs/specs/command-file-format.md`: `### Step N:` と `Step N-M` のみ定義。`**EN.**` 形式は未定義。
- SPEC `docs/specs/docs-spec-rebuild-integrity.md`: 配布物整合性検査パターン（構文健全性・文意保持・責務整合）を定義。docs-check バックエンド適用範囲は明記なし。
- ADR-0113: deprecated。diagnostics → inspect 改名により現行根拠ではない。(a) で違反検出されている対象。
- `repo-agentdev-integrity` skill: docs-check バックエンド。`check_integrity.ts`、`check_command_format.ts`、`skill-category-gap` ルールを保持。

存在するもの: 各検査の実装、REQ-0101-043/044、REQ-0142、REQ-0143、対象 SPEC 群。
欠けているもの: deprecated ADR の取り扱い規定、`**EN.**` 形式の SPEC 上の位置づけ、docs-check の項目役割範囲 SPEC。

## 整形の方向性

backlog-review では 1 つの docs_chore RU に束ねる候補を推奨する。3 件とも「docs-check / SPEC 整備」で主題が共通し、個別に RU 化すると判断の整合性が取りにくい。

RU の想定作業要素:

1. ADR-0113 の処理（`retired/` へ移動、または Decision セクションを結果・影響へ再分類）。あわせて deprecated ADR を docs-check 検出対象外とするフラグ要否を判断。
2. `docs/specs/command-file-format.md` に代替フロー内サブステップ表現（`**EN.**` 形式）の許容・非許容を明記。許容なら `check_command_format.ts` の検査対象拡張を検討。非許容なら `case-close.md` の E1〜E6 を `### Step N:` 形式へ再構成。
3. docs-check の項目役割範囲 SPEC を新規または既存 SPEC へ追記。配布物整合性を `check_integrity.ts` に追加するか、inspect-* 側のみで運用するかを決定。追加する場合は `skill-category-gap` ルールの調整もセットで。

優先度は中程度を想定。(a) の ADR-0113 NG は docs-check 実行のたびにノイズとして出続けるため、早期に判断したい。

注意点: ADR-0113 の処理は「Do NOT edit REQ/ADR files」制約下で見送られた経緯があり、別 RU として ADR 整理フローに回す選択肢もある。backlog-review で束ねる範囲を確定すること。
