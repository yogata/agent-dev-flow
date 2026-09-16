# artifact-contracts.md の REQ-082-004 類似誤アンカー（同種誤引用是正候補）

## 観測
`docs/designs/responsibilities/artifact-contracts.md:126` の「（REQ-082-004 準拠）」表記。REQ-082-004 実本文は HITL 境界系であり Command/Skill/Script 責任分界と無関係で、Issue #2883 と同種の誤アンカーの疑いがある。

## 今回扱わない理由
出所不明引用の網羅是正は Issue #2883 の scope-affecting impact candidate で本 Case 範囲外（追跡 Issue 管理）と明記済み。

## 影響
REQ-053-040 の新規範（正規成果物内 REQ 行引用の実本文整合）の将来適用対象候補。参照者が REQ-082-004 の実規定と無関係な文言を要件内容として誤読し得る。

## レビューで決めること
REQ-053-040 の新規範の適用対象（網羅是正候補リスト）への追加要否、修正手段（引用文言の書き換えまたは根拠付け替え）。

## 根拠（任意）
出所不明引用の防止規定 REQ-053-040（docs/requirements/REQ-053.md L56）。Issue #2883 / PR #2888 の Findings 記録（case-run DEL-2883-1）。
