# install-consumer-opencode.ps1 の wrong target 検出・再作成ロジックの文書化

## 観測内容

`install-consumer-opencode.ps1` apply モードのジャンクション再作成ロジックを「broken 未解決」から「wrong target（意図した target と異なる）」へ拡張した。
これは LocalMode 導入を正しく処理するために必要な変更であり、normal mode でも自己修復性が向上する。
既存の broken junction に対する挙動は後方互換（作用する）。

## 影響

apply モードでリンク先が意図した target と異なる場合に自動再作成される挙動が SPEC `runtime-package-boundary.md` の link mode 技術詳細領域に明記されていない。
将来の保守者が「broken 未解決」前提でコードを読むと、wrong target 分岐の存在理由が不明となる可能性がある。

## 課題

wrong target 検出・再作成ロジックと normal mode の自己修復性向上効果を SPEC/README に明文化する。

## 既存要件との関連

- Issue #1110、PR #1120（merged, squash 4cb0049f）
- LocalMode 導入（ADR-0131）の付随変更
- 対象 SPEC: `docs/specs/runtime-package-boundary.md`（link mode 技術詳細領域）

## 対応方針の方向性

- `runtime-package-boundary.md` の link mode 技術詳細領域に wrong target 検出・再作成ロジックを追記する
- normal mode での自己修復性向上効果を README または SPEC に明記する
- 本件を個別 Issue として起こすか、次回の SPEC 整理系 Issue で扱うか
