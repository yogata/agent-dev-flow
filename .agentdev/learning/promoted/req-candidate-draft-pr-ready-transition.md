# Draft Definition PR の draft 解除経路の整備要求（Tool カタログ・責務空白）

## 背景

case-open が Draft Definition PR を作成し case-ready が merge 責務を持つ構成で、draft 解除（Ready for review 化）を担当する工程がどの workflow にも定義されていなかった（Case #2895、Definition PR #2896、2026-09-16）。case-ready の pr_merge が HTTP 405 (Pull Request is still a draft) で失敗し blocked 停止した。raw gh pr ready による迂回は agentdev-gh-write-guard 違反のため実行できず、ユーザー手動操作で解消した。

## 問題

- Custom Tool agentdev_gh の操作カタログが PR の draft→ready 遷移（pr_ready 等）をカバーしていない
- draft 解除責務の割当が case-open と case-ready の間で未定義のまま
- write-guard 下では Tool カバレッジ外の GitHub side-effect に正規手段がなく、blocked 停止とユーザー手動介入が必須になる

## 望ましい変更

次のいずれか（または組み合わせ）による draft 解除経路の整備。**選択は req-define の変更影響分析に委ねる**:

- (a) case-open で非 Draft PR を作成する構成に変更
- (b) case-open または case-ready へ draft 解除責務を定義（GitHub UI 操作を含む運用定義の可能性も含む）
- (c) agentdev_gh へ draft 解除操作（pr_ready 等）を追加（agentdev-gh-write-guard の許可リスト同期を含む）

## 対象範囲

### 対象

- Definition PR lifecycle（case-open の PR 作成、case-ready の merge 責務）
- agentdev_gh 操作カタログ（REQ-006/REQ-052 系の Tool 操作契約）
- agentdev-gh-write-guard の許可リスト（操作追加の場合）

### 対象外

- Draft PR 作成自体の是非（case-open の冪等性設計は維持前提）
- その他の GitHub 操作（reopen、label 等）の網羅性点検（別途検討候補）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| REQ（Tool 操作契約） | docs/requirements/REQ-006.md / REQ-052.md 系 | agentdev_gh 操作カタログへの draft 解除操作追加の要否判断 |
| Design | definition-readiness 関連 Design（case-open/case-ready の Definition PR lifecycle） | draft 解除責務の割当定義 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-open/ , agentdev-workflow-case-ready/ | 責務定義変更時の workflow 手順更新 |

## 既存対策確認

- **確認結果**: なし
- **該当ファイル**: なし
- **ギャップ分類**: なし
- **ギャップ詳細**: Tool カタログ・責務定義の双方に draft→ready 遷移の経路が存在しない（write-guard の fail-closed 挙動自体は意図された正常動作）

## 制約

- write-guard の安全側設計（fail-closed）は維持する。Tool カタログ拡張はガード許可リストと同期して行う
- blocked → ユーザー操作 → 冪等再開の経路自体は機能した実例があり、整備までの暫定運用として有効

## 受け入れ条件

- [ ] Draft Definition PR を含む Case が case-ready で blocked 停止しない経路が定義されている
- [ ] 整備経路の選択理由（a/b/c のいずれか）が req-define の変更影響分析で確定している

## 元learning item / 根拠

- **要約**: Draft PR の draft 解除経路が Tool カタログ・責務定義の双方に存在せず blocked 停止した
- **根拠**: Case #2895（Issue #2895、PR #2896、Issue コメント 5697968508 の停止記録）の3側面: draft 解除担当の未定義、Tool カタログの操作不在、write-guard 下での正規手段不在
- **再発条件**: case-open が Draft Definition PR を作成し、draft 解除の正規手段が整備されない限り毎回発生（write-guard により raw CLI 迂回は契約違反で blocked 停止が正挙動）
- **横展開可能性**: Draft PR を作成する工程と merge する工程が分かれている全 workflow 分割で同種の責務空白が発生し得る

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: Issue #2895
