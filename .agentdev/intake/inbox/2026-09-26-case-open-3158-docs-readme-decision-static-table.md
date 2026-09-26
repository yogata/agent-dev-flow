# intake: Case #3158 case-open 実行由来の検出候補（docs/README.md Decision 静的表の索引対象外による追記漏れリスク）

- 観測日: 2026-09-26
- 観測元: case-open #3158 STEP-4（Definition PR #3159 作成時の canonical Definition 適用。PR #3159 diff docs/README.md）
- 種別: 索引整合（docs 索引自動生成の対象範囲）の intake 候補。個別是正は inspect-promote / backlog-review 経由

## 候補: docs/README.md の Decision 静的表は generate_indexes 対象外であり、Decision 追加時の追記漏れが発生し得る

- **実観測事実**: main HEAD 74ac980c 時点で docs/README.md の Decision 静的表に DEC-043 の行が存在しなかった（docs/decisions/DEC-043.md は PR #3157 で作成済み、docs/decisions/README.md の AUTOGEN 表には反映済み）。Case #3158 の Definition 変更（PR #3159）で DEC-043/DEC-044 行を手動追記して解消した。
- **原因構造**: generate_indexes.ts が再生成するのは docs/decisions/README.md の AUTOGEN ブロック（decision-baseline-count/table、status 別ビュー、関連 REQ 表）のみであり、docs/README.md の Decision 表（静的表・AUTOGEN マーカーなし）は対象外。DEC 新規作成時に静的表の追記が呼出側の手動作業として残り、DEC-043 で実際に漏れが発生した。
- **具体的修正候補**:
  - (a) docs/README.md の Decision 表を AUTOGEN ブロック化し generate_indexes.ts の生成対象へ含める
  - (b) 追加の機械検査（check_integrity 系）で docs/README.md の Decision 行集合と docs/decisions/ 実ファイル集合の突合を検出対象へ加える
- **影響**: 追記漏れが残った場合、docs-check の既存検査では自動検出されず、Decision 索引の第一参照（docs/README.md）が過去の状態を示し続ける。
- **関連**: Case #3158、PR #3159、docs/README.md、docs/decisions/README.md、generate_indexes.ts、DEC-043、DEC-044
