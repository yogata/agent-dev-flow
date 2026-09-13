# docs-check expanded-readme-sync は root README への全配布コマンド名言及を要求するため README 簡素化の前提制約になる

## 概要

docs-check の expanded-readme-sync は root README への全配布コマンド名の言及（substring 一致）を機械要求する。PR 2792 が追加した README 主要導線内の「配布コマンドの索引」リストはこの機械契約と REQ-057-016 を両立する接合点であり、後続で README 構成を変更する Case はこの制約を前提にする。

## 内容

- expanded-readme-sync は root README への全配布コマンド名の言及（substring 一致）を機械要求する
- README 主要導線内の「配布コマンドの索引」節は、機械契約と REQ-057-016（ルート README は索引と参照リンクで足りる）を両立する接合点。状態→コマンド対応を持たない純粋な名前索引であり、入口表の復活を意味しない
- README をさらに簡素化する後続 Case では、「配布コマンドの索引」リストの維持または checker 側要件の見直しが前提になる

## 根拠

- 観測元: PR 2792（case 2791 / issue 2792、`## Findings / Capture候補` intake セクション および `## Design確定候補`）、case-close（2026-09-13）で回収
- 元テキスト: 「docs-check の expanded-readme-sync は root README への全配布コマンド名の言及（substring 一致）を機械要求する。README をさらに簡素化する後続 Case では、本 PR が追加した「配布コマンドの索引」リストの維持または checker 側要件の見直しが前提になる」
