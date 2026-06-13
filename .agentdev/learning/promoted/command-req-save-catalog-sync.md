# command: req-save catalog entry 連動確認

## 背景

REQ-0108-244 を req-save で APPEND した際、対応する `docs/specs/integrity-rule-catalog.md` の新規 catalog entry 追加を漏らした。integrity-rule-catalog は REQ-0108-150/151 時点の定義が基準であり、それ以降の APPEND 分は手動追記が必要だが、req-save command にはその連動更新を確認するステップが存在しない。これにより integrity 検査の対象漏れが発生し、ドキュメント整合性の盲点となっている。

## 問題

req-save command は REQ-0108 への APPEND 操作（Step 4）を実行するが、対応する `docs/specs/integrity-rule-catalog.md` の該当 catalog entry 有無を確認するステップを持たない。Step 7（docs 変更整合性検証）も REQ 番号の連続性と frontmatter 一致のみを検証し、SPEC 連動更新の検証を含まない。その結果、REQ-0108 へ新規 integrity ルールを APPEND しても catalog への反映が漏れる。

## 望ましい変更

req-save command に、REQ-0108 への APPEND 操作時に integrity-rule-catalog.md の該当 catalog entry 有無を確認するステップを追加する。確認結果に応じて:
- 新規ルールが catalog に未登録の場合 → catalog entry の追加をユーザーに促す（または追記を実施）
- 既存ルールの更新の場合 → catalog entry の関連 REQ 参照の更新を確認

## 対象範囲

### 対象

- `src/opencode/commands/agentdev/req-save.md`（確認ステップの追加）
- 関連する req-file-manager skill の判定ロジック（catalog entry 有無の確認方法を委譲する場合）

### 対象外

- integrity-rule-catalog.md の schema 変更（既存 schema のまま運用）
- docs-check / integrity 検査スクリプトの変更（catalog 追記漏れの自動検出は別課題）
- REQ-0108 以外の REQ への APPEND 操作（本対応は REQ-0108 特化）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `src/opencode/commands/agentdev/req-save.md` | Step 4（REQ ファイル操作）または Step 7（docs 変更整合性検証）付近に、REQ-0108 APPEND 時の integrity-rule-catalog.md entry 確認ステップを追加 |
| skill | `src/opencode/skills/agentdev-req-file-manager/SKILL.md` | catalog entry 有無の確認方法を委譲先ロジックとして追記（req-save からの委譲接続点） |

## 既存対策確認

- **確認結果**: 既存対策なし（gap あり）
- **該当ファイル**: なし（`src/opencode/commands/agentdev/req-save.md` に catalog / integrity-rule への言及なし）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: req-save は REQ-0108 への APPEND を処理するが、対応する catalog entry の有無を確認するステップが不在。手動運用に依存しており、APPEND 漏れの再発リスクが高い

## 制約

- **スコープ限定**: REQ-0108 APPEND 時のみの確認ステップ。他 REQ への汎用化は別件（横展開観点として記録済み）
- **手動判断残存**: catalog entry の「新規か既存か」の判別はエージェントの意味理解に依存するため、完全自動化ではなく確認を促すステップとする
- **既存Step構造の保持**: 新規Stepの挿入は既存Step番号の付け替えを最小化する位置（小Step または Step 7 拡張）に配置
- **G02 制約**: req-save のファイル編集スコープは `docs/requirements/**`, `docs/adr/**`, `docs/README.md`, `.sisyphus/drafts/**` のみ。catalog は `docs/specs/` 配下のため、catalog 追記自体はユーザーへの提示または別途操作が必要（req-save が直接編集しない）

## 受け入れ条件

- [ ] req-save command に REQ-0108 APPEND 時の integrity-rule-catalog.md entry 確認ステップが追加されている
- [ ] 確認ステップは catalog entry の有無をチェックし、未登録の場合にユーザーへの通知（または追記促進）を行う
- [ ] 確認ステップが req-save の既存 Guardrails（特に G02 ファイル編集スコープ）と矛盾しない
- [ ] 変更後の req-save.md が integrity 検査（REQ-0108）でエラーにならない
- [ ] 完了報告 template に catalog 確認結果の記載欄がある場合、template も更新する

## 元learning item / 根拠

- **要約**: REQ-0108 への APPEND 操作時に integrity-rule-catalog.md の catalog entry 追加が漏れる問題
- **根拠**: REQ-0108-244 APPEND 時に catalog entry 追加を漏らした実績。catalog は REQ-0108-150/151 時点が基準で以降の手動追記が必要だが、req-save に確認ステップが不在
- **再発条件**: req-save で REQ-0108 に新規要件を APPEND する際（手動運用のため高確率で再発）
- **横展開可能性**: 他の SPEC（artifact-contracts.md, integrity-contracts.md 等）でも REQ APPEND 時の連動 SPEC 更新が必要なものがある可能性あり

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement, command, req-save
- **関連Issue**: なし
