# AUTOGEN 計測日導出と GitHub squash merge の committer date 置換による drift の取り扱い

## 背景

境界 case-close（Case #3011 第8段・子 Issue 実装 PR #3018/#3021/#3020/#3019 の squash merge 後 fan-in 検査）で check_autogen_freshness が AUTOGEN 計測日 drift（req-health-metrics ブロック）を検出した。AUTOGEN 計測日の導出（generate_indexes.ts deriveMeasureDateFromLastCommit）は git log -1 --format=%cI（committer date 基準）で対象ドキュメント群の最終コミット日付を取るが、GitHub 側で実行した squash merge commit の committer date は merge 実行時刻（サーバー時刻）に置き換わるため、merge 前に記録していた計測日と導出期待値の日付が反転し、ドキュメント群に実変更がなくても鮮度違反となった。AUTOGEN drift クラスとしては date rollover 起因（deferred 2026-09-01）・Phase 0 起因（deferred 2026-08-18）に続く第3の機構である。

## 問題

計測日導出の %cI（committer date）と、GitHub squash merge が merge commit に付与する committer date（merge 実行時刻）の組み合わせは構造的に drift を生む。ローカル検証時点の committer date と GitHub merge 時の committer date が日付境界をまたいで乖離すると、AUTOGEN ブロック記録の計測日が導出値と一致しなくなる。現行 Design（autogen-freshness-gate・index-auto-generation）は計測日導出基準（committer date であること、author date との区別）と squash merge 経由の drift 構造を明示しておらず、発生のたびに原因調査からやり直す。

## 望ましい変更

1. autogen-freshness-gate Design または index-auto-generation Design に、計測日導出基準（%cI committer date・author date との区別）と drift 発生機構（date rollover・Phase 0 起因・GitHub squash merge の committer date 置換の3機構）を明示する
2. squash merge を伴う境界 close の fan-in 検査では check_autogen_freshness を必ず実行し、drift 検出時は計測日再生成（generate_indexes）で解消してから green 判定する運用を設計書に反映する
3. 計測日導出を author date 基準へ切り替えるか merge commit を除外するかは恒久検討課題として記録する（現行は merge 後の計測日再生成で運用解消）

## 対象範囲

### 対象

- docs/designs/integrity/autogen-freshness-gate.md（鮮度 gate 仕様）
- docs/designs/integrity/index-auto-generation.md（計測日導出の生成側仕様）
- case-close の fan-in 検査で check_autogen_freshness を実行する手順（境界 close 時）

### 対象外

- generate_indexes.ts・check_autogen_freshness.ts の実装変更（導出基準切替は恒久検討課題として記録するのみ）
- AUTOGEN gate の停止条件・exit 契約（不変）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/integrity/autogen-freshness-gate.md | 計測日導出基準（committer date）と drift 3 機構（date rollover・Phase 0・squash merge committer date 置換）の明示。squash merge 境界 close での鮮度検査必須運用の追記候補 |
| Design | docs/designs/integrity/index-auto-generation.md | deriveMeasureDateFromLastCommit の導出基準明示と、merge commit 扱いの恒久検討課題記録の候補 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-close/references/（fan-in・docs 検査手順） | squash merge 後 fan-in 検査での check_autogen_freshness 実行と drift 時の計測日再生成手順の追記候補 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: docs/designs/integrity/autogen-freshness-gate.md、docs/designs/integrity/index-auto-generation.md、.opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts・generate_indexes.ts（v4 で稼働中）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: gate・再生成の機構は稼働中だが、計測日導出基準（committer date）と GitHub squash merge による committer date 置換の組み合わせが未文書。既知の drift 2 機構（date rollover・Phase 0）も設計書に集約されておらず、発生のたびに原因調査が繰り返される

## 制約

- AUTOGEN 鮮度 gate の仕様（検出・停止条件）は不変。運用知見と設計書の明示化が主体
- 計測日再生成（generate_indexes 実行 commit）は case-run 側または fan-in 時の正規経路で実施する（case-close 自身が索引を直接編集しない契約は維持）
- committer date → author date への導出基準切替は後方互換（既存 AUTOGEN ブロックの再生成を伴う）ため、req-define での影響分析を経る

## 受け入れ条件

- [ ] 計測日導出基準（%cI committer date・author date との区別）が Design に明示されていること
- [ ] drift 発生機構（date rollover・Phase 0 起因・squash merge の committer date 置換）が Design に列挙されていること
- [ ] squash merge を伴う境界 close の fan-in 検査で check_autogen_freshness を実行し、drift 時は計測日再生成で解消してから green 判定する運用が参照可能であること

## 元learning item / 根拠

- **要約**: AUTOGEN 計測日導出は committer date（%cI）基準であり、GitHub squash merge commit の committer date は merge 実行時刻（サーバー時刻）に置き換わるため、merge 前後で日付境界をまたぐと実変更なしの鮮度違反が発生する。計測日再生成で解消する
- **根拠**: Case #3011 第8段（2026-09-20、Epic #3017 Wave 1 fan-in green 判定時）。Definition PR #3012 の 5 REQ 目的節接続が docs/requirements/** に触れた squash merge 21434202 後に check_autogen_freshness が req-health-metrics ブロックの drift を検出 → AUTOGEN 計測日再生成 commit 1befae99 で解消、autogen violations 0・fan-in green 回復。関連既知事象: deferred 2026-09-01（date rollover）、deferred 2026-08-18（Phase 0 起因の dry-run ゲート差戻し）
- **再発条件**: AUTOGEN 計測日ブロックを持つ対象ドキュメント群への最終コミットが GitHub squash merge となり、その committer date が記録済み計測日と日付境界をまたいで反転する場合
- **横展開可能性**: GitHub 側 squash merge を経るワークフロー（case-close 境界）で構造的に発生し得る。%cI と author date を混同する計測系全般にも適用

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, integrity
- **関連Issue**: Case #3011、Epic #3017、fan-in fix 1befae99
