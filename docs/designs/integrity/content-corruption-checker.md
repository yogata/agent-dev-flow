---
title: "決定的破損検査クラス"
status: draft
created: "2026-08-30"
updated: "2026-08-30"
---

<!-- ADF-COVERS(design): REQ-010-071, REQ-053-012 -->

# 決定的破損検査クラス

配布 command・skill の本文記述に対する決定的破損検査（content corruption check）の検査クラス契約を正規所有する。
REQ-053-012 が要求する機械判定可能な文章品質違反の決定的検査を実現する。
REQ-010-009 に従い、checker 個別ルール（検出シグナル、検出平面、誤検出抑制方式）を本 Design が所有する。
checker 実装と回帰テストは本 Design の契約を実装・固定する。

## 検査対象

### 走査対象

- 配布 command 本文: `src/opencode/commands/agentdev/**/*.md`
- 配布 skill 本文: `src/opencode/skills/**/*.md`

REQ-010-071 が要求する docs-check 実行時の「配布 command・skill 全体」への適用をこの走査範囲で満たす。

### 検出対象（9 検出カテゴリ）

| rule_id | 検出対象 | REQ 参照 |
|---|---|---|
| `heading-hierarchy` | 見出し階層不整合（前見出しからのレベル飛び） | REQ-053-008 |
| `unclosed-code-block` | 未閉鎖コードブロック（fence マーカー数の奇数） | REQ-053-008 |
| `broken-link` | 壊れたリンク（未閉鎖リンク記法、空 target、配布物内に不在の相対 target） | REQ-053-008 |
| `broken-code-span` | 壊れたコードスパン（段落内 backtick ラン数の奇数） | REQ-053-008 |
| `broken-emphasis` | 強調記法の破損（ペア除去後の段落内 `**` 残存の奇数） | REQ-053-008 |
| `control-char` | 制御文字混入（`\t` `\n` `\r` を除く C0/C1 制御文字と DEL） | REQ-053-009 |
| `invalid-unicode` | 不正な Unicode 文字（BOM、U+FFFD、noncharacters、私用領域、不可視整形文字） | REQ-053-009 |
| `foreign-script` | 意図しない異言語文字（日本語・英語コーパス外の文字スクリプト） | REQ-053-009 |
| `stale-reference` | 既知形式の参照残骸（retired 配下パスへのリンク、`ADR-NNN` 旧形式、`REQ-0108-NNN` 旧ナンバリング） | REQ-053-010 |

機械判定不能な項目（明らかな誤字等）は対象外であり、査読観点で扱う。

## 検出平面

1 ファイルを次の検出平面に分割して走査する。

| 平面 | 対象行 | 適用カテゴリ |
|---|---|---|
| 文字平面（charScan） | frontmatter を除く全行（fence 内・HTML コメント内を含む） | `control-char`、`invalid-unicode`、`foreign-script` |
| 構造平面（structural） | frontmatter、fenced code block、HTML コメント領域を除く本文行 | 上記以外の全カテゴリ |

frontmatter は機械データ平面であるため全検出対象から除外する。
fenced code block と HTML コメント領域はレンダリング対象外であるため構造平面から除外する。
ただし文字平面では生ファイル品質の問題として走査を維持する。

fence の開閉判定は CommonMark に従う（3 連以上、先行空白 3 以下、閉 fence は同種・開 fence 以上の長さ・情報文字列なし）。
HTML コメント領域の判定は行単位近似である（`<!--` を含む行で開始し、以降の `-->` を含む行で終了する）。

## 検出シグナル

### 見出し階層不整合（heading-hierarchy）

構造平面の見出し行（`#{1,6}` + 空白 + 非空白）を走査し、前見出しより 2 以上のレベル飛びを検出する。
レベル段増（h1 → h2 → h3）は不整合としない。

### 未閉鎖コードブロック（unclosed-code-block）

ファイル全体の fence マーカー行数が奇数である場合、未閉鎖のブロックが存在するものとして検出する。
fence トグルは HTML コメント領域内では動作しない（コメント内 fence は fence として機能しないため）。

### 壊れたリンク（broken-link）

構造平面の段落（空行区切りの連結行）単位で次を検出する。

- `[text](` で開いたまま段落内に対応する `)` が存在しない
- `()` 空ターゲットのリンク
- 相対 target（`http(s):`、`mailto:`、`#` 以外）が配布物内に実在しない

外部 URL・アンカー単独参照は不在判定の対象外とする。

### 壊れたコードスパン（broken-code-span）

段落内の inline backtick ラン数（`` ` `` 連続列の個数）が奇数である場合を検出する。
テーブル行は 1 行を独立段落として扱い、隣接行のマーカー数と合算しない。

### 強調記法の破損（broken-emphasis）

段落単位で次の順に処理した残存 `**` の総数が奇数である場合を検出する。

1. 強調ペア除去: `**` の直後が空白・`*`・`/` でないペア `**...**` を除去する。本体は行をまたぎ得る（同一段落内の複数行強調は正当な CommonMark 記法である）
2. glob 語彙除去: パス区切りに隣接する `**`（`docs/**`、`**/*.md`、語尾型 `docs/** `）を除去する

既知近似限界: glob 語彙除去により、閉じマーカー直前が `/` である強調（`**path/**`）は強調ペアとして先に除去されるため誤検出しない。
一方で、壊れた `**` が 2 つ同じ段落に存在する場合、ペア除去が偽ペアを形成して検出から漏れることがある。
この限界は行単位検出と段落単位検出のトレードオフとして受容する。

### 文字系カテゴリ（control-char、invalid-unicode、foreign-script）

1 文字単位で決定的に検出し、文字コードを報告に含める。
`foreign-script` の検出対象スクリプト集合は checker 実装の文字クラス定義を正とする。
日本語コーパスで正当な文字（ASCII、ひらがな、カタカナ、CJK 統合漢字、CJK 記号句読点、全角フォーム）は対象外である。

### 既知形式の参照残骸（stale-reference）

- retired 配下パスへのリンク target（`requirements/retired/`、`retired/REQ-` 前置）
- `ADR-\d{3}` 形式の参照（現行の Decision 形式は `DEC-NNN`）
- `REQ-0108-\d{3}` 形式の旧ナンバリング参照

## 許容例列挙

「意図しない異言語文字」の意図的有用性は機械判定できないため、checker は対象ファイル単位の許容例列挙（`ALLOWED_USAGE`）を持つ。
列挙の正規所有は本 Design であり、checker 実装は本節に従い列挙外の除外を独自に追加しない（checker-execution-contracts Design「検出対象除外規定」準拠）。

導入時点で許容例列挙は空である。
現行配布 corpus には異言語文字・不可視文字・制御文字が存在しないことを導入時の実走査（配布物 230 ファイル、findings 0 件）で確認済みである。

追加運用:
許容例を追加する場合は、対象ファイル・rule_id・根拠（意図的使用の理由）を本節に追記した上で checker の列挙に反映する。
許容例の追加は REQ-010-068 の回帰テスト（許容例 fixture）の更新を伴う。

## 回帰テスト契約

REQ-010-068 に従い、次の 5 種 fixture を含む回帰テストを必須とする。
テスト実装は `.opencode/skills/repo-agentdev-integrity/scripts/check_content_corruption.test.ts` である。

| fixture 種別 | 固定する契約 |
|---|---|
| 正常例 | 完全に正当な配布物形式文書が findings 0 であること |
| 違反例 | 9 検出カテゴリそれぞれの最小違反が検出されること |
| 境界例 | 検出境界（複数行強調、glob 語彙、fence 内、テーブル行独立性、コメント平面、frontmatter 平面、レベル段増）の合否 |
| 許容例 | 許容例列挙への登録が登録ファイル + 当該 rule のみ抑制すること、未登録は検出されること |
| 再現例 | 導入時に実 corpus で検出された破損形（BEL による 1 文字置換 2 件、見出し階層飛び 2 件、テーブル行未閉コードスパン 1 件）の再現検出 |

不合格時は fix-and-reverify である（Case Issue テスト戦略 TS-003）。
checker 実装またはテスト fixture のいずれかの修正で消去可能なためである。

## 実装契約

本 Design が定める検査クラスを実装する検査スクリプトとその呼出し契約。

- **検査スクリプト**: `.opencode/skills/repo-agentdev-integrity/scripts/check_content_corruption.ts`
- **実装宣言**: `<!-- ADF-COVERS(implementation): REQ-010-071, REQ-053-012 -->` を checker 本体に持つ。docs-check 実行入口（`.opencode/commands/repo/docs-check.md`）も追加入口の実装対応宣言として REQ-010-071 を宣言する
- **検証宣言**: `<!-- ADF-COVERS(verification): REQ-010-071, REQ-053-012 -->` を回帰テスト本体に持つ
- **実行ランナー**: Bun（`bun run`）。TypeScript 直接実行と `require()` / `import` 混在構文を前提とするため、Bun 以外のランナーでは ESM 解釈エラーが発生する
- **CLI 契約**: `--root <path>`（リポジトリルート、既定は cwd 上方探索）、`--json`（機械可読出力）、`--help`。exit code は 0 ok、1 violation、2 error
- **再帰ファイル探索**: `lib/glob_walk.ts` の共有ヘルパーを使用する（checker-execution-contracts Design「再帰ファイル探索と CLI 引数解析の標準API移行」準拠）
- **CLI 引数解析**: `node:util.parseArgs` を使用する（同一 Design 準拠）
- **docs-check からの呼出し**: `/repo/docs-check` STEP-1 が `bun run` で実行する。failure は docs-check 全体を fail とする

## 対象外

- 検査の実行 Hook の新設（REQ-010-071 対象外）
- docs-check 検査体系の再設計
- 機械判定不能な項目（明らかな誤字等、査読観点）
- 配布物以外（repo-local command、docs/ 配下の本文記述）への適用
- 外部 URL の到達性検査（ネットワーク依存検査は決定的検査の対象外）

## See Also

- checker-execution-contracts.md（checker 共通実行契約、検出対象除外規定）
- integrity-contracts.md（スクリプト契約）
- REQ-010-068（新規検査クラスの回帰テスト義務）
- REQ-053（配布物の文章品質契約）
