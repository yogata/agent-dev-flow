# stage 5 復旧時の保存資材

2026-11-16 に統括が読み取りで確認した。削除、Issue の再作成、PR の閉鎖、要件縮小は実施していない。構成上限と traceability gate の再検証が成立するまで実装の再開・マージを保留する。opencode run は使用しない。

## 既存成果

- Root Case #4071 は OPEN。本文は22子の Epic を ready としているが、上限10件の例外について利用者合意を根拠にしている記録は復旧の承認根拠として使用しない。
- Definition PR #4072 は MERGED。merge commit は 574bdf9a58540c82fea373ff46adcab4fc4e86ed。巻き戻さない。
- 子 Issue #4073〜#4094 は22件すべて OPEN。
- 実装 PR #4095（#4074）、#4096（#4077）、#4097（#4075）、#4098（#4080）、#4099（#4078）は OPEN、base は main、Draft ではない。
- `.worktrees/<Issue番号>-refactor` は #4073〜#4094 の22個すべて存在する。各 worktree の git status --short は空だった。依存整備物等の ignored 資材の所有・内容は未調査であり、削除しない。
- main HEAD は 1f7faa35bcd2ea4e15aa243eb2711e65b2d850e5。main の変更は統括所有の set-state.json の進捗記録のみだった。
- #4081 worktree には f5d1bbe05 のコミットがある。対応する OPEN PR は今回の一覧にはない。未消失成果として保持する。

## 義務と実在 Issue の照合

以下は子 Issue 本文の RU/AG/TS 表記から得た対応である。元 draft の commit 1f1b6222b の operation_units 節を照合し、Root の OU→Issue 対応は正しいと確認した。統括が作成した set-state の RU→OU 対応は連番による誤写だったため修正した。RU-0293 は OU-002、RU-0282〜0292 は OU-003〜013、残りは当初の対応と一致する。RU と必須要求・受け入れ義務の正本スナップショットは保持する。

| RU | AG / TS | Issue | 実装PR | worktree HEAD |
|---|---|---|---|---|
| RU-0281 | 001 | #4073 | 未確認 | 1f7faa35b |
| RU-0282 | 002 | #4075 | #4097 | 8691d2b74 |
| RU-0283 | 003 | #4076 | 未確認 | 1f7faa35b |
| RU-0284 | 004 | #4077 | #4096 | b3526ec1a |
| RU-0285 | 005 | #4078 | #4099 | 59aa6ee5e |
| RU-0286 | 006 | #4079 | 未確認 | 1f7faa35b |
| RU-0287 | 007 | #4080 | #4098 | f339eb2f3 |
| RU-0288 | 008 | #4081 | 未確認 | f5d1bbe05 |
| RU-0289 | 009 | #4082 | 未確認 | 1f7faa35b |
| RU-0290 | 010 | #4083 | 未確認 | 1f7faa35b |
| RU-0291 | 011 | #4084 | 未確認 | 1f7faa35b |
| RU-0292 | 012 | #4085 | 未確認 | 1f7faa35b |
| RU-0293 | 013 | #4074 | #4095 | d3b596298 |
| RU-0294 | 014 | #4086 | 未確認 | 1f7faa35b |
| RU-0295 | 015 | #4087 | 未確認 | 1f7faa35b |
| RU-0296 | 016 | #4088 | 未確認 | 1f7faa35b |
| RU-0297 | 017 | #4089 | 未確認 | 1f7faa35b |
| RU-0298 | 018 | #4090 | 未確認 | 1f7faa35b |
| RU-0299 | 019 | #4091 | 未確認 | 1f7faa35b |
| RU-0300 | 020 | #4092 | 未確認 | 1f7faa35b |
| RU-0301 | 021 | #4093 | 未確認 | 1f7faa35b |
| RU-0302 | 022 | #4094 | 未確認 | 1f7faa35b |

既存の必須依存は #4076 が #4075 の区分け結果を必要とする関係である。Root の Wave 表と両子本文で一致する。この関係を維持する。近接実行・共有パスの競合は必須依存と区別し、構成復旧後の共有実行枠で扱う。

## traceability の受入記録

#4071 の 2026-11-15T14:53:35Z コメントには次の記録がある。これは当時の説明の引用であり、統括による検査合格の認定ではない。

> definition-traceability-gate.ts（case-open scripts/lib 共有）の CHECK_KINDS が traceability checker の12種目 derived-declaration-conflicts（#4047 追加）を認識せず、機械消費（consumeDefinitionTraceability）が構造エラーになる版本ズレあり。raw checker 出力の実質判定（missing-design pass・policy-invalid pass・他全 pass）で確認済み（fail-open 代替）。機械消費側の追随は要整備

元の失敗出力・再現コマンド・実装原因・修復担当は別途調査中。raw 出力の説明によって構造エラーを免除しない。Root の REQ-010-085 implementation/verification 欠落を非 blocking とする記述も、正規 policy と実装契約に照合するまで受入根拠にしない。

## 復旧方針の確定 (2026-11-16)

- 復旧計画の委譲セッション (bg_91d96323) の記録は runtime DB から削除され、最終計画文は復元不能だった。復旧方針は統括が契約読解と 2 件の独立調査結果 (traceability 証拠・構成契約調査) から独自に確定した。方針: (1) traceability consumer の 11↔12 種目版ずれ修復は追跡 Issue を所有者として case-open/case-ready 共有 lib に適用し、case-ready STEP-1 受入機械検査を再実行する。(2) 構成は連結成分 (必須依存 #4076→#4075 のみ) から 20 Standard + 2子 Epic (#4075・#4076) へ再確定する。上限超過の例外記録は承認根拠から外し、正規の構成検証を通過させる。
- main と origin/main の分岐は 2026-11-16 時点で解消済み (origin/main == 1f7faa35b・差分 0/0)。

## 取得経路

- git worktree list --porcelain と22 worktree の git status --short / git log -1。
- gh issue view 4071、gh issue list（タイトル Epic #4071、state all）、gh pr list（state open）、gh pr view 4072。すべて読み取り。
- agentdev_gh issue_read は gh exit 66 / stderr 空の起動失敗。Tool の canContinue に従って許可された読み取り CLI を使用した。書き込みは未実行。
