# textlint presetのcorpus実測校正

## 背景
技術文書corpusにtextlint presetを適用し、大量の慣行表記誤検出を確認した。

## 問題
汎用presetの既定値は専門用語・定義リスト・注意喚起太字を含むcorpusと衝突する。

## 望ましい変更
preset採用時にcorpusを実測し、max値やdisableXxx optionを校正する。規則自体の無効化や大量の手動是正を先行させない。

## 対象範囲
### 対象
- preset規則のoption校正とcorpus測定手順
### 対象外
- 誤検出を理由とした規則全体の無効化

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| Design / procedures | `docs/designs/quality/textlint-quality-runtime.md` | 採用前のcorpus実測・option校正を明記 |

## 既存対策確認
- **確認結果**: 校正optionは実装済み、手順明文化にgap
- **該当ファイル**: `src/opencode/plugins/agentdev-textlint-guard/lib/rules.ts`
- **ギャップ分類**: application miss
- **ギャップ詳細**: preset導入時の実測を標準工程として明示していない

## 制約
拒否対象と助言対象の分類契約を変更せず、慣行表記を検出対象から調整する。

## 受け入れ条件
- [ ] corpus実測値を取得する
- [ ] option校正後の検出件数と残存指摘を確認する
- [ ] 規則無効化なしで慣行表記の誤検出を抑制する

## 元learning item / 根拠
- **要約**: max-kanjiとpreset-ai-writingのcorpus校正
- **根拠**: #10/#11、PR #2747で1,856件・1,825件等の誤検出をoption校正で削減
- **再発条件**: corpus実測なしにpreset既定値を適用する場合
- **横展開可能性**: lint presetを採用する全プロジェクト

## 推奨Issue分類
- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: #2724/#2735
