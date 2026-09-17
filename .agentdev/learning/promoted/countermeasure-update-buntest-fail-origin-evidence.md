# bun test fail 由来分類の証跡手順整備（環境差・baseline 再現確認の具体手順）

## 背景

大規模スイート実行時の環境起因 fail（並列負荷タイムアウト、junction 伝播環境差）の由来分類に、証跡取得と環境差の明示手順が QG-4 references で運用実態に追いついていない。実例では手順を都度工夫して機械受理基準を充足したが、その手順自体が規約化されていない。

## 問題

- タイムアウト系 flaky（5000ms 超過）の由来分類に単独再実行 + フル再実行の証跡取得が必要なことが手順化されていない（Case #2898、2576 pass / 1 fail → 単独・フル再実行で非再現）
- main root と worktree の環境差（junction 伝播の有無）で suite の件数・fail 構成が変わる。件数突合の比較対象は同環境の直前実績を使う必要がある（Case #2904、main root で IR-055・NG21 系 4 fail が worktree 0 fail と乖離）
- baseline 再現確認の具体的手順（detached checkout・読取専用 filter 実行）が明文化されていない（Case #2904 で baseline commit 18391a9e の detached checkout により同一 fail 再現を確認し pre-existing 分類）

## 望ましい変更

QG-4 references の既存節（環境ラベル、fail 由来分類、baseline 再現確認記録基準）へ、実運用で確立した具体手順を追記する:

- タイムアウト系 flaky の由来分類手順（単独再実行 → フル再実行の証跡順序）
- main root 実行時の環境差明示（junction 伝播状態の環境ラベル記録、件数比較は同環境の直前実績）
- baseline 再現確認の具体手順（baseline commit の detached checkout、未コミット変更ゼロ確認、読取専用 filter 実行）

## 対象範囲

### 対象

- agentdev-quality-gates の QG-4 機械受理基準 references（fail 由来分類の運用手順）

### 対象外

- テスト自体の timeout 閾値変更（別改善候補）
- bun test 正規形の分割・実行契約

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md | 既存の環境ラベル節・fail 由来分類節・baseline 再現確認記録基準節への具体手順追記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（L286-289 環境ラベル節〔実行環境・junction 伝播状態・依存パッケージ状態の3要素〕、L295-298 fail 由来分類節〔変更由来 / pre-existing / 不明〕、L322 pre-existing fail の baseline 再現確認記録基準）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 上位基準（何を記録すべきか）は既存だが、具体手順（detached checkout・読取専用 filter 実行、タイムアウト系の再実行証跡順序、同環境直前実績との件数比較）が未明文化（adversarial-review B-2 により既存節と不足分を精緻化）

## 制約

- QG-4 機械受理基準（fail 0 ・由来不明 0）の水準は維持する
- stderr/stdout 分離退避の証跡契約（既存）と整合させる

## 受け入れ条件

- [ ] タイムアウト系 flaky の由来分類手順が規約化されている
- [ ] main root 実行時の環境差明示と件数比較対象が定義されている
- [ ] baseline 再現確認の具体手順（detached checkout・読取専用 filter）が明文化されている

## 元learning item / 根拠

- **要約**: bun test fail 由来分類の証跡取得と環境差・baseline 再現確認の具体手順不在
- **根拠**: Case #2898（分割①初回 5000ms タイムアウト 1 fail、単独再実行 137 pass / 0 fail とフル再実行 2577 pass / 0 fail で非再現確認）、Case #2904（main root で junction 伝播環境固有の IR-055・NG21 系 4 fail、baseline commit 18391a9e の detached checkout で同一再現確認し pre-existing 分類）+ deferred L2204（直前実績比較の制約）と関連
- **再発条件**: フルスイート実行の負荷環境が重なった場合、main root と worktree の環境差がある実行・merge 後検証
- **横展開可能性**: bun test 正規形を実行する全 case・merge 後検証。QG-4 正規形・junction 構成に固有

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: Case #2898, Case #2904
