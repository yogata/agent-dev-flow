# install-consumer-opencode.ps1 apply モードのジャンクション再作成ロジックが wrong target 検出へ拡張された点の文書化検討

## 発生源

- Issue: #1110
- PR: #1120 (merged, squash 4cb0049f)
- 発生日: 2026-06-24

## 観測

本 Issue (#1110) のスコープ外だが、実装過程で `install-consumer-opencode.ps1` apply モードのジャンクション再作成ロジックを「broken 未解決」から「wrong target（意図した target と異なる）」へ拡張した。これは LocalMode 導入を正しく処理するために必要な変更であり、normal mode でも自己修復性が向上する。既存の broken junction に対する挙動は後方互換（作用する）。

## 今回扱わない理由

PR #1120 では LocalMode 導入の付随変更として実装したが、この挙動拡張自体の SPEC/README 記載や、normal mode での自己修復性向上効果の明文化は本 Issue の完了条件（AG-001〜AG-004-c）に含まれていなかった。完了条件は「LocalMode 実装と検証」に限定されており、付随する挙動拡張の文書化は別途扱う方が自然であるため、本 PR では実装のみ残した。

## 影響

apply モードでリンク先が意図した target と異なる場合に自動再作成される挙動が SPEC `runtime-package-boundary.md` の link mode 技術詳細領域に明記されていない。将来の保守者が「broken 未解決」前提でコードを読むと、wrong target 分岐の存在理由が不明となる可能性がある。

## レビューで決めること

- `runtime-package-boundary.md` の link mode 技術詳細領域に wrong target 検出・再作成ロジックを追記するか
- normal mode での自己修復性向上効果を README または SPEC に明記するか
- 本件を個別 Issue として起こすか、次回の SPEC 整理系 Issue で扱うか

## 根拠

PR #1120 本文「Findings / Capture候補」セクション。case-close Step 10 にて intake 候補として回収。
