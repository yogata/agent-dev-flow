# REQ-031-001 のフェーズ名表記が guide 同期後の正規表記とズレたまま残存

## 観測内容

docs/requirements/REQ-031.md L19 の REQ-031-001 フェーズ名表記（「準備、実装、提出」）が、docs/guides/req-case-flow.md L71-75 の正規表記（準備・委譲・クリーンアップ）とズレたまま残存している。

- Case #3086（PR #3093、docs/guides/req-case-flow.md case-run 節 3フェーズ構成表の正規フェーズ名同期）の実装時に確認。本 Case は REQ 行の保存操作対象外（参照のみ、artifact_actions: []）のため本 PR では変更していない。
- 発見元: docs/requirements/REQ-031.md と guide 表の突合。

## 影響

基準（REQ）とガイドのフェーズ名が不整合となり、読者が両者を突合する際に混乱する。

## 課題

REQ-031.md の REQ-031-001 行のフェーズ名表記を正規の準備・委譲・クリーンアップ構成へ同期する。同種表記の扱いは下流で判断する。処分区分候補: document_correction（低優先度）。

## 既存要件との関連

guide 側（docs/guides/req-case-flow.md）は Case #3086 で正規フェーズ名へ同期済みであり、REQ 側が未同期。
