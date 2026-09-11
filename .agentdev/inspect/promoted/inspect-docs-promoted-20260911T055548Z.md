# inspect-docs promoted 20260911T055548Z

> 本ファイルは /agentdev/inspect-promote（2026-09-11 実施、/agentdev/backlog-auto 経由）の分類確定後、promote となった検出事項を保存した採用済み成果物である。backlog-review による RU 化対象。
> 同一実行での他の処置: reject 1件（F-05、20260822T080133Z、解決済みにより即時削除、commit message に却下理由記載）、defer 継続 8件（F-04、F-08〜F-12、F-27、F-34、inbox 残置）。

## F-01: agentdev-textlint-guard Plugin の自己ホスト投影（.opencode/plugins/）が不在

- **category**: 配布投影非対称（自己ホスト投影 stale、横断契約矛盾）
- **target**: `.opencode/plugins/agentdev-textlint-guard/`（ディレクトリ・loader shim `.ts` ともに不存在）
- **evidence**:
  1. 正本 `src/opencode/plugins/agentdev-textlint-guard/` は git tracked で実在（plugin.ts、README.md、rules/、vendor/、tests/）。submodule ではなく通常ディレクトリ
  2. `.opencode/plugins/` には他 4 plugin（agentdev-distribution-boundary-guard / agentdev-gh-tool / agentdev-gh-write-guard / agentdev-third-party-tool）の loader shim（`agentdev-*.ts`）と junction ディレクトリが存在するが、textlint-guard は shim もディレクトリも不存在（inspect-promote 実行時に `ls` で再検証済み）
  3. `docs/designs/local/runtime-package-boundary.md` L270 は「`scripts/self-sync.ps1` は repo-local Plugin を除外しない（自己ホスト投影を維持する）」と規定。L238 も自己ホスト投影の非対称境界を規定。plugin 動的列挙に textlint-guard の除外条件は存在しない
  4. `src/opencode/plugins/agentdev-textlint-guard/README.md` L71 は「本 package は consumer 配布対象（Plugin / Hook 配布種別）であり、repo-local 除外リストへ登録しない」と宣言
  5. DEC-028（文章表層品質の共通実行基盤、accepted）が本 plugin を正規採用。AGENTS.md も同 plugin を textlint 共通基盤の正規参照点として参照。OpenCode は `.opencode/plugins/` depth-1 のファイルのみ自動読み込みするため、現状自己ホスト環境で pre-write Plugin がロードされていない
  6. `docs/designs/quality/textlint-quality-runtime.md` は「空のキャッシュとネットワーク遮断下で Plugin と最終検査が追加操作なしに起動すること」を検証条件とし、self-sync 経路での動作を前提とする
- **severity**: medium
- **confidence**: high（契約文書 3 点〔Design / README / self-sync.ps1〕と実配置の矛盾を inspect-promote 側で直接再検証）
- **source_of_truth**: `docs/designs/local/runtime-package-boundary.md`（投影契約）> `src/opencode/plugins/agentdev-textlint-guard/README.md`（配布宣言）
- **recommended_route**: 対処は (a) `scripts/self-sync.ps1` の再実行による自己ホスト投影の再同期（check モードでは shim 欠落が [DIVERGENCE] 検出対象）、または (b) 意図的除外であれば runtime-package-boundary.md 側への正当化記録の追加。契約 3 点が一致して投影必須を規定し、意図的除外の証拠がないため、契約整合的な処置は (a)。加えて、同種の投影欠落の再発検出のため、配布境界 checker（docs-check 機械検査）への投影対称性検査の追加候補がある（`runtime-package-boundary.md` L273 の repo-local モデル方針〔列挙の乖離は検査側の一般化で解消〕に従う）
- **REQ/DEC 関連**: DEC-028、REQ-052-006（repo-local 判定基準。本 plugin は「ADF 汎用の Plugin」= 配布対象）、REQ-009（自己ホスト投影）
- **notes**: `.opencode/plugins/` 配下は git 管理外のローカル生成物（git ls-files 空）のため、本採用の実現手段はリポジトリ内容の修正ではなく実行環境の再同期（および将来の機械検査拡張）を含み得る

## 分類確定情報（inspect-promote 2026-09-11）

- **分類**: promote（自律確定）
- **判定根拠**: 契約 3 点（runtime-package-boundary.md 投影契約 / plugin README 配布宣言 / self-sync.ps1 動的列挙）と実配置の矛盾を直接再検証し、意図的除外の事実前提が皆無なため対処選択肢は契約整合的な再同期に一意に解決
- **HITL不要理由**: 自律確定判定表（workflow-contracts Design「promote系判断確定とHITL境界」節）8要件を充足。対処選択肢 (a)/(b) は事実で解決され本質的競合が残らない。処置の具体化（再同期実行 / checker 拡張の RU 化）は backlog-review の統合判断に委ねる
- **adversarial-review**: 実施済み（default-on、2系統独立 stream → counter-challenge → convergence → convergence audit、unresolved 争点なし）

## 参照

- 元 finding: `.agentdev/inspect/inbox/inspect-docs-finding-20260911T055548Z.md`（promote 確定により inbox から削除）
- 診断実行: /agentdev/backlog-auto（stage 1）2026-09-11
- 分類実行: /agentdev/backlog-auto（stage 2 inspect 系統）2026-09-11
- 後続: /agentdev/backlog-review での統合
