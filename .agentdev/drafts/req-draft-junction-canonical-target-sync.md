---
draft_type: req_draft
topic_slug: junction-canonical-target-sync
status: draft
created_at: 2026-10-10T23:50:00+09:00
source_rus:
  - RU-0198
---

# draft-data

```yaml
work_type: bugfix

scale: standard

summary: >
  ジャンクション投影の正本一致検査を両公開入口（scripts/self-sync.ps1・scripts/install.ps1）・
  両ホスト（OpenCode・Senpi）の check / dry-run / apply 全モードへ統一適用する。現行の
  check は解決後パス比較で乖離を検出する一方、self-sync の dry-run（両ホスト）と apply
  （OpenCode）はリンク先の存在のみで正常扱いし、install の dry-run（両ホスト）も存在のみ
  判定であるため、REQ-050-015（apply は check 検出乖離を解消）・REQ-058-004（dry-run は
  apply の予測）に反する。あわせて install の apply は管理 relPath 上の不一致ジャンクションを
  管理物判定なしに置換しており、管理対象外リンクの非破壊境界（REQ-058-008）に反する。
  修復は既存の Get-TargetSourcePath・Test-ManagedProjectionJunction・
  Test-ManagedSenpiJunction を再用し、旧正本（src/opencode/ 配下）を向く管理対象リンクは
  旧側実体が残っていても現行正本へ修復する。管理物と確認できないリンクは自動置換せず
  保持・衝突報告・apply 非正常終了とする。正本一覧・移設履歴・物理同一性判定基盤・公開入口
  横断の共有モジュールは追加しない。契約上の義務は REQ-050/058/099 の既存行で充足するため
  REQ 行の変更は行わず、runtime-package-boundary Design の判定表・修復時所有判定の規定を
  整合更新し、実装是正と試験追加を後続工程へ引き継ぐ。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      正本一致条件の統一適用（RU-0198、合意済 2026-10-10T22:42）。両公開入口・両ホストとも、
      リンク先が存在するだけでは正常とせず、同じ正本解決条件を check・dry-run・apply へ適用
      する。正本と異なるリンクを正常・適用省略にしない。現行 check の解決後パス比較を基準に
      予測・適用を整合させる。旧正本にも実体を残した commands・skills・tools の不一致、正本
      候補外を向く plugins・Senpi も対象とする。
  - id: AG-002
    content: |
      修復と所有判定。正本一致の健全なリンクは変更しない。管理物と確認できる不一致リンクは
      リンク自体だけを修復（削除・再作成）する。旧正本側の実体が存在しても修復を省略しない。
      修復可否には既存の Test-ManagedProjectionJunction・Test-ManagedSenpiJunction を再用する。
      現行配置先にある管理物判定不能なリンクは保持し、衝突を報告して apply を非正常終了させる。
      dry-run は当該リンクの除去・再作成を予測しない。競合しない管理対象外リンクは既存の
      情報報告と保持を維持する。管理物と確認できる旧リンク先消失の事例も修復対象とする。
  - id: AG-003
    content: |
      終了コード契約。修復予定がある通常の dry-run は終了コード 0 を維持し、check の乖離は
      終了コード 1 とする。衝突や修復失敗の apply を正常終了にしない（既存の非正常終了維持）。
      適用後は同一ホスト条件の check 再実行で乖離残存なし（収束）を確認し、正常終了表示だけを
      収束の証拠にしない。
  - id: AG-004
    content: |
      非破壊境界。元のリンク先実体・実ディレクトリ・repo-local 資産を保護する。修復はリンク
      自体に限定し、旧正本側のファイル移動・削除、依存生成（node_modules 等）、通信を行わない。
      全対象の事前検査や一括巻戻しまで要求せず、衝突したリンクの保持と不成功の報告を必要条件
      とする。REQ-050・REQ-058・REQ-099 の既存責務と非破壊境界を維持する。
  - id: AG-005
    content: |
      実現方針の限定。既存の正本解決（Get-TargetSourcePath）・管理物判定・試験手段（隔離構成
      New-ConsumerRepo / New-SelfRepo + Invoke-EntryScript による実公開入口実行）を利用する。
      同一判定条件の小さな関数化は必要範囲にとどめ、公開入口をまたぐ新しい共有モジュールや
      汎用同期基盤・正本一覧・移設履歴・別名経由の物理的同一性判定基盤を必須化しない。
      既存要件で充足する義務を新規要件として重複させない。
  - id: AG-006
    content: |
      対象外（RU-0198 対象外を維持）。正本配置モデルの再設計、node_modules 等の依存生成、
      通信・チェックアウト・archive installer（直接対象外は REQ-058-012 どおり）、ホスト選定の
      改変、親ディレクトリ全体の移行、リンク以外の一括是正、同時実行排他、一括巻戻し、汎用
      リンク修復機構。
  - id: AG-007
    content: |
      試験原則。健全な配置と修復可能な不一致の試験は、判定不能な衝突の試験から分離する。
      衝突で停止する試験に修復可能な全件の収束を要求しない。現在の再現資料
      （hermes-vault 外部アーカイブ、reproduce.ps1）は修正前の5事例の再現であり回帰試験では
      ない。後続工程は本 RU 本文から義務を判断でき、セッション論理 URI の解決を必要としない。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/local/runtime-package-boundary.md
    target_design:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: "ジャンクション状態の判定と自己修復"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      両公開入口（`scripts/install.ps1`・`scripts/self-sync.ps1`）は、各ジャンクション対象について、ジャンクションの有無と解決先の一致を同じ正本解決条件で確認する（REQ-050-002/003、REQ-058-012、PR #1120）。本節は install.ps1 の接続手順内に置かれているが、判定と挙動の規定は両公開入口・両ホスト（OpenCode・Senpi）・全モード（apply / check / dry-run）に適用する。各対象は以下のいずれかに分類される。

      | 状態 | 判定基準 | apply モードの挙動 | check モードの挙動 | dry-run モードの挙動 |
      |------|----------|-------------------|-------------------|---------------------|
      | 正常（correct target） | ジャンクションが存在し、解決先が現行正本解決（LocalMode を含む）と一致 | 維持（再作成しない） | OK として報告 | 変更なしとして報告 |
      | wrong target（管理物） | ジャンクションは存在するが解決先が現行正本と不一致（旧正本・消失済み正本を含む）。Test-ManagedProjectionJunction / Test-ManagedSenpiJunction が管理対象投影物と判定 | ジャンクションを削除して現行正本へ再作成（自己修復） | NG（乖離）として報告 | 除去・再作成の予測を表示（REQ-058-004） |
      | wrong target（管理物と確認できない） | 解決先が正本候補外など、管理対象投影物と判定できない | 自動置換しない。リンクとリンク先実体を保持し、衝突を報告して非正常終了 | NG として報告（対象を特定） | 除去・再作成を予測しない（保持を報告） |
      | ジャンクション以外のパス | パスが存在するがジャンクションでない | エラー停止 | エラーとして報告 | エラーとして報告 |

      - 正本解決は既存の `Get-TargetSourcePath`（install・self-sync それぞれの実装）を使う。意図した src 配下は LocalMode の有無により切り替わる（install 通常版は共通原本 `src/common/` 配下・plugin は `src/opencode/plugins/` 配下、LocalMode 指定時は `agentdev-gh` のみ `src/common/tools/agentdev-gh/local/`。self-sync は OpenCode が `src/common/` または `src/opencode/`（plugins）、Senpi が Resolve-SenpiTargetRel 解決結果）
      - 修復の可否判定には既存の `Test-ManagedProjectionJunction`・`Test-ManagedSenpiJunction` を再用する。これらは旧正本（`src/opencode/` 配下の旧配置）を向くリンクも管理対象投影物として修復可能に含め（REQ-099-012）、旧正本側に実体が残っていても現行正本への修復を省略しない。正本候補外を向くリンクは管理物と確認できないため自動置換しない
      - 修復はジャンクション自体の削除・再作成に限定し、旧正本側の実体（ファイル・ディレクトリ）を移動・削除せず、依存生成・通信を行わない
      - dry-run は apply が実行する追加・修復・削除を予測表示のみ行い（REQ-058-004）、check・dry-run はリンク先文字列・リンク先実体・配置先のファイルを変更しない（REQ-050-005）。修復予定がある通常の dry-run の終了コードは 0 を維持し、check の乖離は終了コード 1 とする
      - apply は check と同じ正本解決条件の検出乖離を解消し、適用後に同一条件の check 再実行で乖離が残存しないことをもって収束とする（REQ-050-015、REQ-058-006）。衝突・修復失敗の apply を正常終了にしない
      - 競合しない管理対象外リンク・実ディレクトリ・repo-local 資産の保護は「stale 管理投影物の削除境界」の既存契約を維持する。管理物と判定できない junction を削除せず非破壊に扱う規定と本節の修復時所有判定は同じ境界の適用面である

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0198
    target_design: docs/designs/local/runtime-package-boundary.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      受入条件1（正本一致条件）。旧正本にも実体を残した commands・skills・tools の不一致リンクを
      両入口（self-sync・install）の隔離構成へ配置し、正本候補外を向く plugins・Senpi リンクも
      配置して、check・dry-run・apply を実公開入口（Invoke-EntryScript）で実行する。いずれの
      モードもリンク先存在のみで正常扱いしないこと（check は全件乖離報告・終了コード 1、dry-run
      は正常扱いしない予測表示、apply は省略しない）を確認する。
    pass_criteria: |
      両入口・両ホスト・全モードで、正本と異なるリンクの正常扱い・適用省略 0 件。check 乖離
      報告と終了コード 1。
    on_failure: |
      fix-and-reverify。実装是正（RA-001/RA-002）後に再検証する。
  - id: TS-002
    target_item: AG-001
    verification: |
      受入条件2（予測の忠実性と非変更）。管理物と確認できる不一致について、dry-run がリンクの
      除去と正本への再作成を報告すること、報告に対象の相対パスと予定操作が含まれること、同一
      対象を正常扱いしないことを確認する。予測前後のリンク先文字列・リンク先実体・配置先の
      確認用ファイル内容を比較し、check・dry-run がいずれも変更しないことを確認する。
    pass_criteria: |
      dry-run の修復予測表示（相対パス + 予定操作）。check・dry-run 前後のリンク先文字列・
      実体・ファイル内容の不変。
    on_failure: |
      fix-and-reverify。
  - id: TS-003
    target_item: AG-002
    verification: |
      受入条件3（修復と収束）。管理物と確認できる旧正本リンクについて、旧側実体を残したまま
      apply で現行正本へ張り替え、適用後の参照先と投影経由の現行正本ファイル内容を確認し、
      続けて同一ホスト条件の check を実行して乖離なし・終了コード 0 になることを確認する。
      管理物と確認できる旧リンク先消失の事例（broken junction）も同じ順で確認する。正常終了
      表示だけを収束の証拠にしない。
    pass_criteria: |
      旧正本 3 分類（commands・skills・tools）の修復後、適用後 check の乖離 0・終了コード 0。
      投影経由の実体内容が現行正本と一致。
    on_failure: |
      fix-and-reverify。
  - id: TS-004
    target_item: AG-002
    verification: |
      受入条件4（非破壊境界）。正本候補外を向くなど管理物と確認できないリンクが現行対象の配置先
      を占有する場合（存在する候補外リンク先・消失した候補外リンク先の両反例）を両入口・両ホスト
      で確認する。apply が非正常終了し、リンク自体とリンク先実体が保持されること、衝突報告が
      あることを確認する。適用前後のリンク先文字列と存在する確認用ファイルを比較する。競合
      しない管理対象外リンクと実ディレクトリは既存の保護試験（stale-cleanup TS-003 等）で確認
      する。衝突で停止する試験に修復可能な全件の収束を要求しない（AG-007 の分離原則）。
    pass_criteria: |
      候補外リンクの自動置換 0 件。apply 非正常終了と衝突報告。リンク・実体の保持。
    on_failure: |
      fix-and-reverify。
  - id: TS-005
    target_item: AG-003
    verification: |
      受入条件5（冪等性と既存の正本解決）。正本一致リンクは再作成しないこと、健全な状態の
      dry-run と apply 再実行が不要な除去・作成をせず check が正常を維持することを両入口で
      確認する。導入先の `tools/agentdev-gh` について、LocalMode 指定時の正本解決結果
      （`src/common/tools/agentdev-gh/local/`）を期待値として健全と判定すること、および通常
      構成から LocalMode への既存の参照先変更が維持されることを確認する。通常の参照先へ
      誤修復しないこと。
    pass_criteria: |
      健全リンクの再作成 0 件。apply 再実行の不要操作 0 件。LocalMode 期待値どおりの判定と
      誤修復 0 件。
    on_failure: |
      fix-and-reverify。
  - id: TS-006
    target_item: AG-004
    verification: |
      受入条件6（失敗と変更範囲）。実修復経路の終了結果確認と、可能な最小の失敗注入（修復の
      除去・作成の失敗）を組み合わせる。修復の失敗を成功とせず既存の非正常終了を維持する
      こと、修復がリンク自体に限定され旧正本側のファイル移動・削除・依存生成・通信を行わない
      ことを差分と旧側確認用ファイルの保持で確認する。模擬処理だけを実公開入口の修復証拠に
      しない。
    pass_criteria: |
      失敗注入時の非正常終了。旧側確認用ファイルの保持。修復範囲のリンク自体限定（差分）。
    on_failure: |
      fix-and-reverify。

realization_actions:
  - id: RA-001
    concern: self-sync.ps1 の判定是正
    responsibility: |
      dry-run の OpenCode（884-898 行付近）・Senpi（866-882 行付近）をリンク先存在のみ判定から
      Get-TargetSourcePath 解決結果との正規比較へ変更する。apply の OpenCode（1074-1090 行付近）
      を正規比較へ変更し、1072 行付近で計算済みの sourcePath を比較に使用する（check 乖離を
      apply が解消、REQ-050-015）。修復の可否に Test-ManagedProjectionJunction・
      Test-ManagedSenpiJunction の所有判定を組み込む。終了コード契約（dry-run 0・check 乖離 1・
      apply 失敗 1）は現行のまま維持する。
    ownership_hints:
      - scripts/self-sync.ps1（Get-TargetSourcePath 256-273、Test-ManagedProjectionJunction 327-368、Test-ManagedSenpiJunction 154-175、check OpenCode 730-747 / Senpi 711-727、dry-run Senpi 866-882 / OpenCode 884-898、apply Senpi 1044-1056 / OpenCode 1074-1090）
    intent: REQ-050-003/005/015・REQ-058-001/004/005/006/008/012 の既存義務への実装追随
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001, AG-002, AG-003]
  - id: RA-002
    concern: install.ps1 の判定是正（dry-run 比較化と apply の所有判定）
    responsibility: |
      dry-run の Senpi（1222-1237 行付近）・OpenCode（1239-1254 行付近）を正規比較へ変更する。
      apply の修復経路（Senpi 1372-1396・OpenCode 1401-1418 行付近）に Test-ManagedProjectionJunction・
      Test-ManagedSenpiJunction の所有判定を要求し、管理物と確認できないリンクは置換せず保持・
      衝突報告・非正常終了とする（現行は管理 relPath 上の不一致を所有判定なしで削除再作成）。
      LocalMode の正本解決（Get-TargetSourcePath 406-427 のリダイレクト 420-421、LocalMode 必須
      833-836）は現行のまま維持する。
    ownership_hints:
      - scripts/install.ps1（Get-TargetSourcePath 406-427、Test-ManagedProjectionJunction 429-、check Senpi 1044-1062 / OpenCode 1064-1084、dry-run Senpi 1222-1237 / OpenCode 1239-1254、apply Senpi 1372-1396 / OpenCode 1401-1418）
    intent: REQ-050-002/015・REQ-058-001/004/008/012 の既存義務への実装追随と両入口の挙動統一
    verification_refs: [TS-001, TS-002, TS-004, TS-005]
    source_items: [AG-001, AG-002]
  - id: RA-003
    concern: 回帰試験の追加（stale-cleanup-behavior.Tests.ps1）
    responsibility: |
      既存の隔離構成（New-ConsumerRepo / New-SelfRepo、Invoke-EntryScript による実公開入口実行）
      を再用し、(1) 旧正本リンク（commands・skills・tools の 3 分類）の check 乖離・dry-run 予測・
      apply 修復・適用後 check 収束、(2) 管理relPath上の正本候補外 wrong-target リンクの保持・
      衝突報告・apply 非正常終了、(3) 修復後の冪等性（健全 apply 再実行の不要操作なし）、
      (4) LocalMode の tools/agentdev-gh 期待値、を追加試験する。健全・修復可能群と判定不能衝突群
      の試験を分離し、衝突試験に修復全件収束を要求しない。reproduce.ps1 は修正前再現として
      区別する。
    ownership_hints:
      - scripts/self/release/stale-cleanup-behavior.Tests.ps1（TS-001〜TS-005 既存構成、Invoke-EntryScript 58-73）
      - scripts/self/release/installer-host-projection.Tests.ps1（REQ-099 系・LocalMode 関連の既存試験）
    intent: 受入条件 1〜6 の回帰試験化とカバレッジギャップ（旧正本・wrong-target・apply 修復）
      の解消
    verification_refs: [TS-001, TS-002, TS-003, TS-004, TS-005, TS-006]
    source_items: [AG-001, AG-002, AG-007]

review_dispositions:
  - id: RD-001
    source_ru: RU-0198
    source_item: junction-canonical-target-sync-and-ownership-protection
    disposition: covered
    reason_code: covered_by_existing_req_and_design_update
    reason: |
      RU-0198 の要件化の方向（7 項目）と受け入れ条件 6 件をすべて反映した。条件1→AG-001+TS-001、
      条件2→AG-001+TS-002、条件3→AG-002/AG-003+TS-003、条件4→AG-002/AG-004+TS-004、条件5→
      AG-003+TS-005、条件6→AG-004+TS-006。契約上の義務は REQ-050-002/003/005/015・REQ-058-001/
      004/005/006/008/012・REQ-099-012 の既存行で充足するため REQ 行の新設・変更は行わない
      （RU の「既存要件で充足する義務を新規要件として重複させない」どおり）。設計は
      runtime-package-boundary Design「ジャンクション状態の判定と自己修復」節を両入口・両ホスト・
      全モード適用と修復時所有判定へ整合更新する。実装是正（RA-001/RA-002）と試験追加（RA-003）
      は後続工程へ引き継ぐ。対象外は AG-006、試験分離原則と再現資料の位置づけは AG-007 で保持。
    evidence:
      path: .agentdev/backlog/req-units/RU-0198.md
      section: 決定的受け入れ条件
      checked_at_commit: 4aca4660f31e85e0246f65fada1f18ad99a349bc
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: |
    単一 OU（OU-001: runtime-package-boundary Design 1 節更新 + self-sync.ps1 / install.ps1 の
    判定是正 + 回帰試験追加）。bugfix / standard / issue_policy single。REQ 行の変更を伴わない
    ため feature 昇格なし。RU 前書きの generation_actor: session-supervisor（今回限定承認済み・
    一般契約改訂なし）は RU 本文の記録をそのまま保持する。
  wave_hints: []
```

# summary

RU-0198（ジャンクション正本一致同期と所有判定保護）を要件化した。work_type は bugfix（REQ 行
変更なし・実装欠陥是正）、scale は standard。契約上の義務は REQ-050-015・REQ-058-001/004/005/
006/008/012・REQ-099-012 の既存行で充足するため REQ 操作なし（Jev STEP-3 評価一致）。設計は
runtime-package-boundary Design「ジャンクション状態の判定と自己修復」節を、両公開入口・両ホスト・
check/dry-run/apply 全モードへの同一正本解決適用と、修復時の所有判定（Test-Managed*Junction 再用、
判定不能は保持・衝突報告・apply 非正常終了）へ整合更新する。実装是正（self-sync.ps1 の dry-run
正規比較化・apply OpenCode 正規比較化、install.ps1 の dry-run 正規比較化・apply 修復時所有判定）
と回帰試験追加は realization_actions RA-001〜003 で後続工程へ引き継ぐ。受け入れ条件 6 件は
TS-001〜TS-006 で全対応（健全群と衝突群の試験分離、reproduce.ps1 は修正前再現として区別）。
