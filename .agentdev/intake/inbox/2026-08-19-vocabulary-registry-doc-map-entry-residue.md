# 語彙レジストリに廃止済み agentdev-doc-map の語彙項目が残存

## 観測

.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md の L107 に `agentdev-doc-map | DOC-MAP 管理` の語彙項目が残存している。同スキルは REQ-013-002/003 で廃止済み（実体不存在）である。

## 今回扱わない理由

Issue #2250（OU-0040）の対象範囲は doc-diagnostics SPEC であり、repo-agentdev-integrity の語彙レジストリは本 Issue の対象範囲外。

## 影響

廃止済みスキルを示す語彙項目がレジストリ上に現役で保持され、語彙対照表の保守判断（保持・削除）が未確定のまま残る。

## レビューで決めること

- 廃止済みスキルの語彙エントリを保持するか削除するか（語彙レジストリ管理側での判断候補）

## 根拠

- PR 2285 本文「Findings / Capture候補」セクション intake 2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2285）
