# step_execution 委譲サブエージェントでの agentdev_gh Tool 利用経路の明文化

## 観測

case-auto の step_execution 委譲サブエージェント（case-open 工程）の関数一覧に Custom Tool agentdev_gh が登録されない。plugin は親セッションの OpenCode 実行時へ Tool を登録するため、委譲先サブエージェントからは Tool 直接呼び出しができない。case-open 工程では Tool 公開入口（runAgentdevGhOperation + buildGhToolEnv + createCliRunner）を bun driver スクリプト（.agentdev/tmp/agentdev-gh-driver.ts、UTF-8 JSON リクエスト渡し）経由で呼ぶ正規実行を確立して完了した。case-close 工程も同一経路で GitHub I/O を完結した。

## 今回扱わない理由

委譲時の Tool 利用経路の規定は delegation-contracts Design と case-run/case-close の委譲 template 群の設計判断。単一 Case の実行経路としての確立済み手法をその場で運用するのは可能だが、経路の正規化（委譲文脈への明記 or delegation-unavailable 判定の精緻化）は横断契約の変更を伴う。

## 影響

委譲先で Tool が直接使えないことを知らないサブエージェントは、gh コマンド直接実行（POL-gh-io-delegation 違反）に fallback するリスクがある。実行ごとに driver スクリプトを再発見・再作成するコストも発生する（case-open と case-close で各々一族のスクラッチを生成した実績あり）。

## レビューで決めること

- 委譲プロンプト（case-run の実行担当サブエージェント委譲、case-auto の step_execution 委譲）へ「agentdev_gh は bun driver 経由で利用する」正規経路を明記するか
- bun driver スクリプトを配布物（または .agentdev の恒常成果物）として用意し、委譲時にパスを渡す形にするか
- Tool が登録されない状況を delegation-unavailable 判定の対象に含めるか（現行判定は委譲機構自体の利用可否が対象）

## 根拠

- case-open 工程の観測（委譲単位 case-auto-20260825-stage-open、driver 確立の経緯）
- case-close 工程の運用継続（委譲単位 case-auto-20260825-stage-close-w1、同一 driver で GitHub I/O 完結）
