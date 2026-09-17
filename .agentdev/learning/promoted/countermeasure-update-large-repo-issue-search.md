# 大規模リポジトリでの Issue 検索は gh CLI 第一手段化（agentdev_gh issue_list page limit 対応）

## 背景

Custom Tool agentdev_gh の issue_list 操作が、search フィルタの有無にかかわらず safety page limit（10ページ×100件）に到達して operation-failed となり、case-open の冪等検出入口（既存 Root Case / Definition PR の検索）が Tool 経由では完結しなくなった（Case #2936、Issue 総数 2900+ のリポジトリ、2026-09-17）。

## 問題

- issue_list の内部走査は Issue 総数が走査上限を超えるとフィルタ指定では回避できない（search は title 部分一致で、絞り込み不足とは別の問題）
- Tool 応答の contingency（gh CLI 読み取り系フォールバック）は存在するが、大規模リポジトリでは「再試行ではなく最初から gh CLI」が低コストであることが検索安全手順に明記されていない
- page limit 失敗時に再試行を繰り返す無駄な試行が発生し得る

## 望ましい変更

agentdev-issue-management の Issue 検索安全手順へ「大規模リポジトリ（2900+ Issue 規模）では state=open 絞り込み付き gh CLI を第一手段とする。page limit 失敗時は再試行を繰り返さず直ちに gh CLI へ切替える」を追記する。case-open / case-ready の冪等検出手順にも同様の注意を付記する。

## 対象範囲

### 対象

- agentdev-issue-management の Issue 検索安全手順
- case-open / case-ready の冪等検出手順（references）

### 対象外

- agentdev_gh 側の page limit 上限引き上げや件数プリチェック機能の追加（Tool 仕様変更は別要件。予防策候補として記録のみ）
- 読み取り系以外の gh CLI 実行（write 系は Tool 経由契約を維持）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/opencode/skills/agentdev-issue-management/（Issue 検索の安全手順） | 大規模リポジトリでの gh CLI 第一手段化の追記 |
| 配布skill reference | src/opencode/skills/agentdev-workflow-case-open/ , agentdev-workflow-case-ready/（冪等検出手順） | page limit 失敗時の即時切替え注意の付記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: REQ-011 の読取系 gh CLI fallback 契約（Tool 応答の contingency に明記）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: fallback 契約は存在するが、「大規模リポジトリでは最初から gh CLI」「page limit 失敗時は再試行しない」という判断規則が手順書に明記されていない

## 制約

- 読取系に限定する（write 系の Tool 経由契約は維持）
- gh CLI 実行時の出力エンコーディング対策は既存知識に従う

## 受け入れ条件

- [ ] 大規模リポジトリでの検索手順に gh CLI 第一手段の判断規則が明記されている
- [ ] page limit 失敗時の即時切替えが手順化されている

## 元learning item / 根拠

- **要約**: agentdev_gh issue_list が大規模リポジトリで safety page limit に到達し冪等検出が完結しない
- **根拠**: Case #2936（state=open、search 付き再試行でも失敗。Tool contingency に従い gh issue list / gh pr list で不在確認、closed 側も補完検索して同 topic の旧 Case #2358 を確認後に新規作成経路を確定）
- **再発条件**: Issue 総数が Tool 走査上限を超えた状態で issue_list を呼ぶ場合に毎回発生
- **横展開可能性**: 2900+ Issue 規模のリポジトリで issue_list 依存の手順（case-open 冪等検出、case-ready 構成検証等）。リポジトリ成長に伴い全 workflow で顕在化し得る

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: Case #2936
