# agentdev_gh runner↔spec 内部契約の両版同時反映原則と before payload 契約の Design 化

## 背景

Epic #2686（agentdev_gh 操作契約刷新）の Wave 1 実装で、issue_update / issue_reopen の追跡軸保持 VERIFY（role / kind / trackingState 完全一致・要求通常ラベル包含）の照合基準に「実行前状態」が必要であることが判明した。VERIFY は副作用後の読み戻しで判定する構造上、実行前状態を自己保持できないため、runner 応答 payload へ before を運ばせる接合を採用した。この契約拡張を GitHub 版のみへ反映すると、未対応側（Local 版）の VERIFY が一律 verification-incomplete になる。Wave 1 では Local 版に最低限の型整合のみ適用し、Wave 2（Issue #2688）で実装完了した。

## 問題

- runner 応答 payload の before 構造（state、labels、role、kind、trackingState、closeReason の正規化済み導出値を含めること、GhRunnerReply 成功側の必須化）が Design に未保存である（PR #2691 本文の Design 確定候補として記録されるに留まり、正規所有文書が存在しない）
- runner↔spec 内部契約を拡張する際、GitHub 版と Local 版へ同時反映する原則が文書化されていない

## 望ましい変更

- runner 応答 payload の before 契約（対象操作、含める導出値、正規化規則）を custom-tool-contracts Design の操作契約の構成要素へ記載する
- 内部契約の拡張は GitHub 版と Local 版へ同時に反映する原則（Local 版実装完了までは最低限の型整合を維持し、VERIFY は fail-closed で verification-incomplete になることを許容する）を同じ Design に記載する

## 対象範囲

### 対象

- agentdev_gh の runner↔spec 内部契約（GhRunnerReply 構造）
- issue_update / issue_reopen の追跡軸保持 VERIFY の照合基準

### 対象外

- 追跡軸の定義そのもの（agentdev-issue-tracking Design の所有）
- before payload の実装変更（実装済み。 af697092〜ffaf3603 で両版反映済み）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/responsibilities/custom-tool-contracts.md（操作契約の構成要素節） | before payload 契約と両版同時反映原則の記載（Epic #2686 対応記録コメントの design-save 再実行提案4件の1つと同一内容） |

## 既存対策確認

- **確認結果**: 既存対策なし（Design 未保存）
- **該当ファイル**: なし（実装は src/opencode/tools/agentdev-gh/engine.ts・runner-cli.ts と src/opencode-local/agentdev-gh/runner-local.ts に存在するが、契約の正規所有文書が不在）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 実装が先行し Design が未追随。design-save 再実行提案（パターン b）として Epic #2686 対応記録コメントに記録済みだが、正規経路（backlog-review → RU → req-define → design-save）での確定が望ましい

## 制約

- Epic #2686 の対応記録コメントに design-save 再実行提案として記録済みの同一内容であり、backlog-review で重複検出された場合は統合して扱う
- before 導出値の詳細仕様（正規化規則）は実装（contracts.ts・tracking-schema.ts）と突合して確定する

## 受け入れ条件

- [ ] before payload 契約（対象操作・導出値・正規化）が Design に記載される
- [ ] 内部契約拡張の両版同時反映原則が Design に記載される

## 元learning item / 根拠

- **要約**: 追跡軸保持 VERIFY が実行前状態を必要とするため runner 応答へ before を運ばせる接合を採用した。契約拡張の片側反映は未対応側 VERIFY を一律 verification-incomplete にする
- **根拠**: PR #2691（Wave 1 実装・Design 確定候補として記録）、Issue #2688（Wave 2 Local 版実装で両版反映完了）
- **再発条件**: runner↔spec 内部契約を拡張する際に片側のみへ反映する場合
- **横展開可能性**: 実行前状態を照合基準に使う不変条件保護系 VERIFY を追加する全ケース

## 推奨Issue分類

- **分類**: docs_chore（Design への契約記載）
- **推奨ラベル**: documentation
- **関連Issue**: Epic #2686（対応記録コメントの design-save 再実行提案と同一内容）
