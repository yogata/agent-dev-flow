# REQ-046-004 phantom 参照（DEC-022.md）の baseline 収録要否判断

## 観測

check_integrity 実行（worktree root 指定）で REQ-046-004 phantom 参照（docs/decisions/DEC-022.md:63）が baseline 未収録の NG として検出された。Epic #2497 Wave 1（Issue #2498）の変更外ファイルであり、当該 Case では対応していない。

## 今回扱わない理由

Issue #2498 の変更対象外（docs/decisions/ 配下は参照正本かつ変更対象外）。IR-067 baseline への収録要否は採用判断事項であり、case-close の capture 責務は回収・保存まで。

## 影響

check_integrity 実行時に baseline 未収録 NG が 1件残留する（既存分であり、変更起因の増分ではない）。

## レビューで決めること

- REQ-046-004 phantom 参照（docs/decisions/DEC-022.md:63）を IR-067 baseline へ収録するか、参照側の是正対象とするか

## 根拠

- PR #2501 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2501 ）
