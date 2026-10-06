# docs 内容変更を伴う委譲の MUST DO へ check_integrity 単独実行を含める

## 背景

実装 PR 3505（docs 内容変更 59 ファイル）の委譲要件に check_integrity 実行が含まれず、ReqFreshness NG 13 件（内容変更ファイルの frontmatter `updated` 未進行）が実装工程で検出されず、case-close のマージ後検査まで遅延して close が blocked となった（Case 3500・委譲単位 DEL-3500-2 → blocked、DEL-3500-3 で fix PR 3506 により是正）。

## 問題

docs 内容変更を伴う委譲の MUST DO 工程に check_integrity 単独実行が含まれておらず、内容変更に伴う frontmatter `updated` 進行漏れの検出が委譲要件外に置かれている。検出担当が委譲要件に含まれない場合、機械検査の実行漏れは下流工程（クローズ検査）まで遅延し、merge 後の fix（追加 PR・追加マージ）コストを生む。

## 望ましい変更

docs 内容変更（REQ/Design 本体・frontmatter を含む）を伴う委譲の MUST DO に check_integrity 単独実行（REQ-087 既知 warning 以外の NG 0 確認）を含める。委譲要件テンプレートと case-run の委譲要件確認事項に明記する。

## 対象範囲

### 対象

- 委譲要件テンプレート（case-run 委譲要件の確認事項を所有する配布物）
- `src/common/skills/agentdev-workflow-case-run/references/delegation-and-result.md`（委譲要件の確認事項）

### 対象外

- check_integrity の検査基準（現行どおり）
- REQ-087 既知 warning の解消（別件）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-run/references/delegation-and-result.md | docs 内容変更を伴う委譲の MUST DO へ check_integrity 単独実行を明記 |
| テンプレート | 委譲要件テンプレート（case-run/case-run-execution-adapter 配下の委譲要件テンプレート。実パスは req-define の変更影響分析で確定） | MUST DO 項目への検査前置の追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: check_integrity（ReqFreshness・IR-072 検出）、case-close STEP-4 マージ後整合検査
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 検出器とマージ後検査は存在するが、実装工程（委譲要件側）での検査前置がなく検出が close まで遅延する

## 制約

- REQ-087 既知 warning（crosswalk retired-req-primary-ref）は警告扱いのまま（NG 0 確認の基準から除外）
- 委譲要件テンプレートの実パス確定は req-define の変更影響分析に委ねる

## 受け入れ条件

- [ ] docs 内容変更を伴う委譲の MUST DO に check_integrity 単独実行（REQ-087 既知 warning 以外の NG 0 確認）が明記される

## 元learning item / 根拠

- **要約**: docs 内容変更を伴う委譲には check_integrity 単独実行を MUST DO に含めるべき（検出の close 遅延と merge 後 fix コストの防止）（1件）
- **根拠**: Case 3500・PR 3505（merge 9fbbbc4a、ReqFreshness NG 13 件）・PR 3506（merge cd14227e、13 ファイル frontmatter-only fix）、hold コメント 6018200373
- **再発条件**: docs 内容変更を伴う委譲で check_integrity 実行を委譲要件に含めない場合
- **横展開可能性**: 検出担当の委譲要件包含（検査前置）は内容変更を伴う全委譲で汎用

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
