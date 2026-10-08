# 現行 Decision の retired REQ 保持（related_reqs）の判断基準を確定する

統合元: 2026-10-08-case-3537-dec-013-related-reqs-req-028.md

## 観測内容

Case 3537（Wave 2-5）の全面再評価処遇判定で、DEC-013（accepted・現行）の frontmatter related_reqs に REQ-028（前回 retire 済み）が残存していることを確認した。

解消状況（2026-10-08 実測）: DEC-013 の frontmatter related_reqs は [REQ-010] へ更新済み（RA-005・commit aafcfa16）で、frontmatter の現象は解消済み。ただし判断領域には残存が実在する:

- DEC-013.md:56 本文の「根拠要件: REQ-028（IR 体系の実効性監査と存在条件厳格化）」言及が retired 表記・retired/ パスなしで残留（inspect-docs F-19 が同一箇所を検出）
- docs/README.md:265 の説明列 REQ-028 言及残留（F-19 検出）
- DEC-022 における同種の非対称（REQ-045 本文言及残存 vs REQ-046 frontmatter 保持。F-20 検出）

retired REQ への現行 Decision からの関連宣言参照は IR-015（廃止 REQ 現行参照検出）の検出対象外領域であり、機械検査では検出されず手動確認に依存し続ける。

## 影響

REQ-103-020（歴史記録の保全）と現行関連宣言（REQ-059: Decision↔REQ 関連宣言管理）の境界解釈が未確定のまま残る。related_reqs 保持・本文言及・索引説明の 3 層で退役 REQ の扱いが Decision ごとに不揃いになり、修正時の判断が毎回個別に行われる。

## 課題（backlog-review → req-define 向け）

REQ-059（Decision↔REQ 関連宣言管理）の観点で、現行 Decision が retired REQ を related_reqs・本文・索引の各層で保持し続ける妥当性（歴史記録としての保持 vs 現行参照の除去）の判断基準を確定する。除去する場合は IR-015 検出対象の拡張（related_reqs・本文言及領域の検査追加）を同時に評価する。

## 既存成果物との関連

- inspect-docs F-19（DEC-013 frontmatter 除去に伴う本文・索引説明の未同期）・F-20（DEC-022 retired REQ 取扱い非対称・保持基準未文書）と同一の判断契約論点。backlog-review で F-19/F-20 と統合すること（F-20 は「保持基準を決め DEC-013/DEC-022 双方へ適用」を推奨しており本件と同旨）
- 本件の frontmatter 現象は解消済みであるため、統合時は「判断基準の確定」を主論点とし、本文・索引の個別修正は F-19 の処置に含める

## 元 observation（参照）

- https://github.com/yogata/agent-dev-flow/pull/3544（Wave 2-5・Issue 3537 Findings・処遇判定一覧 DEC-013 行）
