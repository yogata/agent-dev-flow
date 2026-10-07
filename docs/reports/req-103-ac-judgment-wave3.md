# REQ-103 Wave 3 検証記録と未達判定

対象は Issue #3538、親 Epic #3530、委譲識別子 DEL-3538-1 である。
作業ブランチは case-3538、基準 commit は a9535e6a である。
本記録は今回限りの記録であり、恒久台帳ではない。

## 訂正と停止

e30d9a44 の全 AC を pass とする記録は撤回する。
規範の所在と手順文面の確認を、実経路の検証や全件照合の証明として扱ったためである。
また、required 行の検証対応を optional に変更して欠落を消した処置も撤回する。
本委譲で追加した implementation 宣言と verification 宣言は、命題対応の証拠が不足するため撤回した。
policy.yaml の REQ-103 に関する設定は開始時の状態へ戻した。
既存の REQ-103-016、REQ-103-017 の optional 登録は変更していない。

結果は blocked であり、完了 PR は作成しない。
実体の不在を確定したものではない。証拠不足を非該当や合格へ変換しない。
REQ、Decision、Design の新規規範や検証義務の緩和は確定しない。

## AC-26 判定規則を適用した個別判定

定義所在は docs/requirements/REQ-103.md「受け入れ条件対応」節を正とする。
TS 定義は消費済み draft の履歴から確認した。
復元経路は `git show dafbf68b^:.agentdev/drafts/req-draft-adf-v4-canonical-convergence.md` である。
TS-005、TS-006、TS-014 は、手順の存在確認だけでは成立しない。
現在の契約、対象成果物、評価範囲に対応する証拠が揃わない AC は blocked とする。

| AC | 要件行 | 検証義務 | 判定 | 根拠と未達 |
|---|---|---|---|---|
| AC-01 | REQ-103-001、002 | TS-001 | blocked | 正規文書の導線を確認したが、全域読解と正規所有者・参照元の双方向突合は未完了 |
| AC-02 | REQ-103-016、017 | TS-010 | blocked | PR #3544 に全件一覧があるが、本実行で baseline 集合の再列挙と 305 件の一致を確認していない |
| AC-03 | REQ-103-003 | TS-002 | blocked | 全判断一覧からの決定的抽出を実行していない |
| AC-04 | REQ-103-003 | TS-002 | blocked | 同じ命題の再判定経路について全件確認が不足 |
| AC-05 | REQ-103-004、006 | TS-003 | blocked | case-ready の記述を確認したが、残存する全評価の閉包と代表例・反例・判定不能例の照合が不足 |
| AC-06 | REQ-103-005 | TS-003 | blocked | 全評価の不採用機械化案と実装・維持負担の説明を照合していない |
| AC-07 | REQ-103-007 | TS-004 | blocked | キーワード検索は実施したが、LLM 使用箇所の全一覧と開放性根拠の全件確認が不足 |
| AC-08 | REQ-103-008 | TS-005 | blocked | 全障害系を実際の呼出経路へ与える検証が未実施 |
| AC-09 | REQ-103-009 | TS-005 | blocked | 依存後続抑止と独立処理継続の実経路検証が未実施 |
| AC-10 | REQ-103-011 | TS-006 | blocked | 同じ実経路で復旧、旧判定不使用、副作用非重複、正常進行の4項目を検証していない |
| AC-11 | REQ-103-010、012 | TS-005、007 | blocked | 人間判断移行条件の全件列挙と障害系での移行不発生の確認が不足 |
| AC-12 | REQ-103-013 | TS-008 | blocked | 検索結果に document-model のバリデータ不導入記述等が残り、固有契約と全般的禁止の意味整合を確定していない |
| AC-13 | REQ-103-014 | TS-009 | blocked | 全主要責務の所有者対応表と重複・移管漏れの突合が未完了 |
| AC-14 | REQ-103-015 | TS-009 | blocked | 4概念の正規責務と決定方法の全域確認が未完了 |
| AC-15 | REQ-103-022 | TS-013 | blocked | design-save 等の修正を実施したが、accepted Decision の残存記述を自動的に歴史説明扱いにはできない。現行参照の全件分類が未完了 |
| AC-16 | REQ-103-018 | TS-011 | blocked | 統制種別の説明表だけでなく、全適用箇所の列挙と必要性突合が必要 |
| AC-17 | REQ-103-019 | TS-011 | blocked | 本 Wave に新規 checker 等は追加していないが、baseline からの全変更の必要性確認が未完了 |
| AC-18 | REQ-103-020 | TS-012 | blocked | 歴史領域の全差分の意味分類が未完了 |
| AC-19 | REQ-103-021 | TS-012 | blocked | 全歴史成果物から現在の正規所有者への到達性確認が未完了 |
| AC-20 | REQ-103-023 | TS-013、001 | blocked | docs 全域横断読解と残存意味矛盾の確定が未完了 |
| AC-21 | REQ-103-024、025 | TS-014 | blocked | traceability の欠落が残る。実 Case 入力の拒否結果による副作用抑止と全投影の照合も不足 |
| AC-22 | REQ-103-026 | TS-015 | blocked | 表形式の keep 232 行を検査したに留まり、keep 294 件すべての理由照合ではない |
| AC-23 | REQ-103-027 | TS-015 | blocked | 中核5要素の正規文書記述を確認したが、実経路での維持と提供能力の全件照合が不足 |
| AC-24 | REQ-103-028 | TS-016 | pass | baseline tag は非 SemVer 名で実在し、commit 72e04cadc4ff8fa00b6f484f421975c99a75b449 を指す |
| AC-25 | REQ-103-028 | TS-016 | pass | 同 tag の commit 起点で HEAD との差分比較を実行可能。指す先は受領時の記録と一致し、本委譲では tag 操作をしていない |

pass 2 件、blocked 23 件、fail 0 件、not applicable 0 件。
未評価、未検証、証拠不足を not applicable としていない。
AC-26 に従い、blocked が残るため完了とは報告しない。

## 実際に取得した検証結果

以下の退避先は C:/WINDOWS/TEMP/opencode/ である。
一時ファイルの存在だけを恒久証拠とせず、結果の要点をここに記録する。
①と②は worktree root、③は指示された main root で実行した。

| 検証 | 実測結果 | 証跡 | 適用範囲と留保 |
|---|---|---|---|
| bun test ① | 2717 pass、0 fail、110 files、exit 0 | test-1-final2.txt | repo-agentdev-integrity scripts の検査。Jev Tool テスト全体や呼出側抑止を検証した結果ではない |
| bun test ② | 349 pass、0 fail、25 files、exit 0 | test-2-final.txt | src/common/skills 配下 |
| bun test ③ | 653 pass、1 fail、39 files、exit 1 | test-3-final.txt | main root の既知 REQ-061-019 pin fail。worktree 修正はこの実行に反映されない |
| pin 単体 | 65 pass、0 fail | worktree で直接実行 | worktree の case-ready-definition-readiness.test.ts を検証 |
| IR-055 単体 | 31 pass、0 fail | worktree で直接実行 | 本作業で混入した配布物の Decision ID 参照3件を除去後に再検証 |
| 配布依存境界 | failures 0、exit 0 | dist-boundary-final.txt | source profile。全投影の一致をこの結果だけでは証明しない |
| targeted docs guard | failures 0、warnings 0、exit 0 | docs-guard-final2.txt | case-run、変更ファイルをカンマ区切り指定 |
| check_extensions | exit 0、warning あり | extensions-final.txt | worktree で yomiyasu 実体未伝播等の warning |
| AUTOGEN dry-run | WOULD UPDATE 0 | コマンド出力 | req-health-metrics の計測日追随後 |
| textlint final | hard 40、exit 1 | textlint-final-wt3.json、textlint-final-main3.json | hard の集合は main と完全一致、新規0・除去0。検査全体 exit 0 ではない |
| check_integrity | 本文サマリ NG 0、終了コード1 | integrity-final2.txt | stderr は new unmanaged NG 1 と記録。原因未確定のため合格扱いを撤回 |
| traceability | 初期と訂正後とも missing-implementation 14 行、missing-verification 19 行、7 pass・2 fail | check-initial.json と訂正後のコマンド出力 | 宣言追加と optional 化で一時的に pass にした結果は撤回。required 条件を維持した再検査で欠落を確認 |
| LSP diagnostics | fresh diagnostics 待機が2回とも timeout | lsp_diagnostics 応答 | 診断成功とは扱わない。変更した source は pin テスト1ファイル |

## 維持した残存不整合の修正

- REQ-061-019 のテスト pin を現行文言へ追随した。
- design-save 工程言及を Design 保存の内部責務の語彙へ修正した。
- 語彙レジストリの廃止済み command と内部 lifecycle の種別を修正した。
- REQ-006 適用範囲の旧保存工程語彙を更新した。
- DEC-013 の related_reqs から retired REQ-028 を除去し、本文の移管記録は保持した。
- Decision 索引と req-health-metrics の AUTOGEN を追随させた。
- updated は内容変更 commit の日付に対応させた。

## 再開条件

required の検証義務を緩和せず、全要件行の実装実体と検証手段への命題対応を確認する。
実装実体が存在しない場合、新規の Wave 1・2 実装で埋めず、停止条件に従う。
実際の呼出経路で TS-005、TS-006、TS-014 の結果消費と副作用抑止を検証する。
TS-015 は keep 全294件を照合し、TS-001、TS-013 は全対象の読解と参照分類を完了する。
check_integrity の終了コード1を説明できる証拠を取得する。
既確定規範の追加変更が必要な場合は req-define で再合意する。
