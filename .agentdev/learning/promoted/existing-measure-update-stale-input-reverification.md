# 合意入力（draft/RU/合意観測）の適用時再実測・実在検証の前置

## 背景

draft/RU 実測時点と case-open/case-run 適用時点の間に他 Case の merge が入り、合意入力の前提（可変メタデータ・fail 構成・採番状態・対象パス）が陳腐化する事象が4件で観測された。また合意前段階（req-define の artifact_actions 構成）で target 系パスの実在検証が行われず、パス誤記のまま合意へ含まれた事例があった。

## 問題

(1) REQ-032 frontmatter updated 乖離は case-open 実測時点で解消済みだった（時間差陳腐化）。(2) 合意入力時点の pre-existing fail 2件も実行時点で解消済みだった（期待値修正対象なしを Findings 記録で処理）。(3) req-define ドラフトの新設行番号（REQ-001-069/REQ-010-069）が case-open 実行時点の既存行と衝突した（max+1 採番で割当て直し）。(4) draft AG-015 の target_design パスがドメイン誤記（responsibilities vs integrity）で、実在検証なしに合意へ含まれた。

## 望ましい変更

case-open の artifact_actions 適用手順に次の前置検証を明示する: (a) 対象 REQ ファイル実取得による採番衝突検査（末尾行との突合・max+1 割当て）、(b) target 系パス（target_req・target_design）の実在検証（ファイル存在・Design インデックス表 slug 突合）、(c) 可変メタデータ系 ACT（frontmatter 日付等）の現行 HEAD 再実測。req-define 側の artifact_actions 構成時にも target パス実在確認ステップの追加を候補とする。

## 対象範囲

### 対象

- `src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md`（STEP-2/3 対象ファイル実測・STEP-4 適用手順）
- req-define の artifact_actions 構成手順（反映先は req-define が選択）

### 対象外

- draft/RU のライフサイクル契約の変更
- 採番規則（REQ-087-002・numbering-policy）の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md | artifact_actions 適用前の採番衝突検査・実在検証・再実測の前置明示 |
| 配布skill reference | src/common/skills/agentdev-workflow-req-define/ 側 references | artifact_actions 構成時の target パス実在確認ステップの追加候補 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: case-open Design の canonical Definition 比較・冪等再実測規約
- **ギャップ分類**: fix gap
- **ギャップ詳細**: canonical 再実測規約は存在するが、可変メタデータ系 ACT への明示・採番衝突検査・target 系パス実在検証（合意前段階含む）は手順化されていない

## 制約

- ドラフトの行番号指定は「内容の合意」であり「採番の確定」ではないという現行解釈を維持する
- 並行 Case 運用（時間差陳腐化の発生源）は維持する

## 受け入れ条件

- [ ] artifact_actions 適用手順に採番衝突検査が明記される
- [ ] target 系パスの実在検証が手順化される
- [ ] 解消済み前提の再実測（実施対象なしの記録経路）が明記される

## 元learning item / 根拠

- **要約**: 合意入力の時間差陳腐化3件（frontmatter・pre-existing fail・採番）と合意前のパス実在検証欠落1件
- **根拠**: Case #3336・PR #3346（REQ-032 frontmatter 解消済み・ACT-REQ-005 実変更なし）、Case #3342・PR #3383（pre-existing fail 解消済み・実施対象なし）、Root Case #3425・PR #3428（REQ-001-070/REQ-010-070 へ max+1 割当て）、Root Case #3355・PR #3359（target_design を integrity 配下へ所在補正）
- **再発条件**: draft/RU 作成から適用までの間に並行 Case が同一ファイルへ変更を merge する場合、ドメイン配置を記憶ベースで指定し実在検証を経ない場合
- **横展開可能性**: 並行 Case 運用の case-open/case-run・req-define の artifact_actions 構成

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, workflow
- **関連Issue**: なし
