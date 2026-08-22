# 配布物追加 PR のフル suite 必須化と定形成果物の機械検収

## 背景

Epic 2351 Wave 1 で、新規配布物追加 PR 2355（agentdev-project-extensions scripts）が配布側サブセットテスト（21件）と checker 個別テストのみでフル integrity suite 未実施のままマージされ、マージ後 main の bun test 全件で IR-055 delta 違反（README の repo-local 参照3件）が初検出された。並列 Wave の PR 2356 はフル suite を実施していたが、その worktree には PR 2355 の新規ファイルが存在しないため検出不可能だった。また REQ-045 網羅監査（PR 2374）では 714 ファイル・28 検出事項の監査レポート初回検収で7件のラベル欠落があり、TS-002 の機械検収（正規表現によるラベル存在検査）で検出・補完した。

## 問題

- 配布物を新規追加する PR の品質統制にフル integrity suite 実施が必須化されておらず、サブセット green だけで PR 作成が可能になっている
- 並列 Wave の個別 worktree は他 PR の変更を含まないため、マージ後の組み合わせ状態はマージ前の個別検証では検証できない
- 大規模エントリの定形項目（判定ラベル・証拠項目）網羅は手書きでは保証できない
- 意味整合監査の観点（同一契約の複数箇所定義・検査コード陳腐化）は字面走査では捉えられず、機械検査の delta NG 集計が有効な証拠源であることが周知されていない

## 望ましい変更

- 配布物（src/opencode/**）を新規追加・大幅修正する PR の品質統制に「bun test ./.opencode/skills/repo-agentdev-integrity/scripts/ 全件（少なくとも check_integrity.test.ts）」を必須ステップとして明示する
- 定形項目を多数含む成果物（監査レポート等）の検収に項目存在の機械検収（正規表現ラベル検査等）を組み込む
- 監査・検査手順へ delta NG 集計（baseline 差分）の証拠源活用を明示する

## 対象範囲

### 対象

- case-run の品質統制（配布物追加 PR のテスト実施範囲）
- 監査レポート等の定形成果物の検収手順（回帰検査・Wave 実行契約）

### 対象外

- repo-agentdev-integrity のテスト本体変更
- 並列 Wave 実行モデル（epic-wave-model）の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | src/opencode/skills/agentdev-workflow-case-run/SKILL.md + references（品質統制） | 配布物追加 PR のフル suite（check_integrity.test.ts 含む）必須化を明記 |
| skill | src/opencode/skills/agentdev-workflow-case-run/references（検証手順） | 定形成果物の機械検収（ラベル存在検査）と delta NG 集計の証拠源活用を明記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: AG-035（bun test 実行形態契約）、check_integrity.test.ts（delta 回帰テスト本体）、TS-002 検収（PR 2374 で適用）
- **ギャップ分類**: application miss
- **ギャップ詳細**: フル suite の実施範囲が PR の性質（配布物追加）に応じて必須化されていない。機械検収・delta 集計は実績があるが手順として明示されておらず、次回以降の実施が保証されない

## 制約

- 並列 Wave の worktree 相互は他 PR の変更を含まない前提は変更できない（マージ後 main 検証が最終保証）
- フル suite 実行コストと PR サイズのバランスは品質統制の判断に委ねる（配布物追加は必須、軽微修正は既定の範囲）

## 受け入れ条件

- [ ] 配布物追加 PR の品質統制にフル suite（check_integrity.test.ts 含む）必須実行が明記されている
- [ ] 定形成果物の機械検収手順が明記されている
- [ ] delta NG 集計の証拠源活用が監査・検査手順に明記されている

## 元learning item / 根拠

- **要約**: サブセット green の限界と機械検収による網羅性保証（評価スコア 29/40）
- **根拠**: PR 2355 / Epic 2351（フル suite 未実施でマージ後 IR-055 delta 初検出）、PR 2374（監査レポート7件のラベル欠落を TS-002 機械検収で検出・補完）、PR 2374（delta NG 集計が観点V10 の有効証拠源）
- **再発条件**: 配布物追加 PR でフル suite を実施せずマージする場合、定形項目を機械検収なしで検収する場合
- **横展開可能性**: 並列開発・大量定形項目のプロジェクト全般

## 推奨Issue分類

- **分類**: feature（品質統制の拡充）
- **推奨ラベル**: enhancement, testing
- **関連Issue**: Issue 2352（PR 2355、Epic 2351）、Issue 2370（PR 2374、REQ-045-003/004）
