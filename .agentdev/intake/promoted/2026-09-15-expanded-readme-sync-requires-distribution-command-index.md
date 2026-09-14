# expanded-readme-sync が全配布コマンド名言及を要求する制約と README 簡素化の前提

## 観測内容

docs-check の expanded-readme-sync は root README への全配布コマンド名の言及（substring 一致）を機械要求する。PR 2792 が追加した README 主要導線内の「配布コマンドの索引」リストはこの機械契約と REQ-057-016 を両立する接合点であり、後続で README 構成を変更する Case はこの制約を前提にする必要がある。

## 影響

- README をさらに簡素化する後続 Case は、索引リストの維持または checker 側要件の見直しのいずれかを対応前提とする

## 課題（対応候補と判断材料）

- 「配布コマンドの索引」節は状態→コマンド対応を持たない純粋な名前索引であり、入口表の復活を意味しない、という位置づけの知識化
- README 簡素化 Case 実施時の判断材料: 索引リスト維持（機械契約遵守）または checker 側要件見直し

## 既存要件との関連

- REQ-057-016（ルート README は索引と参照リンクで足りる）: 接合点のもう一方の契約
- docs-check expanded-readme-sync: 機械要求の正規所有者

## 根拠

- 観測元: PR 2792（case 2791 / issue 2792）`## Findings / Capture候補` intake セクションおよび `## Design確定候補`、case-close（2026-09-13）で回収
- 処分経緯: intake-promote（2026-09-15）で採用を確定（ユーザー承認。制約記録・知識統合系 item として backlog-review へ渡す）
