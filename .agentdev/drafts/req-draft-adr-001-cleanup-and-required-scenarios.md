---
draft_type: req_draft
topic_slug: adr-001-cleanup-and-required-scenarios
status: saved
created_at: 2026-07-27T00:00:00+09:00
source_rus:
  - RU-0007
agentdev_handoff: true
---

<!-- 譛ｬ繝峨Λ繝輔ヨ縺ｯ AgentDevFlow 譛ｬ菴薙・荳榊・蜷医・謾ｹ蝟・せ繧呈桶縺・燕蟾･遞句ｼ輔″邯吶℃繝峨Λ繝輔ヨ縺ｧ縺ゅｋ・・gentdev_handoff: true・峨・-->

# draft-data

```yaml
work_type: maintenance

scale: large

summary: |
  RU-0007・・DR-001 cleanup・峨ｒ蜃ｦ逅・☆繧九・101 `WS-9` 縺ｨ L102 `譯・` 縺ｯ髱樊э蜻ｳ菫ｮ豁｣・育ｧｻ陦梧凾繝ｩ繝吶Ν髯､蜴ｻ・峨→縺励※
  accepted ADR 逶ｴ謗･邱ｨ髮・〒蟇ｾ蠢懊☆繧九・114 `10繧ｷ繝翫Μ繧ｪ` 縺ｯ莉｣譖ｿ譁・郡PEC縺悟ｮ夂ｾｩ縺吶ｋ10莉ｶ縺ｮ蠢・医す繝翫Μ繧ｪ繧偵☆縺ｹ縺ｦ騾夐℃縺吶ｋ縲阪ｒ
  驕ｩ逕ｨ縺吶ｋ縺溘ａ縲・0莉ｶ縺ｮ蠢・医す繝翫Μ繧ｪ繧貞・謖吶☆繧区ｭ｣隕輯PEC・・ocs/specs/quality/quality-specs.md 縺ｮ譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ・峨ｒ謨ｴ蛯吶☆繧九・  10繧ｷ繝翫Μ繧ｪ縺ｮ荳ｭ霄ｫ縺ｯ case-run 蟾･遞九〒遒ｺ螳壹☆繧九′縲∵棧邨・∩・医そ繧ｯ繧ｷ繝ｧ繝ｳ隕句・縺励→蜿ら・髢｢菫ゑｼ峨ｒ譛ｬ繝峨Λ繝輔ヨ縺ｧ螳夂ｾｩ縺吶ｋ縲・  accepted ADR 逶ｴ謗･邱ｨ髮・燕縺ｫ譏守､ｺ謇ｿ隱崎ｨ倬鹸繧呈ｮ九☆・・EQ-001-059縲∝ｪ剃ｽ薙・髱櫁ｦ丞ｮ夲ｼ峨・  譁ｰ隕・ADR 荳崎ｦ・ｼ・gentdev-adr-file-manager 縺ｮ accepted ADR 逶ｴ謗･邱ｨ髮・メ繧ｧ繝・け繝ｪ繧ｹ繝医↓蠕薙≧・峨・
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      RU-0007: docs/adr/ADR-001.md L101 縺ｮ `WS-9 縺ｧ蟇ｾ蠢彖 繧貞炎髯､縺吶ｋ・磯撼諢丞袖菫ｮ豁｣縲∫ｧｻ陦梧凾繝ｩ繝吶Ν髯､蜴ｻ・峨・      豎ｺ螳壼・螳ｹ縲鍬ocal backend 繧貞ｿ・育ｯ・峇縺ｫ邯ｭ謖√ゆｻ墓ｧ倥・譛蟆丞･醍ｴ・∈邵ｮ蟆上阪・荳榊､峨・      REQ-001-057縲檎ｧｻ陦梧凾繝ｩ繝吶Ν髯､蜴ｻ縲阪↓隧ｲ蠖薙Ｂccepted ADR 逶ｴ謗･邱ｨ髮・庄縲・  - id: AG-002
    content: |
      RU-0007: docs/adr/ADR-001.md L102 縺ｮ `譯・・域価隱肴ｸ・change brief・荏 縺九ｉ譯育分蜿ｷ `譯・` 縺ｮ縺ｿ繧貞炎髯､縺吶ｋ
      ・磯撼諢丞袖菫ｮ豁｣縲∫ｧｻ陦梧凾繝ｩ繝吶Ν髯､蜴ｻ・峨よｱｺ螳壼・螳ｹ縲梧価隱肴ｸ・change brief 縺ｸ邵ｮ蟆上阪・荳榊､峨・      REQ-001-057縲檎ｧｻ陦梧凾繝ｩ繝吶Ν髯､蜴ｻ縲阪↓隧ｲ蠖薙Ｂccepted ADR 逶ｴ謗･邱ｨ髮・庄縲・  - id: AG-003
    content: |
      RU-0007: docs/specs/quality/quality-specs.md 縺ｸ譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ縲悟ｿ・医す繝翫Μ繧ｪ・・0繧ｷ繝翫Μ繧ｪ・峨阪ｒ霑ｽ蜉縺吶ｋ縲・      10繧ｷ繝翫Μ繧ｪ縺ｮ荳ｭ霄ｫ・亥句挨繧ｷ繝翫Μ繧ｪ蜷阪∝粋譬ｼ蝓ｺ貅悶・未騾｣ SPEC/REQ 縺ｸ縺ｮ蜿ら・・峨・ case-run 蟾･遞九〒遒ｺ螳壹☆繧九′縲・      譛ｬ繝峨Λ繝輔ヨ縺ｧ縺ｯ譫邨・∩・医そ繧ｯ繧ｷ繝ｧ繝ｳ隕句・縺励→ ADR-001 L114 縺九ｉ縺ｮ蜿ら・髢｢菫ゑｼ峨ｒ螳夂ｾｩ縺吶ｋ縲・      10繧ｷ繝翫Μ繧ｪ縺ｯ charter.md 縺ｮ蝓ｺ譛ｬ繝輔Ο繝ｼ縲、DR-001 豎ｺ螳・ 縺ｮ繝ｪ繝ｪ繝ｼ繧ｹ譚｡莉ｶ縺ｫ髢｢騾｣縺吶ｋ繧ｷ繝翫Μ繧ｪ縺九ｉ謚ｽ蜃ｺ縺吶ｋ縲・  - id: AG-004
    content: |
      RU-0007: docs/adr/ADR-001.md L114 縺ｮ `4. 蠢・医す繝翫Μ繧ｪ・・0繧ｷ繝翫Μ繧ｪ・峨′騾壹ｋ` 繧・      `4. SPEC縺悟ｮ夂ｾｩ縺吶ｋ10莉ｶ縺ｮ蠢・医す繝翫Μ繧ｪ繧偵☆縺ｹ縺ｦ騾夐℃縺吶ｋ` 縺ｸ螟画峩縺吶ｋ・磯撼諢丞袖菫ｮ豁｣縲∬｣懷勧諠・ｱ菫ｮ豁｣・峨・      莉ｶ謨ｰ縲・0莉ｶ縲阪→蠢・＃諤ｧ縺ｯ邯ｭ謖√＠縲√す繝翫Μ繧ｪ螳夂ｾｩ縺ｮ蜿ら・蜈茨ｼ・ocs/specs/quality/quality-specs.md・峨ｒ陬懆ｶｳ縺吶ｋ螟画峩縲・      REQ-001-057縲瑚｣懷勧諠・ｱ菫ｮ豁｣縲阪↓隧ｲ蠖薙Ｂccepted ADR 逶ｴ謗･邱ｨ髮・庄縲・      窶ｻ 10莉ｶ縺ｮ繧ｷ繝翫Μ繧ｪ荳隕ｧ縺・docs/specs/quality/quality-specs.md 縺ｫ謨ｴ蛯吶＆繧後※縺・ｋ縺薙→繧貞燕謠舌→縺吶ｋ・・G-003・峨・  - id: AG-005
    content: |
      RU-0007: accepted ADR 逶ｴ謗･邱ｨ髮・燕縺ｫ譏守､ｺ謇ｿ隱崎ｨ倬鹸繧呈ｮ九☆・・EQ-001-059・峨・      蟇ｾ雎｡螟画峩・・101/L102 縺ｮ繝ｩ繝吶Ν髯､蜴ｻ縲´114 縺ｮ蜿ら・蜈郁｣懆ｶｳ・峨↓蟇ｾ縺吶ｋ譏守､ｺ謇ｿ隱阪ｒ隱ｭ縺ｿ蜿悶ｌ繧九％縺ｨ縲・      菫晏ｭ伜ｪ剃ｽ薙・ REQ-001-059 縺ｧ髱櫁ｦ丞ｮ夲ｼ・ssue縲￣R縲√◎縺ｮ莉悶・蟐剃ｽ薙ｒ蝠上ｏ縺ｪ縺・ｼ峨・
artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-append
    target_spec:
      operation: update
      domain: quality
      slug: quality-specs
    target_area: "## 蠢・医す繝翫Μ繧ｪ・・0繧ｷ繝翫Μ繧ｪ・・
    source_items: [AG-003]
    spec_logical_division: catalog
    canonical_owner: quality-specs
    content: |
      ## 蠢・医す繝翫Μ繧ｪ・・0繧ｷ繝翫Μ繧ｪ・・
      ADR-001 豎ｺ螳・ 縺ｮ繝ｪ繝ｪ繝ｼ繧ｹ譚｡莉ｶ縲悟ｿ・医す繝翫Μ繧ｪ・・0繧ｷ繝翫Μ繧ｪ・峨′騾壹ｋ縲阪′蜿ら・縺吶ｋ10繧ｷ繝翫Μ繧ｪ縺ｮ豁｣隕丈ｸ隕ｧ繧呈園譛峨☆繧九・      繧ｷ繝翫Μ繧ｪ螳夂ｾｩ縺ｯ譛ｬ SPEC 縺梧園譛峨＠縲∝ｮ溯｡檎ｵ先棡縺ｯ Release Report 縺梧園譛峨☆繧具ｼ・gentdev-adr-guidelines縲悟盾辣ｧ蜈域・遒ｺ蛹悶搾ｼ峨・
      ### 10繧ｷ繝翫Μ繧ｪ荳隕ｧ

      ・遺ｻ case-run 蟾･遞九〒遒ｺ螳壹Ｄharter.md 縺ｮ蝓ｺ譛ｬ繝輔Ο繝ｼ縲、DR-001 豎ｺ螳・ 縺ｮ繝ｪ繝ｪ繝ｼ繧ｹ譚｡莉ｶ縺ｫ髢｢騾｣縺吶ｋ繧ｷ繝翫Μ繧ｪ縺九ｉ謚ｽ蜃ｺ縲・
      1. ・医す繝翫Μ繧ｪ1: 蜷咲ｧｰ縲∝粋譬ｼ蝓ｺ貅悶・未騾｣ REQ/SPEC・・      2. ・医す繝翫Μ繧ｪ2: ...・・      ...
      10. ・医す繝翫Μ繧ｪ10: ...・・
      ### ADR-001 L114 縺ｨ縺ｮ蜿ら・髢｢菫・
      ADR-001 豎ｺ螳・ 譚｡莉ｶ4縲郡PEC縺悟ｮ夂ｾｩ縺吶ｋ10莉ｶ縺ｮ蠢・医す繝翫Μ繧ｪ繧偵☆縺ｹ縺ｦ騾夐℃縺吶ｋ縲阪・譛ｬ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ繧呈ｭ｣隕丞盾辣ｧ蜈医→縺吶ｋ縲・  - id: ACT-ADR-001
    artifact: adr
    operation: update
    target: docs/adr/ADR-001.md
    source_items: [AG-001, AG-002, AG-004, AG-005]
    content: |
      docs/adr/ADR-001.md 縺ｮ3邂・園繧貞､画峩縺吶ｋ・磯撼諢丞袖菫ｮ豁｣縲∥ccepted ADR 逶ｴ謗･邱ｨ髮・ｼ・

      ### L101 縺ｮ螟画峩

      螟画峩蜑・
      | Local backend | 蠢・育ｯ・峇縺ｫ邯ｭ謖√ゆｻ墓ｧ倥・譛蟆丞･醍ｴ・∈邵ｮ蟆擾ｼ・S-9 縺ｧ蟇ｾ蠢懶ｼ・|

      螟画峩蠕・
      | Local backend | 蠢・育ｯ・峇縺ｫ邯ｭ謖√ゆｻ墓ｧ倥・譛蟆丞･醍ｴ・∈邵ｮ蟆・|

      譬ｹ諡: `WS-9` 縺ｯ遘ｻ陦梧凾縺ｮ菴懈･ｭ隴伜挨蟄舌〒縺ゅｊ縲∵ｱｺ螳壼・螳ｹ繧貞､峨∴縺ｪ縺・ｼ・EQ-001-057 遘ｻ陦梧凾繝ｩ繝吶Ν髯､蜴ｻ・峨・
      ### L102 縺ｮ螟画峩

      螟画峩蜑・
      | draft 蠖｢蠑・| 譯・・域価隱肴ｸ・change brief・峨∈邵ｮ蟆上りｩｳ邏ｰ縺ｯ蛻･騾・REQ 縺ｧ螳夂ｾｩ |

      螟画峩蠕・
      | draft 蠖｢蠑・| 謇ｿ隱肴ｸ・change brief 縺ｸ邵ｮ蟆上りｩｳ邏ｰ縺ｯ蛻･騾・REQ 縺ｧ螳夂ｾｩ |

      譬ｹ諡: `譯・` 縺ｯ讀懆ｨ朱℃遞九・隴伜挨蟄舌〒縺ゅｊ縲∵ｱｺ螳壼・螳ｹ繧貞､峨∴縺ｪ縺・ｼ・EQ-001-057 遘ｻ陦梧凾繝ｩ繝吶Ν髯､蜴ｻ縲∵｡育分蜿ｷ縺ｮ縺ｿ髯､蜴ｻ・峨・
      ### L114 縺ｮ螟画峩

      螟画峩蜑・
      4. 蠢・医す繝翫Μ繧ｪ・・0繧ｷ繝翫Μ繧ｪ・峨′騾壹ｋ

      螟画峩蠕・
      4. SPEC縺悟ｮ夂ｾｩ縺吶ｋ10莉ｶ縺ｮ蠢・医す繝翫Μ繧ｪ繧偵☆縺ｹ縺ｦ騾夐℃縺吶ｋ

      譬ｹ諡: 莉ｶ謨ｰ縲・0莉ｶ縲阪→蠢・＃諤ｧ縺ｯ邯ｭ謖√＠縲√す繝翫Μ繧ｪ螳夂ｾｩ縺ｮ謇譛牙・・・ocs/specs/quality/quality-specs.md縲悟ｿ・医す繝翫Μ繧ｪ・・0繧ｷ繝翫Μ繧ｪ・峨阪そ繧ｯ繧ｷ繝ｧ繝ｳ・・      繧定｣懆ｶｳ縺吶ｋ螟画峩・・EQ-001-057 陬懷勧諠・ｱ菫ｮ豁｣・峨・
      ### accepted ADR 逶ｴ謗･邱ｨ髮・メ繧ｧ繝・け繝ｪ繧ｹ繝茨ｼ・gentdev-adr-file-manager・・
      譛ｬ螟画峩縺ｯ agentdev-adr-file-manager skill 縺ｮ accepted ADR 逶ｴ謗･邱ｨ髮・メ繧ｧ繝・け繝ｪ繧ｹ繝医↓蠕薙≧:
      - 髱樊э蜻ｳ菫ｮ豁｣6莉ｶ・・EQ-001-057・峨・縺・★繧後°縺ｫ隧ｲ蠖・ L101/L102 縺ｯ縲檎ｧｻ陦梧凾繝ｩ繝吶Ν髯､蜴ｻ縲阪´114 縺ｯ縲瑚｣懷勧諠・ｱ菫ｮ豁｣縲・      - 諢丞袖螟画峩6莉ｶ・・EQ-001-058・峨・縺・★繧後↓繧りｩｲ蠖薙＠縺ｪ縺・      - 逶ｴ謗･譖ｴ譁ｰ蜑阪↓譏守､ｺ謇ｿ隱崎ｨ倬鹸縺悟ｭ伜惠縺吶ｋ・・EQ-001-059・・      - 驕主悉迚医ｒ辟｡險縺ｧ譖ｸ縺肴鋤縺医↑縺・ｼ・EQ-001-060・・
conflict_resolutions:
  - id: CR-001
    conflict: L114 `10繧ｷ繝翫Μ繧ｪ` 縺ｮ諢丞袖螟画峩 vs 髱樊э蜻ｳ菫ｮ豁｣蛻､螳・    resolution: |
      L114 縺ｮ縲悟ｿ・医す繝翫Μ繧ｪ謨ｰ・・0・峨阪ｒ SPEC 蛛ｴ縺ｧ螟画峩蜿ｯ閭ｽ縺ｪ蜍慕噪譚｡莉ｶ・医郡PEC 縺悟ｮ夂ｾｩ縺吶ｋ蠢・医す繝翫Μ繧ｪ謨ｰ縲搾ｼ峨∈螟画峩縺吶ｋ蝣ｴ蜷医・
      蠢・域擅莉ｶ/蛻ｶ邏・､画峩・・EQ-001-058・・諢丞袖螟画峩縺ｧ蠕檎ｶ・ADR 縺悟ｿ・ｦ√・      縺励°縺玲悽繝峨Λ繝輔ヨ縺ｧ縺ｯ莉ｶ謨ｰ縲・0莉ｶ縲阪→蠢・＃諤ｧ繧堤ｶｭ謖√＠縲√す繝翫Μ繧ｪ螳夂ｾｩ縺ｮ謇譛牙・繧定｣懆ｶｳ縺吶ｋ縺ｮ縺ｿ・・EQ-001-057 陬懷勧諠・ｱ菫ｮ豁｣・峨・縺溘ａ髱樊э蜻ｳ菫ｮ豁｣縲・      deep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ・医Ξ繝ｼ繝ｳ1 逶ｮ逧・・蛻ｶ邏・√Ξ繝ｼ繝ｳ3 邨ｱ蛻ｶ繝ｻ繧ｬ繝舌リ繝ｳ繧ｹ CG-02/03・峨〒遒ｺ隱肴ｸ医∩縲・  - id: CR-002
    conflict: 10繧ｷ繝翫Μ繧ｪ荳隕ｧ縺ｮ謨ｴ蛯吝ｴ謇
    resolution: |
      docs/specs/quality/quality-specs.md 縺ｮ譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ縲悟ｿ・医す繝翫Μ繧ｪ・・0繧ｷ繝翫Μ繧ｪ・峨阪→縺吶ｋ縲・      逅・罰: 蜩∬ｳｪ蝓ｺ貅悶ｒ謇譛峨☆繧・SPEC 縺ｧ縺ゅｊ縲√す繝翫Μ繧ｪ蜷域ｼ蝓ｺ貅悶→縺ｮ隕ｪ蜥梧ｧ縺碁ｫ倥＞縺溘ａ縲・      10繧ｷ繝翫Μ繧ｪ縺ｮ荳ｭ霄ｫ縺ｯ case-run 蟾･遞九〒遒ｺ螳夲ｼ・harter.md 縺ｮ蝓ｺ譛ｬ繝輔Ο繝ｼ縲、DR-001 豎ｺ螳・ 縺ｮ繝ｪ繝ｪ繝ｼ繧ｹ譚｡莉ｶ髢｢騾｣縺九ｉ謚ｽ蜃ｺ・峨・  - id: CR-003
    conflict: 謇ｿ隱崎ｨ倬鹸縺ｮ菫晏ｭ伜ｪ剃ｽ難ｼ・ase-run Issue/PR 縺九√◎縺ｮ莉悶°・・    resolution: |
      REQ-001-059 縺ｯ莠句燕縺ｮ譏守､ｺ謇ｿ隱崎ｨ倬鹸縺ｮ蟄伜惠繧定ｦ∵ｱゅ☆繧九′縲∽ｿ晏ｭ伜ｪ剃ｽ薙・髱櫁ｦ丞ｮ壹・      縲栗ssue縺ｾ縺溘・PR縺ｸ縺ｮ謇ｿ隱崎ｨ倬鹸縺ｯ險ｱ螳ｹ縺輔ｌ繧九阪→縺・≧謗ｨ隲悶ｒ驕ｿ縺代√悟ｪ剃ｽ薙・髱櫁ｦ丞ｮ壹∝ｯｾ雎｡螟画峩縺ｫ蟇ｾ縺吶ｋ譏守､ｺ謇ｿ隱阪ｒ隱ｭ縺ｿ蜿悶ｌ繧九％縺ｨ縲阪→縺吶ｋ縲・      deep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ・医Ξ繝ｼ繝ｳ5 險ｼ諡繝ｻ讀懆ｨｼ蜿ｯ閭ｽ諤ｧ EV-03・峨〒遒ｺ隱肴ｸ医∩縲・  - id: CR-004
    conflict: ADR 隕∝凄
    resolution: |
      譁ｰ隕・ADR 荳崎ｦ√Ｂccepted ADR 逶ｴ謗･邱ｨ髮・〒蟇ｾ蠢懶ｼ・gentdev-adr-file-manager 縺ｮ繝√ぉ繝・け繝ｪ繧ｹ繝医↓蠕薙≧・峨・      deep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ・医Ξ繝ｼ繝ｳ3 邨ｱ蛻ｶ繝ｻ繧ｬ繝舌リ繝ｳ繧ｹ・峨〒遒ｺ隱肴ｸ医∩縲・
operation_units:
  - ou_id: OU-001
    source_ru: RU-0007
    target_spec: docs/specs/quality/quality-specs.md
    operation: spec-append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0007
    target_req: ADR-001
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/adr/ADR-001.md L101 縺九ｉ `WS-9` 縺悟炎髯､縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      豎ｺ螳壼・螳ｹ縲鍬ocal backend 繧貞ｿ・育ｯ・峇縺ｫ邯ｭ謖√ゆｻ墓ｧ倥・譛蟆丞･醍ｴ・∈邵ｮ蟆上阪′邯ｭ謖√＆繧後※縺・ｋ縺薙→縲・    pass_criteria: |
      L101 縺ｫ `WS-9` 縺悟ｭ伜惠縺帙★縲∵ｱｺ螳壼・螳ｹ譛ｬ譁・′邯ｭ謖√＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-002
    target_item: AG-002
    verification: |
      docs/adr/ADR-001.md L102 縺九ｉ譯育分蜿ｷ `譯・` 縺悟炎髯､縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      豎ｺ螳壼・螳ｹ縲梧価隱肴ｸ・change brief 縺ｸ邵ｮ蟆上阪′邯ｭ謖√＆繧後※縺・ｋ縺薙→縲・    pass_criteria: |
      L102 縺ｫ `譯・` 縺悟ｭ伜惠縺帙★縲∵ｱｺ螳壼・螳ｹ譛ｬ譁・′邯ｭ謖√＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-003
    target_item: AG-003
    verification: |
      docs/specs/quality/quality-specs.md 縺ｫ譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ縲悟ｿ・医す繝翫Μ繧ｪ・・0繧ｷ繝翫Μ繧ｪ・峨阪′霑ｽ蜉縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ蜀・↓10繧ｷ繝翫Μ繧ｪ縺ｮ譫邨・∩・医す繝翫Μ繧ｪ1縲・0・峨′螳夂ｾｩ縺輔ｌ縺ｦ縺・ｋ縺薙→縲・      荳ｭ霄ｫ・医す繝翫Μ繧ｪ蜷阪∝粋譬ｼ蝓ｺ貅悶・未騾｣ REQ/SPEC・峨・ case-run 蟾･遞九〒遒ｺ螳壹☆繧九◆繧√∵悽讀懆ｨｼ譎らせ縺ｧ縺ｯ譫邨・∩縺ｮ縺ｿ縺ｧ繧医＞縲・    pass_criteria: |
      docs/specs/quality/quality-specs.md 縺ｫ縲悟ｿ・医す繝翫Μ繧ｪ・・0繧ｷ繝翫Μ繧ｪ・峨阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺ｨ10繧ｷ繝翫Μ繧ｪ縺ｮ譫邨・∩縺悟ｭ伜惠縺吶ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-004
    target_item: AG-004
    verification: |
      docs/adr/ADR-001.md L114 縺・`SPEC縺悟ｮ夂ｾｩ縺吶ｋ10莉ｶ縺ｮ蠢・医す繝翫Μ繧ｪ繧偵☆縺ｹ縺ｦ騾夐℃縺吶ｋ` 縺ｸ螟画峩縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      莉ｶ謨ｰ縲・0莉ｶ縲阪→蠢・＃諤ｧ縲後☆縺ｹ縺ｦ騾夐℃縺吶ｋ縲阪′邯ｭ謖√＆繧後※縺・ｋ縺薙→縲・      docs/specs/quality/quality-specs.md縲悟ｿ・医す繝翫Μ繧ｪ・・0繧ｷ繝翫Μ繧ｪ・峨阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺ｸ縺ｮ蜿ら・髢｢菫ゅ′謌千ｫ九＠縺ｦ縺・ｋ縺薙→縲・    pass_criteria: |
      L114 縺ｫ螟画峩蠕後・譁・擇縺悟ｭ伜惠縺励∽ｻｶ謨ｰ縺ｨ蠢・＃諤ｧ縺檎ｶｭ謖√＆繧後〈uality-specs.md 縺ｮ隧ｲ蠖薙そ繧ｯ繧ｷ繝ｧ繝ｳ縺悟ｮ溷惠縺吶ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-005
    target_item: AG-005
    verification: |
      accepted ADR 逶ｴ謗･邱ｨ髮・燕縺ｫ譏守､ｺ謇ｿ隱崎ｨ倬鹸縺梧ｮ九＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      蟇ｾ雎｡螟画峩・・101/L102/L114・峨↓蟇ｾ縺吶ｋ譏守､ｺ謇ｿ隱阪ｒ隱ｭ縺ｿ蜿悶ｌ繧九％縺ｨ縲・      菫晏ｭ伜ｪ剃ｽ薙・髱櫁ｦ丞ｮ夲ｼ・EQ-001-059・峨・    pass_criteria: |
      L101/L102/L114 縺ｮ蜷・､画峩縺ｫ蟇ｾ縺吶ｋ譏守､ｺ謇ｿ隱崎ｨ倬鹸縺悟ｭ伜惠縺励∝ｯｾ雎｡螟画峩縺ｨ謇ｿ隱榊・螳ｹ縺瑚ｪｭ縺ｿ蜿悶ｌ繧九％縺ｨ縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨よ・遉ｺ謇ｿ隱崎ｨ倬鹸縺悟ｭ伜惠縺励↑縺・ｴ蜷医・霑ｽ蜉縺励※蜀肴､懆ｨｼ縲・
review_dispositions:
  - id: RD-001
    source_ru: RU-0007
    source_item: RU-0007-Sources-adr-001-cleanup
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0007 縺ｮ Source Summary 縺梧欠鞫倥☆繧九径ccepted ADR-001 縺ｮ遘ｻ陦梧凾隴伜挨蟄先ｮ句ｭ倥→ L114 縺ｮ譖匁乂縺輔阪・
      AG-001縲廣G-005 縺ｧ螳悟・縺ｫ邨ｱ蜷医＆繧後◆縲・101/L102 縺ｮ繝ｩ繝吶Ν髯､蜴ｻ縲´114 縺ｮ蜿ら・蜈域・遒ｺ蛹悶・0繧ｷ繝翫Μ繧ｪ荳隕ｧ謨ｴ蛯吶・      謇ｿ隱崎ｨ倬鹸隕∽ｻｶ繧貞・縺ｦ蜿肴丐縲・    evidence:
      path: .agentdev/backlog/req-units/RU-0007.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: |
    scale: large・・0繧ｷ繝翫Μ繧ｪ荳隕ｧ謨ｴ蛯・+ ADR-001 逶ｴ謗･邱ｨ髮・+ 謇ｿ隱崎ｨ倬鹸・峨□縺後∝腰荳 Issue 縺ｧ螳檎ｵ舌☆繧九・    OU-001・・uality-specs.md 譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ・俄・ OU-002・・DR-001 逶ｴ謗･邱ｨ髮・ｼ峨・鬆・〒螳滓命縲・    10繧ｷ繝翫Μ繧ｪ縺ｮ荳ｭ霄ｫ遒ｺ螳壹・ case-run 蟾･遞九〒螳滓命縲・  wave_hints:
    - wave: 1
      units: [OU-001, OU-002]
      rationale: 蜊倅ｸ Issue 蜀・〒鬆・ｬ｡螳溯｡後・```

# implementation_details

譛ｬ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｯ case-run 蟾･遞九〒螳滓命縺吶ｋ螳溯｣・ｩｳ邏ｰ・・tep 10-1 繧ｬ繧､繝峨Λ繧､繝ｳ縺ｫ蝓ｺ縺･縺丞・髮｢・峨・
## 10繧ｷ繝翫Μ繧ｪ縺ｮ荳ｭ霄ｫ遒ｺ螳・
- charter.md 縺ｮ蝓ｺ譛ｬ繝輔Ο繝ｼ縲、DR-001 豎ｺ螳・ 縺ｮ繝ｪ繝ｪ繝ｼ繧ｹ譚｡莉ｶ縺ｫ髢｢騾｣縺吶ｋ繧ｷ繝翫Μ繧ｪ縺九ｉ10莉ｶ繧呈歓蜃ｺ
- 蜷・す繝翫Μ繧ｪ縺ｫ縲悟錐遘ｰ縲∝粋譬ｼ蝓ｺ貅悶・未騾｣ REQ/SPEC縲阪ｒ螳夂ｾｩ
- docs/specs/quality/quality-specs.md縲悟ｿ・医す繝翫Μ繧ｪ・・0繧ｷ繝翫Μ繧ｪ・峨阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺ｸ險倩ｼ・- ADR-001 L114 縺九ｉ縺ｮ蜿ら・髢｢菫ゅｒ遒ｺ隱・
## 譏守､ｺ謇ｿ隱崎ｨ倬鹸

- accepted ADR 逶ｴ謗･邱ｨ髮・燕縺ｫ縲∝ｯｾ雎｡螟画峩・・101/L102/L114・峨↓蟇ｾ縺吶ｋ譏守､ｺ謇ｿ隱阪ｒ險倬鹸
- 蟐剃ｽ薙・髱櫁ｦ丞ｮ夲ｼ・EQ-001-059・峨・ssue縲￣R縲√∪縺溘・縺昴・莉悶・蟐剃ｽ薙〒縲∝ｯｾ雎｡螟画峩縺ｨ謇ｿ隱榊・螳ｹ縺瑚ｪｭ縺ｿ蜿悶ｌ繧九％縺ｨ
- agentdev-adr-file-manager skill 縺ｮ accepted ADR 逶ｴ謗･邱ｨ髮・メ繧ｧ繝・け繝ｪ繧ｹ繝医↓蠕薙≧

## 螳溯｣・せ繧ｳ繝ｼ繝励∈縺ｮ豕ｨ諢・
螳溯｣・ｩｳ邏ｰ縺ｯ譛ｬ繝峨Λ繝輔ヨ縺ｮ隕∽ｻｶ螳夂ｾｩ譛ｬ菴薙〒縺ｯ縺ｪ縺上…ase-run 蟾･遞九〒縺ｮ蜿ら・諠・ｱ縺ｧ縺ゅｋ縲・隕∽ｻｶ螳夂ｾｩ縺ｨ縺励※縺ｮ蜴滓悽縺ｯ荳願ｨ・`# draft-data` YAML 繝悶Ο繝・け縲・
# summary

譛ｬ繝峨Λ繝輔ヨ縺ｯ RU-0007・・DR-001 cleanup + 10繧ｷ繝翫Μ繧ｪ荳隕ｧ謨ｴ蛯呻ｼ峨ｒ蜃ｦ逅・☆繧玖ｦ∽ｻｶ螳夂ｾｩ縺ｧ縺ゅｋ縲・gentDevFlow 譛ｬ菴薙・謾ｹ蝟・ｼ・gentdev_handoff: true・峨・
deep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ縺ｧ遒ｺ螳壹＠縺溯ｨｭ險亥愛譁ｭ1繧貞・髱｢逧・↓蜿肴丐縲・101/L102 縺ｯ髱樊э蜻ｳ菫ｮ豁｣・育ｧｻ陦梧凾繝ｩ繝吶Ν髯､蜴ｻ・峨´114 縺ｯ髱樊э蜻ｳ菫ｮ豁｣・郁｣懷勧諠・ｱ菫ｮ豁｣・峨→縺励※ accepted ADR 逶ｴ謗･邱ｨ髮・〒蟇ｾ蠢懊・0繧ｷ繝翫Μ繧ｪ荳隕ｧ縺ｯ docs/specs/quality/quality-specs.md 縺ｮ譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ縺ｨ縺励※謨ｴ蛯吶・
荳ｻ隕√↑螟画峩蟇ｾ雎｡縺ｯ ADR-001 縺ｨ docs/specs/quality/quality-specs.md縲Ｔcale: large・・0繧ｷ繝翫Μ繧ｪ縺ｮ荳ｭ霄ｫ遒ｺ螳壹↓隱ｿ譟ｻ縺悟ｿ・ｦ√↑縺溘ａ・峨・
蠕檎ｶ壹さ繝槭Φ繝峨・ spec-save・・uality-specs.md 譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ霑ｽ蜉・俄・ req-save・・DR-001 逶ｴ謗･邱ｨ髮・ヽEQ/ADR 繝輔ぃ繧､繝ｫ縺ｨ縺励※菫晏ｭ倥∵眠隕・ADR 縺ｪ縺暦ｼ俄・ case-open 竊・case-run・・0繧ｷ繝翫Μ繧ｪ荳ｭ霄ｫ遒ｺ螳壹∵・遉ｺ謇ｿ隱崎ｨ倬鹸・峨ｒ諠ｳ螳壹・
