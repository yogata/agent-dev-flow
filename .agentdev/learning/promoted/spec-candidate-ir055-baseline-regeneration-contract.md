# IR-055 baseline 再生成の実行契約（タイミング・スコープ）の明文化（spec 候補）

## 背景

IR-055 baseline（runtime reference snapshot）の再生成に関する3件の運用障害が発生した:

1. **更新漏れ**: Phase 4（OU-005 #2081）で `docs/specs/**` への新規参照が追加されたが baseline へ未反映で、main HEAD で IR-055 テストが pre-existing fail（PR #2089 / Epic #2076）。Phase 6 へ委譲
2. **移設時の未登録**: workflow 実装を command から skill へ移設すると、同一文言の参照でも移設先ファイルが baseline 未登録のため delta 違反になる。正規 CLI（`--update-ir055-baseline`）での再生成が移設作業の標準手順として機能した（98 → 61 entries、ratchet として健全）（PR 2114 / Issue 2102）
3. **並列 Wave の相互作用**: 並列 Wave の1つが共有 baseline を自 HEAD 基準で再生成すると、兄弟 Wave の新規ファイルが baseline 未登録のまま merge 後 staging で delta warning を生む（PR 2112/2113/2114 の統合で warning 増分 +5）（Epic #2099 Wave 2）

## 問題

baseline 再生成の実行契約（いつ・どのスコープで再生成するか）が規定されていない。file 移設・並列 Wave・docs/specs 新規参照の各工程で、再生成スキップまたは局所実行が障害化する。

## 望ましい変更

1. file 移設を伴う PR（command → skill 移行等）の標準手順に、移設完了時の正規 CLI による baseline 再生成を組み込む
2. 並列 Wave で baseline 再生成を行う OU を含める場合、(a) Wave 境界（case-close Stage 3 集約時）での再生成、または (b) merge 順序最後の PR が全兄弟変更を取り込んでから再生成、のいずれかで整列する実行契約を明記する
3. case-close の docs 検証で、PR 対象ファイルに `docs/specs/**` が含まれる場合の baseline 再生成必須チェック（または再生成要否の判定手順）を追加する

## 対象範囲

### 対象

- IR-055 baseline の再生成タイミング・スコープの運用契約
- case-run / case-close の移設系 PR・docs 変更を伴う工程の手順

### 対象外

- IR-055 検出ルール自体の仕様変更
- baseline の形式・スキーマ変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec 候補 | `docs/specs/integrity/`（IR-055 baseline 運用規約。配置は backlog-review → req-define で判断） | 再生成の実行契約（移設時標準手順・Wave 境界/最終 merge でのスコープ・docs/specs 変更時チェック） |
| skill reference | `src/opencode/skills/agentdev-workflow-case-close/references/`（docs 検証 STEP）、case-run の移設作業手順 | baseline 再生成ステップの組込み |

## 既存対策確認

- **確認結果**: 既存対策あり（部分的）
- **該当ファイル**: 正規 CLI（`check_integrity.ts --update-ir055-baseline`）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 再生成 CLI は存在するが、実行契約（タイミング・スコープ）が規定されていない

## 制約

- baseline は ratchet（純減は健全）である性質を損なわない
- 並列 Wave の実行モデル（case-auto Stage 3 集約）と整合する配置とする

## 受け入れ条件

- [ ] 移設系 PR の手順に baseline 再生成が標準ステップとして組み込まれている
- [ ] 並列 Wave での再生成スコープ契約（Wave 境界 or 最終 merge 後）が明文化されている
- [ ] docs/specs/** 変更を伴う case-close で baseline 再生成の要否判定手順が規定されている

## 元learning item / 根拠

- **要約**: IR-055 baseline 再生成の実行契約（タイミング・スコープ）未規定で、更新漏れ・移設時未登録・並列 Wave 相互作用の3障害が発生
- **根拠**: PR #2089（pre-existing fail、Phase 6 委譲）、PR 2114（移設時再生成で 98→61 entries）、Epic #2099 Wave 2 統合（delta warning 増分 +5、merge 前シミュレーションで事前検出）
- **再発条件**: file 移設・並列 Wave・docs/specs 新規参照を伴う工程で baseline 再生成をスキップまたは局所実行した場合
- **横展開可能性**: 中程度。baseline ratchet 運用を持つプロジェクト全般

## 推奨Issue分類

- **分類**: chore（運用契約の明文化）
- **推奨ラベル**: documentation, integrity, testing
- **関連Issue**: #2082 委譲先 #2083、2102、Epic #2099 Wave 2
