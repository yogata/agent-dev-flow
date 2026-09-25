# 既存対策の更新: traceability 対応宣言の component/sidecar 対応一覧確認の定型化

## 背景

Case #3113（PR #3133）で、producer 側ソースの実装・verification 宣言を plugin 登録層用 sidecar に置いた初回検査で duplicate-inconsistencies が2件検出された。
traceability の対応宣言の所属は変更対象ファイルの見た目ではなく、producer/component（配布物単位）の責務境界で決める必要があるが、宣言作成時にその対応先を誤った。
producer ソースとテストの宣言を traceability/agentdev-gh.yaml に移し、check を再実行して全9項目 pass を確認した（PR 本文の記録）。

## 問題

対応宣言を追加する前に対象ファイルの producer/component と sidecar 対応を照合する定型手順が明示されておらず、producer 側実装の宣言を隣接する登録層 component の sidecar へ追加してしまう。
Tool 本体は agentdev-gh、plugin 登録層は agentdev-gh-tool の sidecar を用いる対応区別が、宣言作成時のチェックとして手順化されていない。

## 望ましい変更

traceability 対応宣言の運用手順に、宣言追加前の component/sidecar 対応一覧確認（対象ファイルの producer/component の特定と、Tool 本体側 / plugin 登録層側の sidecar 区別の照合）を定型ステップとして明示する。

## 対象範囲

### 対象

- traceability 対応宣言（sidecar）の作成・追加手順（agentdev-traceability skill の運用手順記述）
- component 境界による sidecar 所属判定の指針明示

### 対象外

- sidecar schema 自体の変更
- traceability check の実装変更（duplicate-inconsistencies 検出は正常作動）
- 既存 sidecar 宣言ファイル（traceability/agentdev-gh.yaml、traceability/agentdev-gh-tool.yaml）の内容変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-traceability/references/sidecar-and-policy.md（実在確認済み） | 宣言追加前の component/sidecar 対応一覧確認ステップの明示 |
| 配布skill | src/opencode/skills/agentdev-traceability/SKILL.md | 対応宣言の作成手順における component 境界確認の注記 |

## 既存対策確認

- **確認結果**: 既存対策あり（traceability check の duplicate-inconsistencies 検出、sidecar-and-policy.md の運用手順）
- **該当ファイル**: src/opencode/skills/agentdev-traceability/references/sidecar-and-policy.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 宣言追加前の component/sidecar 対応一覧確認（producer/component と sidecar 対応の照合、Tool 本体 / plugin 登録層の区別）が定型ステップとして明示されていない。

## 制約

- sidecar 所属は配布物単位（component）の責務境界で決まり、変更対象ファイルの見た目では決まらない。
- 宣言の移動（所属訂正）後に check を再実行して pass を確認する運用を維持する。

## 受け入れ条件

- [ ] 対応宣言追加前の component/sidecar 対応一覧確認が定型ステップとして運用手順に明記されている
- [ ] Tool 本体（agentdev-gh）と plugin 登録層（agentdev-gh-tool）の sidecar 区別の指針が確認可能である

## 元learning item / 根拠

- **要約**: traceability sidecar は宣言元 component に対応づける（producer/component 境界判定の事前確認手順ギャップ）。
- **根拠**: Case #3113（PR #3133）で REQ-011-033 を対象とした traceability check の findings により duplicate-inconsistencies 2件を検出。宣言を traceability/agentdev-gh.yaml へ移し、check 再実行で全9項目 pass（PR 本文の記録）。
- **再発条件**: producer 側実装の宣言を隣接する登録層 component の sidecar へ追加した場合。
- **横展開可能性**: traceability 対応宣言を扱う全 Case で発生し得る運用手順の知見。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation（手順明示）
- **関連Issue**: Case #3113（PR #3133）
