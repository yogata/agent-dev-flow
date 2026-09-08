# agentdev-traceability の親要件 bare ID 参照の扱い明示化

## 観測内容

agentdev-traceability の check で、親要件 ID（例: REQ-011）の bare ID 参照（子行番号を伴わない親要件自体への参照）に実装宣言（ADF-COVERS(implementation)）がなく、missing-implementation として報告される。親要件行自体は複数の Design 実装に横断して被覆されるため、単一箇所に実装宣言を置くことが不自然なケースである。当該報告は PR #2694 の変更対象行（REQ-011-024/025/026/027/030）の欠落ではない。

## 影響

- traceability check の missing-implementation 報告に親要件 bare ID 起因のノイズが混入し、本来検出したい実装宣言欠落の判別を妨げる
- 個別カンマ指定での回避運用（子行 ID 指定）が暗黙の前提となっている

## 変更候補

- 親要件 bare ID 参照の扱いを Design/実装側で明示化する。候補は次のいずれか:
  - 親要件行（子行を持つREQ ID）を missing-implementation の計上対象から除外する
  - 参照側の表記を子行 ID 付きへ是正する運用を Design に明記する
- 扱いは traceability 能力の正規所有 Design（対応宣言の表記仕様を所有する Design）が担う

## 既存要件・成果物との関連

- agentdev-traceability スキルおよびその Design（対応宣言の表記）
- REQ-011 のように子行へ分割された親要件群での共通課題
- `--req` 範囲構文（REQ-NNNN-AAA..BBB）がリテラル reqId として報告される既知問題（learning inbox で別途回収済み）と同領域の実行前提整理

## 出所

- 元 intake item: `2026-09-08-req-011-bare-id-missing-implementation-2694.md`（PR #2694 の case-run トレーサビリティ check → case-close 独立再検査由来、Issue #2688・Epic #2686 Wave 2）
