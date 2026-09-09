---
id: REQ-053-TEXTLINT-WAVE2-CALIBRATION
title: "textlint Wave2 規則校正・規則固定・正式初期判定の実行記録"
status: accepted
created: 2026-09-09
source_issue: "#2736"
parent_epic: "#2734"
---

<!-- ADF-COVERS(implementation): REQ-053-034, REQ-053-037 -->

# textlint Wave2 規則校正・規則固定・正式初期判定の実行記録

本 Report は、textlint 是正キャンペーン Epic（#2734）Wave 2（Issue #2736、RA-003 規則校正と規則固定）の実行記録である。対象解決後 corpus での規則ごとの option・severity 確定（校正記録）、DEC-001 決定4の7条件による拒否対象昇格判定（昇格なし）、規則と依存版の固定（固定記録）、正式初期判定の実行と初期不合格一覧の記録を行う。測定値はすべて本 Report のとおり実測であり、Design 本文へは混在させない（textlint 品質基盤 Design「規則校正と移行検証」節のとおり）。実行環境は worktree `.worktrees/2736-refactor`、base c430ae9d（origin/main と同一）。実行識別情報（委譲単位 DEL-2736-1）と最終 HEAD の確定値（コミットハッシュ）は該当 PR 本文に記録する。

Wave1（Issue #2735）で確定した対象解決（既定除外 `**/node_modules/**`、`docs/requirements/retired/**`、`docs/reports/**` と追加対象 5 glob の加算）を前提とする。本 Report 自身は `docs/reports/**` 既定除外により textlint 検査対象外である。

## 1. 実測ベースライン（校正前）

実行形式: 最終検査入口（`gate.ts --root . --json`）による全対象列挙・実ファイル全文検査（2026-09-09 実測）。

| 項目 | 実測値 |
|---|---|
| 解決対象ファイル数 | 493 |
| 拒否対象違反（hardCount） | 0（終了コード 0） |
| 助言指摘 | 8,017 件 / 447 ファイル |

既知差異: Issue #2736 本文の「504ファイル」は case-open 時のベースライン参考値である。実測 493 は並行作業（#2731 agentdev-doc-writing 退役等）による corpus 移動を反映した値であり、PR #2745 の stale-reference 記録と同内容の差異である。本校正は実測 493 ファイルを corpus として実施した。

校正前の規則別助言件数（上位）: sentence-length 2,504 / max-kanji-continuous-len 1,856 / no-ai-list-formatting 1,825 / ja-no-mixed-period 563 / no-mix-dearu-desumasu 367 / no-ai-colon-continuation 213 / ja-no-redundant-expression 206 / no-doubled-joshi 145 / ja-no-successive-word 97 / ai-tech-writing-guideline 71 / max-comma 44 / max-ten 31 / arabic-kanji-numbers 29 / no-ai-emphasis-patterns 22 / no-exclamation-question-mark 17 / no-ai-hype-expressions 12 / no-doubled-conjunction 11 / ja-no-weak-phrase 3 / no-doubled-conjunctive-particle-ga 1。

## 2. 校正記録（規則ごとの option・severity 確定）

採用 29 規則（preset-ja-technical-writing 23、preset-ai-writing 5、prh 1）すべてについて、実測と誤検出確認に基づき option と severity を確定した。校正後の option 変更は 3 規則で、severity の変更（昇格・降格）は 0 件である。

### 2.1 拒否対象（severity error、維持）

| 規則 | 判断 | 誤検出確認 |
|---|---|---|
| preset-ja-technical-writing/no-hankaku-kana | 維持（hard） | 文字クラス判定。実測違反 0 件。誤検出なし |
| preset-ja-technical-writing/no-invalid-control-character | 維持（hard） | 文字クラス判定。実測違反 0 件。誤検出なし |
| preset-ja-technical-writing/no-nfd | 維持（hard） | 文字クラス判定。実測違反 0 件。誤検出なし |
| preset-ja-technical-writing/no-zero-width-spaces | 維持（hard） | 文字クラス判定。実測違反 0 件。誤検出なし |
| prh | 維持（hard） | 完全一致検出（標準辞書 12 語、プロジェクト辞書不在）。実測違反 0 件。誤検出なし |

### 2.2 助言対象（severity warning、option 校正あり）

| 規則 | option 確定 | 実測根拠（校正前 → 校正後） |
|---|---|---|
| preset-ja-technical-writing/max-kanji-continuous-len | `max: 10`（プリセット既定 6 から変更） | 1,856 → 33。既定 6 での指摘は「現行成果物体系」「限定的親判断解決」「決定論的実行中核」等の 7〜10 字連続が大半で、題名・ルール名・手順名等の正規複合名詞である（漢字連続分布の実測: 7 字 1,070 件、8 字 605 件、9 字 193 件、10 字 51 件、11 字以上 37 件相当）。緩和後の残存 33 件は「版旧生成方式語彙混入検出」「数値閾値到達可能性検証」等の 11 字以上の長連続であり、中黒挿入等の可読性改善余地が実在する |
| preset-ai-writing/no-ai-list-formatting | `disableBoldListItems: true`（絵文字リスト検出は維持） | 1,825 → 28。校正前の指摘は全件「- **用語**: 説明」形式の太字リスト項目であり、本 corpus の慣行的な定義リスト表記として確立している。残存 28 件は ✅/❌/⚠️ 等の絵文字リスト項目であり、AI 由来の機械的体裁の検出として意図的に維持する |
| preset-ai-writing/no-ai-emphasis-patterns | `disableInfoPatterns: true`（絵文字+太字検出は維持） | 22 → 0。校正前の指摘は全件「**重要**」「**注意**」「**確認**」等の info プレフィックス太字であり、配布物の注意喚起慣行として確立している表記である |

### 2.3 助言対象（severity warning、option 維持）

| 規則 | option | 誤検出確認と判断 |
|---|---|---|
| preset-ja-technical-writing/sentence-length | 既定（max 100） | 2,504 件。100 字超の文の実長による指摘であり、構造的誤検出ではない。エンジニアリング仕様文書の長文の実在を反映し、助言対象として維持する。緩和すると正の長文指摘も消えるため緩和しない |
| preset-ja-technical-writing/ja-no-mixed-period | 既定（periodMark 。） | 563 件。excerpt に「:」「件」「）」等があり、定義リスト・テーブル由来の構造的指摘を多く含む。periodMark option 以外に対象絞り込み手段がなく、助言対象として維持する |
| preset-ja-technical-writing/no-mix-dearu-desumasu | 既定（本文 ですます / 箇条書き である / strict false） | 367 件。文書内の文体混在の実在検出であり、真の指摘を含む。option 変更の根拠なし。文書種別ごとの文体基準は本校正では確立しない（是正 Wave の判断に委ねる） |
| preset-ai-writing/no-ai-colon-continuation | 既定 | 213 件。名詞終端コロンは規則内で形態素解析により自動許可され、残存指摘は述語終端コロンである。真の指摘を含む |
| preset-ja-technical-writing/ja-no-redundant-expression | 既定 | 206 件。「することができる」等の真の冗長表現 |
| preset-ja-technical-writing/no-doubled-joshi | 既定（min_interval 1） | 145 件。助詞連続の実在指摘。見かけ上の連続も含むが語単位の除外 option は min_interval のみであり維持 |
| preset-ja-technical-writing/ja-no-successive-word | 既定 | 97 件。同語連続。入れ子括弧「））」由来の構造的指摘を含む。allow option は語単位許可のみであり維持 |
| preset-ai-writing/ai-tech-writing-guideline | 既定（ADF 共通構成が severity warning を所有） | 71 件。「することができます」「が行われ」等の冗長・受動態ガイダンス。frontmatter 全文を excerpt とする構造的指摘（3 件相当、`created:`/`updated:` 行を 1 文とみなす）は誤検出として記録する。プリセット既定 severity info を warning に上書きした現行構成を維持する（ja-no-redundant-expression と同等の是正価値があるため） |
| preset-ja-technical-writing/max-comma | 既定（max 3） | 44 件。半角カンマ 4 個以上の列挙。真の列挙過多指摘であり少件数 |
| preset-ja-technical-writing/max-ten | 既定（max 3） | 31 件。読点 4 個以上の列挙。真の指摘であり少件数 |
| preset-ja-technical-writing/arabic-kanji-numbers | 既定（JTF 2.2.2） | 29 件。「一」「二」等の算用数字化候補。識別子・引用由来の指摘を含むが少件数 |
| preset-ja-technical-writing/no-exclamation-question-mark | 既定 | 17 件。document-type-responsibilities.md の 6 件は「?」を例示テーブルで記載した例示由来であり、是正時は例示の fenced code 化が候補。残存は真の指摘。少件数のため維持 |
| preset-ai-writing/no-ai-hype-expressions | 既定 | 12 件。「完全に」「大幅に」。技術記述（「完全に一致」等）での文脈依存の指摘を含む。少件数 |
| preset-ja-technical-writing/no-doubled-conjunction | 既定 | 11 件。「または」の連続。真の指摘 |
| preset-ja-technical-writing/ja-no-weak-phrase | 既定 | 3 件。charter / DEC-001 内は意思決定記録の引用文脈。少件数 |
| preset-ja-technical-writing/no-doubled-conjunctive-particle-ga | 既定 | 1 件。真の指摘候補。少件数 |
| preset-ja-technical-writing/no-double-negative-ja | 既定 | 0 件。問題なし |
| preset-ja-technical-writing/no-dropping-the-ra | 既定 | 0 件。問題なし |
| preset-ja-technical-writing/ja-no-abusage | 既定 | 0 件。問題なし |
| preset-ja-technical-writing/ja-unnatural-alphabet | 既定 | 0 件。問題なし |
| preset-ja-technical-writing/no-unmatched-pair | 既定 | 0 件。問題なし |

## 3. 拒否対象への昇格判定（DEC-001 決定4の7条件）

DEC-028「条件を裏付けられない規則を拒否対象へ昇格させない」に従い、採用 29 規則すべてについて 7 条件の証拠を評価した。

**結果: 本校正では昇格規則なし。** 既存の拒否対象 5 規則（文字品質クラス 4 規則 + prh）を維持し、新たな昇格は行わない。

7 条件の評価（昇格候補となり得た高頻度助言規則すべてに共通する判断）:

| 条件 | 評価 |
|---|---|
| 1. 再現する問題 | 再現しない。助言指摘の多くは正規の術語・慣行形式・文書構造由来であり、規則が指摘する「問題」のうち強制に値する被害を再現する証拠がない（第 2 節の誤検出確認のとおり） |
| 2. 強制に値する被害 | 証拠なし。可読性・文体の助言レベルの改善であり、被害の実測・事例が存在しない |
| 3. 既存機構では防げない理由 | 立証できない。語彙統制は prh 辞書（既存機構、完全一致・決定的）で強制可能であり、ヒューリスティック規則の pre-write 拒否は誤検出時の執筆阻塞を生む |
| 4. 実行可能性 | pre-write 拒否機構は実装済みであり技術的には可能。ただし単独では昇格条件を満たさない |
| 5. 単一の所有者 | ADF 共通構成（lib/rules.ts）。所有は一元だが他条件不成立 |
| 6. 削減される旧機構 | ない。prh 辞書が既に語彙統制を所有しており、ヒューリスティック規則の昇格は旧機構の削減を伴わない |
| 7. 再評価条件 | 未定義。DEC-028 の再評価条件（誤検出の増加、API の変化、同等保証を持つ既存機構への統合）を満たした時点で改めて評価する |

決定的規則（文字品質クラス・prh）は既に拒否対象であり、残る 24 規則はいずれもヒューリスティックな規則または構造的誤検出を含む規則である（Design「ヒューリスティックな規則を一律に拒否対象としない」のとおり）。

## 4. 固定記録（規則構成と依存版、REQ-053-034）

校正完了時点の規則構成と依存版を固定する。実装は `src/opencode/plugins/agentdev-textlint-guard/lib/rules.ts` の `HARD_RULE_IDS`、`CALIBRATED_RULE_OPTIONS`、依存版は `package.json` + `bun.lock`、および配布済み vendored engine bundle（`vendor/textlint-engine.bundle.json`、オフライン起動）で固定される。

### 4.1 規則構成識別子

**規則構成ハッシュ（SHA-256）: `8b6aea87e3987e9b3f5347a883bb8f7e436a5b9d712c617553c0f6d96af59c73`**

再計算手順（Wave5 が同一手順で突合する）:

1. `prepareInspection(root)` を実行し `composition.rules`（ruleId + options）を取得する（plugin dir を cwd として `bun` で実行）
2. rules を ruleId 辞書順にソートし、各規則について `ruleId + "\t" + キー順正規化 canonical JSON(options)` の行を連結する
3. prh 標準辞書（`rules/default-prh.yml`）の内容 SHA-256、prh rulePaths 数、依存版一覧（`describeEngineVersions`）、`hardRuleIds` 辞書順連結を順に付与し SHA-256 を取る

構成要素の実測値（2026-09-09 計算時点）:

| 要素 | 値 |
|---|---|
| 採用規則数 | 29（ja preset 23 + ai preset 5 + prh 1） |
| prh 標準辞書 SHA-256 | `98c1ac19d8f6f2f85b4cab978ea9f752f35c93c14040c3227f0567f6a21b500e`（12 語登録） |
| 拒否対象規則 | no-hankaku-kana、no-invalid-control-character、no-nfd、no-zero-width-spaces、prh の 5 規則 |
| プロジェクト用語辞書 | なし（`.agentdev/config/plugins/agentdev-textlint-guard-prh.yml` 不在。標準構成だけの正常状態） |

### 4.2 依存版記録

| 依存 | 固定版 | 固定手段 |
|---|---|---|
| @textlint/kernel | 14.8.4 | bun.lock + vendored engine bundle |
| @textlint/textlint-plugin-markdown | 14.8.4 | bun.lock + vendored engine bundle |
| textlint-rule-preset-ja-technical-writing | 12.0.2 | bun.lock + vendored engine bundle |
| @textlint-ja/textlint-rule-preset-ai-writing | 1.7.0 | bun.lock + vendored engine bundle |
| textlint-rule-prh | 6.1.0 | bun.lock + vendored engine bundle |

bun.lock は本校正の実装変更で未変更である（`bun install` 実行後も `git status` で差分なし）。依存版の変更を伴わないため、authoring/dependency-version-compatibility.md の互換性事前確認は不要と判断した。

## 5. 正式初期判定（固定規則での実測、REQ-053-037）

規則構成ハッシュ **`8b6aea87e3987e9b3f5347a883bb8f7e436a5b9d712c617553c0f6d96af59c73`** を用いて、第 1 節のベースライン（8,017 件）と同一の対象解決下で正式初期判定を実行した。

| 項目 | 実測値 |
|---|---|
| 実行形式 | `bun run src/opencode/plugins/agentdev-textlint-guard/gate.ts --root . --json` |
| 検査ファイル数 | 493 |
| 拒否対象違反（hardCount） | **0（終了コード 0）** |
| 初期不合格ファイル（拒否対象違反あり） | **0 ファイル（空一覧）** |
| 助言指摘 | 4,375 件 / 422 ファイル |

初期不合格ファイル一覧は空である（拒否対象違反ゼロ）。現時点で拒否対象違反が存在しないという事実そのものを本節に記録する。Wave 3/4（是正）に初期不合格ファイルの是正対象は存在しない。

規則別の検出件数（正式初期判定）:

| 規則 | 拒否対象 | 助言 |
|---|---|---|
| preset-ai-writing/ai-tech-writing-guideline | 0 | 71 |
| preset-ai-writing/no-ai-colon-continuation | 0 | 213 |
| preset-ai-writing/no-ai-emphasis-patterns | 0 | 0 |
| preset-ai-writing/no-ai-hype-expressions | 0 | 12 |
| preset-ai-writing/no-ai-list-formatting | 0 | 28 |
| preset-ja-technical-writing/arabic-kanji-numbers | 0 | 29 |
| preset-ja-technical-writing/ja-no-mixed-period | 0 | 563 |
| preset-ja-technical-writing/ja-no-redundant-expression | 0 | 206 |
| preset-ja-technical-writing/ja-no-successive-word | 0 | 97 |
| preset-ja-technical-writing/ja-no-weak-phrase | 0 | 3 |
| preset-ja-technical-writing/max-comma | 0 | 44 |
| preset-ja-technical-writing/max-kanji-continuous-len | 0 | 33 |
| preset-ja-technical-writing/max-ten | 0 | 31 |
| preset-ja-technical-writing/no-doubled-conjunction | 0 | 11 |
| preset-ja-technical-writing/no-doubled-conjunctive-particle-ga | 0 | 1 |
| preset-ja-technical-writing/no-doubled-joshi | 0 | 145 |
| preset-ja-technical-writing/no-exclamation-question-mark | 0 | 17 |
| preset-ja-technical-writing/no-mix-dearu-desumasu | 0 | 367 |
| preset-ja-technical-writing/sentence-length | 0 | 2,504 |
| prh | 0 | 0 |
| （上記以外の採用規則） | 0 | 0 |

## 6. 助言対象の取り扱い（CR-001）

助言対象のまま残す規則の指摘（正式初期判定時点で 4,375 件）は、是正完了の必須条件としない。Wave 3/4（是正）および Wave 5（最終検証）の完了条件は拒否対象違反ゼロのみである。助言指摘は是正候補の提示であり、検査不合格の根拠としない（共通基盤の契約および DEC-028「助言対象の規則および意味診断の助言をこの例外によって一律の拒否条件へ変更しない」のとおり）。

正式初期判定以降は本 Report 第 4 節の規則構成を変更しない。規則の緩和による既知違反の合格扱い（baseline suppression、事後降格）は認められない（DEC-028、REQ-053-037）。既知違反を基準値へ登録しての合格扱い、規則緩和、severity の事後降格は本校正では行っていない。

## 7. Wave5 への引き継ぎ（TS-001 突合要素）

最終検証（Wave5、TS-001）は本節を参照し、初期判定と同一規則であることを突合する。

| 突合要素 | 正式初期判定（本 Report） | 最終検証（Wave5）で確認すべき値 |
|---|---|---|
| 規則構成ハッシュ | `8b6aea87e3987e9b3f5347a883bb8f7e436a5b9d712c617553c0f6d96af59c73` | 同一値であること（第 4.1 節の手順で再計算） |
| 拒否対象規則（5 規則） | 上記第 4.1 節のとおり | 同一であること |
| 検査入口 | `gate.ts --root . --json` | 同一入口・同一規則で実行すること |
| 初期不合格ファイル | 0 ファイル | 最終 0 ファイルを維持すること（REQ-053-020/038） |
| 助言指摘 | 4,375 件 / 422 ファイル | 完了条件に含めない（第 6 節 CR-001） |
| 解決対象ファイル数 | 493 | corpus 変動があり得る（Wave1〜4 の変更を反映）。同一規則構成での再実測値を記録すること |

 Wave5 の実行時点で corpus ファイル数は是正 Wave の変更により変動し得る。突合対象は規則構成ハッシュと拒否対象違反のゼロ維持であり、ファイル数・助言件数の一致は要求しない。
