---
title: "IR-072: req-updated-freshness"
status: accepted
created: 2026-09-29
updated: 2026-10-08
---

# IR-072: req-updated-freshness

<!-- ADF-COVERS(design): REQ-010-068 -->

| Field | Value |
|-------|-------|
| rule_id | IR-072 |
| description | 現行 REQ ファイル（`docs/requirements/REQ-NNN.md`）の frontmatter `updated` と、当該ファイルの最終内容変更 commit の日付（author date、`%as`）を突合する。REQ 本文を変更する際は frontmatter `updated` を変更日へ進行させる規約（`docs/designs/foundations/patterns.md`「REQ frontmatter 規約」に明文化済み）の機械検査である。updated 進行忘れによる文書鮮度 metadata の陳腐化を検出する（REQ-010-068 準拠の新規検査クラス、Case #3233・RD-013） |
| severity | strict |
| category | document-drift |
| detection_method | `check_integrity.ts`（`checkReqUpdatedFreshness`）による突合。現行 3 桁帯 REQ ファイル（README.md、retired/、4 桁旧番号帯は対象外）の frontmatter `updated` を解析し、`git log` で導出した最終内容変更 commit の author date と比較する。frontmatter（`updated` 等 metadata）のみの変更 commit は内容変更ではない（TS-015 pass_criteria）ため、コミット履歴を新しい順に走査し、変更 hunk（`--unified=0`）の old 側行範囲が変更前バージョンの frontmatter 終了行以内に収まる commit（metadata のみの変更 commit）を内容変更から除外して、最終内容変更 commit の author date を採用する。root commit・frontmatter 不在・diff 取得失敗は保守的に内容変更扱いとする。日付の導出基準を author date とするのは、squash merge による committer date 置換（AUTOGEN 鮮度 gate の既知 drift 機構）の影響を受けないためである。git 履歴が取得不能な環境（archive 展開等の git 履歴不在ツリー、`--root` 指定先が git 作業ツリーでない場合）では info で skip する（検査対象が原理的に不在であり、既知 NG の info スキップ〔IR-069 の対象不在時スキップ〕と同一扱い）。untracked（履歴不在）ファイルは突合対象外とする。updated 欠落・非日付形式は required-fields / IR-002 相当の別ルール対象で本ルールでは計上しない。Design ファイル（docs/designs/**/*.md）の frontmatter updated も同一基準（最終内容変更 commit の author date との突合、frontmatter のみの変更 commit の除外、author date 基準、git 履歴不在時の info skip、untracked 対象外）で検査する。Design frontmatter 必須キー（IR-070）との役割分担は維持する |
| affected_artifacts | [docs/requirements/REQ-*.md, docs/designs/**/*.md] |
| related_req | [REQ-010-068] |
| related_design | [../integrity-rule-catalog.md, ../../foundations/patterns.md, ../checker-execution-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。複数日に跨ぐ PR を squash merge した場合、merge 後の author date は最初の commit 日になるため、後続 commit 日に updated を進行させた REQ で誤検出し得る。このうち REQ frontmatter updated の機械的是正（metadata のみの変更 commit）由来の乖離は、frontmatter のみ変更 commit を内容変更から除外する判定で検出側に吸収済みである（TS-015 pass_criteria 忠実化）。updated 進行を本文変更と同一 commit に含める形の乖離は検出側で区別できないため残存する（誤検出時は updated を merge 後 author date へ再進行させて解消する。GitHub squash merge の author 保持仕様に由来する構造的限界） |
| regression_test | `check_integrity.test.ts` describe "IR-072 req-updated-freshness (REQ-010-068)"。正常例（updated = 最終内容変更 commit 日）・違反例（updated 進行忘れで不一致）・境界例（untracked 履歴不在は突合対象外）・許容例（README.md / retired/ / 4 桁旧番号帯は対象外、updated 欠落は別ルール計上）・過去再現例（REQ 本文修正 commit で updated 進行忘れした実在パターン）・frontmatter のみ変更例（metadata のみ変更 commit は最終内容変更から除外され、除外後の真の内容変更 commit 日との乖離は検出継続）の fixture（git init + 固定日付 commit で履歴を構成）。Design ファイル対象の fixture（正常例・違反例・境界例〔frontmatter のみ変更〕・許容例・再現例）を追加 |
| finding_route | intake |
| triage_action | frontmatter `updated` を最終内容変更 commit 日（author date）へ機械的に進行させる（metadata のみの変更で意味変更なし。REQ 本文行を変更しないため AUTOGEN 対象 block の再生成は不要） |
| last_verified | 2026-09-29 |

## 検査項目

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | 現行 REQ ファイルの frontmatter `updated`（日付部分）が最終内容変更 commit（frontmatter のみの変更 commit を除外）の author date と一致すること | strict fail |
| 2 | git 履歴取得不能環境では info スキップとすること（fail にしない） | 設計要件 |
| 3 | updated 欠落・非日付形式は本ルールで計上せず別ルール（required-fields / IR-002 相当）に委ねること | 設計要件 |
| 4 | 設計PR の merge 直前（case-ready 受入検査）には branch HEAD（origin/main 取り込み済み）に対して本検査を再実行すること（REQ-061-046）。再実測対象は変更を伴う docs ファイル群とする | 設計要件 |
| 5 | 本検査を含む check_integrity は commit 済み HEAD に対して実行すること。未 commit 変更を含む working tree への実行は、git log 上の最終内容変更 commit に未 commit 変更が反映されず構造的に不一致となるため、検査結果を採用しない（prepare_definition_pr の工程順序: check_integrity は stage-and-commit の後に実行） | 設計要件 |

## exemption（許容条件）

| 対象 | 理由 |
|------|------|
| `docs/requirements/README.md` | frontmatter updated を持たない索引文書 |
| `docs/requirements/retired/REQ-*.md` | 廃止済み REQ は履歴記録であり現行鮮度規約の対象外 |
| 4 桁旧番号帯（`REQ-NNNN.md`） | 旧番号帯は現行採番規約の対象外（IR-069 と同一の帯限定） |
| untracked（git 履歴不在）ファイル | 突合対象となる commit 日付が存在しない |
| git 履歴不在ツリー（archive 展開等） | 検査自体が成立しないため info スキップ |
| updated 欠落・非日付形式 | required-fields / IR-002 相当の別ルールが計上する（二重計上しない） |

## baseline 運用

本ルールは strict で即時 fail とする（baseline 不要）。導入時点（REQ-010-068 準拠の新規検査クラス採用、Case #3233・RD-013・CR-003）で既知の不一致は全現行 REQ の frontmatter updated 機械的是正（metadata のみの変更・意味変更なし）を同一 Case で実施して解消するため、fix → 検査導入の順序（IR-071 の前例、REQ-029 再アンカー〔CR-003〕と同一）により導入直後の自己適用で既存違反は発生しない設計である。

## See Also

- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [../../foundations/patterns.md](../../foundations/patterns.md)（updated 進行規約の原本）
- [IR-069-req-number-gap-recorded.md](IR-069-req-number-gap-recorded.md)（対象不在時 info スキップの前例）
