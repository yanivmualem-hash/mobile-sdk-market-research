# Rise — Market Research Memory
> Persistent log of competitive intelligence, market insights, and strategic context.
> Updated: June 29, 2026

---

## Context: Who We Are

**Company:** Rise
**Goal:** Become the best programmatic bidder for **in-app brand and performance ads**
**Role of this file:** Running memory across market research sessions — past and future.

---

## Session 1 — June 29, 2026
### In-App AdTech Competitive Landscape

---

### Market Backdrop

- Global programmatic ad spend heading toward $84B+; 65%+ of all ad budgets now spent programmatically
- In-app programmatic is a key growth channel — 90%+ of US digital display spend is programmatic
- Mobile app consumer spend hit $150B globally in 2024 (+13% YOY); time in apps grew 5.8% YOY
- AdTech market CAGR: **14.4%** (2025–2030, Grand View Research)
- Post-ATT and post-cookie environment has reshuffled targeting: ID-less, contextual, and first-party signals now the battleground
- Open exchange CPMs under pressure; curation, SPO, and private marketplaces gaining share
- AI is entering every layer: bidding optimization, creative generation, autonomous campaign management

---

### Competitors Analyzed

#### 1. Ogury
- **Positioning:** Premium brand advertising; privacy-first; mobile-native
- **Revenue:** ~$170M (2025); ~62% gross margin; positive EBITDA
- **Identity:** "Personified Advertising" — targets aggregated personas, not individuals
- **Targeting approach:** Zero-party data (large-scale surveys) + contextual/semantic signals + AI, fully ID-less
- **SDK:** Proprietary publisher SDK + header bidding solution; 10,000+ manually vetted premium apps; OM SDK certified
- **Formats:** Fully On-Screen video (~65% of revenue), Header Ad, Thumbnail Ad, Video Chooser
- **Key metrics:** 98% viewability, CPM premiums 25–45% above open exchange, 1.8% aggregate CTR (FY2025), 85%+ top-tier client retention
- **Geo mix:** Europe ~45%, North America ~40%
- **Platform:** Ogury One (launched April 2025, built on AWS/Bedrock) — AI-powered persona planning for agencies
- **Key partnerships:** The Trade Desk (direct integration, Programmatic Guaranteed), Microsoft Monetize, AWS
- **Strategic direction:** 100% ID-less revenue by 2026; CTV expansion; IPO or strategic merger signaled for ~2027
- **Strengths:** Privacy moat survived IDFA disruption; decade of mobile journey data; viewability guarantee; brand-safe manual vetting
- **Weaknesses:** CPMs 20–40% above market may deter performance advertisers; 68% revenue tied to mobile display/video; limited omnichannel vs. rivals
- **Lesson for Rise:** Privacy-first narrative wins brand budgets. Viewability guarantees + ID-less targeting on top of programmatic scale = premium brand CPMs performance-only bidders leave on the table.

---

#### 2. PubMatic
- **Positioning:** Full-stack SSP evolving toward end-to-end programmatic platform; infrastructure leader
- **Revenue:** $62.6M Q1 2025 (+13% YOY); mobile app revenue +25% YOY
- **Scale:** ~75 trillion impressions processed Q1 2025 (+29% YOY); ~1,950 publishers globally
- **SDK:** OpenWrap SDK — open-source, header bidding, integrated with AppLovin MAX, Google AdMob, Unity LevelPlay = access to 90%+ of global mobile SDK inventory; revenue doubled YOY by Q3 2024
- **AI:** AgenticOS platform — 30+ fully autonomous end-to-end agentic campaigns; AI infrastructure owned (own servers, NVIDIA partnership); 5x faster bid response; 3-layer AI stack
- **SPO:** 55% of all platform activity (record Q1 2025)
- **Activate platform:** Direct buyer-to-publisher connection; bypasses DSPs for Programmatic Guaranteed video — now expanding to all media formats
- **Key partnerships:** GroupM strategic alliance; OpenAI advertising ecosystem exploration
- **Strengths:** Unmatched scale as training data; SDK gives inventory-level signal advantage before auction; moving buy-side via Activate; own-server AI = defensible moat
- **Weaknesses:** US revenue -12% YOY (Trade Desk OpenPath SPO headwind); SSP-to-buy-side tension with publishers; mobile is growing but still <15% of total revenue
- **Lesson for Rise:** SDK = supply lock-in moat. Open-source approach (OpenWrap) massively reduced adoption friction. Build SDK open/transparent to speed publisher relationships; differentiate on what sits on top (data, bidding logic, demand access).

---

#### 3. Digital Turbine
- **Positioning:** On-device app distribution + in-app programmatic exchange; Android/carrier specialist
- **Revenue:** FY2025 $490.5M; Q2 FY2026 $140.4M (+18% YOY); EBITDA improving
- **Two segments:**
  - On-Device Solutions (ODS): Ignite firmware platform — pre-loads on 300M+ devices/year; setup wizards; 1B+ exclusive device placements
  - App Growth Platform (AGP): programmatic exchange + user acquisition; impressions +30% YOY Q2 FY2026
- **SDK:** 82,000+ SDK-integrated apps; DT Exchange (OpenRTB); DT iQ AI engine; SingleTap frictionless installs
- **Carrier moat:** 200+ global carrier/OEM integrations; firmware-level data (usage patterns, device telemetry) = deterministic first-party signals; 20–30% higher engagement vs. generic networks
- **Key partnerships:** GroupM global preferred partner; Programmatic Guaranteed with top-3 DSP; ONE Store International (alt. app marketplace, acquired Oct 2024); TIM Brazil (Jan 2025); Alcatel India (June 2025)
- **Strengths:** Closed-loop ecosystem with device-level AI; lowest fraud exposure; Android/carrier first-party data advantage; DMA/alternative app store tailwinds
- **Weaknesses:** iOS structurally blocked; limited China presence; programmatic share single-digit vs. incumbents despite SDK breadth; complex multi-product story; volatile historical financials
- **Lesson for Rise:** Proprietary signal sources beat algo optimization alone. Carrier-level data is the kind of exclusive first-party signal Rise should seek equivalents of. DT's iOS gap is a structural opening Rise should exploit.

---

#### 4. MobileFuse
- **Positioning:** Premium in-app + CTV + DOOH; moments-based targeting; brand-safe exchange
- **Status:** Private company (exact revenue undisclosed)
- **Exchange:** MobileFuse Exchange (MFX) — direct-to-publisher; integrated with major DSPs (Amazon, TTD, others)
- **SDK:** Growing MobileFuse SDK; Fusion OutStream Video as growth format
- **Targeting:** Mindset Targeting™ — real-time signals: time of day, day of week, weather, events, behavioral patterns; patented location verification
- **Quality/Trust:** TAG Platinum certified exchange; Pixalate pre-bid fraud filtering; OM SDK; early GPP adopter; LiveRamp ATS + UID2.0
- **Tech:** AWS RTB Fabric early partner (reduced latency, improved supply path efficiency)
- **Differentiators:** CarbonNeutral® certified company; commerce media expansion; sustainability/ESG narrative resonates with brand CMOs
- **Strengths:** Mindset Targeting™ is genuinely differentiated; nimble private company (fastest to adopt new standards); AWS RTB Fabric = auction efficiency edge; strong sustainability brand position
- **Weaknesses:** Scale ceiling as private niche player; heavy managed-service reliance; limited self-serve for performance buyers; ESG positioning not primary purchasing criterion for performance advertisers
- **Lesson for Rise:** Mindset Targeting™ is a playbook for Rise. Don't just bid on audiences — bid on moments. Real-time contextual signals at auction time improve brand relevance without IDs and can be internalized as a bidding feature layer.

---

### SDK Strategy Summary

| Player | SDK Type | iOS | Approach |
|---|---|---|---|
| Ogury | Supply-side, curated | ✓ | Premium publisher SDK; manual vetting; quality gate |
| PubMatic | Open-source header bidding | ✓ | OpenWrap plugs into existing mediation stacks (MAX, AdMob, LevelPlay) |
| Digital Turbine | On-device firmware + 82K+ app SDK | ✗ (Android only) | Deepest carrier lock-in; unique device signals |
| MobileFuse | Supply-side, growing | ✓ | Publisher SDK with real-time contextual signals |

**Key SDK insight:** The SDK is not the product — the data and demand behind it is the product. All four derive SDK value from what sits on top: signal quality, demand access, targeting precision.

---

### Competitive Positioning Map (Qualitative)

```
                    BRAND-FOCUSED
                         |
          MobileFuse      |      Ogury
          (brand/direct)  |  (brand/exchange)
                          |
DIRECT -------- -------- Rise → -------- -------- EXCHANGE
                          |
          Dig.Turbine     |      PubMatic
          (perf/direct)   |  (perf/exchange)
                          |
                   PERFORMANCE-FOCUSED
```

**Rise opportunity:** No competitor credibly occupies the cross-quadrant position — programmatic efficiency for performance buyers combined with brand-quality signals (viewability, context, attention). This is Rise's target white space.

---

### Strategic Priorities for Rise (from Session 1)

1. **Win on bidding intelligence before building an SDK.** Best-in-class in-app bidding engine with signal-rich bid requests (app category, user behavior, viewability prediction, time/context) comes first. SDK follows once demand-side value is proven.

2. **Exploit the iOS gap Digital Turbine can't fill.** DT's carrier moat is entirely Android. A Rise strategy that works cleanly across iOS and Android — first-party data respecting ATT — is a structural opening none of the incumbents covers fully for performance advertisers.

3. **Blend brand and performance in one buying interface.** Own the cross-quadrant position: programmatic efficiency for performance buyers + brand-quality signals (viewability, context, attention) built into the bidder, not bolted on.

4. **If building an SDK, go open-source like PubMatic.** Plug into existing mediation stacks (AppLovin MAX, Google AdMob, Unity LevelPlay) rather than asking publishers to rip-and-replace. Differentiate on demand and data, not SDK exclusivity.

5. **Internalize Mindset Targeting as a bidding signal layer.** Real-time contextual signals (time, weather, app context, events) improve ROAS for performance buyers and brand lift for brand buyers simultaneously — without requiring IDs.

---

### Watch List / Open Questions

- [ ] How is PubMatic's Activate platform evolving beyond video? (Direct DSP threat to Rise)
- [ ] Ogury IPO/merger timeline — what happens to their SDK publisher relationships if acquired?
- [ ] Digital Turbine ONE Store International traction — does alternative app distribution change in-app inventory landscape?
- [ ] MobileFuse acquisition likelihood — they're the right size and profile for a strategic buy
- [ ] AppLovin vs. PubMatic OpenWrap SDK dynamics — MAX is both a competitor and a distribution channel
- [ ] Where does The Trade Desk's OpenPath go for in-app? Could it threaten Rise's supply access?

---

## Future Sessions
*(Append new research below this line with date headers)*

---
*File managed by Claude — update after each market research conversation.*
