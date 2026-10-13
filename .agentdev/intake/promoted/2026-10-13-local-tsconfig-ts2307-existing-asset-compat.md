# local tsconfig の existing-asset-compat.test.ts 誤 import (TS2307) を是正する

## 観測内容

DEL-3670-RUN 受領検証 TS-003 (Case #3670) で、`src/common/tools/agentdev-gh/local/` の typecheck (`tsc --noEmit`) が 1 エラーを報告した。エラーは `tests/existing-asset-compat.test.ts` L17 の `import ... from "../../../runner.ts"` が解決できない (TS2307)。正しい相対パスは `../../runner.ts`。当該ファイルは origin/main 上にも存在し (最終変更 a15f55df)、main 由来の pre-existing 破損である。type-only import のため bun runtime には影響せず、bun test (46 pass / 0 fail) は正当に成立している。

### 発生時のスコープ判断

本 Case (#3670、B15/REQ-009-033) の対象範囲はローカル版 pr_merge のマージ取り込み保証であり、当該テストファイルは変更対象外である。19cfa730 (`tests/four-combination-shared.ts` の import パス修正) と同種の main 由来破損だが、そちらは本 PR の typecheck 合格の前提として同一 PR 内で修復された一方、本件は PR 修正範囲外として区別記録した。

## 影響

`src/common/tools/agentdev-gh/local/` package の `tsc --noEmit` が常に 1 エラーで fail する。typecheck を品質ゲートや CI に組み込む際に、真の型エラーの検出をこの既存エラーが掩い、fail-closed 判定のノイズになる。runner コード自体の型検査は tsconfig の対象外読み飛ばし等がない限り阻害されないが、gate として使う状態ではない。

## 課題（backlog-review で決めること）

- 修正方法: L17 の import パスを `../../runner.ts` へ 1 行修正するだけで成立するか、それ以外の構造問題 (テスト資産配置) を含むか
- local package と agentdev-gh ルート package の tsconfig 二重管理の扱い (統合・参照共有の可否)
- typecheck を local package の品質ゲートに組み込むタイミング

**注記（adversarial-review accepted finding）**: 本 item は「L17 の import パス 1 行修正」を主スコープとする。tsconfig 二重管理の統合議論は範囲拡大にあたるため、後段（RU 化・要件化時）で別扱いとすること（別 item 化は後段判断）。

## 関連（既存要件・正規成果物・証跡）

- 関連: PR #3669 本文 Findings セクション (pre-existing 区別記録)、同種修正の実績 commit 19cfa730
- 関連要件: REQ-009-033（Case #3670 の対象範囲）

## 根拠

- 観測元: Case #3670、PR #3669 (DEL-3670-RUN 受領検証 TS-003、2026-10-13)
- 証拠: `C:/Users/ogatay/AppData/Local/hermes/cache/scratch/rev-b15-r2/ts003-observations.md` (local tsconfig typecheck exit 2、TS2307 1 件)。agentdev-gh ルート tsconfig は同時刻の typecheck で 0 エラー (exit 0)
- 再観測: Case #3671、PR #3672 (DEL-3671-CLOSE capture、2026-10-13)。base commit (ae2802f7) と merge 後 main (321ebf3e) の両方で L17 誤 import が未修復のまま再確認。PR #3672 本文 Findings でも「別途修正候補」と区別記録。観測元 2 Case 化により再現性が強化された
