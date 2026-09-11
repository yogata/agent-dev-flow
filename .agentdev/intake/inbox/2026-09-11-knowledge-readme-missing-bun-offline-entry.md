# docs/knowledge/README.md の知識文書一覧に bun-offline-bundle-placement-independent-build.md 未登録

## 概要

docs/knowledge/README.md の「現在の知識文書」一覧に `bun-offline-bundle-placement-independent-build.md`（design-save commit fd54813f で追加された offline bundle 運用知識）が未登録である。README 自身は知識文書ではなく案内と位置づけられるため、knowledge 再変更を対象外とする case 2775 では修正せず、一覧更新候補として intake 化する。

## 内容

- docs/knowledge/README.md の知識文書一覧へ `bun-offline-bundle-placement-independent-build.md` のエントリ追加候補（一覧との整合回収）
- 当該知識文書は runtime-package-boundary.md L93〜99（vendored bundle 再生成時の焼き付き絶対パス自己検査契約）から相互参照されており、case 2775 の TS-002 突合で参照先実在を確認済み。README 一覧のみが追随していない

## 根拠

- 観測元: case 2775 / PR #2776 本文 Findings（intake 候補）、case-close（2026-09-11）で回収。case-close 側で README 一覧の `bun-offline` 記載 0 件を再確認
- 元テキスト: PR #2776 本文 Findings/Capture候補「docs/knowledge/README.md の『現在の知識文書』一覧（3 件）に bun-offline-bundle-placement-independent-build.md（design-save commit fd54813f で追加）が未登録。README 自身は知識文書ではなく案内と位置づけられるため本 Issue（knowledge 再変更対象外）では修正せず、一覧更新候補として記録」
- 処分経緯: case-close STEP-6 Capture 回収で intake inbox へ保存
