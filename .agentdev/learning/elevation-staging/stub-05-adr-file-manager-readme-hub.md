# adr-file-manager README ハブ更新要件の追加

## 背景

ADR 新規作成時に `docs/adr/README.md`（ADR Index）には追記したが、`docs/README.md` の個別 ADR リストへの追加を漏らす問題が発生（評価スコア 27/40、問題クラス4の adr-file-manager 反映分）。

## 問題

ADR 新規作成時の更新対象ファイルリストに `docs/README.md` が含まれておらず、ADR Index（`docs/adr/README.md`）の更新のみを考慮していた。docs/README.md の個別 ADR リストも更新対象であることを見落としていた。

## 望ましい変更

`agentdev-adr-file-manager` スキルの CREATE 手順に以下を追加:
- ADR 新規作成時は `docs/adr/README.md`（Index）と `docs/README.md`（ドキュメントハブ）の両方の更新が必要であることを明記
- APPEND/UPDATE 操作時にも関連する README ハブの更新をチェックする手順を追加

## 対象範囲

### 対象

- `.opencode/skills/agentdev-adr-file-manager/SKILL.md`

### 対象外

- spec-compliance スキル（別スタブ stub-04 で対応）
- case-run コマンドの対象ファイルリスト生成ロジック

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-adr-file-manager/SKILL.md` | CREATE 手順に docs/README.md 更新を明記、APPEND/UPDATE 時の README ハブ更新チェック追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-adr-file-manager/SKILL.md`
- **ギャップ分類**: fix gap（APPEND/UPDATE 時の README ハブ更新要件なし）
- **ギャップ詳細**: CREATE 手順に docs/README.md の個別 ADR リスト更新が明記されていない。APPEND/UPDATE 操作時にも関連 README ハブの更新確認が必要

## 制約

- adr-file-manager の既存の Step 構造を維持する
- 更新対象は README ハブ（docs/README.md）に限定し、他のドキュメントハブは対象外

## 受け入れ条件

- [ ] CREATE 手順に「docs/README.md の個別 ADR リストにも追記する」が明記されている
- [ ] APPEND/UPDATE 操作時の README ハブ更新チェック手順が追加されている
- [ ] 更新対象ファイルのチェックリストに docs/README.md が含まれている

## 元learning item / 根拠

- **要約**: ADR 新規作成時の docs/README.md 個別リンク追加漏れ（1件）
- **根拠**: ADR-0004 新規作成時に docs/adr/README.md には追記したが docs/README.md を見落とした。対象ファイルリストに docs/README.md が含まれていなかった
- **再発条件**: ADR を新規作成する際、対象ファイルリストに docs/README.md を含めない場合
- **横展開可能性**: 中（docs/README.md に個別リストを持つ構造のプロジェクト全般）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: Issue #264, PR #265
