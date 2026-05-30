# REQファイル群の体系的再構成レビュー

## 観測

`docs/requirements/` は REQ-0041 / ADR-0009 により新基準REQ群（REQ-0042〜REQ-0050）へ再基準化されているが、読み手の入口には以下の構造的な混在が残っている。

- 旧REQ（REQ-0001〜REQ-0040）と新基準REQ（REQ-0042〜REQ-0050）が同じ `REQ-{NNNN}.md` 階層に並んでいる
- retained 旧REQの一部が新基準REQの関心対象と重複している
- partially superseded 旧REQは、現行仕様として読める範囲と履歴参照範囲の判定がファイルごとに必要になっている
- `requirements/README.md` と `DOC-MAP.md` は分類を提示しているが、関心対象ごとの「第一参照REQ」と「補助参照REQ」の関係がまだ十分に明示されていない
- REQ-0050 は再構成候補の保存導線を定義しているが、REQ再構成レビュー自体の観点・進め方・成果物形は対象外としている

## 今回扱わない理由

REQ本文の分割・統合・退役を即時に実施すると、旧REQの履歴保持、現行基準の参照安定性、mapping-table の対応関係を同時に崩す可能性がある。まず再構成レビューの入力として、関心対象の整理、統合候補、退役候補、段階的な移行手順を明文化する。

## 影響

実装者やレビュー担当者が要件を読む際に、同じ関心対象について複数REQを横断しなければならない。特に以下の領域で、第一参照先の判断がぶれやすい。

| 関心対象 | 現在の第一参照候補 | 補助・重複参照候補 | 構造上の問題 |
|---|---|---|---|
| 文書基準境界 | REQ-0042 | REQ-0004, REQ-0035, REQ-0041 | REQ基準・DOC-MAP・旧views廃止・分類モデルが複数REQにまたがる |
| 要件定義と保存 | REQ-0043 | REQ-0002, REQ-0018, REQ-0034, REQ-0041 | req-define / req-save / req-analysis / 関連ドキュメント候補が分散している |
| artifact責任分界 | REQ-0044 | REQ-0008, REQ-0009, REQ-0016, REQ-0017, REQ-0021 | command / skill / template / script / namespace / guardrail が分散している |
| command protocol | REQ-0045 | REQ-0001, REQ-0002, REQ-0010, REQ-0005, REQ-0020 | ワークフロー全体・Epic・Pattern・SSoTが複数REQに残っている |
| intake / learning / RU | REQ-0046 | REQ-0007, REQ-0019, REQ-0026, REQ-0027, REQ-0039 | lifecycle と旧コマンド移行履歴が混在している |
| case-run / case-close | REQ-0047 | REQ-0014, REQ-0015, REQ-0032, REQ-0037, REQ-0038, REQ-0040 | 実行信頼性・完了ゲート・post-run回収が重なっている |
| reporting / writing quality | REQ-0048 | REQ-0011, REQ-0012, REQ-0024, REQ-0031, REQ-0036 | GitHub本文品質・リンク・AI-slop・報告形式が分散している |
| integrity / tests | REQ-0049 | REQ-0021, REQ-0022, REQ-0025, REQ-0030, REQ-0033 | 検査・git永続化・テスト・二次整合性が混在している |
| REQ再構成運用 | REQ-0050 | REQ-0042, REQ-0043, REQ-0049 | 保存導線はあるが、レビュー手順と判断基準は未定義 |

## 想定される再構成方向

### 1. 関心対象モデルを先に固定する

REQファイル単位ではなく、読み手が探す関心対象を基準に再構成する。最小案では、現行の新基準REQ群を次の9領域として扱う。

| 領域ID | 関心対象 | 第一参照REQ |
|---|---|---|
| RQ-DOC | 文書基準境界 | REQ-0042 |
| RQ-DEFINE | 要件定義・保存 | REQ-0043 |
| RQ-ARTIFACT | command / skill / template / script 責任分界 | REQ-0044 |
| RQ-FLOW | AgentDevFlow command protocol | REQ-0045 |
| RQ-BACKLOG | intake / learning / req-backlog / RU lifecycle | REQ-0046 |
| RQ-EXEC | case-run / case-close / post-run capture | REQ-0047 |
| RQ-QUALITY | reporting / GitHub body / link / writing quality | REQ-0048 |
| RQ-INTEGRITY | integrity / validation / tests | REQ-0049 |
| RQ-RESTRUCTURE | REQ再構成運用 | REQ-0050 |

### 2. 旧REQは「現行基準」ではなく「補助参照」として再分類する

retained / partially superseded / superseded の3分類は残しつつ、README と DOC-MAP では関心対象ごとに以下を明示する。

- 第一参照REQ
- 補助参照REQ
- 履歴参照REQ
- 読み手が実装判断に使ってよい範囲
- 将来的な統合・退役候補

### 3. retained旧REQを再評価する

retained 15件は「全文現行仕様」とされているが、新基準REQとの重複がある。以下は優先的に再評価する。

| 対象 | 候補種別 | 理由 |
|---|---|---|
| REQ-0001 + REQ-0045 | MERGE / PARTIAL RETIRE | ワークフロー3フェーズ、SSoT、エラー回復が重複している |
| REQ-0003 + REQ-0020 + REQ-0047 | MERGE / MOVE | 並列実行・Epic orchestration・case-run制御が近接している |
| REQ-0008 + REQ-0044 | MERGE / PARTIAL RETIRE | skill品質基準が artifact責任分界内の一部として読める |
| REQ-0012 + REQ-0048 | MERGE / PARTIAL RETIRE | AI-slop品質基準が writing quality 領域に統合可能 |
| REQ-0021 + REQ-0049 | MERGE / PARTIAL RETIRE | guardrail script 方針が integrity 領域に統合可能 |
| REQ-0030 + REQ-0049 | MERGE / PARTIAL RETIRE | command群テスト体系が validation / tests 領域に統合可能 |
| REQ-0031 + REQ-0048 | MERGE / PARTIAL RETIRE | GitHub link normalization が reporting quality 領域に統合可能 |
| REQ-0032 + REQ-0047 | MERGE / PARTIAL RETIRE | case-close完了ゲートが execution 領域に統合可能 |
| REQ-0034 + REQ-0043 | MERGE / MOVE | 関連ドキュメント更新候補抽出は req-define / req-save 領域に近い |
| REQ-0035 + REQ-0042 | MERGE / PARTIAL RETIRE | DOC-MAP導入は文書基準境界領域に統合可能 |
| REQ-0038 + REQ-0047 | MERGE / PARTIAL RETIRE | case実行信頼性は execution 領域に統合可能 |

### 4. 変更単位は小さくする

一括でREQ本文を移動しない。次の順序で進める。

1. `requirements/README.md` と `DOC-MAP.md` に関心対象ビューを追加する
2. retained旧REQのうち重複が強いものを1〜2件だけ選び、第一参照REQへ要件行を統合できるか確認する
3. 統合できた旧REQに「現行判断は後継REQを優先」と明記する
4. `mapping-table.md` を retained から partially superseded / superseded へ必要最小限だけ更新する
5. integrity-check の検査対象に、関心対象ビューとREQ実体の不一致を追加するか検討する

## レビューで決めること

- 関心対象モデルを上記9領域で固定するか、Epic / Sisyphus / req-analysis を独立領域として残すか
- retained旧REQを「全文現行仕様」として維持するか、補助参照へ段階的に下げるか
- 再構成の第一段階を README / DOC-MAP の関心対象ビュー追加に限定するか
- REQ本文の統合を行う場合、最初の対象をどれにするか
- REQ再構成レビュー専用の手順を REQ-0050 にAPPENDするか、新規REQとして定義するか

## 根拠

- `docs/requirements/README.md` は新基準REQ群、retained旧REQ、partially superseded旧REQ、superseded旧REQを分類している
- `docs/DOC-MAP.md` は文書探索入口として同じ分類を提示している
- `docs/requirements/mapping-table.md` は旧REQ40件と新基準REQ群の対応を保持している
- REQ-0041 / ADR-0009 は旧REQ混在を問題として定義し、新基準REQ群への再基準化を開始している
- REQ-0050 はREQ再構成候補を通常intakeとは別に保存する導線を定義しているが、実際の再構成レビュー手順は対象外としている
