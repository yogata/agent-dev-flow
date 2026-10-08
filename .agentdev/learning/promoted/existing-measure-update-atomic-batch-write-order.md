# 複数ファイル一括機械処理の原子書込順序規律を deferred 原子的移動プロシージャへ補足する

## 背景

learning-promote STEP-6 の deferred 移動・prune を node スクリプトで実行した際、prune 判定の見出しマッチが改行揺れで誤判定し検証 throw した。throw 時点で deferred.md への追記は未着手だったが、同スクリプト内の先行ステップで inbox.md は既にヘッダーのみへクリア済みだったため、38 エントリ中 30 エントリが inbox から消え deferred にも存在しない中間状態が発生した（git 復元で回復、commit f549e506）。

## 問題

deferred-atomic-move-procedure.md は「Step 2 失敗時は inbox.md を変更せず」「Step 3 は Step 2 成功時のみ」という書込順序規律を持つが、機械実行時の「全ファイル内容をメモリ上で構築し全検証（見出し数・処分判定数・文字化け・BOM/CRLF）を成功させてから一括書込する」実装構成規律を持たない。段階的書込構成のスクリプトでは、検証 throw がどのタイミングでも「元の状態」または「完了状態」の二択にならない。

## 望ましい変更

agentdev-learning-pipeline の deferred-atomic-move-procedure.md へ、機械実行時の実装規律として「メモリで全構築→全検証→一括書込（検証失敗時は何も書込まない）」を明記する。既存 Step 1-3（追記→検証→クリア）構成との関係（構成の改訂か、機械実行時の適用規律としての併記か）を明示する。

## 対象範囲

### 対象
- src/common/skills/agentdev-learning-pipeline/references/deferred-atomic-move-procedure.md

### 対象外
- 同プロシージャを利用する各 workflow 側の手順書（横断的な一括機械変更 write 規律は別案件候補）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-learning-pipeline/references/deferred-atomic-move-procedure.md | 機械実行時の「メモリ完結→全検証→一括原子書込」実装規律の明記 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: deferred-atomic-move-procedure.md（Step 順序規律）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 段階的書込を許す構成で検証 throw 時の中間状態が残る。「メモリ」「一括」の記載は grep 0 件（実測）

## 制約

- プロシージャの契約変更（Step 構成の廃止等）ではなく機械実行時規律の追記を基本とする（既存 Step 順序規律との整合は変更時に確認）

## 受け入れ条件

- [ ] deferred-atomic-move-procedure.md に機械実行時の一括原子書込規律が記載される
- [ ] 既存 Step 1-3 構成と新規律の関係が明示される

## 元learning item / 根拠

- **要約**: 複数ファイル一括機械処理は全検証をメモリ完結後に一括原子書込する（部分書込後の検証 throw で中間状態が残存、30 エントリ消失実績）
- **根拠**: backlog-auto 2026-10-06 実行、commit f549e506（回復と最終成功を同一 commit に含む）。git show HEAD による復元とスクリプト再構成の実績
- **再発条件**: 複数ファイルへの分割書込を伴う機械処理で、検証ステップが書込ステップの間に挟まれている構成
- **横展開可能性**: 移動・prune・変換・リネーム一括適用等の機械処理一般

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
