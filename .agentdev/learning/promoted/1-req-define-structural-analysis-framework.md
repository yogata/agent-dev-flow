# req-define 壁打ち Step 3 の構造的分析フレーム先行手順・質問運用ルール拡充

## 背景

integrity report NG 36件の要件化壁打ち（ses_0cd07cf96ffeOS2zdW4Ce0N3tO）で、req-define/agentdev-req-analysis は「evidence-first 原則」「状態要件と反映作業の分離基準」を規定するにもかかわらず、以下4つの失敗パターンに陥った:(1) docs で解決できる内容（検出事項経路マップ、反映作業規定、REQ/SPEC 配置境界）を自明な質問として繰り返し、(2)「新規要件化すべきものはない」と (A)要件↔実装ズレ vs (B)要件↔checkズレ の分類フレームを立てずに断言、(3) 二項選択「どちらか明確に」に対し「混在・要確認」で逃げ、(4)「修正」議論で実装とSPECの両面を分析せず反映作業＝実装修正のみと単純化。ユーザーから4度にわたり厳格な深掘りを要求され、それぞれの指摘でようやく思考が進む受動的構造だった。

## 問題

req-define/agentdev-req-analysis に「壁打ち開始時に構造的分析フレーム（二軸マトリクス等）を立てる手順」「二項選択では件数と根拠でどちらかを明示する規定」「修正には実装とSPECの両面があることを検討する規定」が明示されていない。規定された evidence-first や分離基準を遵守しても、分析枠なしでは「質問/結論を急ぐ」失敗パターンに陥る。

## 望ましい変更

(1) req-define Step 3 に「壁打ち開始時の構造的分析フレーム先行」手順を追加（入力データを二軸以上のマトリクスに配置してから個別に入る）。(2) agentdev-req-analysis SKILL「質問運用ルール」に「二項選択では件数と根拠でどちらかを明示」「修正は実装とSPECの両面を検討」を追記。(3) evidence-first 違反を検出するチェック機構の検討（QG-1 等での「docs 参照証拠なき質問」検出）。

## 対象範囲

### 対象

- `docs/specs/commands/req-define.md` Step 3（構造的分析フレーム先行手順）
- `src/opencode/skills/agentdev-req-analysis/SKILL.md`（質問運用ルール拡充）
- `agentdev-quality-gates` QG-1（evidence-first 違反検出候補、検討対象）

### 対象外

- intake-capture / backlog-review / inspect-promote 等の他の壁打ちコマンド（横展開観点として参考だが本 Issue の対象外。別途要件化を検討）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `docs/specs/commands/req-define.md` Step 3 | 構造的分析フレーム先行手順（二軸マトリクス等の配置を必須化）追加 |
| skill | `src/opencode/skills/agentdev-req-analysis/SKILL.md` | 質問運用ルール拡充（二項選択時の件数+根拠明示、修正は実装+SPEC両面検討） |
| skill | `agentdev-quality-gates` QG-1（検討候補） | evidence-first 違反検出（docs 参照証拠なき質問の検出） |

## 既存対策確認

- **確認結果**: 既存対策あり（ただし構造的分析フレーム・二項選択規定・両面分析規定なし）
- **該当ファイル**: `docs/specs/commands/req-define.md`（evidence-first原則、状態要件と反映作業の分離基準）、`src/opencode/skills/agentdev-req-analysis/SKILL.md`
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 構造的分析フレーム先行手順（壁打ち開始時に二軸マトリクス等を配置してから個別に入る）が未規定。二項選択回答規定（どちらかを件数と根拠で明示）が未規定。実装/SPEC 二軸分析規定（修正には実装とSPECの両面があることを検討）が未規定。evidence-first 原則は規定済みだが、遵守を機械検出する仕組みがない

## 制約

- 既存の req-define Step 3 手順との整合性（既存の evidence-first 原則・分離基準を壊さず拡充）
- 構造的分析フレームの形式は入力データの性質に応じて柔軟（二軸マトリクスに限定しない）
- QG-1 への evidence-first 違反検出追加は検討対象（実現可能性を別途評価）

## 受け入れ条件

- [ ] req-define Step 3 に「壁打ち開始時の構造的分析フレーム先行」手順が追加されていること
- [ ] agentdev-req-analysis SKILL の質問運用ルールに「二項選択では件数と根拠でどちらかを明示」が追記されていること
- [ ] agentdev-req-analysis SKILL の質問運用ルールに「修正は実装とSPECの両面を検討」が追記されていること
- [ ] QG-1 での evidence-first 違反検出（docs 参照証拠なき質問の検出）が検討候補として明記されていること

## 元learning item / 根拠

- **要約**: req-define 壁打ちで構造的分析フレームを先行せず自明な質問と逃げ回答を繰り返す問題クラス（1件、ユーザー確認あり）
- **根拠**: ses_0cd07cf96ffeOS2zdW4Ce0N3tO で4度のユーザー指摘（「自明であるべき内容の質問だけになっている」「必ずどちらかであるはずだ」「実装とSPECの修正が必要となるはずだ」等）を受けてようやく思考が進む受動的構造。evidence-first 原則・分離基準は規定済みだが、枠なしでは失敗。根本原因は req-define/agentdev-req-analysis の手順未整備
- **再発条件**: (1) 複数件の入力（integrity report、複数RU、複数finding等）を入力として req-define 等の壁打ちコマンドを起動、(2) Step 3 で構造的分析フレームを立てず、(3) evidence-first 原則を運用せずに質問/結論を生成した場合
- **横展開可能性**: req-define 以外の壁打ちフェーズを持つコマンド（intake-capture の raw item 整理、backlog-review の RU 化判断、inspect-promote の finding 分類等）で同パターンのリスク

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: ses_0cd07cf96ffeOS2zdW4Ce0N3tO、REQ-0102（要件定義・保存）、REQ-0144-022（除外設定の方針明文化）
