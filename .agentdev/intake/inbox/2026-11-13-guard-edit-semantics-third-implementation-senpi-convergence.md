# ガード編集意味論共通部の第3実装（Senpi edit-interpretation.ts）の将来収束候補

## 観測事実

- Epic 4026 Wave 2（PR 4043、Issue 4033 対応・E4-1 gate 違反で未マージ）の本文 Findings で、Senpi ホスト接続側に `src/senpi/plugins/agentdev-guard-connection/lib/edit-interpretation.ts`（REQ-099-013/014 対応）が存在し、textlint guard と配布境界 guard の編集意味論共通部（lib/edit-semantics.ts）に対する第3の実装となっていることが申告された。Issue 対象範囲が 2 ガードのみのため本 PR では扱っていない。
- PR 4043 の Design 確定候補には、差異処理パターン（matchCount 消費・unknownLines malformed 化・`@@` anchor 強制・replaceAll 無効型拒否の有無で固有条件を分離）を第3ガード接続時に適用する案が含まれる。

## 具体的な修正対象

- Senpi edit-interpretation.ts を lib/edit-semantics.ts（共通部）への参照または同等実装の移設へ収束させる。実施時は PR 4043 Design 確定候補の差異処理パターン（解析結果の消費方法での分離）を適用する。
- 前提: PR 4043 自体の E4-1 gate 違反修正（コメント内 producer 内部 ID 除去）とマージが先行的に必要。

## 関連

- Epic 4026・PR 4043 本文 Findings / Capture候補・Design確定候補（Issue 4033 対応）
- src/senpi/plugins/agentdev-guard-connection/lib/edit-interpretation.ts（REQ-099-013/014）
