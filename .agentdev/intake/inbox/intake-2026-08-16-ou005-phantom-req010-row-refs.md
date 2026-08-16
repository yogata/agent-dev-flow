# Intake Item: ファントム行参照（>062 の旧 REQ-010-NNN）の残置と所有権確定

## 発生源

- PR: #2176 (Issue #2161 / OU-005, Epic #2156 Wave 2)
- 発生 phase: case-close capture 回収（PR 本文 Findings docs-integrity #2）
- capture 分類: intake（docs 整合性是正候補）

## 問題

現行 REQ-010（最大 062）に存在したことのない旧 REQ-010-NNN 番号（ファントム行参照）が docs/** に残存している。対象は 063〜064、070〜088、089〜099、108〜129、136〜151、225、236〜239、244〜245、250〜251、255〜262（263〜265、269、279〜282、285 を含む）。これらは TS-007 の対象範囲（旧 REQ-010-013〜058、061）外のため、Epic #2156（REQ-010 分割）では Wave 1・Wave 2 とも残置方針を維持した。

代表例: docs/specs/quality/spec-health-metrics.md:268 の REQ-010-285。Wave 1 が req-health-metrics.md 側の同種引用（284）を REQ-036-009 へ再配線した一方で残置されたもので、同ファイル内で取り扱いが不統一になっている。

## 推奨対応

inspect-docs / inspect-promote 経由でファントム行参照の所有権を確定する（REQ-036〜039 への再配線、監査記録としての履歴文脈注記、または引用削除のいずれか）。PR #2176 本文の推奨（「夫々の所有権確定は別途 inspect 経由を推奨」）に従う。

## 関連

- Issue: #2161 (CLOSED), Epic: #2156 (CLOSED)
- PR: #2176 (Findings / Capture候補 セクション docs-integrity #2)
- 関連 intake: intake-2026-08-16-ou006-generate-indexes-docmap-deadfn-exit.md（AUTOGEN 再生成ランナー破損。本 item の再配線作業は generate_indexes 修復後に AUTOGEN 再生成を要する場合がある）
