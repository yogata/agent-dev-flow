# issue-operation-recovery への2段分離試験の追記（agentdev_gh 起動環境障害の診断強化）

## 背景

agentdev_gh Custom Tool が opencode plugin ホスト環境でのみ gh を無出力・非ゼロ終了（exit 66・stderr 空）させる障害が通算5回発生した（初回 2026-09-24〔Case #3123〕、2026-09-27、2026-10-06、2026-10-15〜16〔backlog-auto run 20261015T180807JST stage5・Case #3725 closure 系〕）。REQ-093 廃止（2026-10-03）時に REQ-052-014/015 へ移管され、運用文書 `issue-operation-recovery.md`（2026-10-09 整備）が診断・回復・再開手順を恒久化したが、5回目の発生時に「bash 直叩き gh は成功するが plugin ホスト内 spawnSync のみ失敗」を bash 直叩き実行と bun による CliRunner 直接実行の2段分離試験で切り分ける知見が追加された。deferred pool エントリ（2026-09-25移動・再発4回を統合）は「4回再発のため、次回 learning-promote で本エントリ自体の知識文書化を再評価する」と本 run での再評価を明示していた。

## 問題

`issue-operation-recovery.md` の診断手順は failure detail の読み、`gh auth status` による認証確認、`gh repo view --json nameWithOwner` 手動実行による gh CLI 単体の切り分けまでを規定するが、「plugin ホスト環境固有の故障か、runner 契約側の問題か」を分離する2段試験が明記されていない。障害時に（1）bash から同一引数 gh を直接実行し、（2）bun から runner と同一の spawnSync 経路（CliRunner 直接実行）で実行する分離手順が手順として固定されていないため、runner 契約と実行環境の正常性の切り分けが個々の対応者の判断に依存し、plugin ホスト環境差の特定までの所要が延びる。また `runner-cli.ts` failFromExec の stderr 空 detail には分離試験への提案文言がなく、detail だけを読んだ呼出側が分離試験に至らない。

## 望ましい変更

`issue-operation-recovery.md` の診断手順へ、`gh repo view` 手動実行に続く手順として2段分離試験を追記する（手順1: bash から同一引数の gh を直接実行。手順2: bun から runner と同一の spawnSync 経路〔CliRunner 直接実行〕で実行。bash 成功 + runner 失敗なら plugin ホスト環境差、bash も失敗なら実行環境側の問題と判定）。あわせて `runner-cli.ts` failFromExec の stderr 空 detail 文言への分離試験提案追加の要否を req-define の変更影響分析で判断できる情報候補として保持する（REQ-052-014 の「最小限の detail」契約の範囲内での拡張判断）。

## 対象範囲

### 対象

- `src/common/skills/agentdev-issue-management/references/issue-operation-recovery.md`（起動環境障害の診断手順節への2段分離試験追記）
- `src/common/tools/agentdev-gh/runner-cli.ts` failFromExec detail 文言（拡張の情報候補）

### 対象外

- REQ-052 本体の行変更（REQ-052-014/015 は現行契約として十分。本件は運用文書・detail 文言の整備）
- gh-write-guard 等の他 plugin、harness 側の実装（fresh process 分離・自動再初期化は本リポジトリ対象外の既存契約どおり）
- 読み取り系の bash gh 例外手順の変更（`issue-operation-recovery.md` 既存の縮退運用を維持）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill references | `src/common/skills/agentdev-issue-management/references/issue-operation-recovery.md` | 診断手順節へ2段分離試験（bash 直叩き gh 実行 → bun による CliRunner 直接実行〔runner 同一 spawnSync 経路〕）の手順追記と判定基準の明記 |
| 配布 script（情報候補） | `src/common/tools/agentdev-gh/runner-cli.ts` | failFromExec の stderr 空 detail への bash 分離試験提案文言追加の要否判断（REQ-052-014 最小限 detail 契約の範囲内） |
| retired REQ 再評価（情報候補） | `docs/requirements/retired/REQ-093.md` | 恒久化移管（REQ-052-014/015）後も通算5回再発している運用実績を根拠とした恒久化水準の再評価要否の判断材料 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `docs/requirements/REQ-052.md`（REQ-052-014 L34・REQ-052-015 L35）、`src/common/skills/agentdev-issue-management/references/issue-operation-recovery.md`（診断手順 L19-27・回復手段 L29-32・再開手順 L34-42・委譲前疎通確認 L53・gh exit 66 例外手順 L56）、`src/common/tools/agentdev-gh/runner-cli.ts` L188-210
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 診断手順に2段分離試験の明記がなく、runner 契約と実行環境の正常性の分離が手順として固定されていない。failFromExec detail 文言にも分離試験提案がない（stderr 空失敗時の環境起因識別 detail〔envHint・終了コード・stdout 要約〕は REQ-052-014 で既に充足済み）

## 制約

- 書込み操作の gh CLI 代替は fail-closed 契約（POL-gh-io-delegation・gh-write-guard・custom-tool-contracts.md）により禁止のまま維持する。読み取り系のみ bash gh 例外手順（既存）で補完する
- runner-cli.ts の detail 拡張は REQ-052-014 の「最小限の detail」契約の範囲で判断し、既存の失敗分類の値域（config-uninterpretable / enforcement-crashed / operation-failed）を変更しない
- diagnostic 出力に資格情報等の機密値を含めない
- opencode plugin ホスト環境差の根本原因特定は本件の対象外（再現条件は未特定のまま。opencode サーバー再起動で回復する可能性の記録を維持）

## 受け入れ条件

- [ ] `issue-operation-recovery.md` の診断手順に2段分離試験（bash 直叩き gh 実行 → bun による CliRunner 直接実行）が手順として明記されている
- [ ] 障害発生時の判定基準（bash 成功 + runner 経路失敗 → plugin ホスト環境差。bash も失敗 → 実行環境側の問題）が記載されている
- [ ] REQ-052-014 の失敗分類値域不変・fail-closed 維持に影響しないことが検証されている

## 元learning item / 根拠

- **要約**: agentdev_gh が plugin ホスト環境でのみ gh を無出力・非ゼロ終了させる障害（通算5回・書込み操作は fail-closed 停止・Root Case blocked ×4回）の診断手順として、bash 直叩きと bun CliRunner 直接実行の2段分離試験を既存運用文書へ明記する
- **根拠**: 5回目の発生で bash 直叩き gh（issue list・pr list・gh api search/issues・gh repo view）と bun spawnSync 直接実行・CliRunner 直接実行のすべてが成功した一方、agentdev_gh の副作用・読取操作（issue_list 2回・issue_create 4回）が全て exit 66・stderr 空で失敗。gh 認証（keyring）、AGENTDEV_GH_REPO 設定、gh バイナリ（2.102.0 単一）は正常確認済みで、plugin ホストプロセス固有の環境差が疑われた。2段分離試験により「runner 契約と実行環境の正常性」と「plugin ホスト環境差」を即座に切り分けられた実績がある
- **再発条件**: opencode plugin ホストプロセスの環境から gh を spawn した場合（再現条件未特定。opencode サーバー再起動で回復する可能性あり）
- **横展開可能性**: agentdev_gh を使う全 workflow（case-open/ready/run/close、issue、intake-from-github 等）に適用。Custom Tool 副作用操作が「非ゼロ終了・stdout/stderr 空」で失敗する一般の切り分け手順として他の Custom Tool 障害にも適用し得る

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: docs, enhancement
- **関連Issue**: なし（retired REQ-093、Case #3725、deferred pool 同現象エントリ〔2026-09-25移動・再発4回統合〕）
