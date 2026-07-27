---
draft_type: req_draft
topic_slug: alloc-id-regex-fix-and-spec-append-operation
status: saved
created_at: 2026-07-27T00:00:00+09:00
source_rus:
  - RU-0008
  - RU-0011
agentdev_handoff: true
spec_actions_consumed: true
---

<!-- 譛ｬ繝峨Λ繝輔ヨ縺ｯ AgentDevFlow 譛ｬ菴薙・荳榊・蜷医・謾ｹ蝟・せ繧呈桶縺・燕蟾･遞句ｼ輔″邯吶℃繝峨Λ繝輔ヨ縺ｧ縺ゅｋ・・gentdev_handoff: true・峨・-->
<!-- 2 RU・・U-0008: alloc-composite-id.ts 豁｣隕剰｡ｨ迴ｾ繝舌げ縲ヽU-0011: spec-append operation + search-target-area.ts 螂醍ｴ・ｿｮ豁｣・峨ｒ蜷ｫ繧縲・     荳｡ RU 縺ｯ迢ｬ遶矩未蠢・□縺後悟ｮ溯｣・･醍ｴ・ｸ肴紛蜷医・隗｣豸医阪→縺・≧蜈ｱ騾壽ｧ縺ｧ繧ｰ繝ｫ繝ｼ繝優縺ｨ縺励※1繝峨Λ繝輔ヨ縺ｫ縺ｾ縺ｨ繧√◆縲・-->

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  RU-0008・・lloc-composite-id.ts 縺ｮ豁｣隕剰｡ｨ迴ｾ繝舌げ・峨→ RU-0011・・pec-append 隨ｬ荳邏・operation 蛹・+
  search-target-area.ts 豁｣隕丞･醍ｴ・ｸ肴紛蜷井ｿｮ豁｣・峨ｒ蜃ｦ逅・☆繧九・  RU-0008 縺ｯ agentdev-req-file-manager 縺ｮ謗｡逡ｪ繧ｹ繧ｯ繝ｪ繝励ヨ縺・譯・REQ 蠖｢蠑上ｒ隱崎ｭ倥＠縺ｪ縺・ヰ繧ｰ縺ｮ菫ｮ豁｣縲・  RU-0011 縺ｯ譛ｪ讀懷・譎・APPEND fallback 縺ｮ髱槫・蠑城°逕ｨ繧貞ｻ・ｭ｢縺励∵・遉ｺ逧・↑ spec-append operation 繧堤ｬｬ荳邏壼喧縺吶ｋ縲・  菴ｵ縺帙※ search-target-area.ts 縺梧ｭ｣隕丞･醍ｴ・ｼ郁ｦ句・縺苓｡悟・菴灘ｮ悟・荳閾ｴ・峨→荳堺ｸ閾ｴ・郁ｦ句・縺玲悽譁・歓蜃ｺ+蜑肴婿荳閾ｴ・・  縺ｮ蝠城｡後ｒ菫ｮ豁｣縺吶ｋ縲Ｅeep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ縺ｧ遒ｺ螳壹＠縺溯ｨｭ險亥愛譁ｭ3繧貞・髱｢逧・↓蜿肴丐縲・  譁ｰ隕・ADR 荳崎ｦ・ｼ・ommand 蜍穂ｽ應ｻ墓ｧ・螂醍ｴ・僑蠑ｵ縺ｯ ADR 菴懈・荳榊庄蟇ｾ雎｡・峨∥gentdev-architecture-advisory 蜉ｩ險螳滓命貂医∩縲・
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      RU-0008: src/opencode/skills/agentdev-req-file-manager/scripts/src/alloc-composite-id.ts 縺ｮ
      extractAllCompositeIds 髢｢謨ｰ縺ｮ豁｣隕剰｡ｨ迴ｾ繧・/REQ-(\d{4})-(\d{3})/ 縺九ｉ /REQ-(\d{3,4})-(\d{3})/ 縺ｸ螟画峩縺吶ｋ縲・      縺薙ｌ縺ｫ繧医ｊ3譯・REQ 蠖｢蠑擾ｼ・EQ-001-NNN 遲会ｼ峨→4譯・REQ 蠖｢蠑擾ｼ・EQ-0011-NNN 遲会ｼ峨・荳｡譁ｹ繧剃ｸ雋ｫ縺励※隱崎ｭ倥☆繧九・      迴ｾ迥ｶ extractCompositeIdNumbers 縺ｯ \d{3,4} 繧定ｨｱ螳ｹ縺励※縺・ｋ荳譁ｹ縺ｧ extractAllCompositeIds 縺ｯ \d{4} 蝗ｺ螳壹〒縺ゅｊ縲・      髢｢謨ｰ髢薙〒蠖｢蠑丞･醍ｴ・′荳堺ｸ閾ｴ縺励※縺・ｋ譬ｹ譛ｬ蜴溷屏繧定ｧ｣豸医☆繧九・  - id: AG-002
    content: |
      RU-0008: 3譯・4譯∽ｸ｡蠖｢蠑上〒縺ｮ謗｡逡ｪ讀懆ｨｼ繝・せ繝医ｒ霑ｽ蜉縺吶ｋ縲・      extractAllCompositeIds 縺ｨ extractCompositeIdNumbers 縺ｮ荳｡髢｢謨ｰ縺ｫ縺､縺・※縲・譯・REQ 鄒､・・EQ-001, REQ-003, REQ-006, REQ-008, REQ-010 遲会ｼ・      縺ｨ4譯・REQ 鄒､・・EQ-0011 遲会ｼ峨′豺ｷ蝨ｨ縺吶ｋ蜈･蜉帙〒豁｣縺励￥ max 繧定ｿ斐☆縺薙→繧呈､懆ｨｼ縺吶ｋ縲・  - id: AG-003
    content: |
      RU-0008: docs/specs/skills/agentdev-req-file-manager.md 縺ｮ螳溯｣・ｩｳ邏ｰ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｸ縲・      縲軍EQ-ID 蠖｢蠑丞･醍ｴ・・荳蠕区ｧ・・譯・4譯∽ｸ｡蠖｢蠑上ｒ荳雋ｫ縺励※隱崎ｭ倥☆繧九％縺ｨ・峨阪ｒ譏手ｨ倥☆繧九・      髢｢謨ｰ髢薙〒豁｣隕剰｡ｨ迴ｾ蠖｢蠑丞･醍ｴ・′荳堺ｸ閾ｴ縺励↑縺・％縺ｨ繧・SPEC 荳翫・蛻ｶ邏・→縺吶ｋ縲・  - id: AG-004
    content: |
      RU-0011: SPEC operation 繧・spec-create / spec-append / spec-update 縺ｮ3蛟､縺ｸ諡｡蠑ｵ縺吶ｋ縲・      - spec-create: 譁ｰ隕・SPEC 繝輔ぃ繧､繝ｫ繧剃ｽ懈・
      - spec-append: 譌｢蟄・SPEC 縺ｸ譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ繧定ｿｽ蜉
      - spec-update: 譌｢蟄倥そ繧ｯ繧ｷ繝ｧ繝ｳ繧堤ｽｮ謠・      譛ｪ讀懷・譎・APPEND fallback・磯∈謚櫁いB・峨・荳肴治逕ｨ・郁ｪ､譖ｴ譁ｰ繝ｪ繧ｹ繧ｯ縺ｮ縺溘ａ・峨・      蜈ｬ蠑・operation enum 縺ｯ create/update 縺ｮ縺ｿ縲Ｔpec-create/spec-update/spec-append 縺ｯ蜷・SPEC 縺ｮ髱樊ｭ｣隕・alias縲・      producer・・eq-define・・ schema・・rtifact-contracts.md・・ consumer・・pec-save・峨ｒ蜷梧悄譖ｴ譁ｰ縺励・      譌｢蟄・create/update 縺ｯ consumer 縺悟ｾ梧婿莠呈鋤縺ｨ縺励※蜿礼炊縺吶ｋ縲・  - id: AG-005
    content: |
      RU-0011: spec-append 縺ｮ螂醍ｴ・ｒ莉･荳九・騾壹ｊ螳夂ｾｩ縺吶ｋ縲・      - content 縺ｯ譁ｰ隕剰ｦ句・縺苓｡後°繧牙ｧ九∪繧具ｼ井ｾ・ `### IR-044`・・      - 蜷悟錐隕句・縺励′譌｢縺ｫ蟄伜惠縺吶ｋ蝣ｴ蜷医・霑ｽ蜉繧偵せ繧ｭ繝・・縺励’ollow-up 蝣ｱ蜻翫ｒ陦後≧
      - 謖ｿ蜈･菴咲ｽｮ蛻ｶ蠕｡: placement・・ail / after_anchor / before_anchor縲∵里螳・tail・・ anchor・・ail 莉･螟悶・蠢・医∬ｦ句・縺苓｡悟・菴薙〒謖・ｮ夲ｼ・      - anchor 譛ｪ讀懷・譎・ action 繧偵せ繧ｭ繝・・縺励’ollow-up 蝣ｱ蜻翫ｒ陦後≧・・pec-update 縺ｨ蜷御ｸ謖吝虚・・      - 蜷域ｼ蝓ｺ貅・ 霑ｽ蜉蠕後・ SPEC 繝輔ぃ繧､繝ｫ縺ｫ target_area 縺ｨ螳悟・荳閾ｴ縺吶ｋ隕句・縺励′1縺､縺縺大ｭ伜惠縺吶ｋ縺薙→
      - 縲碁←蛻・↑菴咲ｽｮ繧呈耳隲悶☆繧九阪→縺・≧譖匁乂縺ｪ蜃ｦ逅・・荳肴治逕ｨ縲よ・遉ｺ逧・↑ placement/anchor 謖・ｮ壹・縺ｿ蜿励￠莉倥￠繧・  - id: AG-006
    content: |
      RU-0011: search-target-area.ts 繧定ｦ句・縺苓｡悟・菴薙→縺ｮ螳悟・荳閾ｴ縺ｸ菫ｮ豁｣縺吶ｋ縲・      迴ｾ迥ｶ縺ｮ螳溯｣・・隕句・縺苓｡後°繧・`### ` 遲峨・繝励Ξ繝輔ぅ繝・け繧ｹ繧帝勁縺・◆隕句・縺玲悽譁・・縺ｿ繧呈歓蜃ｺ縺励・      縺輔ｉ縺ｫ螳悟・荳閾ｴ縺縺代〒縺ｪ縺丞燕譁ｹ荳閾ｴ繧りｨｱ螳ｹ縺励※縺・ｋ縲ゅ％繧後↓繧医ｊ豁｣隕丞・蜉・`### IR-044` 縺・`IR-044` 縺ｨ荳閾ｴ縺帙★縲・      蟄伜惠縺吶ｋ隕句・縺励ｒ譛ｪ讀懷・縺ｨ縺励※繧ｹ繧ｭ繝・・縺吶ｋ蜿ｯ閭ｽ諤ｧ縺後≠繧九・      菫ｮ豁｣蠕後・ req-define/spec-save 縺ｮ豁｣隕丞･醍ｴ・ｼ郁ｦ句・縺苓｡悟・菴薙→縺ｮ螳悟・荳閾ｴ・峨∈荳閾ｴ縺輔○繧九・      蜑肴婿荳閾ｴ繧貞ｻ・ｭ｢縺励∵ｭ｣隕丞・蜉幢ｼ井ｾ・ `### IR-044`・峨〒縺ｮ蝗槫ｸｰ繝・せ繝医ｒ霑ｽ蜉縺吶ｋ縲・  - id: AG-007
    content: |
      RU-0011: REQ 豁｣隕乗園譛蛾未菫ゅｒ莉･荳九・騾壹ｊ謨ｴ逅・☆繧九・      - 讒矩蛹悶ワ繝ｳ繝峨が繝戊ｦ∽ｻｶ・・rtifact_actions 讒矩縲》arget_area縲√そ繧ｯ繧ｷ繝ｧ繝ｳ蜈ｨ譁・ｼ峨・ REQ-008
      - 螳溯｡後・繝ｭ繧ｻ繧ｹ・郁ｦ∽ｻｶ蠖｢謌舌《pec-save 繝励Ο繧ｻ繧ｹ・峨・ REQ-004
      - operation enum 隧ｳ邏ｰ・・pec-create/spec-append/spec-update 縺ｮ蜷・э蜻ｳ縲∝・蜉帙ヵ繧｣繝ｼ繝ｫ繝会ｼ峨・ SPEC
      req-define 縺ｧ REQ-008/REQ-004 縺ｸ縺ｮ隕∽ｻｶ陦瑚ｿｽ蜉隕∝凄繧貞愛螳壹☆繧九・      spec-append 霑ｽ蜉縺後後ヵ繧｣繝ｼ繝ｫ繝芽ｩｳ邏ｰ縺ｮ霑ｽ蜉縲阪↓逡吶∪繧句ｴ蜷医・ artifact-contracts.md縲〉eq-define縲《pec-save縲・      agentdev-spec-file-manager 縺ｮ SPEC 螂醍ｴ・・縺ｿ譖ｴ譁ｰ縺励ヽEQ-008/REQ-004 縺ｮ隕∽ｻｶ陦瑚ｿｽ蜉縺ｯ荳崎ｦ√→縺吶ｋ縲・      隕∽ｻｶ繝ｬ繝吶Ν縺ｧ APPEND 縺ｨ UPDATE 縺ｮ蛹ｺ蛻･繧貞､夜Κ螂醍ｴ・→縺励※菫晁ｨｼ縺吶ｋ蝣ｴ蜷医・ REQ-008-032 縺ｮ譖ｴ譁ｰ縺ｾ縺溘・ REQ-008 縺ｸ縺ｮ隕∽ｻｶ陦瑚ｿｽ蜉繧定｡後≧縲・  - id: AG-008
    content: |
      RU-0011: 譁ｰ隕・ADR 縺ｯ荳崎ｦ√Ｄommand 蜍穂ｽ應ｻ墓ｧ・螂醍ｴ・僑蠑ｵ縺ｯ ADR 菴懈・荳榊庄蟇ｾ雎｡・・gentdev-adr-guidelines・峨・      縺溘□縺・agentdev-architecture-advisory 蜉ｩ險縺ｯ螳滓命貂医∩・・eep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ縺ｧ險ｭ險亥愛譁ｭ3縺ｨ縺励※遒ｺ螳夲ｼ峨・      諠ｳ螳夂ｵ先棡縺ｯ ADR unnecessary縲・
artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-req-file-manager
    target_area: "## 螳溯｣・ｩｳ邏ｰ"
    source_items: [AG-001, AG-002, AG-003]
    spec_logical_division: implementation_detail
    canonical_owner: agentdev-req-file-manager
    content: |
      ## 螳溯｣・ｩｳ邏ｰ

      ・育樟陦後そ繧ｯ繧ｷ繝ｧ繝ｳ縺ｸ莉･荳九ｒ霑ｽ險假ｼ・
      ### REQ-ID 蠖｢蠑丞･醍ｴ・・荳蠕区ｧ

      alloc-composite-id.ts 縺梧署萓帙☆繧句・髢｢謨ｰ・・xtractAllCompositeIds, extractCompositeIdNumbers 遲会ｼ峨・縲・      REQ-ID 蠖｢蠑上→縺励※3譯・ｼ・EQ-001-NNN・峨→4譯・ｼ・EQ-0011-NNN・峨・荳｡譁ｹ繧剃ｸ雋ｫ縺励※隱崎ｭ倥☆繧九％縺ｨ縲・      髢｢謨ｰ髢薙〒豁｣隕剰｡ｨ迴ｾ蠖｢蠑丞･醍ｴ・′荳堺ｸ閾ｴ縺励↑縺・％縺ｨ縲・
      謗｡逡ｪ讀懆ｨｼ繝・せ繝医・3譯・REQ 鄒､・・EQ-001, REQ-003, REQ-006, REQ-008, REQ-010・峨→
      4譯・REQ 鄒､・・EQ-0011・峨′豺ｷ蝨ｨ縺吶ｋ蜈･蜉帙〒豁｣縺励￥ max 繧定ｿ斐☆縺薙→繧呈､懆ｨｼ縺吶ｋ縺薙→縲・  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-008.md
    source_items: [AG-004, AG-005, AG-007]
    content: |
      REQ-008 縺ｮ讒矩蛹悶ワ繝ｳ繝峨が繝戊ｦ∽ｻｶ・・rtifact_actions 讒矩・峨∈ spec-append operation 繧定ｿｽ蜉縺吶ｋ縺九←縺・°繧・      req-save 螳溯｡梧凾縺ｫ蛻､螳壹☆繧九りｦ∽ｻｶ繝ｬ繝吶Ν縺ｧ APPEND 縺ｨ UPDATE 縺ｮ蛹ｺ蛻･繧貞､夜Κ螂醍ｴ・→縺励※菫晁ｨｼ縺吶ｋ蝣ｴ蜷医・
      REQ-008-032・・PEC update 譎ゅ・蟇ｾ雎｡隕句・縺暦ｼ峨・譖ｴ譁ｰ縺ｾ縺溘・譁ｰ隕剰ｦ∽ｻｶ陦後・霑ｽ蜉繧定｡後≧縲・      繝輔ぅ繝ｼ繝ｫ繝芽ｩｳ邏ｰ縺ｮ霑ｽ蜉縺ｫ逡吶∪繧句ｴ蜷医・ REQ-008 縺ｮ隕∽ｻｶ陦瑚ｿｽ蜉縺ｯ陦後ｏ縺壹ヾPEC 縺ｮ縺ｿ譖ｴ譁ｰ縺吶ｋ縲・      隧ｳ邏ｰ隕∽ｻｶ陦後・ req-save 螳溯｡梧凾縺ｫ REQ-008 縺ｮ譌｢蟄倩ｦ∽ｻｶ鄒､縺ｨ縺ｮ謨ｴ蜷医ｒ遒ｺ隱阪＠縺ｦ驟咲ｽｮ縺吶ｋ縲・  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: responsibilities
      slug: artifact-contracts
    target_area: "## artifact_actions operation"
    source_items: [AG-004, AG-005]
    spec_logical_division: cross_cutting_contract
    canonical_owner: artifact-contracts
    content: |
      ## artifact_actions operation

      ・育樟陦後・ operation enum 螳夂ｾｩ縺ｸ莉･荳九ｒ霑ｽ險假ｼ・
      SPEC operation 縺ｯ create/update 縺ｮ2蛟､繧貞・蠑・enum 縺ｨ縺吶ｋ縲・      蜷・SPEC・・eq-define/spec-save・峨・髱樊ｭ｣隕・alias 縺ｨ縺励※ spec-create/spec-update/spec-append 繧貞女縺台ｻ倥￠繧九％縺ｨ縺後〒縺阪ｋ縲・      consumer・・pec-save・峨・ create/update/spec-create/spec-update/spec-append 縺ｮ蜈ｨ縺ｦ繧貞女逅・☆繧具ｼ亥ｾ梧婿莠呈鋤・峨・
      ### spec-append operation

      - 諢丞袖: 譌｢蟄・SPEC 繝輔ぃ繧､繝ｫ縺ｸ譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ繧定ｿｽ蜉縺吶ｋ
      - 蜈･蜉帙ヵ繧｣繝ｼ繝ｫ繝・
        - target: 譌｢蟄・SPEC 繝代せ・亥ｿ・茨ｼ・        - target_area: 譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ隕句・縺苓｡鯉ｼ亥ｿ・医∬ｦ句・縺苓｡悟・菴灘ｽ｢蠑上∽ｾ・ `### IR-044`・・        - content: 譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ蜈ｨ譁・ｼ亥ｿ・医∬ｦ句・縺苓｡後°繧牙ｧ九∪繧具ｼ・        - placement: tail・域里螳夲ｼ・ after_anchor / before_anchor
        - anchor: placement 縺・tail 莉･螟悶・蝣ｴ蜷医・蠢・医りｦ句・縺苓｡悟・菴薙〒謖・ｮ・      - 謖吝虚:
        - 蜷悟錐隕句・縺暦ｼ・arget_area 縺ｨ螳悟・荳閾ｴ・峨′譌｢蟄倥・蝣ｴ蜷医・霑ｽ蜉繧ｹ繧ｭ繝・・ + follow-up 蝣ｱ蜻・        - placement 縺・tail 莉･螟悶〒 anchor 縺梧悴讀懷・縺ｮ蝣ｴ蜷医・ action 繧ｹ繧ｭ繝・・ + follow-up 蝣ｱ蜻・        - 蜷域ｼ蝓ｺ貅・ 霑ｽ蜉蠕後・ SPEC 繝輔ぃ繧､繝ｫ縺ｫ target_area 縺ｨ螳悟・荳閾ｴ縺吶ｋ隕句・縺励′1縺､縺縺大ｭ伜惠縺吶ｋ縺薙→
  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: req-define
    target_area: "## artifact_actions 逕滓・"
    source_items: [AG-004, AG-005]
    spec_logical_division: behavior
    canonical_owner: req-define
    content: |
      ## artifact_actions 逕滓・

      ・育樟陦後そ繧ｯ繧ｷ繝ｧ繝ｳ縺ｸ莉･荳九ｒ霑ｽ險假ｼ・
      req-define 縺ｯ譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ霑ｽ蜉繧・operation: spec-append 縺ｨ縺励※蜃ｺ蜉帙☆繧九・      - target: 譌｢蟄・SPEC 繝代せ
      - target_area: 譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ隕句・縺・      - content: 譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ蜈ｨ譁・ｼ郁ｦ句・縺苓｡後°繧牙ｧ九∪繧具ｼ・      - placement: tail・域里螳夲ｼ・ after_anchor / before_anchor・亥ｿ・ｦ∵凾・・      - anchor: placement 縺・tail 莉･螟悶・蝣ｴ蜷医・蠢・茨ｼ亥ｿ・ｦ∵凾・・
      縺薙ｌ縺ｫ繧医ｊ諢丞峙逧・↑譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ霑ｽ蜉縺ｨ target_area 縺ｮ隱､蟄励・蜿､縺・ｦ句・縺怜錐繝ｻ蜿ら・蜈磯俣驕輔＞繧呈ｩ滓｢ｰ逧・↓蛹ｺ蛻･縺ｧ縺阪ｋ縲・  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: spec-save
    target_area: "## target_area 繝吶・繧ｹ縺ｮ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ鄂ｮ謠帙Ο繧ｸ繝・け"
    source_items: [AG-004, AG-005, AG-006]
    spec_logical_division: behavior
    canonical_owner: spec-save
    content: |
      ## target_area 繝吶・繧ｹ縺ｮ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ鄂ｮ謠帙Ο繧ｸ繝・け

      ・育樟陦後そ繧ｯ繧ｷ繝ｧ繝ｳ縺ｸ莉･荳九ｒ霑ｽ險假ｼ・
      ### spec-append operation 縺ｮ蜃ｦ逅・
      operation: spec-append 縺ｮ蝣ｴ蜷・
      - target_area 縺ｨ螳悟・荳閾ｴ縺吶ｋ隕句・縺苓｡後′譌｢蟄倥☆繧句ｴ蜷医・霑ｽ蜉繧ｹ繧ｭ繝・・ + follow-up 蝣ｱ蜻奇ｼ亥・菴謎ｸｭ豁｢縺励↑縺・ｼ・      - placement: tail・域里螳夲ｼ峨・蝣ｴ蜷医・ SPEC 繝輔ぃ繧､繝ｫ譛ｫ蟆ｾ縺ｸ譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ繧定ｿｽ蜉
      - placement: after_anchor / before_anchor 縺ｮ蝣ｴ蜷医・ anchor 縺ｧ謖・ｮ壹＆繧後◆隕句・縺苓｡後・蜑榊ｾ後∈霑ｽ蜉縲・        anchor 縺梧悴讀懷・縺ｮ蝣ｴ蜷医・ action 繧ｹ繧ｭ繝・・ + follow-up 蝣ｱ蜻・      - 蜷域ｼ蝓ｺ貅・ 霑ｽ蜉蠕後・ SPEC 繝輔ぃ繧､繝ｫ縺ｫ target_area 縺ｨ螳悟・荳閾ｴ縺吶ｋ隕句・縺励′1縺､縺縺大ｭ伜惠縺吶ｋ縺薙→

      ### search-target-area.ts 螂醍ｴ・
      search-target-area.ts 縺ｯ隕句・縺苓｡悟・菴薙→縺ｮ螳悟・荳閾ｴ縺ｮ縺ｿ繧貞女縺台ｻ倥￠繧九・      蜑肴婿荳閾ｴ繧・ｦ句・縺玲悽譁・・縺ｿ縺ｮ謚ｽ蜃ｺ縺ｯ陦後ｏ縺ｪ縺・・      豁｣隕丞・蜉幢ｼ井ｾ・ `### IR-044`・峨〒縺ｮ蝗槫ｸｰ繝・せ繝医ｒ邯ｭ謖√☆繧九・  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-spec-file-manager
    target_area: "## 謠蝉ｾ帶桃菴・
    source_items: [AG-004, AG-005, AG-006]
    spec_logical_division: behavior
    canonical_owner: agentdev-spec-file-manager
    content: |
      ## 謠蝉ｾ帶桃菴・
      ・育樟陦後・ CREATE/APPEND/UPDATE 縺ｫ蜉縺医※縲、PPEND 謫堺ｽ懊・螂醍ｴ・ｒ莉･荳九・騾壹ｊ譏守｢ｺ蛹厄ｼ・
      ### APPEND 謫堺ｽ懶ｼ・pec-append・・
      - content 縺ｯ譁ｰ隕剰ｦ句・縺苓｡後°繧牙ｧ九∪繧・      - 蜷悟錐隕句・縺暦ｼ・arget_area 縺ｨ螳悟・荳閾ｴ・峨′譌｢蟄倥・蝣ｴ蜷医・霑ｽ蜉繧ｹ繧ｭ繝・・ + follow-up 蝣ｱ蜻・      - placement: tail・域里螳夲ｼ・ after_anchor / before_anchor
      - anchor: placement 縺・tail 莉･螟悶・蝣ｴ蜷医・蠢・医∬ｦ句・縺苓｡悟・菴薙〒謖・ｮ・      - anchor 譛ｪ讀懷・譎・ action 繧ｹ繧ｭ繝・・ + follow-up 蝣ｱ蜻・      - 蜷域ｼ蝓ｺ貅・ 霑ｽ蜉蠕後・ SPEC 繝輔ぃ繧､繝ｫ縺ｫ target_area 縺ｨ螳悟・荳閾ｴ縺吶ｋ隕句・縺励′1縺､縺縺大ｭ伜惠縺吶ｋ縺薙→

      ### search-target-area.ts 螂醍ｴ・
      search-target-area.ts 縺ｯ隕句・縺苓｡悟・菴薙→縺ｮ螳悟・荳閾ｴ縺ｮ縺ｿ繧貞女縺台ｻ倥￠繧具ｼ亥燕譁ｹ荳閾ｴ蟒・ｭ｢・峨・      豁｣隕丞・蜉幢ｼ井ｾ・ `### IR-044`・峨〒蝗槫ｸｰ繝・せ繝医ｒ邯ｭ謖√☆繧九・
conflict_resolutions:
  - id: CR-001
    conflict: RU-0011 驕ｸ謚櫁いB・・pec-save 蛛ｴ縺ｧ譛ｪ讀懷・譎・APPEND fallback 蜈ｬ蠑丞喧・・vs 驕ｸ謚櫁いA・・eq-define 譁ｰ隕・operation・・    resolution: |
      驕ｸ謚櫁いA・・pec-append 隨ｬ荳邏・operation・峨ｒ謗｡逕ｨ縲る∈謚櫁いB縺ｯ隱､譖ｴ譁ｰ繝ｪ繧ｹ繧ｯ・・arget_area 隱､蟄励・蜿､縺・ｦ句・縺怜錐繝ｻ蜿ら・蜈磯俣驕輔＞縺・      APPEND 縺輔ｌ縺ｦ縺励∪縺・ｼ峨・縺溘ａ荳肴治逕ｨ縲Ｅeep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ・医Ξ繝ｼ繝ｳ4 螻･豁ｴ繝ｻ霑ｽ霍｡諤ｧ HTR-005/08・峨〒遒ｺ隱肴ｸ医∩縲・  - id: CR-002
    conflict: spec-append 縺ｮ謖ｿ蜈･蝓ｺ貅厄ｼ域忰蟆ｾ霑ｽ蜉縺ｮ縺ｿ vs 莉ｻ諢丈ｽ咲ｽｮ謖・ｮ夲ｼ・    resolution: |
      莉ｻ諢丈ｽ咲ｽｮ謖・ｮ壹ｒ險ｱ螳ｹ縺吶ｋ縺後｝lacement・・ail/after_anchor/before_anchor・・ anchor 縺ｮ譏守､ｺ逧・欠螳壹・縺ｿ蜿励￠莉倥￠繧九・      縲碁←蛻・↑菴咲ｽｮ繧呈耳隲悶☆繧九阪→縺・≧譖匁乂縺ｪ蜃ｦ逅・・荳肴治逕ｨ縲Ｅeep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ・医Ξ繝ｼ繝ｳ5 險ｼ諡繝ｻ讀懆ｨｼ蜿ｯ閭ｽ諤ｧ EV-09・峨〒遒ｺ隱肴ｸ医∩縲・  - id: CR-003
    conflict: search-target-area.ts 菫ｮ豁｣繧・RU-0011 繧ｹ繧ｳ繝ｼ繝励↓蜷ｫ繧√ｋ縺・    resolution: |
      RU-0011 繧ｹ繧ｳ繝ｼ繝励↓蜷ｫ繧√※蜷梧凾菫ｮ豁｣縲Ｔpec-append 縺ｮ蜑肴署縺ｨ縺励※豎ｺ螳夂噪讀懃ｴ｢螂醍ｴ・′蠢・ｦ√↑縺溘ａ縲・      繝ｦ繝ｼ繧ｶ繝ｼ蜷域э貂医∩縲・  - id: CR-004
    conflict: RU-0011 REQ 豁｣隕乗園譛牙・・・eview agent 縺ｯ縲御ｸ肴・縲阪‥eep-review 縺ｯ縲軍EQ-008/REQ-004/SPEC縲搾ｼ・    resolution: |
      讒矩蛹悶ワ繝ｳ繝峨が繝戊ｦ∽ｻｶ縺ｯ REQ-008縲∝ｮ溯｡後・繝ｭ繧ｻ繧ｹ縺ｯ REQ-004縲｛peration enum 隧ｳ邏ｰ縺ｯ SPEC縲・      req-define 縺ｧ REQ-008/REQ-004 縺ｸ縺ｮ隕∽ｻｶ陦瑚ｿｽ蜉隕∝凄繧貞愛螳壹☆繧九Ｅeep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ・医Ξ繝ｼ繝ｳ3 邨ｱ蛻ｶ繝ｻ繧ｬ繝舌リ繝ｳ繧ｹ CG-09縲・      繝ｬ繝ｼ繝ｳ5 險ｼ諡繝ｻ讀懆ｨｼ蜿ｯ閭ｽ諤ｧ EV-07・峨〒遒ｺ隱肴ｸ医∩縲・  - id: CR-005
    conflict: ADR 隕∝凄
    resolution: |
      譁ｰ隕・ADR 荳崎ｦ√Ｄommand 蜍穂ｽ應ｻ墓ｧ・螂醍ｴ・僑蠑ｵ縺ｯ ADR 菴懈・荳榊庄蟇ｾ雎｡縲・      agentdev-architecture-advisory 蜉ｩ險縺ｯ螳滓命貂医∩・域Φ螳夂ｵ先棡: ADR unnecessary・峨・      deep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ・医Ξ繝ｼ繝ｳ3 邨ｱ蛻ｶ繝ｻ繧ｬ繝舌リ繝ｳ繧ｹ・峨〒遒ｺ隱肴ｸ医∩縲・
operation_units:
  - ou_id: OU-001
    source_ru: RU-0008
    target_spec: docs/specs/skills/agentdev-req-file-manager.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0011
    target_req: REQ-008
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0011
    target_spec: docs/specs/responsibilities/artifact-contracts.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0011
    target_spec: docs/specs/commands/req-define.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002, OU-003]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0011
    target_spec: docs/specs/commands/spec-save.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002, OU-003]
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-0011
    target_spec: docs/specs/skills/agentdev-spec-file-manager.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002, OU-003]
    recommended_order: 6
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      src/opencode/skills/agentdev-req-file-manager/scripts/src/alloc-composite-id.ts 縺ｮ
      extractAllCompositeIds 髢｢謨ｰ縺ｮ豁｣隕剰｡ｨ迴ｾ縺・/REQ-(\d{3,4})-(\d{3})/ 縺ｫ螟画峩縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・    pass_criteria: |
      豁｣隕剰｡ｨ迴ｾ縺・3譯・4譯∽ｸ｡譁ｹ繧定ｨｱ螳ｹ縺励・譯・REQ・・EQ-001-NNN 遲会ｼ峨ｒ豁｣縺励￥隱崎ｭ倥☆繧九％縺ｨ縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-002
    target_item: AG-002
    verification: |
      謗｡逡ｪ讀懆ｨｼ繝・せ繝医ｒ螳溯｡後☆繧九・      3譯・REQ 鄒､・・EQ-001, REQ-003, REQ-006, REQ-008, REQ-010・峨→4譯・REQ 鄒､・・EQ-0011・峨′豺ｷ蝨ｨ縺吶ｋ蜈･蜉帙〒縲・      extractAllCompositeIds 縺ｨ extractCompositeIdNumbers 縺ｮ荳｡髢｢謨ｰ縺梧ｭ｣縺励￥ max 繧定ｿ斐☆縺薙→繧呈､懆ｨｼ縺吶ｋ縲・    pass_criteria: |
      蜈ｨ繝・せ繝医こ繝ｼ繧ｹ縺・PASS 縺吶ｋ縺薙→縲・譯・4譯∵ｷｷ蝨ｨ縺ｧ繧よｭ｣縺励＞ max 縺ｨ ID 繝ｪ繧ｹ繝医′霑斐＆繧後ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-003
    target_item: AG-003
    verification: |
      docs/specs/skills/agentdev-req-file-manager.md 縺ｮ螳溯｣・ｩｳ邏ｰ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｫ
      縲軍EQ-ID 蠖｢蠑丞･醍ｴ・・荳蠕区ｧ縲阪′譏手ｨ倥＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・    pass_criteria: |
      蜷後そ繧ｯ繧ｷ繝ｧ繝ｳ縺ｫ 3譯・4譯∽ｸ｡蠖｢蠑上・荳雋ｫ隱崎ｭ倥→髢｢謨ｰ髢灘ｽ｢蠑丞･醍ｴ・ｸ堺ｸ閾ｴ遖∵ｭ｢縺瑚ｨ倩ｼ峨＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-004
    target_item: AG-004
    verification: |
      artifact-contracts.md 縺ｧ SPEC operation 縺・create/update 縺ｮ蜈ｬ蠑・enum 縺ｨ譏手ｨ倥＆繧後・      蜷・SPEC 縺碁撼豁｣隕・alias・・pec-create/spec-update/spec-append・峨ｒ蜿励￠莉倥￠繧九％縺ｨ縺瑚ｨ倩ｼ峨＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      req-define.md, spec-save.md, agentdev-spec-file-manager.md 縺ｧ spec-append 縺悟・逅・ｯｾ雎｡縺ｨ縺励※險倩ｼ峨＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      譌｢蟄・create/update 縺・consumer 縺ｧ蠕梧婿莠呈鋤縺ｨ縺励※蜿礼炊縺輔ｌ繧九％縺ｨ縺瑚ｨ倩ｼ峨＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・    pass_criteria: |
      蜈ｨ4 SPEC・・rtifact-contracts/req-define/spec-save/agentdev-spec-file-manager・峨〒 spec-append 縺瑚ｨ倩ｼ峨＆繧後・      create/update 縺ｮ蠕梧婿莠呈鋤縺梧・險倥＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-005
    target_item: AG-005
    verification: |
      spec-append 縺ｮ螂醍ｴ・ｼ・lacement/anchor/蜷悟錐隕句・縺・anchor 譛ｪ讀懷・譎・蜷域ｼ蝓ｺ貅厄ｼ峨′
      artifact-contracts.md, spec-save.md, agentdev-spec-file-manager.md 縺ｧ荳雋ｫ縺励※險倩ｼ峨＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      decision test: 蛻ｻ諢冗噪縺ｪ spec-append action 繧呈ｵ√＠霎ｼ縺ｿ縲∵э蝗ｳ騾壹ｊ縺ｮ菴咲ｽｮ縺ｫ隕句・縺励′1縺､縺縺題ｿｽ蜉縺輔ｌ繧九％縺ｨ繧呈､懆ｨｼ縺吶ｋ縲・    pass_criteria: |
      3 SPEC 縺ｧ螂醍ｴ・′螳悟・荳閾ｴ縺励‥ecision test 縺ｧ target_area 縺ｨ螳悟・荳閾ｴ縺吶ｋ隕句・縺励′1縺､縺縺大ｭ伜惠縺吶ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-006
    target_item: AG-006
    verification: |
      src/opencode/skills/agentdev-spec-file-manager/scripts/src/search-target-area.ts 縺・      隕句・縺苓｡悟・菴薙→縺ｮ螳悟・荳閾ｴ縺ｮ縺ｿ繧貞女縺台ｻ倥￠繧句ｮ溯｣・↓縺ｪ縺｣縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      豁｣隕丞・蜉・`### IR-044` 縺ｧ蝗槫ｸｰ繝・せ繝医ｒ螳溯｡後☆繧九・    pass_criteria: |
      蜑肴婿荳閾ｴ繧・ｦ句・縺玲悽譁・・縺ｿ縺ｮ謚ｽ蜃ｺ縺悟ｻ・ｭ｢縺輔ｌ縲∬ｦ句・縺苓｡悟・菴薙→縺ｮ螳悟・荳閾ｴ縺ｮ縺ｿ縺悟女縺台ｻ倥￠繧峨ｌ繧九％縺ｨ縲・      蝗槫ｸｰ繝・せ繝医′蜈ｨ縺ｦ PASS 縺吶ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-007
    target_item: AG-007
    verification: |
      REQ-008/REQ-004 縺ｮ隕∽ｻｶ陦後′豁｣縺励￥譖ｴ譁ｰ縺輔ｌ縺ｦ縺・ｋ縺具ｼ医∪縺溘・譖ｴ譁ｰ荳崎ｦ√→蛻､螳壹＆繧後◆縺具ｼ峨ｒ遒ｺ隱阪☆繧九・      req-save 螳溯｡梧凾縺ｫ隕∽ｻｶ陦瑚ｿｽ蜉隕∝凄縺悟愛螳壹＆繧後∫ｵ先棡縺瑚ｨ倬鹸縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・    pass_criteria: |
      REQ-008/REQ-004 縺ｮ譖ｴ譁ｰ隕∝凄蛻､螳壹′險倬鹸縺輔ｌ縲∝ｿ・ｦ√↑蝣ｴ蜷医・隕∽ｻｶ陦後′霑ｽ蜉縺輔ｌ縺ｦ縺・ｋ縺薙→縲・      荳崎ｦ√・蝣ｴ蜷医・ SPEC 縺ｮ縺ｿ譖ｴ譁ｰ縺輔ｌ縺ｦ縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-008
    target_item: AG-008
    verification: |
      譁ｰ隕・ADR 縺御ｽ懈・縺輔ｌ縺ｦ縺・↑縺・％縺ｨ繧堤｢ｺ隱阪☆繧九・      docs/adr/ 縺ｸ縺ｮ譁ｰ隕・ADR-NNN 繝輔ぃ繧､繝ｫ縺悟ｭ伜惠縺励↑縺・％縺ｨ縲・      agentdev-architecture-advisory 蜉ｩ險險倬鹸縺梧悽繝峨Λ繝輔ヨ縺ｮ conflict_resolutions・・R-005・峨↓谿九▲縺ｦ縺・ｋ縺薙→縲・    pass_criteria: |
      譁ｰ隕・ADR 繝輔ぃ繧､繝ｫ縺悟ｭ伜惠縺帙★縲∥dvisory 蜉ｩ險螳滓命險倬鹸縺・draft 縺ｫ谿九▲縺ｦ縺・ｋ縺薙→縲・    on_failure: |
      record-in-findings・井ｸ・′荳 ADR 縺御ｽ懈・縺輔ｌ縺溷ｴ蜷医・險ｭ險亥愛譁ｭ螟画峩縺ｮ縺溘ａ縲：indings 縺ｸ out-of-scope 縺ｨ縺励※險倬鹸・峨・
review_dispositions:
  - id: RD-001
    source_ru: RU-0008
    source_item: RU-0008-Sources-regex-bug
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0008 縺ｮ Source Summary 縺梧欠鞫倥☆繧九憩xtractAllCompositeIds 縺ｮ豁｣隕剰｡ｨ迴ｾ繝舌げ縲阪・ AG-001縲廣G-003 縺ｧ螳悟・縺ｫ邨ｱ蜷医＆繧後◆縲・      豁｣隕剰｡ｨ迴ｾ菫ｮ豁｣縲√ユ繧ｹ繝郁ｿｽ蜉縲ヾPEC 譏手ｨ倥ｒ蜈ｨ縺ｦ蜿肴丐縲・    evidence:
      path: .agentdev/backlog/req-units/RU-0008.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0011
    source_item: RU-0011-Sources-append-fallback
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0011 縺ｮ Source Summary 縺梧欠鞫倥☆繧九梧悴讀懷・譎・APPEND fallback 縺ｮ髱槫・蠑城°逕ｨ縲阪・ AG-004縲廣G-008 縺ｧ螳悟・縺ｫ邨ｱ蜷医＆繧後◆縲・      spec-append 隨ｬ荳邏・operation 蛹悶∝ｾ梧婿莠呈鋤縲∝･醍ｴ・ｮ悟・諤ｧ縲《earch-target-area.ts 菫ｮ豁｣縲ヽEQ 謇譛蛾未菫よ紛逅・ｒ蜈ｨ縺ｦ蜿肴丐縲・    evidence:
      path: .agentdev/backlog/req-units/RU-0011.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    scale: large・・EQ-008 update + 5 SPEC 蜷梧悄譖ｴ譁ｰ + 2 繧ｹ繧ｯ繝ｪ繝励ヨ菫ｮ豁｣・峨・縺溘ａ Epic 讒区・繧呈耳螂ｨ縲・    RU-0008・・U-001・峨・ RU-0011 縺ｨ迢ｬ遶倶ｸｦ蛻怜ｮ溯｡悟庄閭ｽ縲・    Wave 讒区・譯・
    - Wave 1: OU-001・・U-0008 SPEC・・ OU-002・・EQ-008 update・我ｸｦ蛻・    - Wave 2: OU-003・・rtifact-contracts.md・・ OU-006・・gentdev-spec-file-manager.md・・    - Wave 3: OU-004・・eq-define.md・・ OU-005・・pec-save.md・・    窶ｻ case-run 蟾･遞九〒 alloc-composite-id.ts, search-target-area.ts 縺ｮ螳溯｣・ｿｮ豁｣繧貞ｮ滓命縲・  wave_hints:
    - wave: 1
      units: [OU-001, OU-002]
      rationale: RU-0008 縺ｨ RU-0011 縺ｯ迢ｬ遶九３EQ-008 update 縺悟ｾ檎ｶ壹・蜑肴署縲・    - wave: 2
      units: [OU-003, OU-006]
      rationale: artifact-contracts.md 縺ｨ agentdev-spec-file-manager.md 縺ｯ螂醍ｴ・・ SSoT縲・    - wave: 3
      units: [OU-004, OU-005]
      rationale: req-define.md 縺ｨ spec-save.md 縺ｯ Wave 2 縺ｮ螂醍ｴ・↓蠕薙≧ consumer/producer縲・```

# implementation_details

譛ｬ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｯ case-run 蟾･遞九〒螳滓命縺吶ｋ螳溯｣・ｩｳ邏ｰ・・tep 10-1 繧ｬ繧､繝峨Λ繧､繝ｳ縺ｫ蝓ｺ縺･縺丞・髮｢・峨・
## RU-0008 螳溯｣・
- 繝輔ぃ繧､繝ｫ: `src/opencode/skills/agentdev-req-file-manager/scripts/src/alloc-composite-id.ts`
- 菫ｮ豁｣: `extractAllCompositeIds` 髢｢謨ｰ縺ｮ豁｣隕剰｡ｨ迴ｾ繧・`/REQ-(\d{4})-(\d{3})/` 縺九ｉ `/REQ-(\d{3,4})-(\d{3})/` 縺ｸ螟画峩
- 繝・せ繝郁ｿｽ蜉: 3譯・REQ・・EQ-001-NNN 遲会ｼ峨→4譯・REQ・・EQ-0011-NNN・画ｷｷ蝨ｨ蜈･蜉帙〒縺ｮ max 險育ｮ玲､懆ｨｼ
- 蠖ｱ髻ｿ: REQ-001, REQ-003, REQ-006, REQ-008, REQ-010 縺ｮ謗｡逡ｪ縺瑚・蜍募喧縺輔ｌ繧具ｼ・ase-auto Draft 1縲・ 縺ｧ謇句虚謗｡逡ｪ縺悟ｿ・ｦ√□縺｣縺溷撫鬘後・隗｣豸茨ｼ・
## RU-0011 螳溯｣・
- 繝輔ぃ繧､繝ｫ: `src/opencode/skills/agentdev-spec-file-manager/scripts/src/search-target-area.ts`
- 菫ｮ豁｣: 隕句・縺苓｡後°繧・`### ` 遲峨・繝励Ξ繝輔ぅ繝・け繧ｹ繧帝勁縺丞・逅・ｒ蟒・ｭ｢縲ょ・蜉帙＆繧後◆ `target_area`・郁ｦ句・縺苓｡悟・菴難ｼ峨→縺ｮ螳悟・荳閾ｴ縺ｮ縺ｿ繧貞女縺台ｻ倥￠繧・- 蟒・ｭ｢: 蜑肴婿荳閾ｴ險ｱ螳ｹ
- 蝗槫ｸｰ繝・せ繝郁ｿｽ蜉: 豁｣隕丞・蜉・`### IR-044`, `## 蟾･遞句挨 capture 雋ｬ蜍兪 遲峨〒縺ｮ讀懆ｨｼ

## 螳溯｣・せ繧ｳ繝ｼ繝励∈縺ｮ豕ｨ諢・
螳溯｣・ｩｳ邏ｰ縺ｯ譛ｬ繝峨Λ繝輔ヨ縺ｮ隕∽ｻｶ螳夂ｾｩ譛ｬ菴薙〒縺ｯ縺ｪ縺上…ase-run 蟾･遞九〒縺ｮ蜿ら・諠・ｱ縺ｧ縺ゅｋ縲・隕∽ｻｶ螳夂ｾｩ縺ｨ縺励※縺ｮ蜴滓悽縺ｯ荳願ｨ・`# draft-data` YAML 繝悶Ο繝・け縲・
# summary

譛ｬ繝峨Λ繝輔ヨ縺ｯ RU-0008・・lloc-composite-id.ts 豁｣隕剰｡ｨ迴ｾ繝舌げ・峨→ RU-0011・・pec-append 隨ｬ荳邏・operation 蛹・+ search-target-area.ts 豁｣隕丞･醍ｴ・ｿｮ豁｣・峨ｒ蜃ｦ逅・☆繧玖ｦ∽ｻｶ螳夂ｾｩ縺ｧ縺ゅｋ縲・gentDevFlow 譛ｬ菴薙・謾ｹ蝟・ｼ・gentdev_handoff: true・峨・
deep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ縺ｧ遒ｺ螳壹＠縺溯ｨｭ險亥愛譁ｭ3繧貞・髱｢逧・↓蜿肴丐縲る∈謚櫁いB・・pec-save 蛛ｴ縺ｧ APPEND fallback 蜈ｬ蠑丞喧・峨・荳肴治逕ｨ縲∵・遉ｺ逧・spec-append 隨ｬ荳邏・operation 繧呈治逕ｨ縲・
荳ｻ隕√↑螟画峩蟇ｾ雎｡縺ｯ REQ-008 縺ｨ5縺､縺ｮ SPEC・・gentdev-req-file-manager.md, artifact-contracts.md, req-define.md, spec-save.md, agentdev-spec-file-manager.md・峨Ｔcale: large縲・pic 讒区・繧呈耳螂ｨ縲・
蠕檎ｶ壹さ繝槭Φ繝峨・ req-save・・EQ-008 update + ADR null・俄・ spec-save・・ SPEC 蜷梧悄譖ｴ譁ｰ・俄・ case-open・・pic 讒区・・俄・ case-run・亥ｮ溯｣・ｩｳ邏ｰ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ蜿ら・・峨ｒ諠ｳ螳壹・
