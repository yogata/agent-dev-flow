# worktree・実行形態の環境差に由来する検査失敗の帰属確認と main 等価再現（spec 候補）

## 背景

Epic #2134〜#2189 の case-run/case-close 運用で、git worktree 内の検査・テスト実行時に「自変更由来か環境差か」の帰属が一見で判定できない失敗が反復した。根本的な原因は、git 管理外リソース（`.opencode/` junction、node_modules）が git worktree へ複製されないことと、フルスイートと単体実行で結果が変わるテストの存在である。前回 learning-promote（2026-08-15）では living pool の同根2エントリ（lint_skills.ts ジャンクション一時作成、README 参照 fallback）を単発として未分類維持していたが、本 run の living pool 再評価で今回の4エントリと同根（根本原因・再発条件・予防策が同一）と判定し、6件の反復としてクラス化した。

## 問題

worktree 環境での検査失敗の帰属確認手順と main 等価環境の再現手順が、SPEC・検証手続のいずれにも規定されていない。このため (a) 実行形態差でしか発生しない既知失敗を自変更由来と誤認して修正対象化するリスク、(b) junction 未伝播環境で checker が false fail/warning を出し検証が停止するリスク、(c) node_modules 未伝播でテストを実行できないリスク、が各 Epic で反復する。

## 望ましい変更

1. 検証失敗の帰属確認を「単体再実行」「base・main 再現」の二段階手順として検証手続へ明文化する
2. worktree の `.opencode/skills|commands` へ一時 junction を作成して main repo 等価環境を再現する手順（検証後クリーンアップ対象）を明文化する
3. junction 依存検査は src 側スクリプト（`--profile source` 等）による代替経路と、`bun install --cwd` 前置による node_modules 伝播対策を worktree 検証手順へ明記する
4. worktree での warning 評価時に「main では発生しない環境差異 warning」の切り分け（main 再実行）を規定する

## 対象範囲

### 対象

- `docs/specs/skills/agentdev-git-worktree-test-fallback.md`（draft。構造系テスト fallback の対象拡張: checker 実行時の環境差扱い）
- case-run / case-close の worktree 検証手順（環境差切り分け・一時 junction・代替経路）
- `src/opencode/skills/agentdev-git-worktree/`（検証手順への反映候補）

### 対象外

- Linux/macOS 環境（junction 未伝播が発生しない）
- junction 構造自体の変更（install スクリプト設計は対象外）
- 個別 checker の実装修正（checker 側の fallback 実装は各 checker の Issue 範囲）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/skills/agentdev-git-worktree-test-fallback.md` | fallback 対象へ checker 実行時の環境差 warning 切り分け・一時 junction 手順を追加 |
| skill reference | case-run / case-close の検証手順 references | 帰属確認二段階手順・src 側代替経路・`bun install --cwd` 前置を明記 |
| skill | `src/opencode/skills/agentdev-git-worktree/` | worktree 検証時の stash・junction 運用注意（クラス6 成果物と連携） |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `docs/specs/skills/agentdev-git-worktree-test-fallback.md`（draft。「構造系テストの src/ fallback 実行」「junction 依存 checker の skip」を規定）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 環境差 warning の切り分け手順（main 再実行）、check_integrity 向け一時 junction 再現、node_modules 未伝播の代替手順（src 側スクリプト + `bun install --cwd`）が SPEC・手順のいずれにも未規定。同根の intake item（intake-2026-08-16-ou002-ir035-worktree-junction-fallback、intake-2026-08-16-ou007-checkextensions-worktree-junction-failure）は checker 側 fallback を管理中であり、backlog-review で統合前提

## 制約

- 一時 junction は gitignore 対象であり worktree への残置・削除の扱いを明確にする（PR #2188 は残置運用）
- テストコード側の projection/source fallback 実装は REQ-018 範囲であり本成果物と重複させない

## 受け入れ条件

- [ ] 帰属確認の二段階手順（単体再実行・base/main 再現）が検証手順に明記されていること
- [ ] worktree での check_integrity 等 junction 依存検査の main 等価再現手順（一時 junction）が規定されていること
- [ ] junction 未伝播環境の代替検証経路（src 側スクリプト、`bun install --cwd`）が規定されていること
- [ ] 環境差 warning と実違反の切り分け基準（main 再実行による比較）が規定されていること

## 元learning item / 根拠

- **要約**: worktree・実行形態の環境差（junction 未伝播・node_modules 未伝播・実行順序依存）に由来する検査失敗の帰属確認と main 等価再現の手順化
- **根拠**: (1) PR #2149（OU-004）: worktree フルスイートで自変更と無関係の失敗が混在、単体再実行と `git stash push -- <path>` による base 再現の二段階で帰属確認してから修正判断。(2) PR #2177（OU-010）: worktree の check_integrity で ir035 warning 4件が main では 0件の環境差異と判明、main 再実行で切り分け。(3) PR #2188（OU-004）: worktree の `.opencode/skills|commands` へ一時 junction 作成で main repo 等価環境を再現し exit 0 確認。(4) PR #2197（OU-0003）: junction 未伝播で check_extensions.ts 等が実行不能、src 側 check_distribution_boundary.ts --profile source と bun install --cwd 後の bun test で代替検証。【living pool 由来（prune 済み）】(5) lint_skills.ts を worktree で実行するため必要スキルのみの一時ジャンクション作成パターン（PR #1551）。(6) worktree ジャンクション未伝播環境での README 参照 fallback 実装パターン（PR #1553。commands_e2e.test.ts の projection → source fallback 解析）
- **再発条件**: Windows + junction 環境で worktree 内の検査・テスト実行、フルスイートと単体実行で結果が変わるテストが存在する環境での検証
- **横展開可能性**: 中程度。worktree + junction + bun の Windows プロジェクト全般

## 推奨Issue分類

- **分類**: chore（SPEC・検証手順の整備。checker 実装変更は派生 Issue）
- **推奨ラベル**: documentation, windows, worktree, verification
- **関連Issue**: #2149, #2177, #2188, #2192（いずれもクローズ済みの発生源）
