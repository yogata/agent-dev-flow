# case-auto/open/close工程間の状態管理・委譲契約設計の整備

## 背景

AgentDevFlow の複数工程パイプライン（req-save→spec-save→case-open→case-run→case-close）において、中間成果物の commit/push タイミング・委譲契約の MUST NOT DO 範囲・squash merge 後の分岐ハンドリングが不明確なため、3件の重大なインシデントが発生した。

1. Epic #979 Wave1 #982: case-auto が req-save/spec-save 成果物を main に commit+push する前に worktree を作成し、sub-agent がファイル状態の矛盾に直面して MUST NOT DO で禁止された REQ/ADR/SPEC ファイルを編集（PR #986 スコープ違反でクローズ）。
2. PR #1012: case-auto 委譲契約の「REQ/ADR/SPEC ファイルを変更しない」MUST NOT DO と case-close G22（SPEC昇格は case-close の責務）が衝突。SPEC昇格を見送り後続課題として残存。
3. PR #1014: case-open が .agentdev/ commit（RU削除）を push せず case-run へ引き継ぎ、squash merge 後にローカル main が分岐し git pull --ff-only が失敗。

## 問題

複数工程パイプラインで以下の3点が未整備:
- 中間成果物（.agentdev/ commit）の即時 push タイミングが手順化されていない
- 委譲契約 MUST NOT DO が機械的状態遷移（SPEC lifecycle draft→accepted 等）まで包括禁止しており、正当な責務（G22）と衝突する
- squash merge 後のローカル先行 commit 検出→内容重複確認→reset 手順が case-close Step 9 にない

## 望ましい変更

1. case-open の .agentdev/ commit（draft/RU 削除等）を即時 push する手順を明文化
2. case-auto 委譲契約 MUST NOT DO を「実質的 SPEC/REQ/ADR 内容編集禁止（lifecycle 状態遷移 draft→accepted は除く）」に精密化
3. case-close Step 9（git pull --ff-only）に squash merge 後のローカル先行 commit 検出→内容重複確認→reset 手順を追加

## 対象範囲

### 対象
- `src/opencode/commands/agentdev/case-open.md`（.agentdev/ commit の push タイミング）
- `src/opencode/commands/agentdev/case-auto.md`（委譲契約 MUST NOT DO の精密化）
- `src/opencode/commands/agentdev/case-close.md`（Step 9 squash merge 分岐ハンドリング）
- `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md`（squash merge 後分岐ハンドリング手順）

### 対象外
- 各コマンドの既存ガードレール・責務の変更（G09 準拠）
- Form Zero（即時ステージ・コミット）自体の変更（既存の手順は維持）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `src/opencode/commands/agentdev/case-open.md` | Step 14/14-1 の draft/RU 削除 commit 後に即時 push する手順を追加 |
| command | `src/opencode/commands/agentdev/case-auto.md` | 委譲契約 MUST NOT DO を「実質的 SPEC/REQ/ADR 内容編集禁止（lifecycle 状態遷移 draft→accepted は除く）」に精密化 |
| command | `src/opencode/commands/agentdev/case-close.md` | Step 9 に squash merge 後のローカル先行 commit 検出→内容重複確認→reset 手順を追加 |
| skill | `src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md` | squash merge 後分岐ハンドリング手順（git log origin/main..HEAD → git diff --stat → git reset --hard origin/main）を追加 |

## 既存対策確認

- **確認結果**: あり（部分的）
- **該当ファイル**: `case-open.md`（G24 Form Zero・即時ステージ・コミット）, `case-close.md`（G06 git pull --ff-only・G22 SPEC昇格）, `git-common-procedures.md`（実行前同期手順）, `worktree-operations.md`（squash merge 後の条件付き -D 許可）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: Form Zero（即時コミット）は定義済みだが即時 push は未規定。MUST NOT DO が状態遷移まで包括禁止。git pull --ff-only のみで squash merge 分岐を想定しない。squash merge 後のローカル先行 commit 検出・reset 手順が未整備。

## 制約

- 既存の Form Zero（即時ステージ・コミット）手順は維持し、push タイミングのみ追加
- G09（既存コマンドの責務変更禁止）に準拠し、手順・ガードレールの追加・精密化のみ
- case-close G22（SPEC昇格は case-close の責務）の定義は維持し、委譲契約側を精密化
- squash merge 後の reset は「origin/main が strict supersetであること」を検証後のみ実行（内容ロス防止）

## 受け入れ条件

- [ ] case-open の draft/RU 削除 commit 後に即時 push する手順が Step 14/14-1 に追加されている
- [ ] case-auto 委譲契約 MUST NOT DO が「実質的 SPEC/REQ/ADR 内容編集禁止（lifecycle 状態遷移 draft→accepted は除く）」に精密化されている
- [ ] case-close Step 9 に squash merge 後のローカル先行 commit 検出→内容重複確認→reset 手順が追加されている
- [ ] git-common-procedures.md に squash merge 後分岐ハンドリング手順が追加されている

## 元learning item / 根拠

- **要約**: 複数工程パイプラインで中間成果物の commit/push タイミング・委譲契約 MUST NOT DO 範囲・squash merge 後分岐ハンドリングが不明確
- **根拠**: (1) Epic #979 #982 で case-auto が push 前に worktree 作成し sub-agent スコープ違反 (2) PR #1012 で MUST NOT DO と G22 SPEC昇格が衝突 (3) PR #1014 で未 push commit が squash merge と重複し git pull --ff-only 失敗
- **再発条件**: (1) case-auto が中間成果物を push せず worktree 作成 (2) MUST NOT DO が状態遷移まで包括禁止 (3) case-close Step 9 が squash merge 分岐を想定しない
- **横展開可能性**: 高。req-save→spec-save 等のコマンド間でローカル commit を引き継ぐ工程全般で発生し得る

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: Epic #979 #982, PR #986, PR #1012 Issue #1011, PR #1014 Issue #1013
