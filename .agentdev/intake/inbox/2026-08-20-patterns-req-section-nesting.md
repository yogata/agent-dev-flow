# patterns.md の REQ 規約節入れ子構造

## 観測
docs/designs/foundations/patterns.md の「REQ frontmatter 規約」節と「REQ セクション構成」節が本文中に階層構造（## 目的 / ## 要件 / ## 適用範囲）として存在し、文書構造が入れ子になっている。本来は各 REQ テンプレート側の規約である可能性がある。

## 今回扱わない理由
Issue #2349（SPEC成果物のDesign再定義）は語彙置換・物理移行・機構追従が対象であり、文書構造の整形は範囲外。PR #2350 の Findings に記録のみ実施（語彙置換のみ実施、構造修正は未実施）。

## 影響
patterns.md 内の見出し階層が入れ子になり読みにくい。検査動作への影響なし。

## レビューで決めること
- 当該2節を REQ テンプレート側（agentdev-req-file-manager のテンプレート群）へ移管するか、patterns.md 内で見出し構造を平坦化するか。

## 根拠
- PR 2350 本文「Findings/ Capture候補」intake 小見出し（回収元: https://github.com/yogata/agent-dev-flow/pull/2350）
