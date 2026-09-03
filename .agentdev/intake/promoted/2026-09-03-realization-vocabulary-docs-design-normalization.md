# docs 側 Design の「実現面」語彙現行化候補（req-define Design、req-analysis skill Design）

## 観測内容

2026-09-03 の Wave 3 Case（PR #2552、OU-003 req-define 確定責務明示）の Findings / Capture候補 として case-close が回収。PR #2552 で配布物側（agentdev-req-analysis SKILL、analysis-viewpoints.md、req-define command）は REQ-004-037 変更後語彙「実現面（正規所有責務を持つ既存実体・成果物）」へ統一済みだが、docs 側 Design に語彙未反映の箇所が残る:

- docs/designs/commands/req-define.md 164 行目「実装面/Design面の両面分析表」、175-178 行目「実装/Design両面分析規定」（実装面 = ソースコード、スクリプト、スキル定義ファイル等の変更と定義）
- docs/designs/skills/agentdev-req-analysis.md 67 行目「実装計画、タスク分割、コード変更方針の確定」（req-analysis が扱わないの列挙）

あわせて「実現面」語彙の正典配置（REQ-004-037 変更後本文が語彙定義込みで確定。docs Design 側の「実装面」語彙との統一、正典語彙の Design 反映）が判断候補として挙がっている。

原因分類: 箇所の実在と語彙未反映は確認済（PR #2552 本文 Findings 記録 + case-close による main 上 rg 再確認）/ 概念面は現行契約と矛盾しない（req-define Design の実装面定義と req-analysis Design の列挙は、正規所有責務を持つ実体・成果物への変更の分析という点で現行契約と整合。語彙の旧式のみが残存）。

## 影響

- 配布物（req-analysis SKILL、analysis-viewpoints.md、req-define command）と docs 側 Design で同一概念の語彙（実装面 / 実現面）が分岐し、正典語彙の所在が Design から読み取れない
- 横断整合検証（TS-007）で語彙パターンの残存が継続検出され、検証差分の既出分類が積み上がる

## 課題（レビューで決めること）

- docs 側 Design（req-define Design、req-analysis skill Design）の「実装面」語彙を「実現面（正規所有責務を持つ既存実体・成果物）」へ現行化するかの判断
- 「実現面」語彙の正典配置（REQ-004-037 変更後本文を正典とし Design は参照に留めるか、Design 側へ語彙定義を複製するか）
- 語彙現行化と同時に、docs-check のアンカー突合（旧アンカー「実装spec両面分析規定」等の名残）への組み込み要否

## 既存要件・契約との関連

- REQ-004-037（実現面語彙の定義を含む変更後本文、commit 727d5aae）、req-define Design（docs/designs/commands/req-define.md）、req-analysis skill Design（docs/designs/skills/agentdev-req-analysis.md）、語彙レジストリ Design（docs/designs/authoring/vocabulary-registry.md）の正典配置契約。

## 根拠

- PR #2552 本文 `## Findings / Capture候補`（docs 側 req-define Design の語彙旧式 2 件、「実現面」語彙の正典配置候補）
- docs/designs/commands/req-define.md（164、175-178 行目）、docs/designs/skills/agentdev-req-analysis.md（67 行目）
- REQ-004-037 変更後本文（実現面 = 正規所有責務を持つ既存実体・成果物の語彙定義、727d5aae）
