# ハーネス guard による project root 外・一時領域書込みブロックの運用指針整備

## 背景

project root 外パスへの書込みを fail-closed で拒否する guard 群（agentdev-textlint-guard、distribution-boundary-guard、配布依存境界 pre-write gate）と、正規の作業経路（AGENTS.md 推奨一時ディレクトリ、一時 worktree）の間に運用指針の不整合がある。guard は設計どおり動作しているが、正規回避手段が文書化されておらず、作業者はブロックされるまで推奨パスが使えないことを知り得ない。

## 問題

- AGENTS.md は `C:\WINDOWS\TEMP\opencode` を pre-approved の一時作業ディレクトリとして推奨する一方、write/edit ツールで同パスへ書き込むと agentdev-textlint-guard が一律 fail-closed ブロックする（Case #2898、2026-09-17）
- 一時 worktree（git 管理下の正規リポジトリ複製）内のファイル編集も project root 外パス検査でブロックされる（Case #2903、PR #2910）
- 配布ソース面パス列挙を含む補助ファイルの Write や、src 参照を含む一時検証ドライバの TEMP 書出しも配布依存境界系 gate にブロックされる（deferred L1004/L1889/L1364 の同種事象）
- ブロック時の正規回避手段（node writeFileSync 明示 utf8、worktree 内配置、一時ファイル不要化）が集約文書化されていない

## 望ましい変更

- AGENTS.md の一時ディレクトリ推奨に「write/edit ツールは不可、node writeFileSync（明示 utf8）経由」の注記を追加
- worktree 配置先と worktree 内編集の標準手段（node 明示 UTF-8 I/O または project root 配下 worktree）の明記
- guard 種別ごとのブロック条件と回避手段を集約した知識文書の作成（docs/knowledge/ 候補）

## 対象範囲

### 対象

- AGENTS.md 行動規範（一時ディレクトリ推奨記述）
- worktree 運用手順（agentdev-git-worktree）
- guard 種別ごとの回避手段の集約知識

### 対象外

- guard の fail-closed 設計自体の変更（意図された安全機構のため維持前提）
- guard 側への許容パス設定導入（別途設計判断）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| AGENTS.md | AGENTS.md | 一時ディレクトリ推奨への write ツール不可・node 経由の注記 |
| knowledge | docs/knowledge/（新規知識文書候補、windows 系知識との隣接） | guard 種別ごとのブロック条件と正規回避手段の集約 |
| 配布skill | src/opencode/skills/agentdev-git-worktree/ | worktree 配置先と worktree 内編集の標準手段の明記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: AGENTS.md（node 明示エンコーディング経路の規定）、docs/knowledge/windows-powershell-bulk-io-corruption.md（cp932 破損回避の node 標準手段）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: AGENTS.md の一時ディレクトリ推奨と guard 契約の不整合が未解消。guard 種別ごとの回避手段の集約なし。deferred の同種事象3件（L1004: Write ツールのリポジトリ外 temp 書込みが distribution-boundary-guard でブロック / L1889: 配布ソース面パス列挙を含む補助ファイルの Write が pre-write gate でブロック / L1364: src 参照を含む一時検証ドライバの TEMP 書出しも配布依存境界 guard がブロック）を統合評価対象とする（adversarial-review A-2）

## 制約

- guard の fail-closed 挙動は正の設計であり、緩和ではなく運用指針側の整備で対応する
- node 経由の回避は cp932 破損回避規約（明示 utf8）と整合させる

## 受け入れ条件

- [ ] AGENTS.md の一時ディレクトリ推奨に write/edit ツール不可の注記がある
- [ ] 一時領域書込みが必要な作業者がブロック前に正規手段を選べる知識が集約されている

## 元learning item / 根拠

- **要約**: guard による project root 外・一時領域書込みブロックと正規作業経路の運用指針不整合
- **根拠**: Case #2898（横断依存検査の入力 JSON を AGENTS.md 推奨一時ディレクトリへ write しようとしてブロック、node 経由で解消）、Case #2903/PR #2910（一時 worktree 内編集がブロック、node writeFileSync で迂回）+ deferred 同種事象3件（L1004/L1889/L1364、guard 主体違いの同種事象）
- **再発条件**: write/edit ツールで project root 外（os.tmpdir 系一時ディレクトリ、project root 外 worktree）へ書込む場合に毎回発生
- **横展開可能性**: 一時書込みを伴う全工程（横断依存検査、検証スクリプト、採番スクリプト等の --input JSON 渡し）。Windows・ハーネス構成に固有の落とし穴

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
