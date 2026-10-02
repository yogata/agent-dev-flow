# intake: traceability/src-opencode-correction.yaml の component 再編（REQ-094 component への REQ-096-015 混在解消）候補

## 分類

採用（backlog-review へ引き渡す変更候補）

## 観測内容

- traceability/src-opencode-correction.yaml は REQ-094 用の component に REQ-096-015 の implementation 宣言が混在している
- これは RA-002 が「artifact パス × role 単位の単一情報源規約」に従い既存 sidecar へ統合した結果であり、duplicate-inconsistencies を 1件 → 0件に解消した側面がある一方、component 名と内容の対応が乖離している

## 影響・課題

- component 単位の管理性（命名と内容の対応）が損なわれている
- sidecar 整理が必要な場面で component の意味境界が不明瞭になる

## 既存要件・成果物との関連

- agentdev-traceability（sidecar schema・単一情報源規約）
- traceability/ 配下の他 sidecar（agentdev-workflow-*.yaml の component 命名規約）

## 対応候補

- 後続の sidecar 整理パスで、component 単位の命名と内容の対応を再編する（例: REQ-096 宣言を専用 component へ分離、または component 名を実態に合わせ改称）
- 宣言の意味（reqIds・artifact・role）は変更しない

## 元 item

- 観測日: 2026-10-01
- 観測元: Epic #3280 Wave 2 case-close Capture 回収（PR #3288 本文 Findings。Issue #3284 / RA-002 で検出）
- 再導出手段: PR #3288 本文「Findings / Capture候補」第5項を参照。traceability/src-opencode-correction.yaml（component: src-opencode-correction、REQ-094 系 reqIds と REQ-096-015 の混在状態）で再導出可能
