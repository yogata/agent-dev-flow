# consumer-project-setup.md の broken-file-link 5件（docs/specs/local/ 参照切れ）

## 観測

check_integrity の broken-file-link で NG 5件が検出されている。

- docs/guides/consumer-project-setup.md が ../specs/local/runtime-package-boundary.md および ../specs/local/local-case-file.md へリンクしているが、docs/specs/local/ は実在せず、実体は docs/designs/local/ 配下にある

Wave 3 ドメイン再編後の相対パス更新漏れと推定される（pre-existing、31a0ae07/d903f85b 起因）。

## 今回扱わない理由

Issue #2380（OU-002）の検証対象外の pre-existing 検出。docs 体系・配布テンプレートの旧構造正規化は OU-007（Issue #2385、Wave 2）が担当する。

## 影響

適用プロジェクト向けガイドからのリンク切れにより、ローカル版境界・Case ファイルの説明への到達性が下がる。

## レビューで決めること

- 参照先を実体（docs/designs/local/ 配下）へ修正する対応を OU-007（Issue #2385）のスコープに含めるか

## 根拠

- PR #2390 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2390 ）
