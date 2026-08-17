# 契約テスト・checker 固定トークンの事前確認手順（記述削減・抽象化の前段 grep）（既存 skill 反映）

## 背景

配布物本文の記述削減・抽象化に伴い、本文トークンを期待値固定する機械検査との衝突が反復した。(1) PR #2186（OU-003、Epic #2178）: コマンド本文の STEP 要約削減で、distribution_boundary_routing_contract.test.ts が固定する routing token（check_distribution_boundary.ts エントリポイント、--profile source、result 状態語）を含むセクションが削減されテスト不合格となり原形復帰した。(2) living pool の CaptureBoundary 事例（Epic #1719 Wave 4、PR #1728/#1735）: 配布 command からのコンクリートパス除去で `checkCommandCaptureDuties` が要求する概念名文字列 `capture-boundaries` が消え、4 command でチェック違反が発生した。前回 learning-promote の問題クラス3（契約テストと本文編集・完了判定の相互作用）として promote → RU 化済みの主題だが、authoring skill への反映は未到達であり、本 run の再発観測は反映待ちの状態を示している。

## 問題

agentdev-command-authoring / agentdev-skill-authoring に「本文の記述削減・抽象化の前に、対象ファイルを参照する `*.test.ts`・checker の grep（routing token・期待値固定セクション・概念名文字列の検出）を実施する」手順が存在しない。固定トークンの存在が記述上から読み取れないため、削減・抽象化のたびにテスト不合格・チェック違反として初めて発覚する。

## 望ましい変更

1. command-authoring / skill-authoring の記述削減・ thin 化・抽象化手順へ「削減前の契約テスト・checker grep」を必須ステップとして追加する
2. grep 対象の代表例（routing token、期待値固定セクション、capture 責務の概念名文字列、checker の `content.includes` 由来の文字列）を列挙する
3. 両立運用（概念名の括弧書き残存等、CaptureBoundary/IR-059 で確立したパターン）を回避策として併記する

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-command-authoring/SKILL.md`（記述削減・品質基準手順）
- `src/opencode/skills/agentdev-skill-authoring/SKILL.md`（同上）
- 配布 command / skill 本文の抽象化・thin 化を扱う Issue の検証手順

### 対象外

- 契約テスト側の期待値管理方式の変更（テストの固定方式自体は維持）
- checker の文字列一致方式の変更（`content.includes` 等は既存契約）
- 通常の新規作成手順（削減・抽象化時の追加手順が対象）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-command-authoring/SKILL.md` | 記述削減手順へ契約テスト・checker 固定トークンの事前 grep を必須ステップとして追加 |
| skill | `src/opencode/skills/agentdev-skill-authoring/SKILL.md` | 同上（skill 本文の抽象化・参照除去時） |

## 既存対策確認

- **確認結果**: 既存対策なし
- **該当ファイル**: なし（agentdev-command-authoring・agentdev-skill-authoring の SKILL.md に契約テスト固定トークンの事前確認手順なし。前回 learning-promote の問題クラス3として promote → RU 化済みだが authoring skill への反映は未到達）
- **ギャップ分類**: なし（対策不在。前回 RU 由来の反映待ち）
- **ギャップ詳細**: なし

## 制約

- 前回 RU 化済み主題（契約テストと本文編集・完了判定の相互作用）の重複登録にならないよう、本成果物は authoring skill 手順への反映に特化する（完了条件への期待値更新明示は前回 RU 側の範囲）
- grep 手順は判断を含むため自動化は必須としない（手順の明文化が主体）

## 受け入れ条件

- [ ] 記述削減・抽象化手順に契約テスト・checker grep の事前実施ステップが追加されていること
- [ ] grep 対象の代表例（routing token・期待値固定セクション・概念名文字列）が列挙されていること
- [ ] 固定トークンを含むセクションの原形維持・概念名括弧書き残存などの回避パターンが併記されていること

## 元learning item / 根拠

- **要約**: 契約テスト・checker が配布物本文トークンを機械検証していることが記述上から読み取れず、削減・抽象化で初めて発覚する。事前 grep 手順の authoring 反映が必要
- **根拠**: (1) PR #2186（Issue #2181）: 16コマンドの STEP 要約削減で case-run ### Step 7-1 の routing token（検出器エントリポイント、--profile source、result 状態語）削減により distribution_boundary_routing_contract.test.ts 不合格。対象セクションを公開 interface として原形維持し、削減を「工程詳細の再要約」に限定して解消。【living pool 由来（prune 済み）】(2) Epic #1719 Wave 4（PR #1728/#1733→#1735）: 配布 command からコンクリートパス除去で `capture-boundaries` 文字列が消失し checkCommandCaptureDuties 違反4件。概念名の括弧書き残存で IR-059 と両立する運用を確立
- **再発条件**: 契約テスト・checker が本文トークン・文字列を期待値固定している配布物に対し、トークン残存確認なしに記述削減・抽象化を行う場合
- **横展開可能性**: 高い。契約テスト・文字列 checker を持つ配布物編集全般

## 推奨Issue分類

- **分類**: chore（配布 skill 手順の追記）
- **推奨ラベル**: documentation, authoring, contract-test
- **関連Issue**: #2181 (CLOSED)
