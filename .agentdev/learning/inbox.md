# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-07: 配布対象 SKILL.md の記載例に具体的な REQ/TS 行 ID を使うと distribution-boundary gate の concrete-id / unclassified-entry 違反になる

- **問題事象**: agentdev-issue-management/SKILL.md への記載粒度ガイドライン記載例で具体的な行 ID（REQ-057-003、TS-012）を使用した結果、case-close E4-1 配布依存境界 最終 gate（check_distribution_boundary.ts --profile source）で新規違反 2件（concrete-id、unclassified-entry）を検出し、PR マージが中止・blocked 再作業となった。
- **発生局面**: レビュー（case-close E4-1 最終 gate）。Epic 2652 / Issue 2662 / PR 2675。
- **検知方法**: case-close E4-1 gate の delta 実行（main baseline との差分）で新規違反 2件として機械検出。
- **根本原因**: 配布ソース面の本文に digits を持つ具体 ID 例を記載すると GENERIC_ID_PATTERN 非合致として concrete-id / unclassified-entry に分類される。記載例執筆時に検出器の ID 分類規則（プレースホルダ形式は digits を持たず許容）を考慮していなかった。
- **自律対応内容**: 記載例をプレースホルダ形式（REQ-{NNNN}-{NNN}、TS-{NNN}）へ汎用化し、gate 再実行で新規違反 0件を確認してマージ（commit f42bf6f6）。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（distribution-boundary Design の既定規則への準拠欠缺に起因。Design 変更不要）
- **横展開観点**: 配布対象 command/skill ソース（src/opencode/**）へ記載例・サンプルを追加する全ケース（case-run 委譲、docs_chore 系 Issue）に共通。
- **再発条件**: 配布ソース面の本文への digits 付き具体 ID（REQ-XXXX-XXX、TS-XXX、NG-XXX 等）の記載例追加。
- **予防策候補**: 配布対象ファイルへの記載例は最初からプレースホルダ形式（{NNNN} 系トークン）で書く。具体 ID の実例が必要な場合は PR 作成前に check_distribution_boundary.ts --profile source を前置実行する。
- **想定反映先**: learning-promote での分類後、agentdev-skill-authoring の記載例ガイドライン注記、case-run 検証手順への前置 gate 実行注記。
- **関連**: PR 2675 本文 Findings / Capture候補 セクション、Issue 2662、Epic 2652
- **タグ**: #distribution-boundary #skill #example #placeholder #case-close #verification

---

## 2026-09-07: ng-baseline エントリ削除は live suppression を巻き込まない。削除後に check_integrity で delta 0 を検証する

- **問題事象**: ng-baseline.json の解消済みエントリ削除作業で、provenance が同一（issue-2372-ir065-initial-baseline）の live suppression（.agentdev/extensions 3件、rewrite-patterns.md の obsolete-vocabulary 計4件）まで一括削除され、demote 解除が破綻する状態で PR 化された。case-close 側の検証で delta が 0 にならないため blocked 再作業となり、live 4件の復元（commit c74d9c30）が必要だった。
- **発生局面**: 実装（case-run 委譲）。Epic 2652 / Issue 2659 / PR 2672。
- **検知方法**: case-close 側での check_integrity 再実行・main 差分比較（TS-009 の demote 解除検証）。
- **根本原因**: 「解消済みエントリ」の判定を provenance 系の一括処理で行い、「当該エントリの violation が現在も発生しているか（live か）」の個別確認を経ていなかった。
- **自律対応内容**: live suppressions 4件を復元し、最終状態でエントリ差分（573 → 555、削除 18 / 追加 0）と check_integrity 新規 NG 0件（delta 0）を確認してマージ。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（integrity-contracts.md L359 の baseline 再計算手順・ratchet 運用の適用欠缺。Design 変更不要）
- **横展開観点**: ng-baseline / baseline 系ファイルのエントリ削除・再生成を伴う全作業（ACT-DESIGN-003 運用、baseline 再計算 PR）に共通。
- **再発条件**: baseline エントリ削除時に violation 発生有無を確認せず provenance・check 種別単位で一括削除する運用。
- **予防策候補**: baseline エントリ削除の前に、当該エントリの violation が現行ツリーで still-live かを確認（live は残す）。削除後は PR 化前に check_integrity を再実行して新規 NG 0件（delta 0）を確認する。
- **想定反映先**: learning-promote での分類後、repo-agentdev-integrity SKILL.md の baseline 運用手順注記、integrity-contracts.md baseline 再計算手順の運用注記。
- **関連**: PR 2672 本文、Issue 2659、Epic 2652、docs/designs/integrity/integrity-contracts.md
- **タグ**: #baseline #ng-baseline #integrity #demote #case-run #verification

---

## 2026-09-07: Bun.YAML 依存 checker は node 安定実行経路で実行不能。bun spawnSync の stdout 分離取得で証跡を確保する

- **問題事象**: checker 実行契約の安定実行経路（node --experimental-strip-types）で check_distribution_boundary.ts を実行したところ、`Bun.YAML.parse` 依存により "fail-closed: distribution targets file is not valid YAML"（exit 2）で失敗した。check_extensions.ts 等の同系 checker も同じ Bun 依存を持つ。また traceability check（scripts/src/check.ts）は `bun run <相対パス>` で Module not found（exit 1）になり、スクリプト絶対パス指定で解決した。
- **発生局面**: 検証（case-close STEP-3 配布依存境界 最終 gate、targeted docs guard、トレーサビリティ独立再検査）。Epic 2653 / Issue 2664 / PR 2677。
- **検知方法**: node での checker 実行が空 stdout + exit 2 で失敗し、stderr の fail-closed メッセージと checker ソース（distribution-boundary-rules.ts の Bun.YAML.parse）を突合して原因特定。
- **根本原因**: checker 実行契約の安定実行経路は Windows + bun の process.exit stdout 消失対策として node 経路を標準とするが、Bun.YAML 等 Bun ランタイム API に依存する checker は node では実行そのものが不可能。契約上の標準経路と checker 実装のランタイム依存の間に前提のずれがある。
- **自律対応内容**: bun を spawnSync で起動し status/stdout を分離取得、stdout を UTF-8 明示 writeFileSync で退避する wrapper を用いて全 checker を実行。JSON レポート取得と非ゼロ exit の証跡保持を両立した。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（checker 実行契約の運用注記レベル。契約文書の変更必要性は learning-promote で判断）
- **横展開観点**: repo-agentdev-integrity 配下 checker、agentdev-traceability scripts を case-close/case-run で実行する全ケースに共通。
- **再発条件**: Bun ランタイム API（Bun.YAML 等）に依存する checker を node 経路で実行する場合、または scripts 配下に独自 package.json を持つスクリプトを相対パスの `bun run` で起動する場合。
- **予防策候補**: checker 実行時、Bun 依存の有無（Bun.YAML 等 import）を確認し、Bun 依存 checker は bun spawnSync wrapper 経由で stdout 証跡を取得する。scripts 配下のスクリプトは絶対パス指定で起動する。
- **想定反映先**: learning-promote での分類後、checker 実行契約（checker 実行契約と検出基盤規則 Design）の安定実行経路節への Bun 依存 checker 注記。
- **関連**: PR 2677、Issue 2664、Epic 2653、.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-rules.ts
- **タグ**: #checker #bun #stdout #windows #case-close #verification

---

## 2026-09-08: bun install は bun.lock の root workspace name を書き換えない。package rename 後は lock の name フィールドを手動更新する

- **問題事象**: package rename（agentdev-gh-cli-local-runner → agentdev-gh-local-runner）後に `bun install` を実行しても、bun.lock 内 `workspaces[""].name` は旧名のまま残存し、依存解決のみが再検証される。
- **発生局面**: 実装（case-run 委譲・RA-002 package 名統一）。Epic 2681 / Issue 2683 / PR 2684。
- **検知方法**: rename 後の bun.lock 残存内容確認（git grep agentdev-gh-cli-local-runner）。
- **根本原因**: bun install v1.3.6 の lock 更新は依存グラフを対象とし、lock の root workspace name フィールドは package.json との自動同期対象外。
- **自律対応内容**: bun.lock の name フィールドを手動更新して旧 package identifier の現行利用ゼロ（AC-05/26）を達成。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（bun 運用知見。契約文書の変更必要性は learning-promote で判断）
- **横展開観点**: package rename を伴う全作業（ディレクトリ改名と package 識別子統一の同時実施ケース）に共通。
- **再発条件**: package.json の name 変更後に bun install のみで bun.lock 同期を完了判定する場合。
- **予防策候補**: package rename 後は bun.lock 内 root workspace name を grep で確認し、旧名残存時は手動更新する。TS-002 系の package 識別子検証に bun.lock の name フィールド確認を含める。
- **想定反映先**: learning-promote での分類後、runtime-package-boundary.md の link mode 更新運用または REQ-009 系検証手順への注記候補。
- **関連**: PR 2684、Issue 2683、Epic 2681、src/opencode-local/agentdev-gh/bun.lock
- **タグ**: #bun #bun-lock #package-rename #case-run #verification

---

## 2026-09-08: bun の stdout を PowerShell リダイレクト（*>）で受けると日本語混じり JSON が符号化破損する。checker 証跡は spawnSync + fs.writeFileSync(utf8) で取得する

- **問題事象**: bun で checker を実行し、その stdout を PowerShell の `*>` リダイレクトでファイル化すると、日本語混じり JSON が符号化破損し JSON.parse が破綻する。配布依存境界 gate の JSON レポート証跡が取得できなくなる。
- **発生局面**: 実装（case-run 委譲）。Epic 2686 / Issue 2687 / PR 2691。
- **検知方法**: リダイレクト生成ファイルの JSON.parse 失敗と、元 stdout の直接取得成功の対比で検知。
- **根本原因**: PowerShell リダイレクトは既定エンコーディング（cp932 系）で再符号化するため、UTF-8 の stdout バイト列が破損する。AGENTS.md 既知事象（PowerShell 標準 cmdlet 経由の既存 UTF-8 ファイル一括読み書き回避）と同根。
- **自律対応内容**: checker 出力の証跡取得を spawnSync（encoding buffer）+ stdout.toString("utf8") + fs.writeFileSync("utf8") の運用へ統一し、JSON レポートの取得と非ゼロ exit の証跡保持を両立させた。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（checker 実行契約「checker コマンドの stdout 退避形式」で既に規定済みの運用の再確認）
- **横展開観点**: Windows 環境で bun/node 系 checker の JSON 出力を証跡化する全ケース（case-close E4-1 gate、STEP-3 検証群、case-run STEP-S5）に共通。
- **再発条件**: checker stdout を PowerShell リダイレクトや標準 cmdlet でファイル化する場合。
- **予防策候補**: checker 実行は必ず spawnSync 系 wrapper で stdout を UTF-8 明示 writeFileSync する。`>` / `*>` リダイレクト・PowerShell 変数格納は stdout 証跡に使わない。
- **想定反映先**: learning-promote での分類後、checker 実行契約の stdout 退避形式節への運用注記強化候補。
- **関連**: PR 2691、Issue 2687、Epic 2686、.opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts
- **タグ**: #windows #powershell #encoding #checker #case-run #case-close #verification

---

## 2026-09-08: issue_update/issue_reopen の追跡軸保持 VERIFY は実行前状態を必要とするため runner 応答 payload へ before を運ばせる。runner↔spec 内部契約拡張は GitHub 版と Local 版へ同時反映する

- **問題事象**: spec の verify は実行後にしか動けないが、追跡軸保持 VERIFY（role/kind/trackingState 完全一致・要求通常ラベル包含）の照合基準は「実行前状態」が必要。runner 応答 payload に before を運ばせる接合とした際、契約拡張を両版へ同時反映しないと、未対応側の VERIFY が一律 verification-incomplete になる。
- **発生局面**: 実装（case-run 委譲・RA-003 設計判断）。Epic 2686 / Issue 2687 / PR 2691。
- **検知方法**: VERIFY 照合基準と実行タイミングの不整合の設計時発見（fail-closed 動作として実装側で捕捉）。
- **根本原因**: VERIFY は副作用後の読み戻しで判定する構造上、実行前状態を自己保持できない。runner が応答へ before を含めることが照合の前提になる。
- **自律対応内容**: GhRunnerReply 成功側へ before（state、labels、role、kind、trackingState、closeReason の正規化済み導出値）を必須化し、issue_update/issue_reopen の VERIFY を before 基準で照合するよう実装。Local 版（runner-local.ts）へは Wave 2（#2688）まで最低限の型整合のみ適用（fail の failureClass、before、pr_read body、新操作5種は operation-failed スタブ）。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: runner↔spec 内部契約の設計判断。Design への記載は未保存（PR 本文 Design 確定候補として design-save 再実行提案済み）
- **横展開観点**: 実行前状態を照合基準に使う VERIFY を追加する全ケース（追跡軸保持以外の不変条件保護系 VERIFY）に共通。
- **再発条件**: runner↔spec 内部契約を拡張する際に GitHub 版のみへ反映する場合。
- **予防策候補**: 内部契約の拡張は GitHub 版と Local 版へ同時に反映する（Local 版が実装完了するまでの間は最低限の型整合を維持し、VERIFY は fail-closed で verification-incomplete になることを許容する）。
- **想定反映先**: learning-promote での分類後、custom-tool-contracts.md（before 契約の Design 反映。design-save 再実行提案と一体）。
- **関連**: PR 2691、Issue 2687、Epic 2686、Issue 2688（Wave 2 Local 版等価実装）
- **タグ**: #agentdev-gh #verify #runner #spec #before #fail-closed #case-run

---

## 2026-09-08: agentdev-traceability check の --req 範囲構文（REQ-011-022..030 形式）は範囲文字列がリテラル reqId として報告される。個別カンマ指定を正として使う

- **問題事象**: `check.ts --req REQ-011-022..030` の範囲構文を渡すと、missing-implementation 検査で範囲文字列全体がリテラル reqId として報告される（存在しない要求行として扱われる）。個別カンマ指定（REQ-011-022,REQ-011-023,...）では正しく解決されて pass する。
- **発生局面**: 検証（case-close トレーサビリティ独立再検査）。Epic 2686 / Issue 2687 / PR 2691。
- **検知方法**: 範囲構文での check 実行結果（リテラル reqId 報告）と個別指定での実行結果（pass）の対比。
- **根本原因**: check の --req 引数解析が `..` 範囲形式を範囲展開せずリテラル ID として扱う。
- **自律対応内容**: 個別カンマ指定の実行結果を正として採用し、範囲構文の使用を避けた（前回 case-close の対応記録コメント備考へ記録、本 learning へ回収）。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（agentdev-traceability の引数解析改善候補。実装変更は後続判断）
- **横展開観点**: agentdev-traceability check を case-close STEP-3 / QG-4 独立再検査で実行する全ケースに共通。
- **再発条件**: --req へ `..` 区切りの範囲形式を渡す場合。
- **予防策候補**: check の --req は個別カンマ指定で渡す。範囲形式の対応は agentdev-traceability 実装側の改善候補として記録する。
- **想定反映先**: learning-promote での分類後、agentdev-traceability SKILL.md の check 呼出手順注記、case-close/case-run の check 実行手順への注記候補。
- **関連**: PR 2691、Issue 2687、Epic 2686、src/opencode/skills/agentdev-traceability/scripts/src/check.ts

---
