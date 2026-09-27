# agentdev_gh issue_update 契約の role 不受理規則（issue_create 専用フィールド）の安全手順明記

## 背景

case-open（Case #3166）の STEP-3 adf_case 埋め戻しで、Custom Tool agentdev_gh の issue_update 操作に `role: case` を含めて呼出したところ invalid-input（unknown-field [role]: field 'role' is not part of the issue_update input contract、retryable: true）で拒否された。role を除去した最小引数で再送し成功した。Tool 契約自体は fail-closed に機能したが、公開説明の表現が誤解を招く状態が残る。

## 問題

- agentdev_gh の `role` は issue_create 専用の入力フィールドであり、issue_update は受理しない
- Tool 公開説明の「Tracking-issue operations expose logical values (role, kind, trackingState)」の記述が、role を全 tracking 操作で受理できると誤解させる
- invalid-input は retryable 表示でも同一呼出の再試行では解消せず、引数修正が必須である旨の contingency 記述がない

## 望ましい変更

- issue-operation-safety.md の tracking 軸操作の 3 規則節に「issue_update は role を受理しない（role は issue_create 専用）。labels は省略時追跡軸維持」を明記する
- invalid-input（unknown-field）は再試行でなく引数修正対象である旨を contingency 記述へ補足する

## 対象範囲

### 対象

- agentdev-issue-management issue-operation-safety.md（tracking 軸操作の 3 規則節・issue_update 項、contingency 記述）
- agentdev-issue-tracking Design（操作別入力契約の明記候補）

### 対象外

- agentdev_gh Tool 実装・公開スキーマ自体の変更（fail-closed 契約自体は正しく機能している）
- trackingState 等の他フィールド契約の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md | tracking 軸 3 規則への role 不受理規則明記、invalid-input contingency 補足 |
| Design | agentdev-issue-tracking Design（操作別入力契約） | issue_update の入力契約（role 不受理・labels 省略時挙動）明記候補 |

## 既存対策確認

- **確認結果**: あり（fix gap）
- **該当ファイル**: src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: issue-operation-safety.md は存在するが role 不受理の規則未記載。近縁 deferred「2026-09-15 case 2805 Epic: body 更新のみの issue_update 後に Issue state が closed へ変化した」は issue_update 副作用系で根本原因は別。該当 deferred エントリなし

## 制約

- Tool 契約自体は fail-closed に機能しており、変更対象は呼出側の知見補完（reference 手順文書）に限定される
- issue_update を使う全 workflow（case-ready の ready 遷移、case-close のクローズ、Epic tracker のステータス更新等）で同様の誤呼出が起こり得るため、規則は tracking 軸操作の共通規則として記述する

## 受け入れ条件

- [ ] issue-operation-safety.md に「issue_update は role を受理しない（role は issue_create 専用）。labels は省略時追跡軸維持」の規則が明記されること
- [ ] invalid-input（unknown-field）の取扱い（再試行ではなく引数修正）が contingency 記述へ補足されること

## 元 learning item / 根拠

- **要約**: agentdev_gh issue_update の入力契約で role が不受理である実測と公開説明の誤解を招く表現
- **根拠**: inbox「agentdev_gh issue_update 契約は role フィールドを受理しない（issue_create 専用）の実測」（Case #3166・Root Case 本文更新成功）: `role: case` 含む issue_update が invalid-input（unknown-field [role]）で拒否。role 除去の最小引数（body・labels・number・operation）で再送し VERIFY 通過。trackingState も指定せず本文更新のみとした（Case Issue の論理状態は case-ready 以降の工程で変化させる）
- **再発条件**: issue_create の引数構成を issue_update へ流用する場合
- **横展開可能性**: issue_update を使う全 workflow で再現し得る。invalid-input の detail を契約の実測として受容する手順は他 Custom Tool 操作にも展開可能

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation
- **関連Issue**: なし
