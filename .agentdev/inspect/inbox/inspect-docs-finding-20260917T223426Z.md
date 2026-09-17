# inspect-docs finding 20260917T223426Z（defer 残置分）

> 本ファイルは inspect-promote（2026-09-18 実施、/agentdev/backlog-auto stage 2 inspect 系統経由、--auto なし）の分類確定後、defer となった検出事項のみを残置する。promote 採用分（QG-4-1、IDX-1 の2件）は `.agentdev/inspect/promoted/inspect-docs-promoted-20260917T223426Z.md` へ保存済み。reject 0件。
>
> 対論型レビュー（adversarial-review、2系統独立 stream、challenge → counter-challenge → convergence → convergence audit）を実施し、全検出事項が自律確定（HITL 不要、unresolved 0件）で確定した。
>
> - QG-4-1: promote 確定（機械的証拠完全一致、判定表8要件適合）
> - IDX-1: promote 確定（同一事象 intake item との統合前提。統合は backlog-review 責務）
> - REQ57-1: defer 継続（MOVE 採否は意味判断。**既存 defer F-04（20260907、REQ-057 RETIRE 候補）の再評価条件に本検出事項を統合して再評価する**）

## 検出事項リスト（defer 残置分）

### REQ57-1: REQ-057-031/036 に作業履歴・書式詳細が混入している MOVE 候補

- **category**: 文書分類一貫性（MOVE 候補、REQ 要件行への Design 分離基準シグナル）
- **target**: `docs/requirements/REQ-057.md:46,51`（REQ-057-031、REQ-057-036）
- **evidence**:
  - `REQ-057-031` は要件の主目的（現行根拠文脈の旧行番号引用を0件にすること）に加え、「導入時点 318 件」「provenance issue-2383-ir067-initial-baseline」「診断基線 commit 92c8d28b」を記載する。provenance 名・commit hash は作業履歴／実装時点の内部証跡であり、REQ 要件行の主契約からは Design または Report へ分離できる候補である。
  - `REQ-057-036` は Design status 昇格時の記録要求に加え、標準形式の見出し名「対応記録」、必須項目（昇格日、評価契約根拠、対応 Case/PR、REQ 整合確認結果）、見送り記録との排他を要件行へ列挙する。これは report format / template variant の詳細を含む。
  - `docs/designs/authoring/command-file-format.md:16-18`、`src/opencode/skills/agentdev-design-file-manager/references/design-lifecycle-application.md:69-76` は執筆・保存側の責務を既に保持する。REQ-057-036 の存在自体は必要な成果契約だが、書式詳細の正規所有境界は要確認である。
- **severity**: low
- **confidence**: low
- **source_of_truth**: 現行 `REQ-001` の文書種別責務・Design Separation Criteria と、関連する Design/Skill を基準とする。REQ-057 は docs corpus 整合バッチという特殊な一時性を持つため、単純な違反確定ではなく文脈審査を要する。
- **recommended_route**: `MOVE` 候補の観察継続。REQ-057 完了後 RETIRE 候補として既存 defer F-04（20260907）と統合し、書式の必達成果だけを REQ に残すか、詳細を Design/保存手順へ移すかを backlog-review で判断する。
- **ng_classification**: 要ヒューマンレビュー
- **notes**: high-specificity signal 候補はあるが、REQ-057 は一時的な整合バッチを所有し、再現可能な監査証跡を要件へ含める解釈も成立する。単独の req-define 入力案は作成しない。

## 推奨アクション（defer 残置分）

- REQ57-1: 既存の REQ-057 RETIRE 観察（20260907 F-04）へ統合し、REQ の必達成果と Design/Report の内部証跡・書式詳細の境界を人手審査する。審議結果（2026-09-18）: defer 継続が正当と判定（REQ-057-031 の行主文意は検証可能な成果契約であり provenance/hash は検証の参照解決に機能する解釈が成立、low/low・文脈判断）。F-04（20260907）の再評価条件に本検出事項を統合した上で、次回 inspect サイクルまたは REQ-057 完了時の RETIRE 審査で再評価する。

## 出典

- 元診断（検出事項3件・クリーン判定・対象外・診断証跡を含む完全版）: commit `5e825098` の `.agentdev/inspect/inbox/inspect-docs-finding-20260917T223426Z.md`
- promote 分: `.agentdev/inspect/promoted/inspect-docs-promoted-20260917T223426Z.md`（QG-4-1、IDX-1、docs-check route 候補2件を含む）
