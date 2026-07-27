---
draft_type: req_draft
topic_slug: gh-cli-windows-procedures-and-pass-criteria-guide
status: draft
created_at: 2026-07-27T00:00:00+09:00
source_rus:
  - RU-0005
  - RU-0006
agentdev_handoff: true
spec_actions_consumed: true
spec_saved_at: 2026-07-27T00:00:00+09:00
---

<!-- 譛ｬ繝峨Λ繝輔ヨ縺ｯ AgentDevFlow 譛ｬ菴薙・荳榊・蜷医・謾ｹ蝟・せ繧呈桶縺・燕蟾･遞句ｼ輔″邯吶℃繝峨Λ繝輔ヨ縺ｧ縺ゅｋ・・gentdev_handoff: true・峨・-->
<!-- 2 RU・・U-0005: gh-cli Windows 迺ｰ蠅・撫鬘・莉ｶ縲ヽU-0006: pass_criteria 險倩ｿｰ繧ｬ繧､繝会ｼ峨ｒ蜷ｫ繧縲・     荳｡ RU 縺ｯ迢ｬ遶矩未蠢・□縺後碁・蟶・せ繧ｭ繝ｫ驕狗畑繧ｬ繧､繝峨・謨ｴ蛯吶阪→縺・≧蜈ｱ騾壽ｧ縺ｧ繧ｰ繝ｫ繝ｼ繝唯縺ｨ縺励※1繝峨Λ繝輔ヨ縺ｫ縺ｾ縺ｨ繧√◆縲・-->

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |
  RU-0005・・gentdev-gh-cli skill 縺ｮ Windows 迺ｰ蠅・崋譛牙撫鬘・莉ｶ・峨→ RU-0006・・gentdev-workflow-templates 縺ｨ
  agentdev-req-analysis 縺ｮ pass_criteria 險倩ｿｰ繧ｬ繧､繝会ｼ峨ｒ蜃ｦ逅・☆繧九・  RU-0005 縺ｯ cp932 --title 蛹悶￠縲∽ｸ譎ゅヵ繧｡繧､繝ｫ驟咲ｽｮ繝ｻcleanup 髱樔ｸ菴灘喧縲￣owerShell MatchEvaluator 蜀・-replace 縺ｮ鄂縺ｮ3莉ｶ繧・  standard-procedures.md 縺ｸ謇狗ｶ壹″霑ｽ險倥〒蟇ｾ蠢懊☆繧九ゅΘ繝ｼ繧ｶ繝ｼ遒ｺ螳壻ｺ矩・・agentdev/tmp/ 驟咲ｽｮ縲…leanup 蠢・医阪ｒ蜿肴丐縲・  RU-0006 縺ｯ test strategy 縺ｮ pass_criteria 險倩ｿｰ蜩∬ｳｪ繧ｬ繧､繝峨ｒ agentdev-workflow-templates 縺ｨ agentdev-req-analysis 縺ｸ霑ｽ險倥☆繧九・  譁ｰ隕・ADR 荳崎ｦ√∵眠隕・REQ 螟画峩縺ｪ縺励・ SPEC・・gentdev-gh-cli.md, agentdev-workflow-templates.md, agentdev-req-analysis.md・峨∈縺ｮ
  蜿り・ｿｽ險倥→ case-run 蟾･遞九〒縺ｮ skill reference 繝輔ぃ繧､繝ｫ譖ｴ譁ｰ繧堤ｵ・∩蜷医ｏ縺帙ｋ縲・
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      RU-0005: src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md 縺ｧ
      Windows 迺ｰ蠅・・ --title / inline --input 蠑墓焚縺ｮ菴ｿ逕ｨ繧堤ｦ∵ｭ｢縺励・-body-file 縺ｾ縺溘・ gh api --input・・ile bytes 繧・UTF-8 縺ｨ縺励※謇ｱ縺・ｼ峨ｒ
      謗ｨ螂ｨ縺吶ｋ譌ｨ繧呈・險倥☆繧九４ection 2 Step 0 縺ｮ繧ｳ繝ｳ繧ｽ繝ｼ繝ｫ繧ｨ繝ｳ繧ｳ繝ｼ繝・ぅ繝ｳ繧ｰ蛻晄悄蛹厄ｼ・陦鯉ｼ峨・譛ｬ譁・I/O 縺ｧ譛牙柑縺縺・      --title 蠑墓焚 decode 縺ｫ縺ｯ蠖ｱ髻ｿ縺励↑縺・挨蝠城｡後→縺励※譏守､ｺ縺吶ｋ縲・  - id: AG-002
    content: |
      RU-0005: title 菫ｮ豁｣縺悟ｿ・ｦ√↑蝣ｴ蜷医・ REST API PATCH 讓呎ｺ匁焔邯壹″繧呈・險倥☆繧九・      gh api -X PATCH /repos/{owner}/{repo}/issues/{N} + UTF-8 JSON --input file 縺ｮ蠖｢蠑上・      Draft 6 Epic #1845 繧ｿ繧､繝医Ν蛹悶￠縺ｮ螳溽ｸｾ縺ｫ蝓ｺ縺･縺丞屓驕ｿ遲悶・  - id: AG-003
    content: |
      RU-0005: 荳譎ゅヵ繧｡繧､繝ｫ驟咲ｽｮ繧・$env:TEMP/agentdev/・・indows 縺ｧ C:\WINDOWS\TEMP 縺ｸ隗｣豎ｺ縺嶺ｸｦ蛻励ち繧ｹ繧ｯ縺・cp932 縺ｧ蜷悟錐繝輔ぃ繧､繝ｫ荳頑嶌縺榊撫鬘鯉ｼ・      縺九ｉ .agentdev/tmp/・・orkspace-local・峨∈螟画峩縺吶ｋ縲Ｄleanup 繧・create 竊・gh螳溯｡・竊・VERIFY 竊・cleanup 縺ｮ1謇矩・Θ繝九ャ繝医↓邨・∩霎ｼ縺ｿ縲・      逵∫払荳榊庄繧ｹ繝・ャ繝怜喧縺吶ｋ縲Ｄase-auto run 8 draft 荳ｦ蛻怜・逅・〒23莉ｶ谿句ｭ倥＠縺溷ｮ溽ｸｾ縺ｮ蜀咲匱髦ｲ豁｢縲・      繝ｦ繝ｼ繧ｶ繝ｼ遒ｺ螳壻ｺ矩・・agentdev/tmp/ 驟咲ｽｮ縲…leanup 蠢・医阪ｒ蜿肴丐縲・  - id: AG-004
    content: |
      RU-0005: 譛ｬ譁・ｽｮ謠帶焔邯壹″縺ｸ PowerShell regex MatchEvaluator 蜀・-replace 菴ｿ逕ｨ豕ｨ諢上→蝗樣∩遲悶ｒ霑ｽ險倥☆繧九・      [regex]::Replace + ScriptBlock 蜀・〒 -replace 貍皮ｮ怜ｭ舌ｒ菴ｿ逕ｨ縺吶ｋ縺ｨ蜈ｨ莉ｶ鄂ｮ謠帙′譛溷ｾ・壹ｊ蜍穂ｽ懊＠縺ｪ縺・・      蝗樣∩遲悶・ Node.js・・tring.split/join・峨∪縺溘・ PowerShell String.Replace・・NET 繝｡繧ｽ繝・ラ縲〉egex 髱樔ｽｿ逕ｨ・峨・      譌｢蟄倥・ backreference $N 蟇ｾ遲厄ｼ・31-37・峨→蛹ｺ蛻･縺励※險倩ｼ峨☆繧九Ｄase-close(#epic) QG-4 縺ｧ螳御ｺ・擅莉ｶ繝√ぉ繝・け繝懊ャ繧ｯ繧ｹ7蛟倶ｸｭ1蛟九＠縺・      鄂ｮ謠帙＆繧後↑縺九▲縺溷ｮ溽ｸｾ縺ｫ蝓ｺ縺･縺上・  - id: AG-005
    content: |
      RU-0005: docs/specs/skills/agentdev-gh-cli.md 縺ｸ Windows 迺ｰ蠅・崋譛画焔邯壹″縺ｮ蜿ら・霑ｽ險倥ｒ陦後≧縲・      standard-procedures.md 縺・Windows 迺ｰ蠅・崋譛画焔邯壹″・・p932 蛹悶￠蟇ｾ遲悶・agentdev/tmp/ 驟咲ｽｮ縲…leanup 荳菴灘喧縲・      MatchEvaluator 蜀・-replace 鄂・峨ｒ謇譛峨☆繧九％縺ｨ繧呈・險倥☆繧九・  - id: AG-006
    content: |
      RU-0006: src/opencode/skills/agentdev-workflow-templates/ 縺ｮ issue_desc_*.md 繝・Φ繝励Ξ繝ｼ繝医↓
      test strategy 險倩ｿｰ繧ｬ繧､繝峨ｒ霑ｽ險倥☆繧・
      - 隍・焚 REQ 蜈ｱ騾・pass_criteria 縺ｮ繝ｪ繧ｹ繧ｯ・亥推 REQ 縺ｮ pipeline stage 驕輔＞繧貞精蜿弱○縺壽枚蟄怜・荳閾ｴ繧定ｦ∵ｱゅ☆繧九→ QG-4 隧穂ｾ｡譎ゅ↓鬟溘＞驕輔≧・・      - REQ 蛟句挨譛溷ｾ・､險倩ｿｰ縺ｮ謗ｨ螂ｨ
      - 螟画峩蟇ｾ雎｡螟・REQ 讀懆ｨｼ縺ｮ豁｣縺励＞陦ｨ迴ｾ・・iff 縺後↑縺・％縺ｨ・・      - 蟄伜惠遒ｺ隱阪・菴ｿ逕ｨ譚｡莉ｶ・域眠隕丈ｽ懈・遖∵ｭ｢縺ｮ蝣ｴ蜷医・縺ｿ・・      Issue #1760 QG-4 縺ｧ REQ-0129-012 content 縺ｨ譁・ｭ怜・荳堺ｸ閾ｴ縲：-001縲梧э蜻ｳ逧・ｭ我ｾ｡繝ｻ謇ｿ隱阪阪〒蜃ｦ逅・＠縺溷ｮ溽ｸｾ縺ｫ蝓ｺ縺･縺上・  - id: AG-007
    content: |
      RU-0006: src/opencode/skills/agentdev-req-analysis/ 縺ｸ pass_criteria 險倩ｿｰ蝓ｺ貅悶ｒ霑ｽ險倥☆繧・
      - pipeline stage 蛻･縺ｮ content 陦ｨ迴ｾ蟾ｮ逡ｰ繧貞精蜿弱☆繧九梧э蜻ｳ逧・ｭ我ｾ｡險ｱ螳ｹ縲阪ぎ繧､繝峨Λ繧､繝ｳ
      - 縲悟ｭ伜惠縺励↑縺・％縺ｨ縲阪→縲悟､画峩縺輔ｌ縺ｦ縺・↑縺・％縺ｨ縲阪・菴ｿ縺・・縺大渕貅・      Issue #1760 TS-003 縺ｧ REQ-0147-010 繧偵悟ｭ伜惠縺励↑縺・％縺ｨ縲阪→隱､陦ｨ迴ｾ縺励◆螳溽ｸｾ縺ｫ蝓ｺ縺･縺上・      蟄伜惠遒ｺ隱阪・譁ｰ隕丈ｽ懈・遖∵ｭ｢・・EQ-0164 縺悟ｭ伜惠縺励↑縺・％縺ｨ遲会ｼ峨・蝣ｴ蜷医・縺ｿ菴ｿ逕ｨ縺吶∋縺阪・
artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-gh-cli
    target_area: "## Windows 迺ｰ蠅・崋譛画焔邯壹″"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-gh-cli
    content: |
      ## Windows 迺ｰ蠅・崋譛画焔邯壹″

      Windows 迺ｰ蠅・崋譛峨・謇狗ｶ壹″縺ｯ `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` 縺梧ｭ｣隕乗園譛峨☆繧九・      譛ｬ SPEC 縺ｯ Windows 迺ｰ蠅・崋譛画焔邯壹″縺ｮ蟄伜惠縺ｨ蜿ら・髢｢菫ゅ・縺ｿ繧貞ｮ壹ａ縲∬ｩｳ邏ｰ謇狗ｶ壹″縺ｯ reference 繝輔ぃ繧､繝ｫ縺ｸ蟋碑ｭｲ縺吶ｋ縲・
      ### 蟇ｾ雎｡謇狗ｶ壹″

      - cp932 蛹悶￠蟇ｾ遲厄ｼ・-title / inline --input 蠑墓焚縺ｮ菴ｿ逕ｨ遖∵ｭ｢縲・-body-file / gh api --input 謗ｨ螂ｨ・・      - title 菫ｮ豁｣縺悟ｿ・ｦ√↑蝣ｴ蜷医・ REST API PATCH 讓呎ｺ匁焔邯壹″
      - 荳譎ゅヵ繧｡繧､繝ｫ驟咲ｽｮ・・agentdev/tmp/ workspace-local・峨→ cleanup 荳菴灘喧・・reate 竊・gh螳溯｡・竊・VERIFY 竊・cleanup 縺ｮ逵∫払荳榊庄繧ｹ繝・ャ繝怜喧・・      - PowerShell regex MatchEvaluator 蜀・-replace 菴ｿ逕ｨ豕ｨ諢上→蝗樣∩遲厄ｼ・ode.js / String.Replace・・      - 荳願ｨ倥→譌｢蟄倥・ backreference $N 蟇ｾ遲悶→縺ｮ蛹ｺ蛻･

      隧ｳ邏ｰ縺ｯ standard-procedures.md 縺ｮ隧ｲ蠖薙そ繧ｯ繧ｷ繝ｧ繝ｳ繧貞盾辣ｧ縲・  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-workflow-templates
    target_area: "## test strategy 險倩ｿｰ繧ｬ繧､繝峨Λ繧､繝ｳ"
    source_items: [AG-006]
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-workflow-templates
    content: |
      ## test strategy 險倩ｿｰ繧ｬ繧､繝峨Λ繧､繝ｳ

      issue_desc_*.md 繝・Φ繝励Ξ繝ｼ繝医〒 test strategy 繧定ｵｷ逾ｨ縺吶ｋ髫帙・ pass_criteria 險倩ｿｰ繧ｬ繧､繝峨Λ繧､繝ｳ:

      ### 蜈ｱ騾・pass_criteria 縺ｮ繝ｪ繧ｹ繧ｯ

      隍・焚 REQ 縺ｸ縺ｮ蜈ｱ騾・pass_criteria 繧定ｵｷ逾ｨ縺吶ｋ蝣ｴ蜷医∝推 REQ 縺ｮ pipeline stage・・romote 邉ｻ縲〉eview 邉ｻ遲会ｼ峨・驕輔＞繧・      蜷ｸ蜿弱○縺壽枚蟄怜・荳閾ｴ繧定ｦ∵ｱゅ☆繧九→縲＿G-4 隧穂ｾ｡譎ゅ↓ REQ content 縺ｨ pass_criteria 譛溷ｾ・､縺碁｣溘＞驕輔≧蜿ｯ閭ｽ諤ｧ縺後≠繧九・      REQ 蛟句挨譛溷ｾ・､縺ｮ險倩ｿｰ繧呈耳螂ｨ縺吶ｋ縲・
      ### 螟画峩蟇ｾ雎｡螟・REQ 讀懆ｨｼ縺ｮ豁｣縺励＞陦ｨ迴ｾ

      縲悟､画峩蟇ｾ雎｡螟・REQ 縺ｮ螟画峩縺後↑縺・％縺ｨ縲阪・ diff 縺後↑縺・％縺ｨ縺ｨ縺励※陦ｨ迴ｾ縺吶ｋ縲・      縲悟ｭ伜惠縺励↑縺・％縺ｨ縲阪→隱､陦ｨ迴ｾ縺吶ｋ縺ｨ縲∵､懆ｨｼ諢丞峙・・iff 縺後↑縺・％縺ｨ・峨→讀懆ｨｼ陦ｨ迴ｾ・亥ｭ伜惠遒ｺ隱搾ｼ峨′縺壹ｌ繧九・
      ### 蟄伜惠遒ｺ隱阪・菴ｿ逕ｨ譚｡莉ｶ

      縲悟ｭ伜惠縺励↑縺・％縺ｨ縲阪・譁ｰ隕丈ｽ懈・遖∵ｭ｢・井ｾ・ REQ-0164 縺悟ｭ伜惠縺励↑縺・％縺ｨ・峨・蝣ｴ蜷医・縺ｿ菴ｿ逕ｨ縺吶ｋ縲・      譌｢蟄・REQ 縺ｮ螟画峩縺後↑縺・％縺ｨ繧呈､懆ｨｼ縺吶ｋ蝣ｴ蜷医・縲悟､画峩縺輔ｌ縺ｦ縺・↑縺・％縺ｨ縲搾ｼ・iff 縺後↑縺・％縺ｨ・峨ｒ菴ｿ逕ｨ縺吶ｋ縲・  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-req-analysis
    target_area: "## pass_criteria 險倩ｿｰ蝓ｺ貅・
    source_items: [AG-007]
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-req-analysis
    content: |
      ## pass_criteria 險倩ｿｰ蝓ｺ貅・
      pass_criteria 險倩ｿｰ譎ゅ・蜩∬ｳｪ蝓ｺ貅・

      ### 諢丞袖逧・ｭ我ｾ｡險ｱ螳ｹ

      pipeline stage 蛻･縺ｮ content 陦ｨ迴ｾ蟾ｮ逡ｰ繧貞精蜿弱☆繧九梧э蜻ｳ逧・ｭ我ｾ｡險ｱ螳ｹ縲阪ぎ繧､繝峨Λ繧､繝ｳ縲・      REQ content 縺・pipeline stage 縺ｫ繧医▲縺ｦ陦ｨ迴ｾ繧貞､峨∴繧句ｴ蜷医｝ass_criteria 縺ｯ諢丞袖逧・ｭ我ｾ｡諤ｧ縺ｧ蛻､螳壹☆繧九・      譁・ｭ怜・荳閾ｴ繧呈ｩ滓｢ｰ逧・↓隕∵ｱゅ＠縺ｪ縺・・
      ### 縲悟ｭ伜惠縺励↑縺・％縺ｨ縲阪→縲悟､画峩縺輔ｌ縺ｦ縺・↑縺・％縺ｨ縲阪・菴ｿ縺・・縺・
      - 縲悟ｭ伜惠縺励↑縺・％縺ｨ縲・ 譁ｰ隕丈ｽ懈・遖∵ｭ｢・井ｾ・ REQ-0164 縺悟ｭ伜惠縺励↑縺・％縺ｨ・峨・蝣ｴ蜷医・縺ｿ菴ｿ逕ｨ
      - 縲悟､画峩縺輔ｌ縺ｦ縺・↑縺・％縺ｨ縲・ 譌｢蟄・REQ 縺ｮ螟画峩縺後↑縺・％縺ｨ・・iff 縺後↑縺・％縺ｨ・峨ｒ讀懆ｨｼ縺吶ｋ蝣ｴ蜷医↓菴ｿ逕ｨ

      縺薙ｌ繧峨ｒ隱､縺｣縺ｦ豺ｷ逕ｨ縺吶ｋ縺ｨ縲∵､懆ｨｼ諢丞峙縺ｨ讀懆ｨｼ陦ｨ迴ｾ縺後★繧後＿G-4 隧穂ｾ｡譎ゅ↓荳肴ｭ｣遒ｺ縺ｪ蛻､螳壹ｒ逕溘§繧九・
conflict_resolutions:
  - id: CR-001
    conflict: 荳譎ゅヵ繧｡繧､繝ｫ驟咲ｽｮ・・env:TEMP/agentdev/ vs .agentdev/tmp/・・    resolution: |
      .agentdev/tmp/・・orkspace-local・峨ｒ謗｡逕ｨ縲ゅΘ繝ｼ繧ｶ繝ｼ遒ｺ螳壻ｺ矩・・      $env:TEMP 縺ｯ Windows 縺ｧ C:\WINDOWS\TEMP 縺ｸ隗｣豎ｺ縺嶺ｸｦ蛻励ち繧ｹ繧ｯ縺・cp932 縺ｧ蜷悟錐繝輔ぃ繧､繝ｫ荳頑嶌縺榊撫鬘後・縺溘ａ荳肴治逕ｨ縲・  - id: CR-002
    conflict: cleanup 縺ｮ逵∫払蜿ｯ蜷ｦ
    resolution: |
      cleanup 繧・create 竊・gh螳溯｡・竊・VERIFY 竊・cleanup 縺ｮ1謇矩・Θ繝九ャ繝医↓邨・∩霎ｼ縺ｿ縲∫怐逡･荳榊庄繧ｹ繝・ャ繝怜喧縺吶ｋ縲・      case-auto run 8 draft 荳ｦ蛻怜・逅・〒23莉ｶ谿句ｭ倥＠縺溷ｮ溽ｸｾ縺ｮ蜀咲匱髦ｲ豁｢縲ゅΘ繝ｼ繧ｶ繝ｼ遒ｺ螳壻ｺ矩・・  - id: CR-003
    conflict: ADR 隕∝凄
    resolution: |
      譁ｰ隕・ADR 荳崎ｦ√ゅせ繧ｭ繝ｫ驕狗畑謇狗ｶ壹″縺ｮ霑ｽ險倥〒縺ゅｊ縲√い繝ｼ繧ｭ繝・け繝√Ε蛻､譁ｭ繧貞性縺ｾ縺ｪ縺・◆繧√・
operation_units:
  - ou_id: OU-001
    source_ru: RU-0005
    target_spec: docs/specs/skills/agentdev-gh-cli.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0006
    target_spec: docs/specs/skills/agentdev-workflow-templates.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0006
    target_spec: docs/specs/skills/agentdev-req-analysis.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md 縺ｧ
      Windows 迺ｰ蠅・・ --title / inline --input 菴ｿ逕ｨ遖∵ｭ｢縲・-body-file / gh api --input 謗ｨ螂ｨ縺梧・險倥＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      Section 2 Step 0 縺ｮ繧ｳ繝ｳ繧ｽ繝ｼ繝ｫ繧ｨ繝ｳ繧ｳ繝ｼ繝・ぅ繝ｳ繧ｰ蛻晄悄蛹悶→ --title 蠑墓焚 decode 縺ｮ蛻･蝠城｡梧ｧ縺梧・遉ｺ縺輔ｌ縺ｦ縺・ｋ縺薙→縲・    pass_criteria: |
      standard-procedures.md 縺ｫ Windows 迺ｰ蠅・--title / inline --input 菴ｿ逕ｨ遖∵ｭ｢縺ｨ --body-file / gh api --input 謗ｨ螂ｨ縺梧・險倥＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-002
    target_item: AG-002
    verification: |
      standard-procedures.md 縺ｫ title 菫ｮ豁｣縺悟ｿ・ｦ√↑蝣ｴ蜷医・ REST API PATCH 讓呎ｺ匁焔邯壹″
      ・・h api -X PATCH /repos/{owner}/{repo}/issues/{N} + UTF-8 JSON --input file・峨′譏手ｨ倥＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・    pass_criteria: |
      讓呎ｺ匁焔邯壹″縺悟ｮ溯｡悟庄閭ｽ縺ｪ蠖｢蠑上〒險倩ｼ峨＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-003
    target_item: AG-003
    verification: |
      standard-procedures.md 縺ｧ荳譎ゅヵ繧｡繧､繝ｫ驟咲ｽｮ縺・.agentdev/tmp/・・orkspace-local・峨∈螟画峩縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      cleanup 縺・create 竊・gh螳溯｡・竊・VERIFY 竊・cleanup 縺ｮ1謇矩・Θ繝九ャ繝医〒逵∫払荳榊庄繧ｹ繝・ャ繝怜喧縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・    pass_criteria: |
      .agentdev/tmp/ 驟咲ｽｮ縺ｨ cleanup 逵∫払荳榊庄繧ｹ繝・ャ繝怜喧縺瑚ｨ倩ｼ峨＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-004
    target_item: AG-004
    verification: |
      standard-procedures.md 縺ｫ PowerShell regex MatchEvaluator 蜀・-replace 菴ｿ逕ｨ豕ｨ諢上→蝗樣∩遲・      ・・ode.js String.split/join 縺ｾ縺溘・ PowerShell String.Replace・峨′霑ｽ險倥＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      譌｢蟄倥・ backreference $N 蟇ｾ遲厄ｼ・31-37・峨→蛹ｺ蛻･縺励※險倩ｼ峨＆繧後※縺・ｋ縺薙→縲・    pass_criteria: |
      MatchEvaluator 蜀・-replace 豕ｨ諢上→蝗樣∩遲悶′ backreference $N 蟇ｾ遲悶→蛹ｺ蛻･縺輔ｌ縺ｦ險倩ｼ峨＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-005
    target_item: AG-005
    verification: |
      docs/specs/skills/agentdev-gh-cli.md 縺ｫ Windows 迺ｰ蠅・崋譛画焔邯壹″縺ｮ蜿ら・霑ｽ險倥′縺ゅｋ縺薙→繧堤｢ｺ隱阪☆繧九・      standard-procedures.md 縺ｸ縺ｮ蜿ら・髢｢菫ゅ′譏守､ｺ縺輔ｌ縺ｦ縺・ｋ縺薙→縲・    pass_criteria: |
      agentdev-gh-cli.md SPEC 縺ｫ Windows 迺ｰ蠅・崋譛画焔邯壹″縺ｮ蟄伜惠縺ｨ standard-procedures.md 縺ｸ縺ｮ蜿ら・縺瑚ｨ倩ｼ峨＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-006
    target_item: AG-006
    verification: |
      src/opencode/skills/agentdev-workflow-templates/ 縺ｮ issue_desc_*.md 繝・Φ繝励Ξ繝ｼ繝医↓
      test strategy 險倩ｿｰ繧ｬ繧､繝会ｼ亥・騾・pass_criteria 繝ｪ繧ｹ繧ｯ縲ヽEQ 蛟句挨譛溷ｾ・､謗ｨ螂ｨ縲∝､画峩蟇ｾ雎｡螟・REQ 讀懆ｨｼ縲∝ｭ伜惠遒ｺ隱堺ｽｿ逕ｨ譚｡莉ｶ・峨′
      霑ｽ險倥＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      docs/specs/skills/agentdev-workflow-templates.md 縺ｫ縲荊est strategy 險倩ｿｰ繧ｬ繧､繝峨Λ繧､繝ｳ縲阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺瑚ｿｽ蜉縺輔ｌ縺ｦ縺・ｋ縺薙→縲・    pass_criteria: |
      issue_desc_*.md 繝・Φ繝励Ξ繝ｼ繝医→ workflow-templates.md SPEC 縺ｮ荳｡譁ｹ縺ｫ繧ｬ繧､繝峨Λ繧､繝ｳ縺瑚ｨ倩ｼ峨＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-007
    target_item: AG-007
    verification: |
      src/opencode/skills/agentdev-req-analysis/ 縺ｫ pass_criteria 險倩ｿｰ蝓ｺ貅・      ・域э蜻ｳ逧・ｭ我ｾ｡險ｱ螳ｹ縲∝ｭ伜惠遒ｺ隱阪→ diff 遒ｺ隱阪・菴ｿ縺・・縺托ｼ峨′霑ｽ險倥＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      docs/specs/skills/agentdev-req-analysis.md 縺ｫ縲継ass_criteria 險倩ｿｰ蝓ｺ貅悶阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺瑚ｿｽ蜉縺輔ｌ縺ｦ縺・ｋ縺薙→縲・    pass_criteria: |
      req-analysis skill 縺ｨ SPEC 縺ｮ荳｡譁ｹ縺ｫ險倩ｿｰ蝓ｺ貅悶′險倩ｼ峨＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・
review_dispositions:
  - id: RD-001
    source_ru: RU-0005
    source_item: RU-0005-Sources-gh-cli-windows
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0005 縺ｮ Source Summary 縺梧欠鞫倥☆繧九径gentdev-gh-cli skill 縺ｮ Windows 迺ｰ蠅・崋譛牙撫鬘・莉ｶ縲阪・
      AG-001縲廣G-005 縺ｧ螳悟・縺ｫ邨ｱ蜷医＆繧後◆縲Ｄp932 蛹悶￠縲∽ｸ譎ゅヵ繧｡繧､繝ｫ驟咲ｽｮ繝ｻcleanup縲｀atchEvaluator 鄂繧貞・縺ｦ蜿肴丐縲・    evidence:
      path: .agentdev/backlog/req-units/RU-0005.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0006
    source_item: RU-0006-Sources-pass-criteria-guide
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0006 縺ｮ Source Summary 縺梧欠鞫倥☆繧九継ass_criteria 險倩ｿｰ繧ｬ繧､繝画悴謨ｴ蛯吶阪・ AG-006/AG-007 縺ｧ螳悟・縺ｫ邨ｱ蜷医＆繧後◆縲・      workflow-templates 縺ｨ req-analysis 縺ｮ荳｡ skill 縺ｸ縺ｮ繧ｬ繧､繝芽ｿｽ險倥ｒ蜿肴丐縲・    evidence:
      path: .agentdev/backlog/req-units/RU-0006.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: |
    scale: standard縲・ SPEC 縺ｸ縺ｮ蜿り・ｿｽ險・+ 3 skill reference 繝輔ぃ繧､繝ｫ譖ｴ譁ｰ縺ｮ縺溘ａ蜊倅ｸ Issue 縺ｧ螳檎ｵ舌☆繧九・    OU-001・・gentdev-gh-cli.md・俄・ OU-002・・gentdev-workflow-templates.md・俄・ OU-003・・gentdev-req-analysis.md・峨・鬆・〒螳滓命縲・    case-run 蟾･遞九〒蜷・skill 縺ｮ reference 繝輔ぃ繧､繝ｫ・・tandard-procedures.md, issue_desc_*.md 遲会ｼ峨ｒ譖ｴ譁ｰ縲・  wave_hints:
    - wave: 1
      units: [OU-001, OU-002, OU-003]
      rationale: 3 SPEC 縺ｯ迢ｬ遶九＠縺ｦ縺翫ｊ荳ｦ蛻怜ｮ溯｡悟庄閭ｽ縲・```

# implementation_details

譛ｬ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｯ case-run 蟾･遞九〒螳滓命縺吶ｋ螳溯｣・ｩｳ邏ｰ・・tep 10-1 繧ｬ繧､繝峨Λ繧､繝ｳ縺ｫ蝓ｺ縺･縺丞・髮｢・峨・
## RU-0005 螳溯｣・ standard-procedures.md

- 繝輔ぃ繧､繝ｫ: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`
- 霑ｽ險伜・螳ｹ:
  - Windows 迺ｰ蠅・・ --title / inline --input 菴ｿ逕ｨ遖∵ｭ｢縲・-body-file / gh api --input 謗ｨ螂ｨ
  - title 菫ｮ豁｣逕ｨ REST API PATCH 讓呎ｺ匁焔邯壹″
  - 荳譎ゅヵ繧｡繧､繝ｫ驟咲ｽｮ繧・.agentdev/tmp/・・orkspace-local・峨∈螟画峩
  - cleanup 繧・create 竊・gh螳溯｡・竊・VERIFY 竊・cleanup 縺ｮ1謇矩・Θ繝九ャ繝医〒逵∫払荳榊庄繧ｹ繝・ャ繝怜喧
  - PowerShell regex MatchEvaluator 蜀・-replace 菴ｿ逕ｨ豕ｨ諢上→蝗樣∩遲厄ｼ・ode.js / String.Replace・・  - 譌｢蟄・backreference $N 蟇ｾ遲厄ｼ・31-37・峨→縺ｮ蛹ｺ蛻･險倩ｼ・
## RU-0006 螳溯｣・ workflow-templates 縺ｨ req-analysis

- 繝輔ぃ繧､繝ｫ1: `src/opencode/skills/agentdev-workflow-templates/` 縺ｮ issue_desc_*.md 繝・Φ繝励Ξ繝ｼ繝・- 繝輔ぃ繧､繝ｫ2: `src/opencode/skills/agentdev-req-analysis/` 縺ｮ skill reference
- 霑ｽ險伜・螳ｹ:
  - test strategy 險倩ｿｰ繧ｬ繧､繝峨Λ繧､繝ｳ・亥・騾・pass_criteria 繝ｪ繧ｹ繧ｯ縲ヽEQ 蛟句挨譛溷ｾ・､謗ｨ螂ｨ・・  - 螟画峩蟇ｾ雎｡螟・REQ 讀懆ｨｼ縺ｮ豁｣縺励＞陦ｨ迴ｾ・・iff 縺後↑縺・％縺ｨ・・  - 蟄伜惠遒ｺ隱阪・菴ｿ逕ｨ譚｡莉ｶ・域眠隕丈ｽ懈・遖∵ｭ｢・・  - pipeline stage 蛻･ content 陦ｨ迴ｾ蟾ｮ逡ｰ縺ｮ諢丞袖逧・ｭ我ｾ｡險ｱ螳ｹ

## 螳溯｣・せ繧ｳ繝ｼ繝励∈縺ｮ豕ｨ諢・
螳溯｣・ｩｳ邏ｰ縺ｯ譛ｬ繝峨Λ繝輔ヨ縺ｮ隕∽ｻｶ螳夂ｾｩ譛ｬ菴薙〒縺ｯ縺ｪ縺上…ase-run 蟾･遞九〒縺ｮ蜿ら・諠・ｱ縺ｧ縺ゅｋ縲・隕∽ｻｶ螳夂ｾｩ縺ｨ縺励※縺ｮ蜴滓悽縺ｯ荳願ｨ・`# draft-data` YAML 繝悶Ο繝・け縲・
# summary

譛ｬ繝峨Λ繝輔ヨ縺ｯ RU-0005・・h-cli Windows 迺ｰ蠅・撫鬘・莉ｶ・峨→ RU-0006・・ass_criteria 險倩ｿｰ繧ｬ繧､繝会ｼ峨ｒ蜃ｦ逅・☆繧玖ｦ∽ｻｶ螳夂ｾｩ縺ｧ縺ゅｋ縲・gentDevFlow 譛ｬ菴薙・謾ｹ蝟・ｼ・gentdev_handoff: true・峨・
荳ｻ隕√↑螟画峩蟇ｾ雎｡縺ｯ3縺､縺ｮ SPEC・・gentdev-gh-cli.md, agentdev-workflow-templates.md, agentdev-req-analysis.md・峨∈縺ｮ蜿り・ｿｽ險倥→縲∝推 skill 縺ｮ reference 繝輔ぃ繧､繝ｫ譖ｴ譁ｰ・・ase-run 蟾･遞具ｼ峨Ｔcale: standard縲・
蠕檎ｶ壹さ繝槭Φ繝峨・ req-save・・EQ/ADR 螟画峩縺ｪ縺励√せ繧ｭ繝・・蜿ｯ・俄・ spec-save・・ SPEC 蜿り・ｿｽ險假ｼ俄・ case-open 竊・case-run・亥推 skill reference 繝輔ぃ繧､繝ｫ譖ｴ譁ｰ・峨ｒ諠ｳ螳壹・
