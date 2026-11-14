# 廃止 skill agentdev-command-creator の retired 語彙検出（IR-066 obsolete-vocabulary-map）追加候補

## 観測事実

- OU-005（Issue #4058、PR #4063）で agentdev-command-creator が廃止された。現行層の参照残存は rg で 0件を確認済みのため、本 PR では retired 語彙登録を実施していない。
- obsolete-vocabulary-map.yaml への IR-066 廃止語彙追加は、check_integrity.ts の IR066_VOCAB_PATTERNS 定数との同一 PR 更新を同期条件（yaml ヘッダー）とする様式である。語彙追加は integrity 検査対象の拡張を伴うため、OU-005 の委譲境界（integrity 検査の意味変更禁止・参照置換のみ）の外側だった。
- PR #4053 の閉鎖後も監督側ブランチ fix/integrity-rule-metadata-c13-c15 由来の履歴参照が doc/reports 等に残る可能性は低いが、旧パス参照の再発を機械検出したい場合の投入判断は未決のままである。

## 具体的な修正対象

- 旧パス参照の再発を機械検出したい場合、obsolete-vocabulary-map.yaml への agentdev-command-creator 語彙追加と check_integrity.ts の IR066_VOCAB_PATTERNS 定数更新を同一 PR で実施する。要否判断（検出コストと再発リスクの比較）を別作業単位で行う。

## 関連

- Epic #4054・Issue #4058・PR #4063 本文 Findings（判断の記録 b）
- IR-066（obsolete-vocabulary）・.opencode/skills/repo-agentdev-integrity/data/obsolete-vocabulary-map.yaml・check_integrity.ts IR066_VOCAB_PATTERNS
