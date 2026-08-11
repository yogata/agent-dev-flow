# intake: inspect-docs 觀点レジストリの要件化（Phase 4 実施候補）

## 発生日

2026-08-11

## 発生元

- Issue: #2080 (OU-004 Phase 3 横断的 invariant 統合設計)
- PR: #2087 (feat(spec): REQ-028 Phase 3 IMPLEMENT 22 IR 横断的統合設計)
- Epic: #2076 (REQ-028: IR portfolio audit and existence-condition hardening)
- 取得元: PR #2087 本文「## Findings / Capture候補」>「### intake 候補」、設計書 `docs/specs/integrity/audits/cross-cutting-integration-design-20260811.md` §5.2、§7.1、§10.3、§11.2

## 問題事象

REQ-028-007（文脈解釈・意味判断検査を docs-check IR から除外し inspect/diagnostics へ移管）に基づき、Phase 3 は IR-019/022/026/036 の4件を「inspect-docs 觀点へ移管、IR catalog から除外候補」と判定した。しかし移管先である inspect-docs 觀点レジストリは現在暗黙的に保持されており、レジストリ化（実体ファイル、観点 schema、移管元 IR との対応表）が未実施である。Phase 4（OU-005）で IR catalog から除外する際、移管先レジストリが存在しなければ除外作业が完了しない。

## 影響

- Phase 4 (OU-005 #2081) IR catalog 除外作業の前提欠如: IR-019/022/026/036 の移管先実体が必要
- REQ-028-007 完全達成の阻害: docs-check IR から除外しても移管先が不明確では意味判断検査が宙に浮く
- 設計書 §11.2 SPEC確定候補「inspect-docs 觀点レジストリの要件化」の未確定

## 発生局面

実装（REQ-028 Phase 3 横断的統合設計での inspect-docs 移管候補特定）

## 検知方法

Phase 3 設計書 §5.2 で IR-019/022/026/036 の4件を inspect-docs 移管候補と判定、§7.1 (b) 区分で checkTerminology 等の移管先を inspect-docs 觀点と明示、§10.3 で「現状 inspect-docs は観点を暗黙的に保持し、レジストリ化されていない」と記録。PR #2087 本文「### intake 候補」に明記。

## 想定される対応方向

- **Phase 4 (OU-005 #2081) で inspect-docs 觀点レジストリを実体化**: 観点 schema（観点 ID、対象文書種別、検出方式、severity、移管元 IR）、配置先（`docs/specs/integrity/inspect-docs-perspective-registry.md` 等の候補）を確定
- **§11.2 SPEC確定候補の確定**: REQ-028-007 完了条件として inspect-docs 觀点レジストリの実体設計を要件化する候補を Phase 4 で確定
- **backlog-review で優先度判断**: Phase 4 スコープに含めるか、独立作業とするかを評価

## 関連

- Epic: #2076 (REQ-028 IR portfolio audit)
- Issue: #2080 (OU-004 Phase 3)
- PR: #2087 (squash merge commit b834c84a)
- 設計書: `docs/specs/integrity/audits/cross-cutting-integration-design-20260811.md` §5.2, §7.1, §10.3, §11.2
- 関連要件: REQ-028-007（意味判断検査の inspect/diagnostics 移管）
- 後続 Issue: #2081 (OU-005 Phase 4 IR 管理モデル再設計、DEC-013 apply)

## 出典引用

PR #2087 本文「## Findings / Capture候補」>「### intake 候補」より:

> - inspect-docs 觀点レジストリ（現在暗黙的）のレジストリ化を Phase 4 で実施すべき候補。IR-019/022/026/036 の移管先

設計書 §10.3「intake 候補」より:

> - Phase 4（OU-005）で IR catalog から除外する4件（IR-019, 022, 026, 036）の inspect-docs 觀点レジストリ（移管先）設計が必要。現状 inspect-docs は観点を暗黙的に保持し、レジストリ化されていない。レジストリ化候補として記録

## タグ

#intake #inspect-docs #perspective-registry #req-028 #req-028-007 #epic-2076 #ir-portfolio-audit #phase-delegation #phase-4
