# ガイド・リリース検査に残存する src/opencode-local/ 旧語彙指定 (agentdev-workflow-templates Design と scripts-layout.test) を是正する

## 観測内容

PR #3669 (Case #3670、ガイド旧パス是正修正 6) で `docs/guides/consumer-project-setup.md` と `docs/guides/glossary.md` の旧パス `src/opencode-local/agentdev-gh/` を現行パス `src/common/tools/agentdev-gh/local/` へ是正した際、同一旧語彙が正式文書に残存していることを確認した。(1) `docs/designs/skills/agentdev-workflow-templates.md` L103 が `src/opencode-local/` 接頭辞を正規形とする旧語彙指定のまま (「(維持)」記載あり)。(2) `scripts/self/release/scripts-layout.test.ts` L186-192 が実在しない `src/opencode-local/` を検査対象リストに含む。Design `runtime-package-boundary.md` と `install.ps1` が示す正は `src/common/tools/agentdev-gh/local/` である。

### 発生時のスコープ判断

本 Case (#3670) の対象範囲は REQ-009-033 (マージ取り込み保証) の是正であり、ガイド是正も PR 本文に申告された 2 ファイル (consumer-project-setup.md、glossary.md) に限定される。当該 Design とリリース検査スクリプトは Case Issue 本文の「対象外」節に明示記載されたガイド陳腐化の残存候補であり、範囲拡大を避けるため本 Case では扱わない。

## 影響

旧語彙を正規形とする Design 記述と、実在しないディレクトリを検査対象とするリリース検査が残存する。新規に作成される workflow テンプレートや command README が旧パス表記を正と誤解して書かれる再生産リスクがあり、scripts-layout.test は当該パスを検査しても常に空振りする (壊れた検査ではないが無意味な検査対象として残る)。

## 課題（backlog-review で決めること）

- `agentdev-workflow-templates.md` L103 の語彙指定の是正方針 (現行パス接頭辞への置換か、パス非依存の記述への変更か)。「(維持)」記載の意図があったかの確認
- `scripts-layout.test.ts` L186-192 の検査対象リストからの `src/opencode-local/` 除去と、`src/common/tools/agentdev-gh/local/` への置換要否
- 旧語彙の全リポジトリ横断残存調査 (他の Design / ガイド / スクリプトに同種の言及がないか)

## 関連（既存要件・正規成果物・証跡）

- 関連: Design `runtime-package-boundary.md`、`install.ps1` (正規パスの情報源)
- 関連正規成果物: `docs/designs/skills/agentdev-workflow-templates.md`、`scripts/self/release/scripts-layout.test.ts`

## 根拠

- 観測元: Case #3670、PR #3669 本文 Findings / Capture候補 セクション (2026-10-13)
- 証拠: PR #3669 修正 6 の是正対象外確認 (merge commit 5958fe7e、`docs/guides/` 2 ファイルのみ変更)。`docs/designs/skills/agentdev-workflow-templates.md` L103、`scripts/self/release/scripts-layout.test.ts` L186-192 の現行記述
