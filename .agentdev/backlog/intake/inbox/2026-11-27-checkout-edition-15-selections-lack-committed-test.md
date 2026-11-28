---
id: 2026-11-27-checkout-edition-15-selections-lack-committed-test
created_at: 2026-11-27T23:58:00+09:00
source: case-close (Wave 1 #4229 の実行・最終受入 capture)
status: unreviewed
---

# checkout 版（install.ps1）に選択 15 通りと空選択拒否を網羅するコミット済み試験がなく、最終受入が評価者自身の probe に依存している

- **課題**: 4 エージェント選択の空でない全 15 通りと空選択の拒否を、checkout 版（scripts/install.ps1）で検証するコミット済み試験がリポジトリにない。リリース ZIP 版には archive-installer-selection.test.ts（43 試験）があるが、checkout 版は case-close の評価者がその都度 selection-probe を実行して判定しており、第 2 回最終受入では初回委譲の probe が未保存だったため条件 1 の証拠不足 (f)・(l) となった
- **期待する処分**: checkout 版の 15 通り選択と空選択拒否を網羅するコミット済み試験を scripts/self/release/ に追加するか、評価者 probe を規定の証跡ラベルで必ず保存する運用を case-close の手順に明記するかを判断する
- **出典**: Wave 1（Issue #4229）の case-run・case-close 実行（PR #4231 本文の Findings、第 3 回最終受入）
- **実証根拠**: (1) PR #4231 本文の完了条件 1 の記載と intake 項目 (f)。(2) 第 2 回最終受入の判定記録 findings-r3.md の (l)。(3) 第 3 回は case-close-4227-selection-probe-matrix-head-r5（31/31 合格）で判定し、コミット済み試験は ZIP 版のみであること
