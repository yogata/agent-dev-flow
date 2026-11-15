# Windows パス形式・計測規律の knowledge 補強

## 背景

Windows 環境で bash・Windows バイナリ（git/bun/node）間のパス形式解釈差による見かけの失敗が 4 変異で反復した（Case #3967 cygpath なし TEMP・#3972 退避リダイレクト相対パス・#3988 bun install --cwd 相対パス ENOENT・#4054 backslash 形 cwd での bun run モジュール解決失敗）。既存知識 windows-checker-msys-path-argument.md は checker --root への MSYS 形式指定破損のみを対象とし、本 4 変異は未収録

## 問題

(1) bash の POSIX パス（/tmp 等）を git/bun へ直接渡すと Windows バイナリ側で誤解釈される（cygpath -m による mixed 形式変換の前置が既存知識に不在）(2) bun install --cwd の相対パスが本環境で機能せず絶対パス指定が必要（環境差注記が不在）(3) backslash 形 cwd での bun run モジュール解決失敗（forward slash cwd + 直接実行形式が安定）の規律が不在 (4) 検査の stdout/stderr 退避ファイルのリダイレクト先を cwd 相対でなく絶対パスで指定する規律が不在

## 望ましい変更

既存 knowledge windows-checker-msys-path-argument.md への統合追記または新規 knowledge 文書として、cygpath -m 変換前置・bun install --cwd 相対パス失敗時の絶対パスフォールバック・backslash 形 cwd の問題と forward slash + 直接実行形式の安定経路・リダイレクト先絶対パス規律を収録する

## 対象範囲

### 対象

- docs/knowledge/（既存文書への統合追記または新規文書・req-define で選択）

### 対象外

- cygpath・bash・bun・node 自体の仕様変更対応
- windows-powershell-bulk-io-corruption.md（PowerShell 系の別系統問題）の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/windows-checker-msys-path-argument.md（統合追記の候補） | cygpath 前置・bun install --cwd 絶対パスフォールバック・backslash cwd・リダイレクト先絶対パスの変異を追記 |
| knowledge | docs/knowledge/ 新規文書（統合範囲が大きい場合の候補） | Windows パス形式の解釈差変異集（MSYS・cygpath・相対/絶対・backslash・リダイレクト） |

## 既存対策確認

- **確認結果**: 対策あり（部分的）
- **該当ファイル**: docs/knowledge/windows-checker-msys-path-argument.md（--root MSYS 破損と backslash 引数 escape を対象・全文確認実測）・docs/designs/integrity/checker-execution-contracts.md L196-198（パス引数の絶対パス構成標準は実在）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: cygpath 前置・bun install --cwd 相対パス・backslash 形 cwd・リダイレクト先絶対パスの 4 変異が既存文書に不在（grep・全文確認実測）

## 制約

- 既存知識（windows-checker-msys-path-argument.md・windows-git-bash-inline-content-corruption.md〔node -e エスケープ・別クラス〕・checker 契約 L196-198）との重複を避け差分のみ収録する
- 環境差の一般化は実測環境（Windows・bun 1.3.6）の範囲に限定し全 Windows 版への一般化を避ける

## 受け入れ条件

- [ ] 4 変異（cygpath・bun install --cwd 相対・backslash cwd・リダイレクト絶対パス）が knowledge として収録されていること
- [ ] 既存知識との重複なく相互参照が整備されていること
- [ ] 後続の bash・Windows バイナリ連結工程で同型の見かけの失敗が低減されること

## 元learning item / 根拠

- **要約**: Windows 環境の bash・Windows バイナリ間のパス形式解釈差による見かけの失敗が 4 変異で反復
- **根拠**: windows-checker-msys-path-argument.md 全文確認実測（対象外変異）・checker-execution-contracts.md L196-198 確認実測（絶対パス標準のみ）・4 変異の Case 観測（#3967/#3972/#3988/#4054）
- **再発条件**: bash から Windows バイナリへパスを直接渡す実行
- **横展開可能性**: bash と Windows バイナリを連結する全経路（検証・機械工程・委譲）で適用可能な環境運用知識

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, chore
- **関連Issue**: なし
