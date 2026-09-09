---
draft_type: req_draft
topic_slug: adf-textlint-guard-and-doc-writing-retirement
status: saved
created_at: "2026-09-09T10:03:26+09:00"
---

# draft-data

```yaml
work_type: "feature"
scale: "large"
summary: "textlint を文章表層品質の共通実行基盤とし、書込み前検査と最終検査を提供する。既存の意味品質と整合性検査を維持し、agentdev-doc-writing とその実行依存を退役させる。"
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
input_provenance:
  path: "C:/Users/ogatay/.codex/attachments/989aa51f-42e7-4461-95ac-dc42a4ad1924/pasted-text.txt"
  logical_key: "adf-textlint-guard-and-doc-writing-retirement"
  source_type: "chat"
  generated_by: "session"
  agreement_confirmed_at: "2026-09-08T15:23:08+09:00"
  agentdev_handoff: true
  session_uri: "session:agent-dev-flow-textlint-guard-20260908"
  handling: "明示された添付ファイルとして消費する。RU-ID とトップレベル status のない資料であり、採番済み RU として扱わない。8節相当の内容を本文から確認した。session URI は解決しない。本体リポジトリのため引き継ぎ標識は停止理由にしない。入力への書込み、RU作成、Git操作を行わない。"
agreed_items:
  -
    id: "AG-001"
    content: |
      ## 1. textlint 標準化
      
      ADF の文章表層品質検査は textlint を標準実装とする。
      
      ADF 標準のルール構成は少なくとも次を含む。
      
      * `textlint-rule-preset-ja-technical-writing`
      
        * 日本語技術文書の基本品質を担当する。
        * 文長、読点過多、文体混在、二重否定、助詞・接続詞重複、冗長表現、文字品質等、既存 preset で表現できる規範を ADF 独自実装から移管する。
      * `@textlint-ja/textlint-rule-preset-ai-writing`
      
        * AI 生成文に出やすい過剰強調、冗長性、機械的構造、抽象表現等を担当する。
        * heuristic 性が高い規則は hard error とせず、採用 preset の性質と ADF corpus での実測結果に基づいて severity を設定する。
      * `textlint-rule-prh`
      
        * プロジェクト固有の固定置換可能な用語・表記統一を担当する。
        * 例として `finding` / `findings` を散文では「指摘事項」に統一する等の規則を表現できること。
      * 文脈依存で固定置換できない禁止表現は、既存 textlint rule の pattern / NG-word 系機能を使用して「検出 + メッセージ」を実現する。
      
        * 例として「正本」を検出し、文脈に応じて「定義元」「基準となる文書」「元ファイル」「生成元」等へ具体化するよう通知できること。
        * この用途だけの ADF 独自文字列 detector は新設しない。
      
      textlint 本体と採用 rule / preset のバージョンは lockfile により固定する。
      
      consumer 利用者へ手作業の npm / Bun package install を要求しない。
      
      依存物の具体的な配置・解決方式は現行 Plugin package / 配布方式へ適合させるが、「install / self-sync 後に追加操作なしで利用可能」という外部契約を維持する。
  -
    id: "AG-002"
    content: |
      ## 2. プロジェクト固有用語
      
      プロジェクト固有の用語規則は consumer project 側が所有する。
      
      固定置換可能な用語規則には textlint / prh のネイティブ形式を利用し、ADF 独自の用語辞書スキーマを新設しない。
      
      ADF repository 自身も一つの ADF 適用プロジェクトとして、自身の用語規則を repository-local に保持する。
      
      プロジェクト固有用語が存在しない場合でも、ADF 標準の日本語技術文書ルールは有効とする。
      
      Markdown 内の inline code、fenced code block 等の構造的な除外は textlint の Markdown AST / 各 rule の標準機構を利用する。
      
      grep ベースの一般文章用独自除外ロジックを新設しない。
  -
    id: "AG-003"
    content: |
      ## 3. integrity vocabulary との分離
      
      プロジェクト固有用語・一般文章表層品質と、ADF の integrity vocabulary を同一視しない。
      
      特に、現行 `IR-065` / `IR-066` 等が扱う次のような検査は、単なる文章 style ではない。
      
      * 廃止語彙の現行概念としての使用
      * retired / historical artifact との区別
      * 旧パス、削除済み名称の残存
      * 歴史的識別子等の文脈依存 exemption
      
      この種の lifecycle / artifact-integrity 検査は、textlint と意味的に等価な検査へ完全移管できることが確認されない限り、既存 deterministic integrity checker の責務として維持する。
      
      「vocabulary を検査している」という理由だけで textlint へ移管しない。
      
      一方、現行 `IR-060` のように `agentdev-doc-writing` の一般文章用置換辞書を正規データとして完全一致検出している規則は、textlint への移管候補として扱う。
      
      移管後は ADF 独自一般文章辞書への依存を残さない。
  -
    id: "AG-004"
    content: |
      ## 4. OpenCode Plugin
      
      新規 consumer 配布 Plugin を追加する。
      
      想定配置は次の通りとする。
      
      `src/opencode/plugins/agentdev-textlint-guard/`
      
      Plugin は OpenCode の `tool.execute.before` hook を利用し、少なくとも次の tool を対象とする。
      
      * `write`
      * `edit`
      * `apply_patch`
      
      処理契約は次の通りとする。
      
      1. OpenCode Plugin 初期化入力から project root を解決する。
      2. `input.worktree` を第一候補とし、現行 Plugin の project-root 解決契約と整合させる。
      3. `input.worktree` が利用できない場合の fallback は、実装時点の OpenCode API と既存 Plugin 契約に整合する既知の project worktree 情報だけを使用する。
      4. tool 実行時に対象ファイルを特定する。
      5. `write` / `edit` / `apply_patch` 適用後の完成予定全文をメモリ上で再構成する。
      6. 完成予定全文を textlint の module API に渡す。
      7. lint hard error が1件以上あれば hook から例外を返し、tool 実行を拒否する。
      8. hard error がなければ tool 実行を許可する。
      9. NG 内容はディスクへ一度書いてから戻すのではなく、書込み前に拒否する。
      
      `apply_patch` が複数ファイルを変更する場合、対象となる全ファイルの完成予定内容を検査する。
      
      対象ファイルのいずれか1件でも hard error なら `apply_patch` 全体を拒否する。
      
      対象パス解決不能、project root 外への escape、supported tool の入力不正、必要な既存ファイルの読込失敗等により安全に検査を完了できない場合は fail-closed とする。
      
      違反メッセージには少なくとも以下を含める。
      
      * 対象パス
      * 行・列または textlint が返す位置情報
      * rule ID
      * 問題となる表現または判定可能な該当範囲
      * rule が replacement / guidance を提供する場合はその内容
      
      これにより OpenCode agent が失敗理由を受け取り、文章を再編集して同じ tool を再実行できるようにする。
  -
    id: "AG-005"
    content: |
      ## 5. 標準対象パス
      
      ADF が consumer project に提供する標準対象は次に固定する。
      
      `docs/**/*.md`
      
      ADF のドキュメント体系では、人間向け project documentation は `docs/` 配下にあることを標準契約とする。
      
      source code を一般日本語文章 lint の対象にしない。
      
      標準対象 `docs/**/*.md` は project-local 設定で削除・置換できない。
  -
    id: "AG-006"
    content: |
      ## 6. Project-local Plugin 設定
      
      各 project は必要な場合だけ次の repository-local 設定を持てるようにする。
      
      `.agentdev/config/plugins/agentdev-textlint-guard.yaml`
      
      初期 schema は以下に限定する。
      
      ```yaml
      version: 1
      
      additional_targets:
        - "path/**/*.md"
      ```
      
      契約は次の通りとする。
      
      * 設定ファイルが存在しない場合は正常とし、`docs/**/*.md` のみを対象にする。
      * `additional_targets` は標準対象へ加算するだけとする。
      * `additional_targets` により `docs/**/*.md` を無効化できない。
      * path は project root 相対の glob とする。
      * project root 外への traversal を許可しない。
      * 設定ファイルが存在するが YAML 構文または schema が不正な場合は fail-closed とする。
      * 設定が不正な状態では、対象判定を推測して lint を迂回せず、supported write tool を拒否して設定エラーを返す。
      * Plugin は project root を基準に固定相対パスの設定を読む。
      * Plugin 自身の配置パスや `import.meta.url` を project root として扱わない。
      * 設定は hook 実行時に変更を検知し、OpenCode 起動後に設定を変更した場合もセッション再起動なしで反映されること。
      
      初期実装は毎回 read + parse でもよい。
      
      cache を導入する場合も、mtime 等により設定変更を確実に再読込できること。
  -
    id: "AG-007"
    content: |
      ## 7. ADF repository 自身の追加対象
      
      ADF repository 自身は次の project-local 設定を持つ。
      
      `.agentdev/config/plugins/agentdev-textlint-guard.yaml`
      
      内容は次の通りとする。
      
      ```yaml
      version: 1
      
      additional_targets:
        - "src/opencode/commands/**/*.md"
        - "src/opencode/skills/**/*.md"
      ```
      
      これにより ADF 自身では次を textlint 対象とする。
      
      * `docs/**/*.md`
      * `src/opencode/commands/**/*.md`
      * `src/opencode/skills/**/*.md`
      
      ADF 専用の if 分岐を Plugin source に入れない。
      
      ADF 専用 Plugin を別 package として作らない。
      
      同一の consumer 配布 Plugin が ADF 自身の project-local 設定を読むことで対象範囲を拡張する。
      
      この追加対象設定は既存の `.agentdev/extensions/skills/**` へ記述しない。
      
      Skill Project Extensions は Skill の意味・context・checks 等を拡張する仕組みであり、deterministic runtime Plugin の対象パス設定には使用しない。
  -
    id: "AG-008"
    content: |
      ## 8. 最終 textlint gate
      
      pre-write hook だけを完全性の根拠にしない。
      
      shell / script、外部 editor、生成 script 等、OpenCode の `write` / `edit` / `apply_patch` hook を通らない変更経路を考慮し、workflow の完了判定前に final textlint gate を実行する。
      
      final gate は pre-write Plugin と同一の以下を再利用する。
      
      * project root 解決
      * project-local config loader
      * target 解決
      * textlint rule 構成
      * project-specific terminology rules
      * lint result formatting
      
      final gate の対象は `docs/**/*.md + additional_targets` の解決結果とする。
      
      ADF 自身では `docs/**/*.md`、`src/opencode/commands/**/*.md`、`src/opencode/skills/**/*.md` が対象となる。
      
      final gate は別の文章品質ロジックを持たず、同一 textlint 実行基盤の standalone entry point として提供する。
      
      consumer 共通の final gate を ADF 本体専用 `docs-check` の内部実装に閉じ込めない。
      
      ADF self-hosting の保存・完了・品質検査経路が final gate を必要とする場合は、この共通 entry point を利用する。
  -
    id: "AG-009"
    content: |
      ## 9. Plugin の配布・投影
      
      `agentdev-textlint-guard` は ADF 汎用の consumer 配布 Plugin とする。
      
      repo-local Plugin の除外対象へ追加しない。
      
      現行の Plugin 配布モデルに従い、少なくとも次の経路で同一 Plugin package が正しく扱われること。
      
      * `scripts/install.ps1` による checkout からの consumer 投影
      * consumer archive install
      * release archive 作成時の consumer 配布物への収録
      * `scripts/self-sync.ps1` による ADF self-host 投影
      * OpenCode が Plugin package を読み込むための depth-1 loader shim
      
      Plugin package と textlint runtime dependency は、consumer install と self-host の双方で追加の手作業 install を要求せず利用できること。
      
      配布方式の既存汎用列挙で自動的に扱える箇所へ、`agentdev-textlint-guard` 固有の特例分岐を追加しない。
  -
    id: "AG-010"
    content: |
      ## 10. `agentdev-doc-writing` の退役
      
      `agentdev-doc-writing` Capability Skill を完全退役させる。
      
      少なくとも次を削除・更新対象として棚卸しする。
      
      * `src/opencode/skills/agentdev-doc-writing/SKILL.md`
      * `src/opencode/skills/agentdev-doc-writing/references/**`
      * `.agentdev/extensions/skills/agentdev-doc-writing.yaml`
      * `docs/designs/skills/agentdev-doc-writing.md`
      * `AGENTS.md` の `agentdev-doc-writing` / `japanese-tech-writing` を文章規範参照点とする現行記述
      * `agentdev-doc-writing` を参照する active requirements / Design / Skill / routing / quality-control 文書
      * `REQ-053` にある `japanese-tech-writing` / `agentdev-doc-writing` を正規経路とする契約
      * `REQ-036` にある `agentdev-doc-writing` への意味診断ルーティング
      * `docs/designs/responsibilities/artifact-quality-control-routing.md` の `agentdev-doc-writing` 提供能力
      * `docs/designs/integrity/rules/IR-060-forbidden-japanese-word-detection.md` の `agentdev-doc-writing` 置換辞書依存
      * `src/third-party/skills.yaml` の `japanese-tech-writing` 宣言。ただし他の active consumer が存在しないことを確認してから削除する
      * `docs/designs/local/third-party-skill-management.md` 等にある `japanese-tech-writing` / `agentdev-doc-writing` 固有の利用前提
      * ADF 独自の日本語置換辞書、rewrite pattern、一般文章用機械検査規則のうち textlint へ移管するもの
      * `scripts/self/maintenance/apply-mechanical-replacement.ps1` 等、退役する一般文章 style 規則だけを実装している処理または分岐
      
      既存 maintenance script 等に文章品質以外の責務が共存する場合は、textlint 移管によって不要になる処理だけを削除し、無関係な機能を巻き込まない。
      
      退役後、active な ADF artifact から `agentdev-doc-writing` への実行依存・routing 依存を残さない。
      
      retired artifact、Report、履歴記録内の歴史的参照は、既存 lifecycle / integrity 契約に従って保持できる。
  -
    id: "AG-011"
    content: |
      ## 11. 意味品質責務の再配置
      
      textlint は文章の表層品質だけを担当する。
      
      REQ / Decision / Design / Command / Skill の意味論的判断を textlint rule 化しない。
      
      `agentdev-doc-writing` が混在所有していた意味品質責務は既存所有者へ再配置する。
      
      ### `agentdev-req-analysis`
      
      要件分析・作成過程における次の意味品質を所有する。
      
      * REQ と Design の境界判断
      * 要件としての主語、対象、状態、検証可能性
      * REQ 要件行の意味品質
      
      ### `agentdev-req-structure-diagnostics`
      
      `inspect-docs` から利用する REQ 構造診断は、現行どおり `agentdev-req-structure-diagnostics` を所有者とする。
      
      少なくとも次を `agentdev-req-analysis` へ重複移管しない。
      
      * SPLIT
      * MERGE
      * MOVE
      * DUPLICATE
      * RETIRE
      * DRIFT
      * REQ 構造としての事後診断
      
      要件分析時の意味品質と、既存成果物への診断責務を分離する。
      
      ### Decision 系責務
      
      * Decision の要否、成立条件は既存 `agentdev-decision-guidelines` 等が所有する。
      * Decision ファイルの作成・更新契約は既存 Decision file manager が所有する。
      * 決定内容、Context、根拠、代替案、Consequences 等の意味品質は Decision 関連の既存 Skill / Design へ整理する。
      
      ### `agentdev-doc-diagnostics`
      
      対象は `docs/**` の横断意味診断に限定する。
      
      * docs 横断意味整合性
      * 文書種別境界
      * 文書間矛盾
      * docs 固有の意味診断
      * 専門 diagnostics へのルーティングと結果統合
      
      一般的な文章表層品質は所有しない。
      
      `src/opencode/**` の textlint 対象化を所有しない。
      
      現行の「文意品質を `agentdev-doc-writing` へルーティングする」契約は廃止し、表層品質と意味品質を分離した新しいルーティングへ更新する。
      
      ### `agentdev-inspect-skills`
      
      次を対象とした Command / Skill 固有の意味・構造診断を所有する。
      
      * `src/opencode/commands/**`
      * `src/opencode/skills/**`
      
      残す対象には次を含む。
      
      * Command → Skill 参照妥当性
      * Skill 責務粒度
      * 意味的重複・矛盾
      * 実行主体分類
      * 責務越境
      * Command / Skill の構造契約
      * references / template / script との意味的整合
      
      textlint へ移管可能な一般文章表層品質は `agentdev-inspect-skills` から削除する。
      
      ### authoring 系 Skill
      
      Command / Skill の構造・記述契約のうち、成果物種別固有の意味を持つものは既存 `agentdev-command-authoring` / `agentdev-skill-authoring` 等が所有する。
      
      一般的な日本語文章表層品質は所有しない。
      
      ### 品質制御 routing
      
      現行 `artifact-quality-control-routing` が持つ「文書品質査読能力 = agentdev-doc-writing」という一対一関係を廃止する。
      
      品質制御上は少なくとも次を区別する。
      
      * 決定的な文章表層品質 gate
      * 成果物固有の意味・構造品質能力
      
      `agentdev-doc-writing` という具体 Skill の退役によって、QG / test strategy 上の品質要求自体が欠落しないように再構成する。
  -
    id: "AG-012"
    content: |
      ## 12. ADF 独自文章規範の整理
      
      既存 textlint rule / preset で表現できる一般文章規範は ADF 独自実装・独自規範文書から削除する。
      
      既存 textlint ecosystem に成熟した代替がなく、かつ ADF 固有の style preference に過ぎないものを維持するためだけに ADF 独自 textlint rule を新設しない。
      
      この原則を少なくとも次へ適用する。
      
      * 一文一行
      * em-dash 禁止
      * 中黒による並列禁止
      * ADF 独自 replacement dictionary
      * ADF 独自 rewrite pattern のうち一般文章表層品質に属するもの
      * LLM 表現のうち既存 textlint rule で扱えるもの
      
      ただし、文章 style ではなく成果物構造、参照整合性、ライフサイクル、識別子、状態、責務境界等を検出する既存 deterministic checker は textlint 移行対象とはしない。
  -
    id: "AG-013"
    content: |
      ## 13. ADF corpus への導入
      
      導入時に ADF 自身の target corpus を textlint で実測し、enabled rule ごとの検出件数を確認する。
      
      既存文書を新規 rule に合わせて必要な範囲で正規化し、導入完了時は hard error を baseline suppression で温存せず、対象 corpus が zero-error で通る状態を作る。
      
      `preset-ja-technical-writing` は blanket `true` で固定せず、ADF corpus の実測に基づいて rule option / severity を設定する。
      
      特に次のような、技術文書で意図的利用があり得る rule は誤検出を確認する。
      
      * 弱い表現
      * 文長
      * 漢字連続
      * 文体混在
      * 疑問符・感嘆符
      * identifier / code / path 周辺の文章
      
      AI-writing preset の heuristic rule は、deterministic gate として hard error にできるものと、suggestion / information に留めるものを分ける。
      
      `docs/**/*.md` という標準 target 自体は維持する。
      
      ただし、Report / retired artifact 等の歴史記録を文章 style の正規化によって事実改変しない。
      
      歴史記録へ不適切な rule がある場合は、標準 target を project-local config から除外するのではなく、rule の適用条件、severity、既存 artifact class の扱いを調整し、既存 lifecycle 契約と両立させる。
acceptance_criteria:
  -
    id: "AC-001"
    content: "ADF repository に consumer 配布対象の `agentdev-textlint-guard` Plugin が存在する。"
  -
    id: "AC-002"
    content: "Plugin / Hook の種別・fail-closed・consumer 配布契約が現行 `REQ-052` と矛盾しない。"
  -
    id: "AC-003"
    content: "`scripts/install.ps1` による consumer install 後、Plugin package と loader shim が既存 Plugin と同じ契約で投影される。"
  -
    id: "AC-004"
    content: "consumer archive install 後にも同一 Plugin が利用可能である。"
  -
    id: "AC-005"
    content: "release archive に consumer 配布対象として同一 Plugin が含まれる。"
  -
    id: "AC-006"
    content: "`scripts/self-sync.ps1` による ADF self-host 投影後、同一 Plugin がロードされる。"
  -
    id: "AC-007"
    content: "`agentdev-textlint-guard` が repo-local Plugin exclusion へ追加されていない。"
  -
    id: "AC-008"
    content: "consumer project に Plugin 設定が存在しない場合、`docs/**/*.md` の `write` / `edit` / `apply_patch` が textlint 対象になる。"
  -
    id: "AC-009"
    content: "consumer project で標準対象外ファイルだけを編集した場合、一般日本語文章 lint は実行対象にならない。"
  -
    id: "AC-010"
    content: "`.agentdev/config/plugins/agentdev-textlint-guard.yaml` の `additional_targets` が標準対象へ加算される。"
  -
    id: "AC-011"
    content: "`additional_targets` で `docs/**/*.md` を無効化できない。"
  -
    id: "AC-012"
    content: "ADF repository の project-local 設定により `src/opencode/commands/**/*.md` と `src/opencode/skills/**/*.md` が lint 対象になる。"
  -
    id: "AC-013"
    content: "ADF repository 判定の hard-coded 分岐が Plugin source に存在しない。"
  -
    id: "AC-014"
    content: "Plugin は `input.worktree` 等の OpenCode project root 情報を基準に project-local config を解決し、Plugin の配置場所を project root として扱わない。"
  -
    id: "AC-015"
    content: "project-local config が malformed の場合、supported write operation が fail-closed で拒否され、設定エラーが返る。"
  -
    id: "AC-016"
    content: "project root 外への path traversal または安全に分類できない対象では supported write operation が fail-closed となる。"
  -
    id: "AC-017"
    content: "OpenCode `write` で hard error を含む対象 Markdown を作ろうとした場合、ファイルが作成・更新される前に tool が失敗する。"
  -
    id: "AC-018"
    content: "OpenCode `edit` で hard error を導入しようとした場合、編集後全文に対して lint され、ディスク上の元ファイルは変更されない。"
  -
    id: "AC-019"
    content: "OpenCode `apply_patch` が複数ファイルを更新し、そのうち1件の対象 Markdown が hard error の場合、patch 全体が拒否される。"
  -
    id: "AC-020"
    content: "NG 失敗レスポンスから agent が対象パス、位置、rule、問題箇所、利用可能な修正情報を取得できる。"
  -
    id: "AC-021"
    content: "project 固有の prh rule を追加すると、対象となる散文の用語表記違反を検出できる。"
  -
    id: "AC-022"
    content: "Markdown の inline code / fenced code 内の token が、採用 rule の Markdown 構造認識に従って散文用語違反として誤検出されない。"
  -
    id: "AC-023"
    content: "固定置換できない禁止表現を既存 textlint rule で定義し、検出時に context-dependent rewrite guidance を返せる。"
  -
    id: "AC-024"
    content: "final gate を実行すると、hook を通らずに書き換えられた対象 Markdown の hard error も検出できる。"
  -
    id: "AC-025"
    content: "pre-write と final gate の target resolution、rule set、project terminology が同一実装を共有し、同一入力に対する判定差分がない。"
  -
    id: "AC-026"
    content: "consumer 共通 final gate が ADF 本体専用 `docs-check` に依存せず利用可能である。"
  -
    id: "AC-027"
    content: "ADF self-host の既存保存・完了・品質検査経路で final textlint gate が必要な箇所は、consumer 共通 lint 基盤を再利用し、別の文章品質ロジックを持たない。"
  -
    id: "AC-028"
    content: "textlint 本体と採用 rule / preset のバージョンが lockfile で固定される。"
  -
    id: "AC-029"
    content: "consumer install / archive install / self-sync 後、利用者が textlint dependencies を手作業で install しなくても Plugin と final gate を実行できる。"
  -
    id: "AC-030"
    content: "`agentdev-doc-writing` Skill directory、references、project extension、active Design / routing からの実行依存が撤去される。"
  -
    id: "AC-031"
    content: "active repository artifact に `agentdev-doc-writing` を実行前提または正規文章品質所有者とする参照が残っていないことを機械検索で確認できる。"
  -
    id: "AC-032"
    content: "`AGENTS.md` が `agentdev-doc-writing` / `japanese-tech-writing` を文章規範の正規参照点として要求しない。"
  -
    id: "AC-033"
    content: "`REQ-053` が `japanese-tech-writing` を文章品質規範の正規所有者、`agentdev-doc-writing` を査読経路として要求しない。"
  -
    id: "AC-034"
    content: "`src/third-party/skills.yaml` から `japanese-tech-writing` 宣言が除去されている。ただし削除前に他の active consumer が存在しないことが確認されている。"
  -
    id: "AC-035"
    content: "third-party Skill 管理機構そのものは維持される。"
  -
    id: "AC-036"
    content: "`agentdev-doc-diagnostics` は `docs/**` の横断意味診断を担当し、一般文章表層 lint と `src/opencode/**` の target ownership を持たない。"
  -
    id: "AC-037"
    content: "REQ 構造の事後診断は `agentdev-req-structure-diagnostics` に残り、`agentdev-req-analysis` との重複所有を作らない。"
  -
    id: "AC-038"
    content: "`agentdev-inspect-skills` は Command / Skill の意味・構造診断を担当し、textlint と重複する一般文章表層 lint を所有しない。"
  -
    id: "AC-039"
    content: "REQ / Decision / Command / Skill 等の成果物固有の意味品質が該当する既存責務 Skill / diagnostics へ移管される。"
  -
    id: "AC-040"
    content: "`artifact-quality-control-routing` から `agentdev-doc-writing` への具体的依存が撤去され、決定的な文章表層品質 gate と成果物固有の意味・構造品質が区別される。"
  -
    id: "AC-041"
    content: "現行 `IR-060` の一般文章用置換辞書依存が除去され、同等の必要な表層検査が textlint 側で担われる。"
  -
    id: "AC-042"
    content: "`IR-065` / `IR-066` 等の lifecycle / historical context を持つ integrity 検査は、同等保証なしに textlint へ置換されていない。"
  -
    id: "AC-043"
    content: "textlint で代替する ADF 独自 replacement dictionary / rewrite pattern / 一般文章 checker が active runtime から除去される。"
  -
    id: "AC-044"
    content: "一文一行、em-dash 禁止、中黒禁止等の style preference を維持するためだけの新規 ADF 独自 textlint rule を導入していない。"
  -
    id: "AC-045"
    content: "`scripts/self/maintenance/apply-mechanical-replacement.ps1` 等に textlint 移管済み一般文章規則だけを維持する不要処理が残っていない。"
  -
    id: "AC-046"
    content: "ADF 自身の target corpus が enabled hard-error rules で zero-error となる。"
  -
    id: "AC-047"
    content: "hard-error rule の既知違反を baseline suppression として残さない。"
  -
    id: "AC-048"
    content: "Report / retired artifact 等の歴史記録を文章 style の正規化によって事実改変していない。"
  -
    id: "AC-049"
    content: "heuristic rule を一律 hard error とせず、ADF corpus の実測結果と誤検出確認に基づいて severity / option が決定されている。"
  -
    id: "AC-050"
    content: "Plugin unit test が config absent / valid / malformed、default target、additional target、write、edit、multi-file apply_patch、outside-root path、lint pass / fail を含む。"
  -
    id: "AC-051"
    content: "final gate regression test が pre-write hook bypass 変更を検出するケースを含む。"
  -
    id: "AC-052"
    content: "install / self-sync の既存 Plugin projection test が新 Plugin を含めて通る。"
  -
    id: "AC-053"
    content: "archive install / release archive の既存配布テストが新 Plugin を含めて通る。"
  -
    id: "AC-054"
    content: "ADF の既存 integrity / quality test suite が ownership、routing、参照更新後も通る。"
  -
    id: "AC-055"
    content: "`agentdev-doc-writing` / `japanese-tech-writing` の active 参照残存、textlint 移管対象 checker の重複残存、退役に伴う dangling reference が機械検査で0件である。"
out_of_scope: |
  * `src/**/*.ts`、`scripts/**`、`tests/**` 等の source code そのものに対する一般日本語文章 lint
  * identifier、API field、class / function 名等の source-code vocabulary 統制
  * AST を利用したプログラミング言語別コメント・文字列 lint
  * textlint に REQ / Design / Decision / Skill の意味分類をさせること
  * consumer project 固有の具体的な用語辞書を ADF 配布物へ埋め込むこと
  * `.agentdev/extensions/skills/**` を textlint Plugin の path 設定機構として利用すること
  * ADF repository 判定を Plugin source に埋め込み、ADF の場合だけ `src/opencode/**` を特別扱いすること
  * textlint で置き換えられる一般文章 lint を新規 ADF checker / Skill として再実装すること
  * `IR-065` / `IR-066` 等の lifecycle / obsolete-artifact integrity 検査を、単に vocabulary を扱うという理由で textlint へ移管すること
  * third-party Skill 管理機構そのものの廃止
  * `docs-check` の ADF self-hosting 自己監査責務そのものの廃止
  * `agentdev-req-structure-diagnostics` 等の成果物固有診断を textlint へ置換すること
artifact_actions:
  -
    id: "ACT-REQ-001"
    artifact: "req"
    operation: "update"
    target: "docs/requirements/REQ-053.md"
    source_items:
      - "AG-001"
      - "AG-002"
      - "AG-003"
      - "AG-004"
      - "AG-005"
      - "AG-006"
      - "AG-007"
      - "AG-008"
      - "AG-009"
      - "AG-010"
      - "AG-011"
      - "AG-012"
      - "AG-013"
    content: |
      ---
      id: REQ-053
      title: 文書と配布物の文章品質契約
      created: 2026-08-30
      updated: 2026-09-04
      ---
      
      ## 目的
      
      文書と配布物の文章表層品質を共通の決定的検査で確認し、書込み前と完了前に同じ基準を適用する。
      成果物固有の意味品質と整合性検査は各責務の所有者が担当する。
      
      ## 要件
      
      | ID | 要件 |
      |---|---|
      | REQ-053-001 | 文章表層品質は textlint を共通実行基盤として検査し、規則の設定を品質基準の定義元として参照できること |
      | REQ-053-002 | 配布物はメタ指示（実行時に意味を持たない LLM 宛指示文）を含まない |
      | REQ-053-003 | 配布物の各文は主述が完結し、未完結文を含まない |
      | REQ-053-004 | 散文のプロジェクト固有用語は当該プロジェクトが所有する規則に従い、識別子と散文を区別して検査できること |
      | REQ-053-005 | 「〜を正とする」「〜が正」形式の規範宣言は、規範原本への参照を伴い、定義元・参照元・所有関係のいずれの関係か一義的に判断できる場合に限り使用でき、同一文書内で濫用しない |
      | REQ-053-006 | 文章表層品質のうち既存の検査規則で判定できる項目は共通検査が担当し、文意判断を要する項目は成果物固有の品質能力が担当すること |
      | REQ-053-007 | 一般文章の検査規則は既存の textlint 規則を利用し、プロジェクト独自の文体上の好みだけを理由に専用検査器を追加しないこと |
      | REQ-053-008 | 配布物は Markdown 構造破損（見出し階層不整合、未閉鎖コードブロック、壊れたリンク、壊れたコードスパン、強調記法の破損）を含まない |
      | REQ-053-009 | 配布物は制御文字、不正な Unicode 文字、意図しない異言語文字を含まず、共通表層検査または既存の決定的破損検査で確認できること |
      | REQ-053-010 | 配布物は既知形式の参照残骸（確認済みの不要参照、実在しない参照先を指す既知形式の記述）を含まない |
      | REQ-053-011 | 文章表層品質は書込み前と完了前の共通検査で確認し、作成時と診断時の成果物固有の意味品質は各責務の品質能力で確認できること |
      | REQ-053-012 | 配布物全体へ文章表層品質検査と決定的破損検査を実行でき、構造と参照の整合性検査は表層品質検査への移管によって保証を失わないこと |
      | REQ-053-013 | 既存配布物は本契約へ適合させる。是正は責務・振る舞い・処理順序・状態遷移・入出力契約・API/CLI 契約・ファイル形式・識別子・状態値・停止条件・安全制約・外部依存を変更してはならない。意味を一義的に復元できない箇所は推測で修正して合格扱いにせず、blocked として記録しユーザーの判断を得る |
      | REQ-053-014 | 文章品質是正の完了判定は、提出対象となる最終 HEAD から読み直した実ファイル全文に対する再確認に基づいて行う。変更差分、作業用メモ、過去の査読結果だけを根拠とした合否判定を行わない |
      | REQ-053-015 | 一つのファイルに対する一部の修正は、当該ファイル全体の合格判定の根拠にならない。各ファイルは最終状態の全文が対象観点すべてに合格した場合に限り合格とする |
      | REQ-053-016 | 最終合否判定は、修正時の合格判断を継承しない。提出対象となる最終 HEAD の実ファイルを再入力として文章品質基準を再適用し、修正時の判断と最終確認の結果が異なる場合は最終確認の結果を優先する |
      | REQ-053-017 | 初期不合格と記録したファイルは、実ファイル修正による解消確認、既存規範に基づく誤検出の根拠付き証明、blocked 記録のいずれかを満たすまで合格へ変更しない。実行中に新しい許容解釈を作成して既知不備を合格へ変更しない |
      | REQ-053-018 | 初期不合格ファイルを実ファイル変更なしに合格とする場合は、初期指摘が既存規範上の誤検出であることを規範の参照付きで証明する。根拠のない合格判定を行わない |
      | REQ-053-019 | 文章品質是正の完了証拠は、対象ファイルごとにファイルパス、初期判定、修正有無、確認した品質観点、最終判定、残存不備、blocked の判断必要事項を個別に確認できること。ファイル単位の結果と一致しない集計値だけでは完了証拠としない |
      | REQ-053-020 | 文章品質是正の完了判定は、固定した同じ規則による初期状態と最終状態の不合格ファイル数、既知不備数、決定的破損数の比較を含むこと。初期不備がある項目は減少と最終ゼロを確認し、初期ゼロの項目はゼロを維持すること。対象に fail または blocked が残る間は完了とせず、別課題への記録だけでは解消扱いにしないこと |
      | REQ-053-021 | 完了報告の件数、ファイル単位結果は提出対象となる最終 HEAD の実ファイル内容と一致する。合格とされたファイルから文章品質違反が再現できた場合、最終検証全体を不合格とする |
      | REQ-053-022 | 既知不備として固定した項目の最終 HEAD での残存は決定的に確認できる。センチネル項目のカタログと検出方式は Design が所有する |
      | REQ-053-023 | 配布 skill の references/ 配下は既知の異言語文字混入、誤記リンク、参照残骸を保持しないこと。検出用の例示や歴史的識別子の許容は現行の構造認識とライフサイクル規則に従うこと |
      
      | new:common-standard | 標準の日本語文章品質規則はプロジェクト固有用語の設定がない場合も有効であること |
      | new:prospective-content | 対応する書込み操作は適用後の対象ファイル全文を保存前に検査し、拒否対象の違反を含む内容をディスクへ反映しないこと |
      | new:patch-atomic-rejection | 複数ファイルを含む書込み操作は対象全件を保存前に検査し、一件でも拒否対象の違反があれば操作全体を拒否すること |
      | new:inspection-failure | 対象や設定を安全に解釈できない場合と必須検査が完了しない場合は、既存の強制境界契約に従い対応する副作用を拒否すること |
      | new:diagnostic-result | 拒否結果から対象、位置、検査規則、該当箇所と利用可能な修正情報を確認できること |
      | new:target-extension | 標準の文書対象を常時検査し、プロジェクト設定で対象を加算できること。加算設定と用語設定によって標準対象を無効化できないこと |
      | new:project-setting | プロジェクト設定は対象プロジェクトを基準に解決され、変更がセッション再起動なしで反映されること |
      | new:shared-final | 完了前検査は書込み前検査と同じ設定、対象解決、規則、用語と結果整形を共有し、同一の全文入力に対する判定が一致すること |
      | new:bypass-detection | 完了前検査は書込み前の検査を経由しない変更を含め、解決された対象全件の全文を検査し、拒否対象の違反が残る場合は完了としないこと |
      | new:consumer-runtime | 共通検査と完了前検査は導入先でも利用でき、標準の導入、アーカイブ導入、本体への同期の後に利用者による依存パッケージの追加インストールを必要としないこと |
      | new:version-reproducibility | 検査本体と採用規則のバージョンは固定され、配布経路によらず同じ検査を再現できること |
      | new:semantic-ownership | 成果物固有の意味と構造の品質は既存の責務別能力が所有し、文章表層検査への移管によって欠落または重複しないこと |
      | new:retired-owner | 現行成果物の文章品質の実行と規範参照は旧文章品質スキルへの依存を持たず、歴史記録は事実と識別子を保持すること |
      | new:calibration | 採用規則の拒否対象と助言対象は実測と誤検出確認で区別し、正式な初期判定以降は同じ規則によって最終判定を行うこと |
      | new:zero-error | 導入完了時に検査対象全体の拒否対象違反がゼロであり、既知違反を基準値への登録や事後の規則緩和で合格扱いにしないこと |
      
      ## 適用範囲
      
      - **対象**: 標準対象の文書、プロジェクトが追加指定する Markdown、ADF 配布 command と skill の本文、共通検査の導入と完了証拠。
      - **対象外**: プログラミング言語のコード自体の文章検査、識別子の一般用語統制、成果物の意味判断の textlint 規則化、third-party Skill 管理機構の廃止。
      - 個別のパス、設定形式、規則構成、公開入口と実行方式は品質基盤の Design が所有する。
    numbering_note: "new: 行は保存時に採番する候補キー。既存IDは維持し、新しい要件行番号を先取りしない。"
  -
    id: "ACT-REQ-002"
    artifact: "req"
    operation: "update"
    target: "docs/requirements/REQ-010.md"
    source_items:
      - "AG-003"
      - "AG-008"
      - "AG-012"
      - "AG-013"
    content: |
      ---
      id: REQ-010
      title: "自己監査コマンド（docs-check）"
      created: "2026-07-25"
      updated: "2026-09-07"
      ---
      
      ## 目的
      
      本体リポジトリ専用の自己監査 command である docs-check の検査責務を所有する。
      検査は機械的パターンマッチングで判定可能な範囲に限定し、意味判断、文脈解釈、推論を要する診断は検出と診断コマンド群（inspect 系）が担当する分離境界を維持する。
      一時成果物の配置、ライフサイクル、構造化契約は REQ-008 が所有する。
      REQ と Design の健全性指標と分割予兆の定量定義は REQ-001 が所有し、IR 体系の存在条件と登録モデルは DEC-013（IR 登録モデルの簡素化）が所有し、本 REQ は指標と基準を用いた検査の実行を所有する。
      
      ## 要件
      
      | ID | 要件 |
      |---|---|
      | REQ-010-001 | docs-check は本体リポジトリ専用の自己監査 command とし、AgentDevFlow の配布対象から除外すること |
      | REQ-010-002 | docs-check は検査対象を直接修正せず、検出事項を報告として出力すること |
      | REQ-010-003 | docs-check の検査は機械的パターンマッチングで判定可能な範囲に限定し、意味判断、文脈解釈、推論を要する検査は inspect 系 command が担当すること |
      | REQ-010-004 | docs-check、inspect-docs、inspect-skills、inspect-promote の責務境界は重複しないこと |
      | REQ-010-005 | docs-check の検査層は全件検査、変更関連検査、影響範囲検査の3層であること |
      | REQ-010-006 | docs-check の検出事項は severity 分類（strict、heuristic、observation）で分類すること |
      | REQ-010-007 | docs-check は基準既知の検出事項と新規検出事項を区別できること |
      | REQ-010-008 | docs-check は整合性検証基盤自身の artifact 変更時に、基盤自身の整合性を検証すること |
      | REQ-010-009 | docs-check の checker 個別ルール、検出シグナル、誤検出抑制方式の詳細は Design、skill、script、tests のいずれかが所有すること |
      | REQ-010-010 | docs-check の新規検査には対応する回帰テストが存在すること |
      | REQ-010-011 | docs-check は索引、README、規則カタログ、文書地図の件数と一覧表が実ファイル配置と整合することを検証すること |
      | REQ-010-012 | 保存工程と完了工程での変更ファイル限定検査は、検出基盤の規則に違反する変更を検出した場合に工程を停止すること |
      | REQ-010-059 | docs-check または CI は AUTOGEN ブロック（spec-health-metrics.md 等）の鮮度を検出し、rename、status 変更時の再生成必要性を判定すること。SC-002（定期再生成）と整合すること |
      | REQ-010-060 | self-hosting における AgentDevFlow 所有の保存・完了・release 経路は、配布境界検査の合格前に永続成果物を確定せず正常完了を報告せず、検査不能時は未合格として停止すること |
      | REQ-010-062 | テストは配布 checker と同種の整合性検証規則を独自実装せず、配布 checker が所有する規則から期待値を導出すること。構造変更時にテスト側のみが陳腐化する二重管理を行わないこと |
      | REQ-010-063 | docs-check の検査は SKILL.md の frontmatter id と Skill ディレクトリ名・物理 path の不一致、および Design frontmatter id と Design ファイルの物理 path の不一致を検出し、warn または error として報告すること（恒常検査契約）。配布 skill ごとに同名の Skill Design の存在を恒常的な不変条件として要求せず、skill rename に固有の旧名・新名間の対称性検査は rename を伴う変更に対してのみ実施すること |
      | REQ-010-064 | docs-check は公開 command 等の共通ポリシー識別子について、意味識別子の未定義参照、重複定義、および廃止済み Gxx 表記の残存在を検出すること |
      | REQ-010-065 | docs-check は実行時配布対象に残る未解決プレースホルダー（DEC-{N}、REQ-{...} 等）を検出すること。ただし正規テンプレート内の意図的なプレースホルダーは、対象種別と許容条件に従って誤検出しないこと |
      | REQ-010-066 | docs-check は現行概念として使用される廃止語彙（旧 ADR 表記等）を検出すること。ただし許容された歴史的識別子（v2:ADR-0123 等）は誤検出しないこと |
      | REQ-010-067 | docs-check は現行参照として残る旧パスおよび削除済み名称を検出すること |
      | REQ-010-068 | 新規検査クラスごとに、正常例、違反例、境界例、許容例、過去に発生した再現例を含む回帰テストが存在すること（REQ-010-010 準拠） |
      | REQ-010-069 | docs-check は docs 本文が引用する REQ 識別子の実在性を機械検査すること。テンプレート・例示のプレースホルダーは REQ-010-065 の許容条件に従って誤検出しないこと |
      | REQ-010-070 | docs-check は過去監査（v1〜v4）で検出漏れとなった対象の再走査結果をうけ、採用した新規機械検査クラスを検査体系へ追加すること。追加検査は REQ-010-068 の回帰テスト義務に従うこと |
      | REQ-010-071 | 配布物の構造、参照、文字の決定的破損検査を配布 command と skill 全体へ適用すること。一般文章表層品質の同等検査は導入先と共通の textlint 実行基盤を再利用し、独自に再実装しないこと。共通検査で代替できない構造と参照の検査は既存の責務を維持し、各検査クラスは REQ-010-068 の回帰テストを伴うこと |
      | REQ-010-072 | docs-check は docs/decisions 関連REQ表における retired REQ へのリンクが retired 実パス（retired/REQ-*.md）を指し、廃止注記を伴うことを検査すること。現行パスへのリンクと注記欠落を違反として検出すること |
      | REQ-010-073 | docs-check は docs/designs 配下の Markdown 本文内相対リンクの解決先実在を検査すること。監査履歴 Report（docs/reports/）のリンクは検査対象外とすること |
      | REQ-010-074 | docs-check の既知 delta は解消済み、残存、警告相当の区分で維持管理し、報告と終了コードは severity および既知と新規の区別に従うこと。この基準値への取り込みと警告扱いは共通 textlint 検査の拒否対象違反へ適用しないこと |
      
      | new:shared-textlint-integration | 本体の保存、完了、品質検査から文章表層品質を確認する際は導入先と共通の検査基盤を呼び出すこと。導入先用の最終検査は docs-check に依存せず、履歴文脈、廃止語彙、旧パスと識別子に対する既存の整合性検査は維持すること |
      
      ## 適用範囲
      
      - **対象**:
        - docs-check 自己監査 command の検査責務と配布境界、機械検出と意味診断の分離境界（docs-check 側）、検査層と severity 分類、検出事項の報告と基準既知と新規の区別、整合性検証基盤自身の整合性検証、checker 詳細の委譲、回帰テスト、索引と README と規則カタログと文書地図の整合性検証、保存工程と完了工程の変更ファイル限定検査、AUTOGEN 鮮度検出、self-hosting 配布境界検査、テストの checker 規則再実装禁止
        - 共通ポリシー意味識別子の整合性検査（未定義参照、重複定義、廃止済み Gxx 表記の残存検出、REQ-051-005）、実行時配布対象の未解決プレースホルダー検査（許容条件付き）、廃止語彙検査（歴史的識別子許容付き）、旧パス・削除済み名称検査、新規検査クラスの回帰テスト義務
        - 関連REQ表の retired REQ 実パスリンク検査、docs/designs 相対リンク実在検査
        - 既知 delta の区分維持と baseline 取り込み・警告扱いの報告反映
      - **対象外**:
        - 一時成果物（draft、RU、取り込み項目、学習エントリ、検出事項）の配置、ライフサイクル、構造化契約、draft type registry（REQ-008）
        - REQ と Design の健全性指標と分割予兆の定量定義（REQ-001）
        - IR 体系の実効性監査と存在条件厳格化（REQ-028、retired。恒常契約は DEC-013 と検出と診断コマンド群側移管行が所有）
        - 検出と診断コマンド群（inspect 系）、取り込みパイプライン（intake）、学習パイプライン（learning）、バックログ統合（backlog-review）の各責務（各分割先 REQ）
        - 要件定義プロセスの実行契約（REQ-004）、完了報告と成果物品質ゲート（REQ-007）
        - checker 個別ルール、検出シグナル定義、enum 値一覧、ルート表、誤検出抑制アルゴリズム、検出ロジック、スクリプト内部実装、個別検出事項の修正実行
        - 検出シグナルの正規表現、許容条件の判定実装、fixture 配置、checker 個別ルール（integrity 関連 Design と checker 実装が所有）、自然言語上の意味矛盾や責務分界の妥当性判断（意味診断は inspect 系）
      
      ## 関連情報
      
      **関連 REQ**: REQ-001（健全性指標の定量定義）、REQ-008（一時成果物ライフサイクル、パイプライン契約の正規所有者）、REQ-028（retired。IR 体系監査）、検出と診断コマンド群（inspect 系）を所有する REQ（機械検出と意味診断の分離相手、severity・gate_level 軸の相互管理）
      **関連 Decision**: DEC-006（inspect 3-command 構成への正規化）、DEC-013（IR 登録モデルの簡素化）
  -
    id: "ACT-REQ-003"
    artifact: "req"
    operation: "update"
    target: "docs/requirements/REQ-036.md"
    source_items:
      - "AG-010"
      - "AG-011"
    content: |
      ---
      id: REQ-036
      title: "検出と診断コマンド群（inspect 系）"
      created: "2026-08-16"
      updated: "2026-09-02"
      ---
      
      ## 目的
      
      本 REQ は、検出コマンド群（inspect-docs、inspect-skills、inspect-promote）と検出ドメインの命名・用語基盤を所有し、docs と配布物の意味診断、検出事項の分類・昇格の実行責務を担う。
      3 command は DEC-006（inspect 3-command 構成への正規化）が定める単一の正規化単位であり、本 REQ の関心単位とする。
      機械的検査は docs-check（REQ-010）が担当し、本系 command は対象を直接修正せず機械的検出と意味診断を分離して候補報告に徹する。
      検出事項の分類と採用済み成果物への昇格は REQ-003-055 の共通原則に基づき（一意に確定できる事項は自律確定し、ユーザー判断が必要な事項のみ HITL を経る）、自動的な要件化を行わない。
      検出事項の inbox、採用済み成果物の配置とライフサイクルは REQ-008 が、パイプライン全体の共通契約は workflow-contracts Design が、採用済み成果物の RU 化は backlog-review を所有する REQ が所有する。
      
      ## 要件
      
      | ID | 要件 |
      |---|---|
      | REQ-036-001 | 検出コマンド群は inspect 命名で一貫し、command 名、ディレクトリ、skill、source_type、検出事項用語、ファイル名接頭辞が全域で統一されること |
      | REQ-036-002 | 公開 inspect command 集合は {inspect-docs, inspect-skills, inspect-promote} の3件とし、inspect-extensions を独立公開 command として廃止すること。extension 検査の決定的検査（8項目）を IR-056 / docs-check、意味診断（2項目）を inspect-skills、finding 処分を inspect-promote へ移管すること |
      | REQ-036-003 | diagnostics 命名は検出 command 名には使用せず、診断ロジックを一次所有する skill 名に限定して許容すること |
      | REQ-036-004 | 検出コマンド群は検出事項を inspect ドメイン状態の inbox へ出力し、reject された事項は即時削除すること |
      | REQ-036-005 | 検出事項の文言は inspect finding に統一し、検出事項ファイル名は command ごとの接頭辞に従うこと |
      | REQ-036-006 | inspect-docs は REQ 体系の意味診断を担当し、操作スコープを読み取りと診断結果の出力に限定すること |
      | REQ-036-007 | inspect-docs の診断観点は SPLIT、MERGE、MOVE、DUPLICATE、RETIRE、DRIFT であること |
      | REQ-036-008 | inspect-docs は機械的な文章表層検査を共通 textlint 基盤へ、本体専用の構造と参照の整合性検査を docs-check へ委譲し、意味診断側に同じ検査を保持しないこと |
      | REQ-036-009 | inspect-docs の診断観点は REQ と Design の境界違反、粒度、Design 詳細混入、誤分類、重複所有、廃止 REQ や Design 由来の記述残置を含むこと |
      | REQ-036-010 | inspect-docs の出力は最小限の診断結果、問題候補、推奨アクション、必要な場合の要件定義入力案に限定すること |
      | REQ-036-011 | inspect-docs は診断カテゴリ、証拠構造、出力契約、文書種別別診断へのルーティングを diagnostics 系 skill へ委譲すること |
      | REQ-036-012 | inspect-skills は command と skill の参照妥当性と skill 構造を、検査対象を直接修正せずに診断すること |
      | REQ-036-013 | inspect-skills の診断観点は Command から Skill への参照、Skill frontmatter、本文構造、references 利用、template と script の参照、粒度、段階的開示、責務境界、実行主体分類の誤認、Design 操作契約テーブルの整合を含むこと |
      | REQ-036-014 | inspect-skills の詳細観点と判定基準は skill に集約し、command 定義は薄い入口とすること |
      | REQ-036-015 | inspect-skills の許可される副作用は検出事項ファイルの生成と inspect ドメイン状態配下の永続化のみとすること |
      | REQ-036-016 | inspect-skills は検出事項に対する推奨経路の提示のみを行い、修正を実行しないこと |
      | REQ-036-017 | inspect-promote は inspect 検出事項を promote、defer、reject に分類すること |
      | REQ-036-018 | inspect-promote は、分類・検証・必要なレビューを経て取得可能な根拠から promote / defer / reject を一意に確定できる検出事項についてはユーザー承認なしで確定し、ユーザー判断が必要な検出事項のみを HITL 対象とすること（判断確定の境界は REQ-003-055 の共通原則に従う） |
      | REQ-036-019 | inspect-promote は promote を promoted へ保存して inbox を削除し、reject を削除し、defer を inbox へ残置すること |
      | REQ-036-020 | 明確な不整合の検出事項は intake を経ずに採用済み成果物として要件化対象とすること |
      | REQ-036-021 | inspect-promote は明示的なオプトインにより、機械的に特定可能で移行先が一意に定まる高確信度検出事項を自動的に採用済み成果物へ昇格できること |
      | REQ-036-022 | 検出事項の severity、gate_level を維持し、削除または同義化しないこと。baseline_status を IR スキーマから除外すること |
      | REQ-036-023 | 文脈解釈、意味判断、設計妥当性判断を必要とする検査は文書種別と成果物種別に対応する既存の診断能力が所有すること。docs 横断の意味診断、REQ の事後構造診断、Command と Skill の意味構造診断を分離し、文章表層検査は共通検査基盤が担当すること |
      | REQ-036-024 | inspect-docs の診断観点は正規の観点レジストリ（schema と配置先を確定した実体）が所有すること。移管対応表で名指しされた観点の正規の所有場所は当該レジストリとすること |
      
      ## 適用範囲
      
      - **対象**:
        - 検出コマンド群の命名統一、ドメイン状態、検出事項用語とファイル名接頭辞、diagnostics 命名の許容境界
        - inspect-extensions の公開 command 廃止と extension 検査の3層責務分離（決定的検査を IR-056 / docs-check、意味診断を inspect-skills、finding 処分を inspect-promote へ移管）
        - inspect-docs の REQ 体系意味診断、診断観点、機械検査の委譲、出力範囲、diagnostics 系 skill へのルーティング
        - inspect-skills の command と skill 参照妥当性診断、診断観点、skill 集約、副作用範囲、推奨経路提示
        - inspect-promote の分類、HITL 承認、promote と reject と defer の処理、明確な不整合の直接要件化、高確信度検出事項の自動昇格
        - severity・gate_level 軸の維持（baseline_status は IR スキーマから除外済み）
      - **対象外**:
        - docs-check の検査責務と配布境界（REQ-010）
        - 一時成果物の配置、ライフサイクル、構造化契約（REQ-008）
        - REQ と Design の健全性指標と分割予兆の定量定義（REQ-001）
        - IR 体系の実効性監査と存在条件厳格化（REQ-028、retired。恒常契約は DEC-013 と本 REQ の移管受入れ行が所有）
        - 取り込みパイプライン（intake）、学習パイプライン（learning）、バックログ統合（backlog-review）の各責務（各分割先 REQ）
        - 個別検出事項の修正実行
      
      ## 関連情報
      
      **関連 REQ**: REQ-008（一時成果物ライフサイクル）、REQ-010（docs-check、機械検出と意味診断の分離相手、severity・gate_level 軸の相互管理）、REQ-028（retired。IR 体系監査。文脈解釈検査の移管原則と観点レジストリ所有は本 REQ の REQ-036-023/024 が引継ぎ）
      **関連 Decision**: DEC-006（inspect 3-command 構成への正規化）
  -
    id: "ACT-DEC-001"
    artifact: "decision"
    operation: "create"
    target: "DEC-028"
    source_items:
      - "AG-001"
      - "AG-003"
      - "AG-004"
      - "AG-008"
      - "AG-010"
      - "AG-011"
      - "AG-012"
      - "AG-013"
    content: |
      # 文章表層品質の共通実行基盤
      
      ## 背景
      
      LLM に文章規範を読ませる経路と独自の辞書および検査器が併存し、作成、査読、診断、完了の各段階で同じ文章品質を判断している。
      利用者は、文章表層品質を textlint へ集約し、違反内容を保存前に拒否する方式に合意した。
      意味判断とライフサイクルを扱う検査は、表層検査と区別する必要がある。
      
      ## 決定
      
      文章表層品質の共通実行基盤として textlint と既存の規則を採用する。
      Plugin による書込み前検査と単独実行可能な最終検査は同じ基盤を使う。
      プロジェクト固有用語はプロジェクトが所有し、ADF は標準規則と実行および配布の接続を所有する。
      意味品質と成果物整合性は各既存責務が所有する。
      
      DEC-001 の決定3にある文章品質を原則として工程停止条件にしない判断について、今回の対象 Markdown に適用する、誤検出確認済みの決定的な拒否対象規則に限定した例外を定める。
      この範囲では書込み前と完了前に違反を拒否する。
      助言対象の規則および意味診断の助言をこの例外によって一律の拒否条件へ変更しない。
      DEC-001 の他の決定は維持する。
      本 Decision は上記範囲に限る後継判断であり、DEC-001 の過去の本文を意味変更して上書きしない。
      後続保存工程は、限定された置換範囲と後継関係が識別できるように両文書の関連を記録する。
      
      DEC-001 決定4の7条件は維持する。
      導入完了証拠には、再現する問題、強制に値する被害、削除や統合や接続面の縮小や指針の改善では被害を防げない理由、実行可能性、単一の所有者、削減される旧機構、再評価条件を含める。
      要件定義時点でこれらが実測済みであるとは扱わない。
      条件を裏付けられない規則を拒否対象へ昇格させない。
      誤検出の増加、API の変化、同等保証を持つ既存機構への統合が可能になった場合は強制方法と規則を再評価する。
      正式初期判定後の規則緩和による既知違反の合格扱いは認めない。
      
      導入時のネットワーク利用を禁じる DEC-016 を維持する。
      配布前に依存を解決した成果物を供給し、導入先での追加パッケージ取得を必要としない。
      
      ## 代替案
      
      LLM の規範読取りだけを維持する方式は、同一入力の検査を再現する目的を満たさない。
      独自の一般文章検査器を維持する方式は、重複所有と辞書保守を残す。
      書込み前の検査だけを提供する方式は、外部編集による変更を完了前に検出できない。
      
      ## 結果と影響
      
      REQ-053 が文章品質の外部保証を所有する。
      REQ-010 と REQ-036 はそれぞれ本体整合性検査と意味診断の境界を保つ。
      旧文章品質スキルの退役に際して、意味品質の移管先と既存保証を確認する。
      拒否対象の違反を持つ既存文書は固定した規則の下で是正が必要になる。
      
      ## 関連する決定
      
      DEC-001 の決定3について上記範囲のみを置換し、決定4を含む他の原則を維持する。
      DEC-016 の導入境界を維持する。
  -
    id: "ACT-DESIGN-001"
    artifact: "design"
    operation: "create"
    target_design:
      operation: "create"
      domain: "quality"
      slug: "textlint-quality-runtime"
    canonical_owner: "textlint-quality-runtime"
    source_items:
      - "AG-001"
      - "AG-002"
      - "AG-004"
      - "AG-005"
      - "AG-006"
      - "AG-007"
      - "AG-008"
      - "AG-009"
      - "AG-013"
    content: |
      # textlint 品質基盤
      
      ## 責務
      
      共通基盤はプロジェクト解決、設定の読込み、対象解決、規則構成、文章検査、結果整形を所有する。
      Plugin と最終検査入口はこの基盤を呼び出す。
      docs-check は本体の利用側であり、導入先用の共通基盤を内包しない。
      
      ## プロジェクトと対象の解決
      
      OpenCode 初期化入力の input.worktree を第一候補とし、現行 API と既存 Plugin 契約で確認できるプロジェクト情報だけを代替候補にする。
      Plugin の配置場所と import.meta.url をプロジェクトルートとして使わない。
      単独実行入口も呼出側が特定したプロジェクト情報を同じ解決処理へ渡す。
      標準対象は docs/**/*.md とする。
      追加対象はルート相対の glob として標準対象へ加算する。
      ルート外への参照と安全に分類できないパスは拒否する。
      対象外ファイルだけの正常な操作には一般文章検査を適用しない。
      
      ## Plugin 設定
      
      固定パスは .agentdev/config/plugins/agentdev-textlint-guard.yaml とする。
      初期形式は version: 1 と additional_targets の文字列配列だけを扱う。
      設定なしは標準対象だけの正常状態として扱う。
      構文、型、バージョン、許可項目およびルート内パスの妥当性を既存 YAML parser と設定検証で確認する。
      不正な設定では write、edit、apply_patch を対象外ファイルへの操作も含めて拒否する。
      設定エラーには原因と設定パスを含め、外部 editor 等による設定修復を案内する。
      設定ファイル自身の修復だけを許可する例外は設けない。
      設定は hook ごとに変更を検知する。
      修復または変更の後の次回操作から再起動なしに反映する。
      
      ADF 本体の追加設定は src/opencode/commands/**/*.md と src/opencode/skills/**/*.md とする。
      この違いを Plugin 内のリポジトリ判定分岐や Skill extension に書かない。
      
      ## 規則構成と用語
      
      標準構成には textlint-rule-preset-ja-technical-writing、@textlint-ja/textlint-rule-preset-ai-writing、textlint-rule-prh を含める。
      固定置換できない禁止表現は既存の pattern または NG-word 系の規則で検出と修正指針を提供する。
      標準構成へプロジェクトが所有する native textlint/prh 形式の用語規則を追加合成する。
      用語の接続によって標準規則または標準対象を無効化しない。
      一般の textlint 設定に含まれる ignore や規則の無効化設定を、標準構成の上書きとして取り込まない。
      標準規則の個別設定は ADF の共通構成が所有し、文書全体の実測で校正する。
      inline code と fenced code 等の散文との区別は Markdown 構造と各規則の機構を利用する。
      独自用語辞書スキーマ、一般文章 detector、grep による独自構造除外を作らない。
      
      ## 書込み前の検査
      
      対象 tool は write、edit、apply_patch とする。
      現行の OpenCode バージョンに対する入力形式と適用結果をテストで固定する。
      完成予定全文をメモリ上で再構成し、仮想ファイルパスとともに textlint の module API に入力する。
      write は新規作成と更新、edit は編集後全文、apply_patch は全対象ファイルの完成予定全文を検査する。
      いずれかに拒否対象の違反があれば hook が失敗を返し、tool 全体を実行しない。
      書込み後に戻す方式で拒否を代替しない。
      tool 入力不正、再構成不能、必要ファイルの読込失敗、設定解釈不能、検査異常終了は拒否する。
      削除や移動を含む形式は、現行 tool の操作意味に即して変更先の対象判定と存在する完成予定内容を確認する。
      扱えない入力を推測で通過させない。
      
      ## 最終検査
      
      単独実行入口は標準対象と追加対象の全件を列挙し、実ファイル全文を同じ共通基盤で検査する。
      shell、外部 editor、生成処理による変更も検出する。
      対象全件の拒否対象違反ゼロで合格とし、検査不能は不合格とする。
      差分だけ、以前の査読結果だけ、pre-write 通過だけを完了証拠にしない。
      本体の保存、完了、品質検査から利用する場合も同じ入口または同じ共通基盤を呼び出す。
      
      ## 結果
      
      共通の結果には対象パス、行と列などの位置、rule ID、該当表現または範囲を含める。
      規則が提供する replacement と guidance を保持する。
      助言対象の結果は拒否対象と区別する。
      pre-write と最終検査は同一全文、同一パス、同一設定および同一規則で同じ判定を返す。
      
      ## 依存と配布
      
      consumer 配布 package は src/opencode/plugins/agentdev-textlint-guard/ に置く。
      既存の動的投影と depth-1 loader shim の契約を利用し、repo-local 除外リストへ追加しない。
      lockfile で本体と規則の版を固定する。
      依存は配布前に解決した成果物として供給し、install と self-sync にネットワーク取得を追加しない。
      node_modules を除外する既存アーカイブだけでは依存充足と見なさない。
      clone またはソース ZIP 由来の導入、release archive の導入、本体同期の各経路に利用可能な依存成果物を含める。
      具体的な bundle 方式と内部配置は実現側が上記保証の範囲で選択する。
      配布形態を問わず、空のキャッシュとネットワーク遮断下で Plugin と最終検査が追加操作なしに起動することを検証する。
      
      ## 規則校正と移行検証
      
      規則の校正と正式初期判定を分ける。
      文長、弱い表現、漢字連続、文体、記号、識別子周辺、歴史文書を含む実測と誤検出確認で option と severity を設定する。
      ヒューリスティックな規則を一律に拒否対象としない。
      校正を終えた規則と依存バージョンを固定し、正式初期判定を行う。
      その後は同じ規則で是正と最終検証を行い、既知の違反を事後降格させない。
      歴史文書は対象から除外せず、事実を保持できる規則条件と severity を校正段階で扱う。
      移行結果と測定証拠は実行記録として保存し、設計本文へ実測値を混在させない。
  -
    id: "ACT-DESIGN-002"
    artifact: "design"
    operation: "update"
    target: "docs/designs/responsibilities/artifact-quality-control-routing.md"
    target_design:
      operation: "update"
      domain: "responsibilities"
      slug: "artifact-quality-control-routing"
    target_area: "能力キー定義"
    canonical_owner: "artifact-quality-control-routing"
    source_items:
      - "AG-008"
      - "AG-010"
      - "AG-011"
    content: |
      ## 能力キー定義
      
      品質能力は決定的な文章表層検査と成果物固有の意味および構造の品質を区別する。
      
      | 対象 | 品質能力 | 提供責務 |
      |---|---|---|
      | 共通基盤の対象 Markdown | 文章表層検査能力 | 共通 textlint 基盤 |
      | REQ の作成と要件行 | 要件意味品質能力 | agentdev-req-analysis |
      | REQ の事後構造診断 | REQ 構造診断能力 | agentdev-req-structure-diagnostics |
      | docs 横断の意味と文書境界 | 文書意味診断能力 | agentdev-doc-diagnostics |
      | Decision の成立と根拠 | Decision 品質判断能力 | agentdev-decision-guidelines と既存 Decision 関連責務 |
      | Command の作成 | Command 品質能力 | agentdev-command-authoring |
      | Skill の作成 | Skill 品質能力 | agentdev-skill-authoring |
      | Command と Skill の事後診断 | 配布物意味構造診断能力 | agentdev-inspect-skills |
      | template と references | 内容の成果物種別に応じた意味構造品質能力 | 当該成果物の既存所有能力 |
      | 構造と参照および履歴の機械検査 | 整合性検査能力 | 既存の決定的検査器 |
      
      能力キーは具体的な Skill の呼出順を固定しない。
      対象判定は共通 textlint 基盤が所有し、doc-diagnostics は src/opencode の対象化を所有しない。
      標準対象外の template 等に文章表層検査を適用する場合はプロジェクトの追加対象設定を利用する。
      同じ成果物に複数の能力が必要なら全てを test strategy に投影する。
      退役する agentdev-doc-writing への呼出しは品質能力の充足根拠としない。
      既存の QG と変更誘発境界リスクに基づく品質要求を維持する。
  -
    id: "ACT-DESIGN-003"
    artifact: "design"
    operation: "update"
    target: "docs/designs/responsibilities/document-type-responsibilities.md"
    target_design:
      operation: "update"
      domain: "responsibilities"
      slug: "document-type-responsibilities"
    canonical_owner: "document-type-responsibilities"
    source_items:
      - "AG-002"
      - "AG-003"
      - "AG-010"
      - "AG-011"
      - "AG-012"
    content: |
      ## 用語政策
      
      プロジェクト固有の散文用語は当該プロジェクトの native textlint/prh 設定が所有する。
      ADF 本体も同じ仕組みを利用する。
      固定置換できる表記と、文脈に応じた修正指針を要する表現を区別する。
      識別子とコードの扱いは Markdown 構造および各規則の標準機構に従う。
      文書種別、ライフサイクル、参照整合性に関わる語彙は一般文章規則と区別する。
      一般文章辞書、書換えパターン、体裁上の好みだけの独自規則を本 Design に重複保持しない。
      
      ### 横断検索における経路識別子の検出基準
      
      経路識別子体系（`経路A`〜`経路H` の字ラベル）は廃止済みである。
      廃止後の docs corpus 横断検索では、`経路` を含む行を grep で抽出し、行単位に次の基準で検出対象と一般用語を区別する。
      
      検出対象（識別子体系由来。字面の除去または現行語への置換対象）は、次のいずれかに一致する行である。
      
      - `経路` の直後に A〜H の1文字が続く字ラベル（`経路A`〜`経路H`）
      - 廃止済みの経路識別子体系の総数を表す数量表現（例: `7経路`。呼出元数を表す語へ置換対象）
      
      非対象（一般名詞としての「経路」。残置対象）は、次のいずれかに一致する行である。
      
      - `経路` の直前に英語語、コマンドオプション、スコープ名等の修飾語が接続する複合名詞（例: `blocked 経路`、`--auto 経路`、`review 経路での ...`）
      - 経路識別子体系と無関係な対象の数を表す複合名詞（例: `docs/ 参照3経路`。参照先ディレクトリ数を表す）
      
      判定が字面だけでは確定しない行は、当該語が経路識別子体系（A〜H）を参照しているかを文意で確認し、参照しない場合は非対象とする。
      
      ### 配布物の REQ 参照表記（定性参照）と対応宣言配置
      
      配布 command/skill の本文・コメントは、対象となる契約を定性参照で表現する。
      定性参照とは、対応する規約・Design の名称や概念を示す記述（例: 「トレーサビリティモデルの対応関係の完全性規則」）であり、要件行 ID（`REQ-{NNN}-{NNN}` 形式）を字面として含まない。
      配布物への concrete ID（REQ/Decision/Design の具象参照）の inline 記載排除と対応宣言（ADF-COVERS）の正規配置先（docs 配下の正規成果物）は REQ-029-003、REQ-029-004、REQ-057-019 が正規所有する。
      本節は、配布物編集時に参照表記として定性参照を採用する運用を正文化するものである。
      
      本規約は配布物 inline の concrete REQ-ID 表記を肯定しない。
      したがって、配布物執筆時の ID 衛生ガイダンス（concrete ID inline 排除・実行手順のプレースホルダ表記を配布物執筆ガイダンスへ明記する後続対応）と矛盾せず、同一方向である。
      後続の ID 衛生ガイダンス対応は本節を参照点として整合を保つ。
    target_area: "用語政策"
  -
    id: "ACT-DESIGN-004"
    artifact: "design"
    operation: "update"
    target: "docs/designs/responsibilities/document-type-responsibilities.md"
    target_design:
      operation: "update"
      domain: "responsibilities"
      slug: "document-type-responsibilities"
    target_area: "文書種別ごとの japanese-tech-writing 適用サブセット"
    canonical_owner: "document-type-responsibilities"
    source_items:
      - "AG-010"
      - "AG-011"
      - "AG-012"
    content: |
      ## 文書種別ごとの意味品質
      
      文章表層品質は共通 textlint 基盤の対象判定と規則構成に従う。
      文書種別に固有の意味と構造は各責務の品質能力が確認する。
      
      | 文書種別 | 意味と構造の確認対象 |
      |---|---|
      | REQ | 主語、対象、状態、検証可能性、要件と設計の境界 |
      | Decision | 判断の成立、背景、根拠、代替案、結果の整合 |
      | Design | 内部構成と現在の動作、所有責務、参照の整合 |
      | Command | 入出力、責務と委譲、実行主体の整合 |
      | Skill | 提供能力、粒度、段階的開示、参照と実行主体の整合 |
      | guide と README | 案内先、説明対象と現行成果物の整合 |
      
      REQ 作成時の分析は agentdev-req-analysis、事後構造診断は agentdev-req-structure-diagnostics が所有する。
      docs 横断診断と専門能力への振分けは agentdev-doc-diagnostics が所有する。
      Command と Skill は既存の作成支援と事後診断の責務を維持する。
      Decision の要否は既存の判断能力が、文書保存は既存のファイル管理能力が担い、意味品質の観点をこれらの既存責務へ接続する。
  -
    id: "ACT-DESIGN-005"
    artifact: "design"
    operation: "update"
    target: "docs/designs/responsibilities/artifact-quality-control-routing.md"
    target_design:
      operation: "update"
      domain: "responsibilities"
      slug: "artifact-quality-control-routing"
    target_area: "他 Design との関係"
    canonical_owner: "artifact-quality-control-routing"
    source_items: ["AG-010", "AG-011"]
    content: |
      ## 他 Design との関係

      - artifact-responsibilities.md は成果物責任表を所有する。
      - document-type-responsibilities.md は文書種別責務を所有し、本 Design は文書以外の成果物も対象にする。
      - textlint-quality-runtime は文章表層検査の共通基盤を所有し、本 Design は必要な品質能力の投影を所有する。
      - 成果物固有の意味と構造の品質は能力キー定義に示した既存責務が所有する。
      - agentdev-skill-authoring は Skill の品質基準を所有する。
      - agentdev-command-authoring は Command の品質基準を所有する。
      - agentdev-quality-gates の QG-2 は実行時の投影先として本 Design の規則に従って検証する。
conflict_resolutions:
  -
    id: "CR-001"
    conflict: "既存の文章品質規範と新しい共通実行基盤が異なる。"
    resolution: "添付の明示合意に従い REQ-053 を更新する。旧品質保証のうち意味と構造および最終全文検証は維持する。"
  -
    id: "CR-002"
    conflict: "DEC-001 の文章品質に関する停止抑制と拒否動作が衝突する。"
    resolution: "明示合意した拒否動作の必然的な反映として限定範囲の後継 Decision を起草する。7条件を立証済みとは扱わず、導入時の証拠を要請する。"
  -
    id: "CR-003"
    conflict: "規則の実測調整と既知違反の事後許容禁止を両立する必要がある。"
    resolution: "校正後に正式初期判定を行い、固定した同一規則で最終検証する。"
  -
    id: "CR-004"
    conflict: "既存 REQ-053-020 は初期不備ゼロの場合も減少を要求する。"
    resolution: "初期ゼロの場合のゼロ維持と、初期不備がある場合の減少および最終ゼロを区別する。"
  -
    id: "CR-005"
    conflict: "既存アーカイブの node_modules 除外と依存の手作業インストール不要を両立する必要がある。"
    resolution: "配布前に解決した依存成果物を通常ソース配布にも提供し、全導入経路を空キャッシュとネットワーク遮断で確認する。"
  -
    id: "CR-006"
    conflict: "不正設定の全書込み拒否では設定自身の修復も拒否される。"
    resolution: "入力の全拒否を維持し、外部 editor 等で修復する導線を通知する。次回 hook で再読込みする。"
  -
    id: "CR-007"
    conflict: "用語の native 設定が標準規則や対象を無効化し得る。"
    resolution: "用語規則を標準構成へ追加合成し、標準構成を無効化する指定を上書きとして取り込まない。"
  -
    id: "CR-008"
    conflict: "REQ-010 の baseline と警告扱いを共通検査へ適用すると既知違反が残る。"
    resolution: "REQ-010-074 に共通 textlint の拒否対象違反が対象外であることを明記する。"
operation_units:
  -
    ou_id: "OU-001"
    target_req: "REQ-053"
    operation: "update"
    scale: "large"
    depends_on: []
    recommended_order: 1
    issue_policy: "epic"
    result:
      saved_files:
        - "docs/requirements/REQ-053.md"
      artifact_actions:
        - action: "ACT-REQ-001"
          artifact: "req"
          operation: "update"
          target_file: "docs/requirements/REQ-053.md"
          appended_rows:
            - "REQ-053-024"
            - "REQ-053-025"
            - "REQ-053-026"
            - "REQ-053-027"
            - "REQ-053-028"
            - "REQ-053-029"
            - "REQ-053-030"
            - "REQ-053-031"
            - "REQ-053-032"
            - "REQ-053-033"
            - "REQ-053-034"
            - "REQ-053-035"
            - "REQ-053-036"
            - "REQ-053-037"
            - "REQ-053-038"
      unclassified_verification_rows:
        - "REQ-053-024"
        - "REQ-053-025"
        - "REQ-053-026"
        - "REQ-053-027"
        - "REQ-053-028"
        - "REQ-053-029"
        - "REQ-053-030"
        - "REQ-053-031"
        - "REQ-053-032"
        - "REQ-053-033"
        - "REQ-053-034"
        - "REQ-053-035"
        - "REQ-053-036"
        - "REQ-053-037"
        - "REQ-053-038"
      decision_saved:
        action: "ACT-DEC-001"
        target_file: "docs/decisions/DEC-028.md"
        status: "proposed"
  -
    ou_id: "OU-002"
    target_req: "REQ-010"
    operation: "update"
    scale: "standard"
    depends_on:
      - "OU-001"
    recommended_order: 2
    issue_policy: "single"
    result:
      saved_files:
        - "docs/requirements/REQ-010.md"
      artifact_actions:
        - action: "ACT-REQ-002"
          artifact: "req"
          operation: "update"
          target_file: "docs/requirements/REQ-010.md"
          appended_rows:
            - "REQ-010-075"
      unclassified_verification_rows:
        - "REQ-010-075"
  -
    ou_id: "OU-003"
    target_req: "REQ-036"
    operation: "update"
    scale: "standard"
    depends_on:
      - "OU-001"
    recommended_order: 2
    issue_policy: "single"
    result:
      saved_files:
        - "docs/requirements/REQ-036.md"
      artifact_actions:
        - action: "ACT-REQ-003"
          artifact: "req"
          operation: "update"
          target_file: "docs/requirements/REQ-036.md"
          appended_rows: []
      unclassified_verification_rows: []
  -
    ou_id: "OU-004"
    target_design:
      operation: "create"
      domain: "quality"
      slug: "textlint-quality-runtime"
    operation: "create"
    scale: "large"
    depends_on:
      - "OU-001"
    recommended_order: 3
    issue_policy: "epic"
    result: {}
  -
    ou_id: "OU-005"
    target_design: "docs/designs/responsibilities/artifact-quality-control-routing.md"
    operation: "update"
    scale: "standard"
    depends_on:
      - "OU-001"
      - "OU-003"
      - "OU-004"
    recommended_order: 4
    issue_policy: "single"
    result: {}
  -
    ou_id: "OU-006"
    target_design: "docs/designs/responsibilities/document-type-responsibilities.md"
    operation: "update"
    scale: "standard"
    depends_on:
      - "OU-001"
      - "OU-003"
      - "OU-004"
    recommended_order: 4
    issue_policy: "single"
    result: {}
test_strategy:
  -
    id: "TS-001"
    target_item: "AG-001"
    verification: "標準規則を固定した版で読み込み、正常例、既知違反、文脈依存禁止表現と助言対象の入力を共通基盤で検査する。"
    pass_criteria: "規則構成と版が追跡可能で、拒否対象を拒否し、助言だけの入力は通過する。独自の一般文章 detector を持たない。"
    on_failure: "fix-and-reverify: 本変更の受け入れ条件に属する不合格は原因を修正し、同じ規則で再検証する。意味を復元できない場合や合意変更が必要な場合は判断事項を記録して停止し、範囲外記録だけで完了としない。"
    acceptance_refs:
      - "AC-001"
      - "AC-002"
      - "AC-023"
      - "AC-028"
      - "AC-049"
  -
    id: "TS-002"
    target_item: "AG-002"
    verification: "プロジェクトの prh 用語を追加し、散文、inline code、fenced code、固定置換できない表現を比較する。標準規則を無効化する指定も検査する。"
    pass_criteria: "用語を散文で検出し、構造上の除外を誤検出しない。修正指針が得られ、用語設定で標準対象と標準規則を無効化できない。"
    on_failure: "fix-and-reverify: 本変更の受け入れ条件に属する不合格は原因を修正し、同じ規則で再検証する。意味を復元できない場合や合意変更が必要な場合は判断事項を記録して停止し、範囲外記録だけで完了としない。"
    acceptance_refs:
      - "AC-021"
      - "AC-022"
      - "AC-023"
  -
    id: "TS-003"
    target_item: "AG-003"
    verification: "IR-060 の一般文章辞書依存と IR-065/066 の履歴文脈を含む検査を照合し、正常、違反、許容、過去再現例を回帰検証する。"
    pass_criteria: "一般文章の二重実装がなく、廃止語彙、旧パス、歴史的識別子の既存保証が維持される。"
    on_failure: "fix-and-reverify: 本変更の受け入れ条件に属する不合格は原因を修正し、同じ規則で再検証する。意味を復元できない場合や合意変更が必要な場合は判断事項を記録して停止し、範囲外記録だけで完了としない。"
    acceptance_refs:
      - "AC-041"
      - "AC-042"
  -
    id: "TS-004"
    target_item: "AG-004"
    verification: "対応する OpenCode バージョンで write の新規と更新、edit、複数ファイル apply_patch の正常と違反を試験する。tool 入力不正、読込失敗、再構成不能とルート外パスも試験する。"
    pass_criteria: "違反または検査不能時に対象ディスクの内容が変わらず、複数ファイル操作全体が拒否される。結果に位置、rule、該当箇所と利用可能な修正情報がある。"
    on_failure: "fix-and-reverify: 本変更の受け入れ条件に属する不合格は原因を修正し、同じ規則で再検証する。意味を復元できない場合や合意変更が必要な場合は判断事項を記録して停止し、範囲外記録だけで完了としない。"
    acceptance_refs:
      - "AC-014"
      - "AC-016"
      - "AC-017"
      - "AC-018"
      - "AC-019"
      - "AC-020"
      - "AC-050"
  -
    id: "TS-005"
    target_item: "AG-005"
    verification: "設定なしで docs 内外の Markdown とコードの操作を比較し、追加設定で標準対象を削除する指定を試験する。"
    pass_criteria: "標準 docs 対象が有効で、正常な標準対象外のみの操作に一般文章 lint を適用しない。標準対象を無効化できない。"
    on_failure: "fix-and-reverify: 本変更の受け入れ条件に属する不合格は原因を修正し、同じ規則で再検証する。意味を復元できない場合や合意変更が必要な場合は判断事項を記録して停止し、範囲外記録だけで完了としない。"
    acceptance_refs:
      - "AC-008"
      - "AC-009"
      - "AC-011"
  -
    id: "TS-006"
    target_item: "AG-006"
    verification: "設定なし、正常、不正 YAML、型違い、未対応 version、未知項目、ルート外 glob を試験する。起動後の設定変更と外部修復後の次回操作も確認する。"
    pass_criteria: "正常設定は加算され、不正設定では対応する全書込み操作が拒否される。設定パスと修復案内が表示され、修復後は再起動なしに正常動作する。"
    on_failure: "fix-and-reverify: 本変更の受け入れ条件に属する不合格は原因を修正し、同じ規則で再検証する。意味を復元できない場合や合意変更が必要な場合は判断事項を記録して停止し、範囲外記録だけで完了としない。"
    acceptance_refs:
      - "AC-010"
      - "AC-015"
      - "AC-050"
  -
    id: "TS-007"
    target_item: "AG-007"
    verification: "ADF 本体の project-local 設定で commands と skills の Markdown を検査し、設定のない別プロジェクトと比較する。Plugin source と extension を検索する。"
    pass_criteria: "ADF 本体の追加対象を同一 Plugin が扱い、リポジトリ名の特別分岐も Skill extension への対象設定も存在しない。"
    on_failure: "fix-and-reverify: 本変更の受け入れ条件に属する不合格は原因を修正し、同じ規則で再検証する。意味を復元できない場合や合意変更が必要な場合は判断事項を記録して停止し、範囲外記録だけで完了としない。"
    acceptance_refs:
      - "AC-012"
      - "AC-013"
  -
    id: "TS-008"
    target_item: "AG-008"
    verification: "同じ全文、パス、規則と設定を pre-write と最終検査へ入力して比較する。外部書込みで違反を導入して最終検査を実行する。"
    pass_criteria: "同一入力の判定差分がゼロで、迂回変更の違反を検出し、全対象の検査不能と拒否対象違反は完了失敗になる。導入先で docs-check なしに実行できる。"
    on_failure: "fix-and-reverify: 本変更の受け入れ条件に属する不合格は原因を修正し、同じ規則で再検証する。意味を復元できない場合や合意変更が必要な場合は判断事項を記録して停止し、範囲外記録だけで完了としない。"
    acceptance_refs:
      - "AC-024"
      - "AC-025"
      - "AC-026"
      - "AC-027"
      - "AC-051"
  -
    id: "TS-009"
    target_item: "AG-009"
    verification: "fresh clone とソース ZIP による通常導入、archive install、release archive、本体 self-sync を、空キャッシュとネットワーク遮断下で検証する。Plugin projection と loader shim の既存テストを実行する。"
    pass_criteria: "全経路で package と shim が揃い、Plugin と最終検査が手作業の npm/Bun install なしに動く。install/self-sync がネットワーク取得せず、repo-local 除外への追加もない。"
    on_failure: "fix-and-reverify: 本変更の受け入れ条件に属する不合格は原因を修正し、同じ規則で再検証する。意味を復元できない場合や合意変更が必要な場合は判断事項を記録して停止し、範囲外記録だけで完了としない。"
    acceptance_refs:
      - "AC-001"
      - "AC-002"
      - "AC-003"
      - "AC-004"
      - "AC-005"
      - "AC-006"
      - "AC-007"
      - "AC-028"
      - "AC-029"
      - "AC-052"
      - "AC-053"
  -
    id: "TS-010"
    target_item: "AG-010"
    verification: "旧 Skill、references、extension、Design、AGENTS、third-party 宣言と全参照元を棚卸しする。現行の実行依存と歴史参照を区別して検索し、参照整合性検査を行う。"
    pass_criteria: "現行の旧所有者依存と dangling reference がゼロで、他の active consumer 解消後に third-party 宣言が除去される。third-party 管理機構と歴史的参照の事実は維持される。"
    on_failure: "fix-and-reverify: 本変更の受け入れ条件に属する不合格は原因を修正し、同じ規則で再検証する。意味を復元できない場合や合意変更が必要な場合は判断事項を記録して停止し、範囲外記録だけで完了としない。"
    acceptance_refs:
      - "AC-030"
      - "AC-031"
      - "AC-032"
      - "AC-033"
      - "AC-034"
      - "AC-035"
      - "AC-055"
  -
    id: "TS-011"
    target_item: "AG-011"
    verification: "旧品質観点の移管対応を REQ 分析、REQ 事後診断、Decision、Design、Command、Skill と QG の投影先ごとに確認する。各能力の正常例と不備例を診断する。"
    pass_criteria: "意味品質の所有先が一意で欠落と重複がなく、構造診断を req-analysis へ二重移管しない。doc-diagnostics は docs の意味診断に限定される。"
    on_failure: "fix-and-reverify: 本変更の受け入れ条件に属する不合格は原因を修正し、同じ規則で再検証する。意味を復元できない場合や合意変更が必要な場合は判断事項を記録して停止し、範囲外記録だけで完了としない。"
    acceptance_refs:
      - "AC-036"
      - "AC-037"
      - "AC-038"
      - "AC-039"
      - "AC-040"
  -
    id: "TS-012"
    target_item: "AG-012"
    verification: "一般文章辞書、rewrite pattern、機械置換 script、IR と規則カタログを追跡し、移管した処理の残存と無関係な処理の維持を確認する。"
    pass_criteria: "textlint が代替する一般文章検査の active runtime 重複がゼロで、体裁上の好みだけの専用規則がなく、構造と参照とライフサイクルの検査を保持する。"
    on_failure: "fix-and-reverify: 本変更の受け入れ条件に属する不合格は原因を修正し、同じ規則で再検証する。意味を復元できない場合や合意変更が必要な場合は判断事項を記録して停止し、範囲外記録だけで完了としない。"
    acceptance_refs:
      - "AC-041"
      - "AC-042"
      - "AC-043"
      - "AC-044"
      - "AC-045"
      - "AC-055"
  -
    id: "TS-013"
    target_item: "AG-013"
    verification: "校正結果と正式初期判定を分けて記録する。固定した規則で対象全体を是正し、最終 HEAD の全文検証と既存の整合性および品質テストを実行する。歴史文書は変更前後の事実を照合する。"
    pass_criteria: "全対象の拒否対象違反がゼロで、既知違反の抑制と事後降格がない。初期不備がある場合は減少と最終ゼロ、初期ゼロならゼロ維持を確認する。全対象の結果と集計と最終 HEAD が一致し、歴史の事実変更がない。"
    on_failure: "fix-and-reverify: 本変更の受け入れ条件に属する不合格は原因を修正し、同じ規則で再検証する。意味を復元できない場合や合意変更が必要な場合は判断事項を記録して停止し、範囲外記録だけで完了としない。"
    acceptance_refs:
      - "AC-046"
      - "AC-047"
      - "AC-048"
      - "AC-049"
      - "AC-054"
      - "AC-055"
  -
    id: "TS-014"
    target_item: "AG-001"
    verification: "拒否対象の規則ごとに、再現問題、強制に値する被害、削除や統合や接続面の縮小や指針改善の不十分性、強制の実行可能性、単一所有、削減する旧機構、将来の再評価条件の証拠を確認する。"
    pass_criteria: "DEC-001 決定4の7条件を満たす根拠が追跡可能で、未立証の規則を拒否対象へ昇格させていない。単に指針では拒否できないという説明だけを被害防止の不十分性の根拠にしない。"
    on_failure: "fix-and-reverify: 未立証の強制を有効にせず、根拠と規則構成を再検討して再検証する。明示合意した外部保証を満たせない場合は判断事項として停止し、全規則の無効化によって合格扱いにしない。"
    acceptance_refs: ["AC-049"]
realization_actions:
  -
    id: "RA-001"
    concern: "共通検査と依存配布"
    responsibility: "共通基盤、消費者向け Plugin と最終検査の実行可能性"
    ownership_hints:
      - "src/opencode/plugins/agentdev-textlint-guard/"
      - "scripts/install.ps1"
      - "scripts/consumer/archive/install.ps1"
      - "scripts/self-sync.ps1"
      - "scripts/self/release/package-release-archive.ps1"
    intent: "共通基盤と二入口、配布前解決済み依存、loader shim を実現する。既存の Plugin 投影契約とオフライン導入を維持する。"
    verification_refs:
      - "TS-001"
      - "TS-004"
      - "TS-008"
      - "TS-009"
    source_items:
      - "AG-001"
      - "AG-004"
      - "AG-008"
      - "AG-009"
  -
    id: "RA-002"
    concern: "プロジェクト用語と追加対象"
    responsibility: "project-local 設定と標準構成への追加接続"
    ownership_hints:
      - ".agentdev/config/plugins/agentdev-textlint-guard.yaml"
      - "プロジェクト所有の native textlint/prh 設定"
    intent: "標準対象を維持し、ADF 本体の commands/skills を設定で追加する。設定不正、再読込み、標準無効化を共通処理で扱う。"
    verification_refs:
      - "TS-002"
      - "TS-005"
      - "TS-006"
      - "TS-007"
    source_items:
      - "AG-002"
      - "AG-005"
      - "AG-006"
      - "AG-007"
  -
    id: "RA-003"
    concern: "旧品質所有者の退役と意味品質の移管"
    responsibility: "既存責務別 Skill と Design および品質能力の投影"
    ownership_hints:
      - "src/opencode/skills/agentdev-doc-writing/**"
      - ".agentdev/extensions/skills/agentdev-doc-writing.yaml"
      - "docs/designs/skills/agentdev-doc-writing.md"
      - "AGENTS.md"
      - "src/third-party/skills.yaml"
      - "docs/designs/local/third-party-skill-management.md"
      - "agentdev-doc-diagnostics"
      - "agentdev-req-structure-diagnostics"
      - "agentdev-req-analysis"
      - "agentdev-decision-guidelines"
      - "agentdev-decision-file-manager"
      - "agentdev-design-file-manager"
      - "agentdev-command-authoring"
      - "agentdev-skill-authoring"
      - "agentdev-inspect-skills"
      - "各対応 Design と extension"
      - "docs/designs/responsibilities/artifact-quality-control-routing.md"
    intent: "旧 Skill の意味品質観点を一件ずつ既存所有者へ移し、呼出元、品質ゲート、template、references、extension、索引を更新する。移管先と呼出しを確認してから旧実行依存を撤去する。退役 Design は現行ライフサイクルに従って処理し、現行参照を残さない。"
    verification_refs:
      - "TS-010"
      - "TS-011"
    source_items:
      - "AG-010"
      - "AG-011"
  -
    id: "RA-004"
    concern: "一般文章検査の重複除去"
    responsibility: "整合性規則と語彙規則の責務分離"
    ownership_hints:
      - "docs/designs/integrity/rules/IR-060-forbidden-japanese-word-detection.md"
      - "IR-065"
      - "IR-066"
      - "docs/designs/integrity/rule-ownership.md"
      - "docs/designs/integrity/integrity-rule-catalog.md"
      - "docs/designs/authoring/vocabulary-registry.md"
      - "docs/designs/responsibilities/document-type-responsibilities.md"
      - "scripts/self/maintenance/apply-mechanical-replacement.ps1"
    intent: "移管した一般文章辞書と checker を撤去し、関連する用語政策と文章規範参照を新しい所有先へ更新する。構造、識別子、状態と履歴文脈の検査および共存する無関係な処理は維持する。"
    verification_refs:
      - "TS-003"
      - "TS-012"
    source_items:
      - "AG-003"
      - "AG-012"
  -
    id: "RA-005"
    concern: "文書全体の移行と最終保証"
    responsibility: "校正、意味保持、全対象検査と完了証拠"
    ownership_hints:
      - "docs/**/*.md"
      - "src/opencode/commands/**/*.md"
      - "src/opencode/skills/**/*.md"
      - "既存の保存と完了および品質検査の呼出元"
    intent: "校正後に規則を固定して初期判定し、既存文書を意味を保って是正する。全受け入れ条件の完了証拠を最終 HEAD に対応させる。歴史の意味を確定できない箇所は推測修正しない。"
    verification_refs:
      - "TS-008"
      - "TS-013"
    source_items:
      - "AG-008"
      - "AG-013"
review_dispositions:
  -
    id: "RD-001"
    source_item: "AG-009:REQ-052-generic-contract"
    disposition: "covered"
    reason_code: "existing_generic_contract"
    reason: "Plugin の種別、fail-closed、汎用配布の契約は既存で充足する。新 Plugin の実装と配布試験は対象に残す。"
    evidence:
      path: "docs/requirements/REQ-052.md"
      section: "要件"
      checked_at_commit: null
    related_removed_items: []
  -
    id: "RD-002"
    source_item: "AG-010:REQ-002-generic-contract"
    disposition: "covered"
    reason_code: "existing_generic_contract"
    reason: "third-party Skill の取得定義と管理機構の契約は維持する。特定 Skill 宣言の削除は実現面の変更として残す。"
    evidence:
      path: "docs/requirements/REQ-002.md"
      section: "要件"
      checked_at_commit: null
    related_removed_items: []
  -
    id: "RD-003"
    source_item: "AG-009:REQ-050-generic-contract"
    disposition: "covered"
    reason_code: "existing_generic_contract"
    reason: "導入のオフライン境界と既存の公開入口を維持できる。依存成果物の同梱と配布試験は別途実現する。"
    evidence:
      path: "docs/requirements/REQ-050.md"
      section: "要件"
      checked_at_commit: null
    related_removed_items: []
case_open_hints:
  epic_needed: true
  decomposition: "単一の統合変更として、共通基盤と配布、書込み前検査と最終検査、意味品質再配置と旧所有者退役、文書全体の移行と完了検証に分けて扱う。Issue 階層と実行単位は case-open が決定する。"
  wave_hints:
    - "共通基盤と依存配布の成立を確認する"
    - "検査の二入口と適用先を接続する"
    - "意味品質の移管先を確立した上で旧実行依存を撤去する"
    - "固定した規則で全対象を是正し、配布と品質を最終検証する"
  integration_constraint: "全ての受け入れ条件を満たすまで統合変更を完了としない。中間段階の旧所有者削除だけで完了扱いにしない。"
classification:
  final: "REQ"
  case_type: "通常"
  reason: "新しい消費者向け拒否動作と共通検査機能を提供するため feature。複数REQと10ファイル超の実現面を変更するため large。方式の採否を比較する実証ではなく、合意済み採用方式の適合試験である。"
  design_separation: "規則名、設定スキーマ、パス、tool入力形式、検査構成、配布実装は Design に分離する。REQ には観測可能な状態と保証を記す。"
operation_unit_notes: "Decision 保存は ACT-DEC-001 により req-save が実行する。各 OU は同一変更の保存操作の区分であり、独立リリースや Issue 階層の決定を意味しない。"
health_assessment:
  target: "REQ-053"
  existing_rows: 23
  candidate_rows: 38
  concern_signals: 2
  artifact_types: 4
  design_separation_violations: 0
  split_signal_total: 2
  recommendation: "SPLIT 検討"
  resolution: "入力の統合理由に従い、文章品質の一つの保証を既存REQへ集約する。Plugin の一般種別と本体整合性および意味診断は既存の別REQへ分離済み。新規REQを追加せず、詳細をDesignへ分離する。実行はlargeの分解参考を提示する。"
architecture_advisory:
  status: "completed"
  confirmed:
    - "既存REQ-053中心の更新で所有可能"
    - "REQ-010-074とREQ-036-008にも境界更新が必要"
    - "DEC-001の限定後継判断が必要"
    - "DEC-016維持で依存を配布前解決する"
  inferred_as_confirmed: false
  user_decisions: []
  blockers: []
review_record:
  strategy: "所有先と既存保証の維持、拒否と完了の実行可能性、用語設定の迂回、配布成立、移行時の誤合格を二系統で独立に反証する。"
  independent_streams:
    - "review_contract"
    - "review_runtime"
  findings:
    -
      id: "A1"
      resolution: "DEC-001決定4の7条件を導入証拠に含め、未立証規則を拒否対象へ昇格させない。"
      status: "resolved"
    -
      id: "A2"
      resolution: "規則校正を正式初期判定より前に分離する。"
      status: "resolved"
    -
      id: "A3"
      resolution: "初期ゼロの維持を完了条件へ明記する。"
      status: "resolved"
    -
      id: "B1"
      resolution: "不正設定の拒否を維持し、外部修復と次回再読込みを示す。"
      status: "resolved"
    -
      id: "B2"
      resolution: "配布前解決済み依存と全導入経路の空キャッシュ試験を定義する。"
      status: "resolved"
    -
      id: "B3"
      resolution: "プロジェクト用語設定で標準構成を無効化できないようにする。"
      status: "resolved"
  convergence_audit: "両独立系統が親の反映案を再評価し、合意候補の再検証を完了した。未解決の判断事項と新たな本質的争点はない。"
verification_status: "要件ドラフトの YAML、参照ID、全55受け入れ条件と検証方針の対応、Design所有者、OU依存を確認した。実装、corpus測定、Plugin実行試験、配布試験は本工程では未実施であり test_strategy は後続工程の実施契約である。"
source_context:
  background: |
    ADF は現在、日本語文書と配布物の文章品質を複数の仕組みで管理している。
    
    主なものは次の通りである。
    
    * `agentdev-doc-writing` による静的査読
    * third-party Skill `japanese-tech-writing` による文章規範
    * `agentdev-doc-writing` 配下の置換辞書、rewrite pattern、機械置換規則
    * `docs-check`、IR、整合性 checker による決定的検査
    * `agentdev-command-authoring`、`agentdev-skill-authoring`、`agentdev-inspect-skills` 等による成果物固有の品質判断
    
    現行の `REQ-053` は配布 command / skill の文章品質契約を所有し、文章品質規範の参照先として `japanese-tech-writing`、査読経路として `agentdev-doc-writing`、診断経路として `agentdev-inspect-skills` を定義している。
    
    一方、文章表層品質の一部は機械的に判定できるにもかかわらず、LLM に規範を読ませて遵守させる経路、ADF 独自の辞書・検出規則、決定的 checker が併存している。
    
    # 問題
    
    文章の表層品質について複数の正規所有者と実装方式が存在するため、次の問題がある。
    
    * LLM が規範を解釈して守る経路では、同一入力に対する遵守結果を決定的に保証できない。
    * 一般的な日本語文章品質に対して ADF 独自の置換辞書、rewrite pattern、検査規則を維持している。
    * 作成時、査読時、診断時、完了時で同種の文章品質判定が重複している。
    * `agentdev-doc-writing` が文章表層品質と成果物固有の意味品質を混在して所有している。
    * プロジェクト固有用語と ADF 固有の integrity vocabulary が同じ「用語統制」として扱われやすく、責務境界が不明瞭である。
    * OpenCode の書込み経路では、違反内容が一度ファイルへ反映された後に検査される経路が残り得る。
    
    文章表層品質を既存の textlint ecosystem へ寄せ、ADF は実行・配布・プロジェクト設定との接続だけを所有する構造へ変更する。
    
    # 目的
    
    ADF の日本語文書品質・用語統制を、LLM が規範文書を読んで守る方式および ADF 独自の文章検査実装から、textlint を利用する決定的な検査方式へ移行する。
    
    OpenCode 上では、文書を書き込む直前に textlint を実行し、違反を含む内容をファイルへ反映させない pre-write gate を提供する。
    
    用語そのものは各 ADF 適用プロジェクトが所有し、ADF は textlint を実行する仕組み、標準の日本語技術文書ルールセット、プロジェクト固有用語を接続する仕組みだけを提供する。
    
    この移行に伴い `agentdev-doc-writing` を退役させ、文章の表層品質は textlint、文書・成果物の意味品質は既存の責務別 Skill / diagnostics が所有する構造へ整理する。
    
    # Source Summary
    
    本 RU は 2026-09-08 の会話で合意した、ADF のドキュメンテーション品質基盤を textlint へ移行する方針を Requirement Unit として整理したものである。
    
    合意の中心は次の通りである。
    
    * 用語・日本語文章品質をプロンプト依存にせず deterministic lint とする。
    * OpenCode Plugin の `tool.execute.before` で `write` / `edit` / `apply_patch` の完成予定内容を textlint し、NG ならファイル化前に拒否する。
    * hook を通らない変更経路に備えて、同じ lint 基盤による最終 gate を持つ。
    * ADF の標準対象は `docs/**/*.md` とする。
    * ADF 自身だけが必要とする `src/opencode/commands/**/*.md`、`src/opencode/skills/**/*.md` は Plugin source の特別分岐ではなく project-local `additional_targets` で追加する。
    * project-local Plugin config は project root の `.agentdev/config/plugins/agentdev-textlint-guard.yaml` から読み、malformed 時は fail-closed とする。
    * project-specific terminology は project が所有し、textlint/prh 等の既存形式を利用する。
    * ADF は既存 textlint ecosystem を利用し、一般文章品質を独自実装しない。
    * `agentdev-doc-writing` は退役させる。
    * 文章の表層品質と成果物固有の意味品質を分離する。
    
    最新 repository との照合は、この合意内容を変更するためではなく、現行の正規所有者、配布経路、active artifact への適用先を特定するために使用する。
    
    # 統合理由
    
    本 RU では、textlint runtime、pre-write Plugin、最終 gate、`agentdev-doc-writing` 退役、既存品質責務の再配置を一つの変更単位として扱う。
    
    これらを別々に導入すると、次の中間状態が発生するためである。
    
    * textlint と `agentdev-doc-writing` が同じ文章表層品質を二重所有する。
    * `agentdev-doc-writing` を先に削除すると、意味品質の所有先が欠落する。
    * pre-write gate だけを導入すると、hook を通らない変更を検出できない。
    * textlint runtime だけを導入して配布経路を更新しないと、consumer で利用できない。
    * 用語検査を一括移管すると、project terminology と ADF integrity vocabulary の責務を混同する。
    
    したがって、文章表層品質の所有者変更と、その実行・配布・最終保証・旧所有者退役を一体として要件化する。
    
    # 主対象REQまたは変更対象候補
    
    最新 repository を基準とした主対象は次の通りとする。
    
    ## 主対象
    
    ### `REQ-053` 配布物の文章品質契約
    
    現行 `REQ-053` は、文章品質規範を `japanese-tech-writing` とし、作成時、`agentdev-doc-writing` による査読時、`agentdev-inspect-skills` による診断時の3経路へ文章品質を適用する契約を持つ。
    
    本 RU の中心的な変更対象である。
    
    req-define では少なくとも次を再構成する。
    
    * 一般文章表層品質の正規実行基盤を textlint へ変更する。
    * `japanese-tech-writing` を文章品質規範の正規所有者とする契約を除去する。
    * `agentdev-doc-writing` を必須査読経路とする契約を除去する。
    * 決定的に検査できる表層品質と、成果物固有の意味・構造品質を分離する。
    * 現行 `REQ-053` に含まれる意味・構造契約は、単に textlint rule へ変換せず、該当する既存責務へ維持または移管する。
    * 最終 HEAD 全文での再検証、既知違反を合格扱いしない等、textlint 移行後も有効な品質保証契約は維持する。
    
    ## 主要な関連変更候補
    
    ### `REQ-052` Custom Tool・Plugin/Hook の種別契約と配布境界
    
    consumer 配布対象の `agentdev-textlint-guard` は ADF 汎用 Plugin / Hook として扱う。
    
    既存の次の契約を利用する。
    
    * Plugin / Hook による実行前の拒否・強制
    * 設定解釈不能、対象パス解決不能、検査不能時の fail-closed
    * ADF 汎用 Plugin の consumer 配布
    
    本 RU のためだけに同種の Plugin 基盤契約を重複定義しない。
    
    ### `REQ-010` 自己監査コマンド（docs-check）
    
    ADF self-hosting に存在する文章表層品質の決定的検査と textlint の責務重複を整理する。
    
    `docs-check` は ADF 本体専用であるため、consumer が利用する textlint runtime / final gate の正規実装にはしない。
    
    ADF self-hosting の保存・完了・検査経路から textlint final gate を利用する場合も、consumer 共通の textlint 実行基盤を呼び出す構造とし、`docs-check` 内へ別の文章品質判定を再実装しない。
    
    ### `REQ-036` 検出と診断コマンド群
    
    `agentdev-doc-writing` を意味診断先として参照する現行契約を更新する。
    
    文章表層品質は inspect 系の意味診断責務から外す。
    
    意味判断を必要とする診断は、文書種別・成果物種別に応じた既存 diagnostics / Skill へ再配置する。
    
    ### その他の変更候補
    
    次は現行契約との整合のため影響調査する。
    
    * `REQ-002`: third-party Skill 宣言・取得機構自体は維持し、`japanese-tech-writing` 固有の利用前提のみを除去する必要がある場合
    * `REQ-050`: install / self-sync / archive 配布の既存汎用契約で新 Plugin を扱えず、要件変更が必要である場合
    * その他、最新 repository で `agentdev-doc-writing`、`japanese-tech-writing`、文章表層品質の正規所有を直接契約する active REQ
    
    既存 REQ で表現可能な内容を、新規 REQ として重複作成しない。
  implementation_assumptions: |
    以下は要件を変更しない内部詳細として扱う。
    
    * textlint runtime、Plugin hook、final gate は可能な限り同一 package / module 群を共有する。
    * YAML parse は既存の標準 parser / runtime API を利用し、ADF 独自 YAML parser を作らない。
    * package dependency の具体的な配置方法は、現行 consumer projection / self-host projection と整合する方式を実装時に選択してよい。
    * OpenCode / textlint API の minor な version drift は、外部契約を変更しない限り現行 API へ追従してよい。
  dependencies: |
    * OpenCode Plugin runtime が `tool.execute.before` を提供し、project root を Plugin input から取得できること。
    * textlint の module API で、ディスクへ反映前の文字列と virtual file path を lint できること。
    * textlint および採用 preset / rule が Bun / OpenCode Plugin runtime で実行可能であること。
    * Plugin package の runtime dependencies が ADF self-sync と consumer install / archive install の双方で、利用者の手作業 install なしに利用可能になること。
    * `write` / `edit` / `apply_patch` の入力形式を、実装時点の OpenCode version に対するテストで固定できること。
    * project-local config の YAML parse に既存標準 parser / runtime API を利用できること。
    
    OpenCode または textlint API の version drift がある場合、現在 version の API へ適応してよい。
    
    ただし次の外部契約は変更しない。
    
    * pre-write で NG をディスクへ入れない。
    * `docs/**/*.md` は常時対象とする。
    * ADF 自身の追加対象は project-local config で実現する。
    * config malformed は fail-closed とする。
    * project-specific vocabulary は project が所有する。
    * final gate は pre-write と同じ lint 基盤を使用する。
    * consumer へ手作業の依存 package install を要求しない。
    * `agentdev-doc-writing` を退役させる。
    * 一般文章品質と artifact-specific semantics を再統合しない。
    * integrity-specific vocabulary checker を一般文章 style として無条件に移管しない。
```

# summary

textlint を文章表層品質の共通実行基盤として導入する。
既存 REQ 3件を更新し、意味品質と整合性の保証を維持する。
55件の受け入れ条件を14件の検証方針に対応づけた。
実装および配布の完了条件は、全対象の拒否対象違反ゼロと既存保証の維持である。

実装は未実施である。
次工程は req-save、design-save、case-open の順とする。
