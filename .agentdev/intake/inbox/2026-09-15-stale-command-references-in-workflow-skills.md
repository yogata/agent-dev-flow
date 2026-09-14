# Workflow Skill 配布物と docs/designs への旧3コマンド経路参照残存の横断 cleanup

## 概要

旧3コマンド（`req-save` / `design-save` / `case-update`）の経路参照が、Workflow Skill 配布物（`src/opencode/skills/` 配下 32 ファイル: SKILL.md 5 件・references/ 23 件・scripts 4 件）と Command Design・基盤 Design（`docs/designs/` 配下 44 ファイル）に残存している。Epic #2805 完了条件③「旧コマンド名参照件数 = 0」を corpus 全体として満たしていない。case #2811（OU-006）case-close QG-4 で検出し、同 Case の構造化停止（blocked）の原因となった残課題。

## 内容

- 最終 Wave OU-006（PR #2819）は routing・issue-management 等 SKILL.md 本体、guides、README、glossary、extensions、検査資産を更新したが、references 層の旧経路記述は未除去のまま残存した
- 代表例:
  - `agentdev-workflow-routing/references/case-update-procedure.md`: ファイル自体が旧 case-update の手順書（routing SKILL.md 34-35 行目から参照され続けている）
  - `agentdev-workflow-routing/references/next-command-rules.md` / `review-ng.md`: `/agentdev/case-update` を正規経路として記述
  - `agentdev-workflow-learning-promote/SKILL.md`・`agentdev-learning-pipeline/**`: 昇華経路に `/agentdev/req-save` / `design-save` を含む旧フロー記述
  - `agentdev-req-analysis/**`・`agentdev-req-file-manager/**`・`agentdev-workflow-req-define/**`: 旧保存フローの分業記述
  - `docs/designs/commands/req-define.md`・`docs/designs/foundations/system.md`: 削除済み Design ファイル（req-save.md / design-save.md / case-update.md）への壊れたリンク（check_integrity broken-file-link NG、route: intake+learning）
  - `expanded-readme-sync` NG: system.md に case-revise の記述欠落（agentdev/ 配布側には存在）
- 実測コマンド（case #2811 case-close 2026-09-15 記録）:
  - Workflow Skill 配布物: `grep -rEl "req-save|design-save|case-update" src/opencode/skills/` → 32 ファイル（references/ 23 件、SKILL.md 5 件）
  - docs/designs: `grep -rEl "req-save|design-save|case-update" docs/designs/` → 44 ファイル
  - 配布 command（`src/opencode/commands/agentdev/`）・guides・README・glossary・extensions は 0 件（OU-006 で達成済み）
- 付随する環境系 NG（check_integrity exit=1、merge 直後 main root 実測）: `.opencode/skills/` の stale junction 3 件（case-update / design-save / req-save、再構築で解消）と `skill-projection-manifest.yaml` の不整合（design-save / req-save が manifest 残置、case-revise 未登録。manifest 最終更新は PR #2817 相当）
- 旧参照の専属割当は親 Epic #2805 で OU 単位に分散（routing 系は OU-006、case-run 系は OU-005、case-close / req-define 系は OU-001）。各 OU が SKILL.md 本体を更新したが references・Design 層の網羅は完了していないため、Epic レベルの横断 cleanup として扱うのが妥当
- cleanup 時の着眼点: references 削除時は SKILL.md 側の参照テーブル（routing SKILL.md の参照一覧等）の同時更新、壊れたリンク除去時は新標準フロー（case-ready / case-revise）への導線置換、`expanded-readme-sync` は system.md への case-revise 記述追加が必要

## 根拠

- 観測元: case #2811（PR #2819）case-close QG-4 独立再検査（2026-09-15、main root 49f17d3e + capture ca5c73a5 で実施）。traceability check は REQ-034-037/038 verification-present（exit=0）で合格した一方、check_integrity（source profile）は exit=1、新規 unmanaged NG 68 件を検出
- 本件は PR #2819 の変更起因ではなく corpus 既存の残課題（PR 変更対象外の docs/designs/・references が発生源。targeted 検査は全て合格: changed-file findings 0）
- 完了条件に含まれる未達事項は intake 記録として明示し、完了扱いに含めない（case-close 不変条件）。本 intake がその記録である
