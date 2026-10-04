---
title: Git 操作の非対話認証の設定規律と失敗検出（実行環境側）
created: 2026-10-04
updated: 2026-10-05
---

# Git 操作の非対話認証の設定規律と失敗検出（実行環境側）

## 知識内容

Git 操作（ドメイン状態永続化の push を含む）は、対話認証の待機で停止・反復しない。実行環境側で非対話実行可能な正規の認証経路を確認してから Git 操作を実行し、認証の失敗、対話要求、タイムアウトを検出した場合は、待機を反復せず失敗、必要な処置、再開条件を報告する。成果契約の正は REQ 文書（`docs/requirements/REQ-102.md`）であり、検出と報告の workflow 側接続は git-worktree Design の「Git 操作の認証失敗検出と実行環境側認証規律との接続」節と `agentdev-git-worktree` の `git-common-procedures.md`「2. ドメイン状態永続化」（push 失敗時の認証起因分類）が担う。本書は実行環境側の設定手順と当環境実績を記録する。

### 当環境の認証経路実績（2026-10-04 時点）

- gh CLI が github.com に対して認証済みである（Git operations protocol は https、credential は OS の keyring に保存）。`gh auth status` で確認でき、トークン値はマスク表示される。
- Git の credential helper として gh CLI の credential 橋（`gh auth git-credential` を `credential.<url>.helper` に接続する方式）を使い、対話入力なしの Git HTTPS 操作が成功した実績がある。
- Git Credential Manager（GCM）が既定の credential helper に設定されている構成も当環境では併存し得る（system / user の gitconfig で確認可能）。
- 認証方式を特定のコマンドに固定しない。上記は当環境での実績の記録であり、環境側で非対話実行可能な正規の経路であれば別方式も採用できる。方式を変更する場合は変更内容と結果を識別できる形で記録する。

### 設定手順（当環境の手順の記録）

1. 人間が `gh auth login` を実行し、gh CLI の GitHub 認証を成立させる。この対話操作は人間が行い、エージェントが偽装・代行しない。
2. `gh auth status` で認証状態と Git operations protocol を確認する。
3. Git の credential helper への接続方式を選択する。
   - gh CLI 橋を使う場合: `gh auth setup-git` を実行し、`credential.https://github.com.helper` に gh の credential 橋が接続されたことを `git config --show-origin --get-all credential.https://github.com.helper` で確認する。
   - Git Credential Manager 等の既存 helper を使う場合: `git config --show-origin --get-all credential.helper` で helper 設定を確認し、保存済み credential により対話入力なしで解決できることを次の手順で確認する。
4. 対話なしの解決を疎通確認する。`printf "protocol=https\nhost=github.com\n\n" | git credential fill` を実行し、出力に `username=` と `password=` の行が存在することのみを確認する。password の値は端末・証跡・ログへ出力せず、行の存在確認（行数カウント等）に限定する。
5. 実 workflow での確認: 認証済み環境で `git push`（ドメイン状態永続化を含む）が対話認証の待機なしに完了することを実測する。完了までの対話入力要求の発生がなければ合格とする。

### 認証不成立時の扱い

- 認証失敗、対話要求、タイムアウトの3分類で識別する。workflow 側の push 失敗時の構造化エラーと分類手順は `agentdev-git-worktree` の `git-common-procedures.md`「2. ドメイン状態永続化」を参照する。
- 認証支援の待機を正常実行として扱わない。認証不成立時は push を失敗として扱い、必要な処置（実行環境側の認証設定の確認・修正、人間による `gh auth login` 等の対話操作）と再開条件（認証設定の修正後に当該 workflow の手順を再実行）を報告する。
- 認証条件を変更しない同一条件での長時間待機を無条件に再試行しない。認証方式を変更して再試行する場合は、変更内容と結果を識別できる形で記録する。
- 資格情報の値（トークン、パスワード等）を解析証拠やログへ出力しない。非対話化は既存の安全な資格情報管理手段の利用であり、認証・アクセス制御の回避ではない。

### push が credential helper 起動後の timeout で失敗する場合の contingency

GCM 有効・トークンが GCM 側に未保存・UI 表示不能なヘッドレス環境では、`git push`（head branch push 等）が credential helper 起動後にプロンプトなしでハングし、90〜300 秒の timeout で失敗することがある（`GIT_TERMINAL_PROMPT=0`・`GCM_INTERACTIVE=never` でも待ちが解除されない）。この場合は `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push ...` のコマンド単位上書きで gh CLI の keyring トークンを使用する。実行前に `gh auth status` で認証済みを確認し、push 出力で refspec と upstream 設定を確認する。恒久設定（gitconfig）の変更は個々の Case では行わない。

### 認証検証の模擬は認証必須操作で行う

public リポジトリへの ls-remote は無効 credential でも匿名読取が成功するため、認証検証にならない。認証経路の確認模擬は push 等の認証必須操作で実施する。匿名読取の成功を認証成立の証拠として扱わない。

### 秘密値不在の検証手順

本知識文書、AGENTS.md「ハーネス選定」の参照行、workflow 側の差分（`git-common-procedures.md`、`issue-operation-safety.md`）は credential 本体（秘密値）を含まない。作成・更新した成果物のファイル集合を対象に、credential 本体を示す文字列パターン（`ghp_` / `gho_` / `ghs_` / `github_pat_` 等の GitHub token プレフィックス、`sk-` 等の provider key プレフィックス、`AKIA` 等の cloud key プレフィックス、base64 風の 40 字以上の長列、高エントロピーなランダム文字列）で検索し 0 件を確認する。コマンド名（`gh auth git-credential` 等の方式名）、変数名（`credential.https://github.com.helper` 等の設定キー名）、手順の記述は対象外である。credential 値そのものを検証の手がかりに使う場合は、値を出力せず行の存在確認に限定する。

## 適用条件

- 本リポジトリの GitHub 運用に接続する実行環境で、Git 操作（push を含む）を実行する場合。
- Git 操作が対話認証の待機で停止した、または停止が疑われる場合の分類と再試行判断。
- 新規実行環境で Git 認証を非対話化する場合の設定と疎通確認。

## 適用対象

- AGENTS.md「ハーネス選定」の非対話認証参照行の維持。
- `agentdev-git-worktree` の `git-common-procedures.md`「2. ドメイン状態永続化」の push 失敗時の認証起因分類から参照される実行環境側の設定・選定規律。
- `agentdev-issue-management` の `issue-operation-safety.md` における gh CLI API 認証の案内と Git 操作の非対話認証の位置づけの区別。

## 根拠

- REQ-102（`docs/requirements/REQ-102.md`、Git 操作の非対話認証。REQ-102-001〜004）。
- git-worktree Design（`docs/designs/skills/agentdev-git-worktree.md`）「Git 操作の認証失敗検出と実行環境側認証規律との接続」節。認証規律の正規所有者が実行環境側であることを規定する。
- Issue #3414（Wave-1: Git 非対話認証規律を実行環境側へ配置し失敗検出を接続する）。
- 当環境の実測（2026-10-04）: `git config --show-origin --get-all credential.helper` による helper 設定確認、`gh auth status` による認証状態確認（keyring、https）、実 workflow の push 完了実績。
- Case #3391・Definition PR #3392（2026-10-05 追記）: push が GCM 起動後 3 回 timeout 失敗 → credential.helper コマンド単位上書きで push 成功・refspec 確認。
- PR #3418（Issue #3414・DEL-3414-1）（2026-10-05 追記）: ls-remote の匿名読取成功により認証検証にならない事象の観測（認証必須操作での模擬の必要性）。

## 関連知識

- [Supervisor 環境での credential 供給ブリッジ（ocenv と opencode bridge shim）](supervisor-bridge-credential-supply.md)。秘密値不在検証の規律（credential 本体を成果物へ含まない）と「実行側が自身の起動コンテキストで取得する」原則の隣接知識。
