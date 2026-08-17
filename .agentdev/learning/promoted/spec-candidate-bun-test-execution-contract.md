# bun test 実行形態契約（フィルタ解釈・gitignore 探索・実行件数突合）（spec 候補）

## 背景

Epic #2134 Wave 3 の case-close（full integrity suite 実行）と PR #2184 の QG-4 再検査で、bun test の実行形態に起因する検証空洞化が2件発生した。(1) `./` prefix なしの相対パス指定では意図したテストの一部だけが実行され、部分実行も EXIT 0 で終わるため件数検証なしには気付けない（160 pass が実際は 2274 tests の約7%）。(2) bun の gitignore-aware 探索は repo root 起動では `.opencode/skills/repo-agentdev-integrity/scripts` 配下（2020 test / 83 files）を検出せず、スイート全体の実行には scripts ディレクトリを cwd とする必要があるが、その実行形態では cwd 依存テストが fail する。

## 問題

quality-gates SPEC の full integrity suite 合格基準は識別子中心評価を主評価値とし、実行件数の妥当性検証（`Ran N tests across M files` の N/M 突合）と実行形式（起動 cwd、`./` prefix、対象ディレクトリ明示）の記録要求が規定されていない。このため pass/fail のみの判定で部分実行を見逃し、「全体実行 pass」の検証証拠が環境依存で再現不能になる。

## 望ましい変更

1. full suite 実行手順に (a) 全テストディレクトリを `./` prefix 付きで明示指定する、(b) `Ran N tests across M files` の N/M を直前実績と突合する件数検証を必須ステップとして組み込む
2. PR 本文・検証手順の証拠記録に実行 cwd と起動コマンド形式の明記を要求する
3. cwd 依存テストの混在するスイートの実行形態（scripts dir 起動）と、その制約（cwd 相対パス解決で fail する既存事象）を運用注記として明記する

## 対象範囲

### 対象

- `docs/specs/quality/quality-gates.md`（full integrity suite 合格基準、QG-4）
- case-close / docs-check の full suite 実行手順
- PR 本文テンプレート（Test Strategy 結果欄の実行形式記録）

### 対象外

- bun 本体のテスト発見仕様の変更（ツール仕様は前提として扱う）
- cwd 依存テストの個別修正（intake 側で管理中の個別課題）
- bun 以外のテストランナー（vitest 等の導入検討はスコープ外）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/quality/quality-gates.md` | full integrity suite 合格基準へ件数突合（N/M）・実行形式明記を必須化 |
| spec / 手順 | case-close・docs-check の full suite 実行手順 | `./` prefix 付き明示指定・cwd 記載・件数突合ステップの追加 |
| template | workflow-templates `templates/pr_desc.md` | Test Strategy 結果欄へ実行 cwd・コマンド形式・件数の記録欄 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `docs/specs/quality/quality-gates.md`（full integrity suite 合格基準、識別子中心評価で実測値は補助値）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: `Ran N tests across M files` の件数突合・実行 cwd とコマンド形式の明記要求が未規定

## 制約

- 件数の直前実績が変動する運用（テスト追加・削除）を考慮し、突合は「N/M が急減していないか」の妥当性検証として規定する（固定値の期待値化はしない）
- QG-4 の既存評価構造（識別子中心）を維持し、件数は補助値の位置付けを変えない

## 受け入れ条件

- [ ] full suite 実行手順に `./` prefix 付きの対象ディレクトリ明示指定が規定されていること
- [ ] `Ran N tests across M files` の N/M 件数突合が必須ステップとして規定されていること
- [ ] 検証証拠への実行 cwd・コマンド形式の明記要求が規定されていること

## 元learning item / 根拠

- **要約**: bun test の引数はフィルタ解釈であり、`./` prefix・起動 cwd・gitignore 探索の組合せで実行対象が変化する。部分実行も EXIT 0 のため件数検証が必須
- **根拠**: (1) Epic #2134 Wave 3 case-close: `./` なし相対パスで 160 pass / EXIT 0 が、prefix 付き再実行で 2274 tests / 106 files だった（bun の "filters did not match any test files" 注意と PR #2154 実績値 267 tests/4ファイル との矛盾で検知）。(2) PR #2184（OU-001、Issue #2179）: repo root 起動では gitignore-aware 探索により repo-agentdev-integrity スイート（2020 test）が検出されず、scripts dir 起動では cwd 依存テスト（check_extensions.test.ts）が fail。PR 本文の「2020 pass（repo root 実行）」がどの実行形態でも再現不能だった
- **再発条件**: Windows 環境で bun test に `./` なし相対パスを渡す場合、gitignore 再包含ディレクトリ配下のスイートを repo root 起動で検証する場合、cwd 依存テストを含むスイートの全体実行を証拠化する場合
- **横展開可能性**: 中程度。bun test + Windows + gitignore 環境全般

## 推奨Issue分類

- **分類**: chore（品質ゲート SPEC・実行手順の整備）
- **推奨ラベル**: documentation, testing, quality-gates
- **関連Issue**: #2143 (CLOSED), #2179 (CLOSED)
