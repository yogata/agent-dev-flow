# Decision ファイル検証と整合性チェック

本ファイルは `agentdev-decision-file-manager` SKILL.md の補助資料であり、Decision frontmatter のバリデーションルール、ステータス遷移の詳細、整合性チェック（README ↔ Decision、Decision ↔ Decision、REQ ↔ Decision、Issue ↔ Decision）、README 分類ビューの運用、accepted Decision 直接編集チェックリスト、APPEND/UPDATE 判定基準の詳細を扱う。
SKILL.md 本文では操作モード、採番不変条件、status遷移の許容/禁止一覧のみを提示し、検証手順、チェックリスト、判定フローは本ファイルを参照する。

## 目次

- [frontmatter 必須フィールド](#frontmatter-必須フィールド)
- [ID とファイル名の一致確認](#id-とファイル名の一致確認)
- [日付フォーマット検証](#日付フォーマット検証)
- [ステータス値のバリデーション](#ステータス値のバリデーション)
- [ステータス遷移ルール](#ステータス遷移ルール)
- [ステータス遷移の意図](#ステータス遷移の意図)
- [単なる廃止、削除、移行は新規Decisionではなくretire/supersedeで扱う基準](#単なる廃止削除移行は新規decisionではなくretiresupersedeで扱う基準)
- [整合性チェック](#整合性チェック)
- [README 分類ビューの運用](#readme-分類ビューの運用)
- [ステータス変更時の README 整合性検証](#ステータス変更時の-readme-整合性検証)
- [APPEND/UPDATE 判定基準](#appendupdate-判定基準)
- [accepted Decision 直接編集チェックリスト](#accepted-decision-直接編集チェックリスト)

## frontmatter 必須フィールド

| フィールド | 型 | 許容値 |
|---|---|---|
| id | string | `DEC-NNN`（3桁ゼロ埋め） |
| title | string | 空文字不可 |
| status | enum | `proposed` \| `accepted` \| `deprecated` \| `superseded` |
| created | date | `YYYY-MM-DD` |
| updated | date | `YYYY-MM-DD` |

## ID とファイル名の一致確認

- `DEC-NNN.md` → frontmatter `id: DEC-NNN`（必須）
- 不一致の場合はエラーとして扱う

## 日付フォーマット検証

- `created`/ `updated` は `YYYY-MM-DD` 形式であること
- `updated` ≥ `created` であること

## ステータス値のバリデーション

- `superseded` の場合、frontmatter に `superseded_by: DEC-MMM` フィールドが存在することを確認
- `superseded_by` に指定されたDecision番号が存在することを確認

## ステータス遷移ルール

### 許容遷移

```
proposed → accepted
accepted → deprecated
accepted → superseded（frontmatter に superseded_by を追加）
proposed → deprecated
```

### 禁止遷移

| 遷移 | 理由 |
|---|---|
| accepted → proposed | 合意済み決定の差し戻しは禁止（新規Decisionを作成） |
| deprecated → * | 廃止済みは遷移不可 |
| superseded → * | 置き換え済みは遷移不可 |

### 初期値制約

- 新規作成時は `proposed` に設定
- `未指定 → accepted` は禁止（必ず proposed → accepted の遷移を経由）

## ステータス遷移の意図

- **proposed**: 検討中の決定事項。レビュー待ち。
- **accepted**: 正式に合意された決定。実装中または実装済み。
- **deprecated**: 廃止された決定。使用しない。
- **superseded**: 他のDecisionに置き換えられた決定。`superseded_by` フィールドに後継Decision番号を記載。`accepted` status の Decision のみ現行根拠として使用する。`proposed`/`deprecated`/`superseded` の Decision を現行要件判断の根拠として引用しない

## 単なる廃止、削除、移行は新規Decisionではなくretire/supersedeで扱う基準

過去の判断を現行基盤から外すだけの場合（削除、廃止、移行、統合、再構築、完全削除）は、新規Decisionを作成せず、対象Decisionのstatus遷移（retire/supersede）で処理する。
新規Decisionは「あるべき状態」の意思決定が存在する場合のみ作成する。
削除、廃止、移行そのものを主題にした新規Decision作成は `agentdev-decision-guidelines` の作成不可条件に該当する。

## 整合性チェック

### README ↔ Decision

- `docs/decisions<README>.md` の現行基準ビュー（Current Baseline View）に `docs/decisions/<DEC-*>.md` の全Decisionが記載されているか確認
- 廃止済み Decision は物理削除を第一選択肢とする。実体が各 retired/ ディレクトリへ移動された場合は README の Retired/ Historical View に全 Decision が記載されているか確認する
- Current View に記載されているがファイルが存在しないDecisionを検出
- ファイルが存在するが Current/Retired View いずれにも未記載のDecisionを検出
- Retired View と current Decision の番号重複がないことを確認

### Decision ↔ Decision

- `superseded_by` リンクの妥当性を確認
  - 後継Decisionが存在すること
  - 循環参照がないこと（A → B → A）
- Decision本文内の参照（Related Decisions）の整合性を確認

### REQ ↔ Decision

- REQ本文の「関連情報」セクションに記載されたDecision番号の存在確認
- Decisionが存在しない場合、Decision作成を推奨（要件がアーキテクチャ判断を含む場合）
- DecisionがREQを参照していない場合、関連性の再評価を推奨

### Issue ↔ Decision

- DecisionファイルはIssueから一方向参照（Issue本文にDecision番号を記載）
- DecisionファイルからIssueへの逆参照は原則禁止する。Decisionを実装履歴に引きずらせないため
- **例外**: Decision作成の経緯としてIssue番号を背景（Context）に記載することは許可する。ただし、Decision本文の決定内容が特定Issueの実装詳細に依存しないこと

## README 分類ビューの運用

`docs/decisions<README>.md` に以下の分類ビューを設ける:

- **現行基準ビュー（Current Baseline View）**: 現行の基準Decision（`docs/decisions/<DEC-*>.md`）の基本情報テーブル（番号、タイトル、ステータス、作成日）
- **廃止履歴ビュー（Retired/ Historical View）**: retired Decision（各 retired/ ディレクトリ配下、運用上移動された場合）のテーブル（番号、タイトル、retired時ステータス、引き継ぎ先）。物理削除が第一選択肢
- **状態別ビュー（Status View）**: ステータス別の分類（proposed/ accepted/ superseded）
- **主題別ビュー（Topic View）**: 対象領域別の分類
- **意思決定マップ（Decision Map）**: Decision間の関係性（supersedes/ relates-to）
- **関連REQ（Related REQ）**: 各Decisionが関連するREQ番号

**関連REQ/ 意思決定マップ（Related REQ/ Decision Map）の構成ルール**:
- REQ本文に記載された Related Decisions などの基準情報から構成する
- README.md の情報は分類ビューであり、Decision本文のSSoTではない
- Decision本文を更新した場合は README.md の該当箇所も更新する

**README.md の更新タイミング**:
- Decision CREATE 時: 全ビューに反映
- Decision UPDATE（ステータス変更）時: 状態別ビュー（Status View）を更新
- Decision APPEND（関連情報追加）時: 意思決定マップ/ 関連REQ を更新

## ステータス変更時の README 整合性検証

Decision の `status` を変更した場合、`docs/decisions<README>.md` の全ビューが実ファイルと一致していることを検証する。
ステータス変更と README 更新が同一変更内で行われないと、README と実ファイルの不整合が発生する。

### 検証対象ビュー

| ビュー | 検証内容 |
|---|---|
| 現行基盤ビュー | 変更後 status が `accepted` の場合のみ現行基盤ビューに掲載。`superseded`/`deprecated` に遷移した場合は現行基盤ビューから除外されていること |
| 状態別ビュー（superseded） | `superseded` の Decision が「置き換え済み」セクションに掲載され、`superseded by DEC-MMM` が明記されていること |
| 状態別ビュー（deprecated） | `deprecated` の Decision が「非推奨」セクションに掲載され、deprecation 理由が明記されていること |
| トピック別ビュー | トピック分類は status によらず維持（歴史的参照のため）。ただし status 表記がある場合は実ファイルと一致 |
| 意思決定マップ | `superseded-by`/`supersedes` のリレーションが正しく記載されていること |

### 検証手順

1. Decision frontmatter の `status` を読み取る
2. `docs/decisions<README>.md` の各ビューを照合し、実ファイルと一致しているか確認する
3. 不整合を検出した場合、ステータス変更と README 更新を同一変更（同一 PR、同一コミット群）で実施する
4. 整合性確認を保存前の検証ステップに組み込む（`req-save`、`case-update` での Decision status 変更時）

### 共起必須項目

| status 遷移 | frontmatter 必須項目 | README 必須反映 |
|---|---|---|
| `accepted` → `superseded` | `superseded_by: DEC-MMM` | superseded セクションへ移動、`superseded-by` リレーション明記、現行基盤ビューから除外 |
| `accepted` → `deprecated` | （deprecation 理由を本文に明記） | deprecated セクションへ移動、deprecation 理由を簡潔に明記、現行基盤ビューから除外 |
| `proposed` → `accepted` | （更新日時のみ） | 現行基盤ビューに掲載、accepted セクションに掲載 |

## APPEND/UPDATE 判定基準

### 判定フロー

```
操作対象は既存Decisionファイルか？
  ├── NO → CREATE
  └── YES → 既存セクションの「内容」を変更するか？
              ├── NO（新規セクション追加・補足説明） → APPEND
              └── YES（テキスト置換・ステータス変更・フィールド更新） → UPDATE
```

### APPEND条件

- 既存セクションへの内容追加（サブアイテム、メモの追記）
- 新規セクションの追加（Post-implementation Notes、追加の参照Decision等）

### UPDATE条件

- 既存セクションの内容修正（テキスト置換、表現変更）
- frontmatter フィールドの変更（status変更、title変更等）
- ステータス遷移（proposed → accepted など）

## accepted Decision 直接編集チェックリスト

accepted status の Decision へ直接編集（UPDATE）を実施する場合、SPEC `agentdev-decision-file-manager` の「accepted Decision 直接編集チェックリスト」セクションに従い、以下の全てを満たすことを確認する（`agentdev-decision-guidelines`「accepted Decision の更新規則」準拠）。
本節は実行入口の要約であり、正規原本は SPEC とする。

本チェックリストの見出し（`accepted Decision 直接編集チェックリスト`）は歴史的経緯により ADR という語を含まない `accepted Decision` 表記を採用する。
これは本スキルが ADR から Decision へ移行した成果物であることによる。
v2:ADR-* 形式の過去参照は原本 SPEC 側で保持する。

### 事前確認

- [ ] 対象 Decision の frontmatter `status` が `accepted` である（現行 Decision であること、`superseded`/`deprecated` は対象外）
- [ ] 当該編集が「非意味修正6件」のいずれかに該当する
- [ ] 当該編集が「意味変更6件」のいずれにも該当しない（該当する場合は新規 Decision で処理）
- [ ] 明示承認記録が存在する

### 非意味修正6件（直接更新可能）

1. 誤字、文字化けの修正
2. 壊れたリンク、誤ったファイルパスの修正
3. タイトルと本文の不一致修正
4. 意味を変えない表記統一
5. 決定内容でも制約でもない移行時ラベルの除去
6. 履歴注記、関連リンク、日付などの補助情報（メタデータ）修正

意味変更6件の分類は `agentdev-decision-guidelines`「accepted Decision の更新規則」を正とする。

### 事後確認

- [ ] 決定内容、適用範囲、必須条件、制約、正規所有者、採用方式、観測可能結果が変更されていない
- [ ] 意味変更を表記修正として扱っていない
- [ ] accepted Decision の過去版を無言で書き換えていない
- [ ] Report（Release Report 等）へ規範要件または必達条件を移していない
- [ ] `docs/decisions<README>.md` の各ビュー（現行基盤、状態別、関連REQ、意思決定マップ）が変更後の実ファイルと整合している（本ファイル「ステータス変更時の README 整合性検証」参照）
- [ ] 対象 Decision を正規根拠として参照する SPEC、REQ への影響がないことを確認する

### 直接編集と APPEND/UPDATE 操作の判定基準

| 状況 | 操作 |
|---|---|
| accepted Decision へ非意味修正6件のいずれかを適用し、事前/事後確認を全て満たす | 直接編集（UPDATE） |
| 意味変更6件のいずれかに該当する編集 | 新規 Decision 作成（`agentdev-decision-guidelines` の判定へ委譲） |
| accepted Decision へ新規セクションを追加する（補足、参照、履歴注記） | APPEND（本チェックリストは適用外、意味不変の追加であること） |
| `proposed`/`deprecated`/`superseded` の Decision への編集 | 本チェックリストの対象外。各ステータス遷移ルールに従う |
