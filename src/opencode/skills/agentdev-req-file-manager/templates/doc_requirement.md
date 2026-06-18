---
id: REQ-{NNNN}
title: ""
created: ""
updated: ""
---

## 目的
<!-- 【必須】 -->

{この領域の要件が存在する理由}

## 要件
<!-- 【必須】 -->

| ID | 要件 |
|---|---|
| REQ-{NNNN}-001 | {検証可能な必達要件を記述} |

## 適用範囲
<!-- 【必須】 -->

- **対象**: ...
- **対象外**: ...

## SPEC候補
<!-- 【任意】 req-define が Step 4-2/4-3 で REQ 要件行候補から分離した SPEC 相当行を配置する補助セクション（REQ-0136-009, ADR-0123）。REQ 必須セクション（目的/要件/適用範囲）は本セクションの有無にかかわらず維持する。構造化データは draft-meta.spec-candidates に保持し、本セクションは人間可読な一覧を提供する。req-save は REQ ファイル保存時に本セクションを除去し、内容は draft-meta.spec-candidates 経由で spec-save が docs/specs/*.md へ保存する。最終 REQ ファイルに本セクションは残さない。SPEC候補がない場合はセクションごと省略する。 -->

- **SC-001**: {SPEC候補の内容}
  - 想定配置先SPEC: {`docs/specs/{file}.md`、または「新規SPEC候補: {トピック}」}
  - 分離根拠: {REQ-0101-068 の SPEC分離基準該当種別（schema field / enum 値一覧 / 判定表 / fixture detail / retry 回数 / Step 番号 等）}
  - 元候補: {要件行候補の出処（壁打ち候補行番号 または 対象 REQ の要件行 ID）}
