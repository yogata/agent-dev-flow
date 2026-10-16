# record-comments applySection の末尾セクション境界におけるセクション後コンテンツ保全（STEP-5-2 本文更新のデータ保全強化）

## 背景

Case Issue 本文の進行状況セクションを `record-comments.ts` の applySection で置換した際（case-close STEP-5-2 本文結果セクション更新・Case #3725）、セクション境界から次の「## 」見出しが現れない区間（文書末尾に続く工程記録 HTML コメント群）までをセクション内容として消費し、履歴コメント（case-run 停止記録・case-revise・case-ready・再委譲記録）が本文から消失した。消失した履歴コメントは結果セクション後に復元し、工程記録継続コメントを新規追記してから issue_update で更新して回復した（実害1回・復元済み）。

## 問題

`cleanup-and-capture.md` L41 の STEP-5-2 条項「既存セクションの順序と内容は保持する」が内容保持の意図を宣言する一方、applySection の境界検出実装（次の「## 」見出し行まで走査、endIndex 初期値 `lines.length`）は、置換対象セクションが文書末尾（後続見出しが存在しない位置）にある場合、見出し無しで後に続く HTML コメント群を前セクション内容の一部として消費する。条項の意図と実装の間に不整合があり、かつ applySection 適用前のセクション後コンテンツ保全確認を規定する手順が case-close references に存在しないため、同じ条件（文書末尾セクション置換）で再発し得る。

## 望ましい変更

第一候補として `record-comments.ts` applySection の境界検出改善（置換対象セクションの後に「## 」見出しが現れない場合、後続する HTML コメント・注記を置換対象から除外する境界挙動）を、併記候補として STEP-5-2 手順への applySection 適用前のセクション後コンテンツ保全確認（適用前読み戻しとコメント群の保全チェック）の明記を検討する。実現先の選択（script 改善・手順明記・両方）は req-define の変更影響分析が確定する。

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts`（applySection 境界検出 L203-224 の改善候補。`record-comments.test.ts` への回帰テスト追加を含む）
- `src/common/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md`（STEP-5-2 手順への適用前保全確認の明記候補）

### 対象外

- `agentdev-issue-management` の Issue 更新時の前後内容比較・再読込 VERIFY 運用（既存のまま維持。本件の前置保全確認は置換前の保全であり役割が異なる）
- Case Issue 本文テンプレート構造そのもの（工程記録 HTML コメントの配置規約は変更しない）
- applySection の API 形状（呼出し側互換性を壊す再設計はしない）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布 script（第一候補） | `src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts` | applySection の境界検出改善（末尾セクション置換時の後続見出し無しコンテンツ保全）+ `scripts/tests/record-comments.test.ts` への回帰テスト追加 |
| 配布skill references | `src/common/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md` | STEP-5-2 手順に applySection 適用前のセクション後コンテンツ保全確認を明記（script 改善と併用または代替） |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `src/common/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md` L41（STEP-5-2「既存セクションの順序と内容は保持する」）、`src/common/skills/agentdev-issue-management/SKILL.md` L23 と `references/issue-operation-safety.md`（Issue 更新時の前後内容比較・再読込 VERIFY）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 内容保持条項と applySection の末尾セクション境界挙動（endIndex 初期値 `lines.length` で後続見出し無しコンテンツを消費）の不整合を検出する前置確認・境界改善の規定がない。前後比較運用は更新後の検査であり、置換による消失の防止には適用前の保全確認または境界改善が必要

## 制約

- `record-comments.ts` は Bun 固有 API（import.meta.path / import.meta.dir）を持ち、正規ランナーは bun である（node --experimental-strip-types では動作しない既知事項）
- applySection の既存呼出し側（case-close STEP-5-2・工程記録継続コメント追記）との互換性を維持する。置換対象セクションの正常系挙動（同名セクション置換・末尾追加）を変えない（既存テスト「applySection は同名セクションを置換し、既存セクションを保持する」「同名セクション不在時、本文末尾へ追加する」を維持）
- script 改善を採る場合は `record-comments.test.ts` に末尾セクション置換の回帰テストを追加する

## 受け入れ条件

- [ ] 末尾セクション（後続見出し無し）置換でセクション後の HTML コメントが消失しないことが回帰テストで検証されている
- [ ] STEP-5-2 手順に適用前の保全確認が明記されている（script 改善と併用または代替のいずれかの形で）
- [ ] 既存の applySection 挙動（同名セクション置換・不在時末尾追加）が破壊されていないことが既存テストで確認されている

## 元learning item / 根拠

- **要約**: record-comments.ts applySection によるセクション置換は、後続見出しの無い文書末尾区間の HTML コメント群を消費して履歴コメントを消失させるため、境界改善または適用前保全確認の手順化を候補化する
- **根拠**: Case #3725 case-close STEP-5-2 で実害が1回発生（履歴コメント〔case-run 停止記録・case-revise・case-ready・再委譲記録〕の消失と復元）。根本原因は applySection の置換範囲仕様（次の「## 」見出しまでまたは文書末尾）。learning エントリ自体が「record-comments.ts の境界検出改善（learning-promote での候補化を想定）」と明示。case-close references 全文 grep で保全確認規定の不在を実測
- **再発条件**: 文書末尾のセクション（後続見出しが存在しないセクション）を applySection で置換した場合（case-close STEP-5-2 の本文結果セクション更新で構造的に起こり得る）
- **横展開可能性**: 本配布物に固有の機構だが、セクション置換型の Issue 本文更新一般（工程記録モデルを採る全 workflow）に適用し得る

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: なし（Case #3725、agentdev-workflow-case-run scripts/record-comments.ts）
