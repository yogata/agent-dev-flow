# 旧二分法語彙残存候補（RA-004 領域 2 件・REQ-027 1 件）の処置を判断する

## 内容

Wave 2-3（Issue 3535、RA-003 統制・検査監査）の実行で検出された旧語彙残存候補 3 件。

- `docs/designs/authoring/command-file-format.md` L40 周辺: skill Design 3 区分節を「semantic 担当 / deterministic 委譲先」の DEC-036 帰属語彙で参照する箇所
- `docs/designs/foundations/v3-v4-crosswalk.md`: 帰属 enum が semantic Skill / deterministic code/tool を使用する箇所
- `docs/requirements/REQ-027.md` L17: DEC-036 分類（semantic 担当 / deterministic 委譲先 / 知識提供）を現行参照

v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節が skill Design 3 区分節の語彙移行を RA-004（Wave 2-4、Issue 3536）の担当として明記しており、REQ の処遇判定は REQ-103-016 の全面再評価（Wave 2-5、Issue 3537）の対象であるため、Wave 2-3 では変更しなかった。

## 影響

旧語彙の現行規範としての使用が残存する（Epic #3530 完了条件「旧語彙の現行規範としての使用が 0 件」の到達前状態）。Wave 2-4・2-5 の対象範囲であり、本 item は横断確認の漏れ防止のための記録。

## 提案

Wave 2-4（Issue 3536）で語彙残存 2 件（command-file-format.md、v3-v4-crosswalk.md）を投影同期対象へ含める。Wave 2-5（Issue 3537）で REQ-027 L17 の処遇判定に含める。Wave 3 横断検証（Issue 3538）で旧語彙 0 件を再確認する。

## 根拠

PR #3541「Findings / Capture候補」の intake。Wave 2-3（Issue 3535、RA-003 統制・検査監査）の実行で検出され、RA-004・REQ 処遇判定の専任領域であるため対象範囲外として記録された。

https://github.com/yogata/agent-dev-flow/pull/3541
