# case-run 品質統制への配布依存境界 gate 実行必須化

## 背景

配布物（src/opencode/**）の変更を含む PR で、配布依存境界 gate（check_distribution_boundary.ts --profile source）の case-run 段階での実行が徹底されていない。PR 2341 では gate 実行が欠落した状態で PR が作成・マージ候補となり、case-close E4-1 最終 gate で concrete-id 違反16件が初検出されてマージ中止・Epic 2307 Wave 1 の部分停止（4/5完了）・Issue 2311 blocked に至った。一方 PR 2355/2356 では case-run 段階で gate を実行した結果、PR 作成前に違反を検出・修正できた（予防策の有効性を実証）。

## 問題

- gate 自体は存在するが、case-run の品質統制・PR 作成手順で「配布物変更時に必須」と明示されていないため、実行が担当者任せになっている
- 新規配布スキル scripts 作成時に、コメント・description・テスト名へ producer 内部 ID（REQ-/DEC-/TS-/UC-/OU- 等）を書き出す習慣が根強く、違反が繰り返し発生する
- 配布物への横断是正では「正規契約への置換」（Design パス参照、具体 DEC-NNN 記述）が配布物では別の違反（IR-055 strict/heuristic）になるという相互作用がある

## 望ましい変更

- case-run の品質統制・PR 作成手順へ「配布物（src/opencode/**）を変更する PR では PR 作成前に check_distribution_boundary.ts --profile source を必須実行する」を明記する
- 配布物新規作成時のコメント・description 規約（内部 ID を書かずドメイン語で表現）を case-run の初期手順に明示する
- 配布物を含む横断是正では、修正適用前に IR-055 パターン（docs/designs パス、具体 DEC/REQ-NNN）の再 grep を行い、違反になる候補は「既存の skill 名参照・注記削除」方式へ切り替える手順を明記する

## 対象範囲

### 対象

- case-run command / agentdev-workflow-case-run の品質統制・PR 作成手順
- 配布物を新規作成・修正する PR の検証手順

### 対象外

- check_distribution_boundary.ts 自体の仕様変更（gate は設計どおりに機能）
- 配布依存境界 Design（REQ-029、DEC-014）の意味境界変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | src/opencode/skills/agentdev-workflow-case-run/SKILL.md + references（品質統制・PR 作成手順） | 配布物変更時の gate 必須実行を明記 |
| skill | src/opencode/skills/agentdev-workflow-case-run/SKILL.md + references（委譲時手順） | 配布物作成時のコメント・description 規約（ドメイン語表現）を明記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: check_distribution_boundary.ts（gate 本体）、distribution-boundary Design
- **ギャップ分類**: application miss
- **ギャップ詳細**: gate の実行タイミングが case-run 手順で必須化されていない。PR 2341 で省略により Wave 部分停止、PR 2355/2356 で実行により PR 作成前に解消という対比から、手順への明示が実効手段

## 制約

- gate 違反時は test-fix ループ（concrete ID → ドメイン語参照への置換）で PR 作成前に解消する
- PR 本文の checker 合格記録は「検証 base 時点」の証拠である旨の注記を維持する（base drift は post-merge 検証で別途対応）

## 受け入れ条件

- [ ] case-run の品質統制に配布物変更時の gate 必須実行が明記されている
- [ ] 配布物作成時のコメント・description 規約（内部 ID 禁止・ドメイン語表現）が明記されている
- [ ] 横断是正時の IR-055 パターン再 grep 手順が明記されている

## 元learning item / 根拠

- **要約**: 配布依存境界 gate の PR 作成前実行徹底による Wave 停止予防（評価スコア 33/40、本バッチ最高）
- **根拠**: PR 2281（内部 ID 直書きが gate で blocking）、PR 2341（gate 省略 → case-close 最終 gate 初検出、Epic 2307 Wave 1 部分停止・Issue 2311 blocked）、PR 2355/2356（case-run 段階実行で PR 作成前に解消、予防策有効性を実証）、PR 2375（横断是正で Design パス参照・具体 DEC-NNN が IR-055 新規違反）
- **再発条件**: 配布物変更 PR で gate を実行せず PR を作成した場合
- **横展開可能性**: 配布物を持つプラグイン開発全般

## 推奨Issue分類

- **分類**: feature（品質統制の手順正式化）
- **推奨ラベル**: enhancement, quality-gate
- **関連Issue**: Issue 2238（PR 2281）、Issue 2311（PR 2341）、Issue 2352/2354（PR 2355/2356）、Issue 2371（PR 2375）
