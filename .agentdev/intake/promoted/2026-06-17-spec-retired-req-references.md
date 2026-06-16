# SPEC ファイル群に retired REQ 参照が未整理

## 観測内容

OU-06（retire/merge/index/mapping-table 整合）でアクティブ REQ の退役・インデックス更新を実施したが、他 SPEC ファイルに残る retired REQ 参照の整理は「別タスクで対応」として先送りされた。2026-06-17 時点で複数の SPEC ファイルが退役済み REQ を参照している。

主な残存:

- `docs/specs/document-model.md`: REQ-0116 および REQ-0116-002〜016 を section provenance marker（`<!-- REQ-0116-NNN -->`）として多数参照（line 137-298）。REQ-0116 は OU-04（Issue #832 / PR #841）で退役、内容は REQ-0101 に吸収済み。
- `docs/specs/quality-gates.md`: 冒頭（line 3）で REQ-0115 を参照。REQ-0115 は OU-05 で退役、内容は REQ-0108 に吸収済み。

## 課題

- retired REQ を provenance marker として参照し続けると、読者が「この REQ は現行か」を判断する必要が生じる
- REQ-0116 の内容が REQ-0101 に吸収された後も document-model.md が REQ-0116 を参照し続けると、AGENTS.md の権威情報源優先順位と矛盾する
- OU-10（Issue #838 / PR #847 docs再基準化）で system.md は更新されたが、document-model.md の REQ-0116 参照は未対応の可能性

## 影響

- 中程度: 現状は動作影響なし。権威情報源の優先順位との整合性、読者の判断負荷。

## 既存要件との関連

- AGENTS.md「信頼できる情報源の優先順位」: retired REQ を現在の権威として引用してはならない
- REQ-0101-017〜026: 文書・REQ管理基準（retired 文書の参照ルール）
- REQ-0112-048: retired ADR の現行根拠引用禁止（REQ 参照にも類推適用可能）
- OU-04（REQ-0116 退役）、OU-05（REQ-0115 退役）、OU-06（PR #845 スコープ外明記）、OU-10（docs再基準化）

## 対応方向の候補

- retired REQ の provenance marker を現行の吸収先 REQ（REQ-0101, REQ-0108 等）へ更新
- provenance marker のありかた（retired REQ 参照を許容するか）を標準化
- document-model.md, quality-gates.md の現時点での残存範囲を再確認して対応範囲を確定

## 根拠

- 観測元: PR #845「refactor: OU-06 最終整合」スコープ外セクション、Issue #834
- intake item: `.agentdev/intake/archive/promoted/2026-06-17-spec-retired-req-references.md`
