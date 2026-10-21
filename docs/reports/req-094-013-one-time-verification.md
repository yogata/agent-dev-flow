# REQ-094-013 一回限り検証記録

対象は Case #3835（Root Case Issue、単一 Standard Issue、Definition PR #3836、実装 PR #3837）。本記録は REQ-094-013（歴史文書の修正対象を読みを誤らせる確定誤記に限定する運用規定）の検証義務について、2026-10-21 の利用者判断により REQ-103 先例（検証軸 optional 登録 + 一回限り検証記録、traceability/req-103-wave3-verification.yaml）と同一の形式を確定したことに基づく今回限りの検証記録であり、恒久台帳ではない。

## 検証義務の形式の確定経緯

- REQ-094-013 は人間運用規定であり、対応する恒常的な機械検証手段は現行不在である（textlint gate は REQ-053-039 により docs/requirements/retired/ 配下と docs/reports/ 配下を検査対象外とし、check_integrity は構造検査を担務とする）
- Case #3835 の case-close QG-4 最終受入（2026-10-21、Issue #3835 コメント 6309589997）は traceability check の missing-verification (REQ-094-013) を完了阻止条件として不合格を確定し、検証対応の形式（恒常検証手段の設計 / 一回限り検証 / policy optional 登録）を人間判断として req-define 再合意に留保した
- 2026-10-21 の case-auto 再開実行において、利用者が REQ-103 先例と同一の形式（traceability policy の verification optional 登録 + 本記録による一回限り検証の記録）を明示選択した。判断変更の記録は Issue #3835 の当該コメントを正とする。これにより traceability/policy.yaml への REQ-094-013 optional 登録は、区分登録・解除を当該要件行の変更と同一の Definition 変更として扱う規定に従い利用者合意済みの変更として実施された

## 一回限り検証の内容と結果

検証の対象は Case #3835 の完了条件（TS-001〜003）に対応する実施記録であり、実施の詳細は PR #3837 本文（検証差分セクション、品質メトリクス）を正とする。

| 検証項目 | 判定 | 根拠証拠（到達経路） |
|---|---|---|
| REQ-094-013 行の存在と内容の完全性（歴史文書3分類・確定誤記への限定・言い回しの除外・判定基準の REQ-094-009 準拠・維持規定 REQ-094-006/007/011 従属・REQ-053-039 定義不変更） | pass | PR #3837 検証差分 TS-001（docs/requirements/REQ-094.md 全文読み取りと要件テーブル行照合。REQ-094-013 行は REQ-094-012 行の直後・テーブル 13 行目。definition PR #3836 merge commit ac5cbbbfa） |
| 維持規定行の不変（REQ-053-039、REQ-094-006/007/011） | pass | PR #3837 検証差分 TS-002（変更差分による本文照合。docs/requirements/REQ-053.md 差分なし、REQ-094.md の差分は ADF-COVERS(implementation) 宣言行追加のみ、commit ce3f5071） |
| 変更範囲が対象成果物の範囲に収まる | pass | PR #3837 検証差分 TS-003（definition PR #3836 は docs/designs/quality/req-health-metrics.md、docs/designs/responsibilities/document-type-responsibilities.md、docs/requirements/REQ-094.md の 3 ファイル。実装 PR #3837 は docs/requirements/REQ-094.md のみ。docs/requirements/ 配下に新規 REQ ファイルなし） |
| Design 対応・implementation 対応の完全性 | pass | PR #3837 品質メトリクス（トレーサビリティ check は missing-design 0 件・missing-implementation 0 件・policy 有効。design 対応は docs/designs/responsibilities/document-type-responsibilities.md の ADF-COVERS(design) 宣言、implementation 対応は docs/requirements/REQ-094.md の inline 宣言、commit ce3f5071） |

## 恒常検証手段の非設置と運用での確認経路

- 本記録により REQ-094-013 の検証対応を一回限りの記録として確定し、恒常 checker は設置しない。traceability/policy.yaml の optional 登録はこの判定の宣言である
- 歴史文書への修正が確定誤記に限定されることの運用面の確認は、REQ-094-010 の確認対象に基づく是正の運用（個別 Case の完了条件評価と監査）が担う。歴史文書を対象に含む是正 Case では、REQ-094-013 の適用（確定誤記のみの修正・言い回しの対象外維持）を当該 Case の完了条件評価で確認する
- REQ-053-039 の機械検査対象外の定義（対象: docs/requirements/retired/ 配下と docs/reports/ 配下）と checker 実行契約 Design（docs/designs/integrity/checker-execution-contracts.md）の検出対象除外規定は本記録では変更しない

## 証跡参照

- Issue #3835（Root Case。完了条件、工程記録、判断変更記録コメント）
- PR #3836（Definition: REQ-094-013 行追加、design 宣言、AUTOGEN 派生物。merge commit ac5cbbbfa）
- PR #3837（実装: REQ-094.md への ADF-COVERS(implementation) 宣言。commit ce3f5071。検証差分・品質メトリクス本文）
- Issue #3835 コメント 6309589997（QG-4 不合格と再開条件の停止記録）
- traceability/req-103-wave3-verification.yaml（検証義務の形式の先例）
