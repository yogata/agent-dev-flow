# bash heredoc のバックスラッシュ転送層消費の追補（quoted heredoc でも保護されない）

## 背景

case-open STEP-4 の artifact_actions 一括適用スクリプトを bash heredoc（quoted 'EOF'）で temp へ書き込んだところ、JS 正規表現リテラルのバックスラッシュ（`\d`、`\\`、`\s`）が転送層で消費され SyntaxError が 2 回発生した（Root Case #3407・Definition PR #3408）。既存の破損回避節・知識文書は argv escape 解釈と heredoc 打ち切りの2機構のみを記載し、本機構は未記載である。

## 問題

harness の bash コマンド転送層が heredoc 内容のバックスラッシュをエスケープ解釈して除去する。shell エスケープではなく転送層の処理のため quoted heredoc でも防げない。バックスラッシュを含む内容を heredoc で書き込む全工程で同種の破損が生じ得る。

## 望ましい変更

worktree-operations.md「shell inline・heredoc に起因するコンテンツ破損の回避」節および docs/knowledge/windows-git-bash-inline-content-corruption.md へ第3の機構として追記する: 「quoted heredoc でもバックスラッシュは転送層で保護されない。バックスラッシュを含むスクリプト・設定ファイルは heredoc 経由で書き込まず、バックスラッシュフリー実装（String.fromCharCode(13)、文字クラス内バックスラッシュなし正規表現、行配列走査）または base64 等の中間エンコード経由で伝達する」。

## 対象範囲

### 対象

- `src/common/skills/agentdev-git-worktree/references/worktree-operations.md`（L249-253 破損回避節。2026-10-05 実測: 2機構のみ記載）
- `docs/knowledge/windows-git-bash-inline-content-corruption.md`

### 対象外

- harness 側の転送層仕様変更
- Write ツール・edit ツールの運用（現行維持）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-git-worktree/references/worktree-operations.md | 破損回避節への第3機構（quoted heredoc のバックスラッシュ非保護）追記 |
| knowledge | docs/knowledge/windows-git-bash-inline-content-corruption.md | 同機構と回避（バックスラッシュフリー実装・中間エンコード）の追記 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: worktree-operations.md 破損回避節（2技法）・windows-git-bash-inline-content-corruption.md（2機構）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 「quoted heredoc でもバックスラッシュは保護されない」機構と回避策が未記載

## 制約

- guard の fail-closed 維持・ブロック時は標準手段へ切替する原則は現行のまま

## 受け入れ条件

- [ ] 第3の破損機構と回避策が節・知識文書の双方へ追記される

## 元learning item / 根拠

- **要約**: bash heredoc 経由のスクリプト書込みでバックスラッシュが転送層で消費される（1件）
- **根拠**: Root Case #3407・Definition PR #3408（SyntaxError 2回 → バックスラッシュフリー実装で 75 actions 全件成功）
- **再発条件**: bash heredoc 経由でバックスラッシュを含むファイル内容を書き込む場合
- **横展開可能性**: 検査スクリプト・一時ツール作成の全工程（Windows に限らず転送層を持つ環境）

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
