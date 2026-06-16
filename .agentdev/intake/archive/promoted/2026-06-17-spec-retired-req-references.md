# SPEC ファイル群に retired REQ 参照が未整理

## 観測

OU-06（retire/merge/index/mapping-table 整合）でアクティブ REQ の退役・インデックス更新を実施したが、他 SPEC ファイルに残る retired REQ 参照の整理は「別タスクで対応」として明示的に先送りされた。2026-06-17 時点で `docs/specs/document-model.md` が退役済み REQ-0116 を広範に参照している。

主な残存:

- `docs/specs/document-model.md`: REQ-0116 および REQ-0116-002〜016 を section provenance marker（`<!-- REQ-0116-NNN -->`）として多数参照。REQ-0116 は OU-04（Issue #832 / PR #841）で退役し、内容は REQ-0101 に吸収済み。
- `docs/specs/quality-gates.md`: 冒頭で REQ-0115 を参照（REQ-0115 は OU-05 で退役、内容は REQ-0108 に吸収済み）

## 今回扱われなかった理由

OU-06 のスコープ厳守（コマンド・スキル・ガイド・他 SPEC ファイルは編集対象外）により、退役 REQ 参照の整理を別タスクに委譲した。

## 影響

- retired REQ を provenance marker として参照し続けると、読者が「この REQ は現行か」を判断する必要が生じる
- REQ-0116 の内容が REQ-0101 に吸収された後も document-model.md が REQ-0116 を参照し続けると、権威情報源の優先順位（AGENTS.md）と矛盾する可能性

## レビューで決めること

- retired REQ の provenance marker を現行の吸収先 REQ（REQ-0101 等）へ更新すべきか
- 現行 SPEC における REQ 参照形式の標準化（provenance marker のありかた）を改めて定義すべきか
- OU-10（Issue #838 / PR #847 docs再基準化）で一部対応された可能性があり、現時点での残存範囲を再確認すべきか

## 根拠

- 観測元: PR #845「refactor: OU-06 最終整合 - retire/merge/index/mapping-table整合 (#834)」のスコープ外セクション、および Issue #834
- 元テキスト（PR #845 スコープ外）:
  > ## スコープ外（別 OU で対応）
  > - 他 SPEC ファイル（document-model.md, quality-gates.md, system.md 等）の retired REQ 参照: 別タスクで対応
- 関連: OU-04（Issue #832 / PR #841 REQ-0116 退役）、OU-05（Issue #833 / PR #842 REQ-0115 退役）、OU-10（Issue #838 / PR #847 docs再基準化）
