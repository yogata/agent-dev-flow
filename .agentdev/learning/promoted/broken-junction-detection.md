# broken junction 検出と junction 管理手順の欠落

## 背景

Windows 環境で `.opencode/skills/` 配下に junction（ディレクトリシンボリックリンク）を使用しているが、namespace 移行時に旧 junction の cleanup 手順が未定義のため、リンク先が存在しない broken junction が残存している。

現状、`.opencode/skills/agentdev-integrity` が `src/opencode/skills/agentdev-integrity` への broken junction となっており、glob やディレクトリ走査で OS error が発生する。また `repo-agentdev-integrity` の `references/gate-levels.md` 自体もエンコーディング破損（単一行化）している。

## 問題

1. `repo-agentdev-integrity` スキルに broken junction 検出チェックが存在しない
2. `references/gate-levels.md` がエンコーディング破損している
3. namespace 移行時の junction cleanup 手順が未定義

## 望ましい変更

1. `repo-agentdev-integrity` スキルの integrity-check に broken junction 検出チェックを追加
2. `references/gate-levels.md` のエンコーディング破損を修復
3. junction 管理手順（作成・検証・cleanup）を明文化

## 対象範囲

### 対象

- `src/opencode/skills/repo-agentdev-integrity/SKILL.md` — broken junction 検出の追加
- `src/opencode/skills/repo-agentdev-integrity/references/gate-levels.md` — エンコーディング破損修復
- `src/opencode/skills/repo-agentdev-integrity/scripts/` — junction 検出スクリプトの追加検討

### 対象外

- 他のスキルファイル
- `.opencode/skills/agentdev-integrity` の broken junction 自体の削除（別作業）
- `sync-opencode.ps1` の大規模改修

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/repo-agentdev-integrity/SKILL.md` | broken junction 検出チェックを Gate 手順に追加 |
| skill | `src/opencode/skills/repo-agentdev-integrity/references/gate-levels.md` | エンコーディング破損の修復 |
| skill | `src/opencode/skills/repo-agentdev-integrity/references/` | junction 管理手順の文書化（新規ファイル検討） |

## 既存対策確認

- **確認結果**: 既存対策あり（一部）
- **該当ファイル**: `.opencode/skills/repo-agentdev-integrity/SKILL.md`, `.opencode/skills/repo-agentdev-integrity/references/gate-levels.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: integrity-check に junction/symlink 健全性チェックが存在しない。gate-levels.md 自体がエンコーディング破損しているため、参照される内容が読取不能

## 制約

- junction 検出は Windows 環境固有の対応を含む（`Get-Item` の `LinkType`/`Target` プロパティの確認）
- gate-levels.md の修復は破損前のバージョンからの復元、または内容の再構築が必要
- スキル名は `repo-agentdev-integrity`（`agentdev-integrity` は broken junction であり使用不可）
- integrity-check スクリプト（TypeScript）への検出ロジック追加は別途検討

## 受け入れ条件

- [ ] integrity-check に broken junction 検出が追加されている
- [ ] gate-levels.md のエンコーディング破損が修復されている
- [ ] junction 管理手順が文書化されている
- [ ] 既存の integrity-check テストが通過する

## 元learning item / 根拠

- **要約**: Windows 環境での junction 管理が不十分で、namespace 移行後に broken junction が残存。integrity-check がこれを検出できない
- **根拠**: `.opencode/skills/agentdev-integrity` が存在しない `src/opencode/skills/agentdev-integrity` への broken junction。gate-levels.md が単一行化破損。symlink 作成時の管理者権限問題で junction 使用が必要
- **再発条件**: namespace 変更時の junction cleanup 手順が未定義の場合
- **横展開可能性**: Windows 環境で junction を使用する全プロジェクトで発生可能。symlink/junction の使い分けは Windows 固有の課題

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, enhancement
- **関連Issue**: PR #611, integrity-check F-001
