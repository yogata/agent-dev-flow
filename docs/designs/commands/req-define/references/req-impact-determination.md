---
title: REQ影響判定とDesign正規所有者確定
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/req-define.md から参照される詳細仕様（遅延読み込み）。 -->

# REQ影響判定とDesign正規所有者確定

## REQ影響判定とDesign正規所有者確定

req-define は backlog-review の暫定分類（`tentative_classification`）を暫定入力とし、最終分類を自身で確定する（REQ-004-010、REQ-001）。

### 最終分類確定ステップで判定する項目

req-define は次の7項目を判定し、`artifact_actions`、`operation_units` へ反映する:

| 判定項目 | 内容 |
|---|---|
| 新しいステークホルダー要求か | 既存REQ が要求を保持していない新しい要求か |
| 既存REQ が要求を既に保持しているか | 同一関心が既存REQ に存在するか |
| 利用者から見える外部契約が変わるか | 外部契約変更（change_nature: `external_contract_change`）に該当するか |
| REQ の作成・更新が必要か | 上記3項目から REQ 作成・更新要否を確定 |
| Design の論理区分 | 文書モデル Design「Design 論理区分（5区分）」節の5区分（挙動Design、カタログDesign、横断契約Design、パラメータDesign、実装詳細Design）のいずれか |
| 正規所有者 | 対象 command、skill、workflow、品質ルール、整合性ルール等の関心キー（REQ-082-009） |
| 正規追記先 | 既存 Design のどの領域へ追記するか（target_area、target_design） |

### Design action への分類根拠出力

最終分類確定ステップで `artifact: design` の Design action 各 entry へ `canonical_owner` を最終分類確定値として出力する。
出力値は `../responsibilities/artifact-contracts.md`「分類根拠伝播契約」の伝播フィールド一覧（`canonical_owner`）と一致し、後続の Design 保存内部責務（case-ready / case-revise）が配置一貫性検証を実行するための入力となる。
分類値が確定できない場合は `unknown` とし、soft-contract（DEC-003）に従い Design 保存内部責務へ警告付きで引き継ぐ。

### REQ 影響なし時の取扱い

REQ 影響なしと確定した変更からは `artifact_actions` の `artifact: req` エントリを生成しない（REQ-004-033）。
代わりに `artifact: design` エントリのみを生成し、Design への配置のみを行う。
Design action には前項「Design action への分類根拠出力」を適用する。

### 設計根拠対応の条件付き意味（REQ-012-031）

req-define は対象要件行の設計根拠対応の成立を独立した Design 文書の存在に一律依存させない。Design 対応の生成判断は、プロジェクトの採用した工程・成果物規約が認める適切な成果物を前提に行い、Design action が存在しない要件行の展開と draft 生成を阻害しない。設計根拠対応の欠落の検出は REQ-021 が所有する工程ゲート（case-ready の ready 遷移ゲート、case-close の QG-4）が担う（REQ-012-031）。

### 採用規約の解決の実行経路接続（REQ-104）

req-define は工程構成に基づいて成果物の有無・成立を判定する入口の1つ（工程構成判断、test strategy 定義、work_type・Scale 判定、設計根拠対応の前提）として、プロジェクトの採用済み工程・工程間関係・必須成果物を、採用規約の解決の公開操作契約（`agentdev-adopted-conventions` の resolve/evaluate script CLI）を経て参照し、解決結果を当該作業の判定基準として使う（REQ-104-009）。

- 読取不能と移行期デフォルトの区別（REQ-104-009）: 解決が実行不能な場合（採用宣言の読取不能・schema 不適合、unresolvable）、工程構成判断を下さず判断留保として扱い、全要件の不存在や全工程の省略として解釈しない。採用宣言が存在しない場合の移行期デフォルト接続（transition-default）は、現行の正規成果物から呼出側の実行契約が意味判断を行う状態であり、読取不能の判断留保とは別の状態として扱い、留保をデフォルト接続へ自動降格しない。
- 成立判定の根拠（REQ-104-010）: 解決結果は判定の入力が揃ったことのみを示す。req-define は工程構成と要件の成立判断を、解決結果に加えて実際の実行とその証拠（正規成果物、検証証拠）とともに行い、解決の成立だけを成立判定の根拠にしない。
- 詳細工程採用状況に応じた判定（REQ-104-011）: 詳細工程を採用しないプロジェクトでは標準案（参照モデルの詳細工程）を未採用候補として扱い、採用した工程構成に応じた工程構成判断と test strategy 定義を行う。採用規約の解決の構造の正は v5 採用規約機構 Design「解決手順」節であり、本 Design は重複定義しない。

### 分類根拠の引き継ぎ

req-define は RU から引き継いだ分類根拠（`artifact-contracts.md`「分類根拠伝播契約」参照）を暫定入力とし、最終分類を確定した上で draft-data へ反映する。
分類根拠の soft-contract 運用（欠落時 unknown 既定値、警告）は DEC-003 に従う。

### tentative_classification との関係

backlog-review が付与する `tentative_classification`（現行の暫定分類契約は REQ-008 の7値）は暫定値であり、req-define が最終分類を上書きする。
最終分類確定時のバリデーション（7値チェック、フィールド欠落時の停止、上書き値の7値チェック）は前述「tentative_classification 最終確定のバリデーション」に従う。

### 壁打ち対話 構造的分析フレーム先行手順（REQ-004-034, REQ-004-035, REQ-004-036）

壁打ち対話の開始時に、入力（RU、セッションコンテキスト、明示入力ファイル）の構造を入力データの性質に応じた分析フレームで先行して整理し、個別論点の深掘り前に全体構造をユーザーに提示する。

#### 分析フレームの選択

入力データの性質に応じて以下のフレームから選択する:

| 入力データの性質 | 推奨フレーム |
|---|---|
| 複数RU・複数改善候補 | 対象×変更種別の二軸マトリクス |
| 既存要件との照合が必要 | 既有件化/未要件化/Design配置の3分類表 |
| 修正要否の判定 | 実現面/Design面の両面分析表 |

上記は推奨例であり、入力データの性質に応じて適切なフレームを選択する。
分析フレームは個別論点の深掘りに先行して提示する。

#### 二項選択回答規定

ユーザーが二項選択（「AかBか」）を求めた質問に対し、「混在」「要確認」単独の回答を出力しない。
件数と根拠でいずれかを明示して回答する。
両選択肢に該当する場合は、それぞれの件数と根拠を明示して両方を提示する。

#### 実現/Design両面分析規定

修正の要否を検討する際、実現面（ソースコード、スクリプト、スキル定義ファイル等の変更）と Design 面（docs/designs/ 配下の文書変更）の両面を分析し、各面の修正対象と修正内容を明示する。
片面のみの分析で修正要否を断定しない。

#### agentdev-req-analysis SKILL 連携

上記手順の詳細（質問運用ルール、分析フレーム選択基準）は `agentdev-req-analysis` SKILL（共通原本 `src/common/skills/agentdev-req-analysis/SKILL.md`。実行時投影先は `.opencode/skills/agentdev-req-analysis/`）の「質問運用ルール」「要件分析観点」セクションに反映する。
本 Design は手順の要件を定義し、SKILL は実装詳細を定義する（原本 src → 配置先 .opencode の文書間投影規則に準拠）。

### 記述単位・寿命の判定項目追加

「最終分類確定ステップで判定する項目」の判定項目表に、次の2項目を追加する。

- 判定単位は記述単位か（ファイル全体・文書種別単位の判定結果を記述単位判定に還元して説明できるか）
- 対象記述の寿命区分は何か（恒久契約・期間限定契約・一時監査・移行作業・履歴記録の別）

この2項目は、分類・適用範囲・ID表記の横断適用（関連文書とreq-define判断入口の一致）の一部として判定され、判定結果は分類根拠の引き継ぎに含める。
