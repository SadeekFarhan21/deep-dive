---
title: "Traversal"
pubDatetime: 2026-09-20T06:40:06.000Z
description: "Traversal builds an AI site-reliability engineer that finds the root cause of production incidents by running causal searches over a customer's telemetry. American Express is both a customer and an investor; a rival with three times the capital raised at $1B."
slug: traversal
company: "Traversal"
stage: "Series A"
sector: "Enterprise software"
tags:
  - enterprise-software
  - observability
  - agents
draft: true
category: ventures
---

## Overview

Traversal builds an agent that does the work of a site-reliability engineer during a production incident: figuring out what actually broke. It maintains a live map of the customer's systems, re-indexes their telemetry so it can run thousands of targeted queries in parallel, and searches causally through that data to identify the root cause, then proposes or applies the fix. It does not collect the telemetry itself — Datadog and its peers still do that — and it does not replace the observability stack. It sits on top of whatever the customer already runs and does the detective work a war room would otherwise do by hand.

| | |
| --- | --- |
| Founded | 2023 |
| Headquarters | New York |
| Founders | Anish Agarwal (CEO), Raaz Dwivedi, Raj Agrawal, Ahmed Lone |
| Stage | \$48M across seed and Series A, June 2025. Strategic investment from Amex Ventures, March 2026 |
| Disclosed investors | Sequoia, Kleiner Perkins, NFDG, Hanabi, Amex Ventures. Angels Nat Friedman and Mike Volpi |
| Employees | About 100, per PitchBook |
| Status | Named customers including American Express, PepsiCo, DigitalOcean. Revenue undisclosed |

## Thesis

Two things are true about production incidents at large companies, and the gap between them is the business. Enterprises already spend heavily on collecting operational data — observability is a mature, well-funded category — and they spend far more on the engineers who interpret it. At a Fortune 100 company, 50 to 100 engineers may join a war room for a single incident. The data is not the constraint. The reasoning over it is.

That gap is widening for a specific reason: AI writes a growing share of production code, so more changes reach production, written by systems with no memory of why the last outage happened, failing in ways that are unfamiliar to the people on call. The volume of incidents is rising while the number of engineers who deeply understand any given system is falling.

The structural argument for an independent company, rather than a feature of a monitoring vendor, is that large enterprises run several monitoring platforms at once and no vendor will reason over a competitor's data. A neutral agent is the only one that sees everything. The CEO makes this case directly in an [interview with SiliconANGLE](https://siliconangle.com/2026/03/04/exclusive-american-express-partners-invests-ai-operations-startup-traversal/): collecting data is solved, interpreting it is not.

The counter-argument is equally structural. The observability vendors own the buyer relationship, the data, and the renewal, and a good-enough bundled agent has historically been enough to end a standalone category. This is the central tension in the investment, and no amount of product quality fully resolves it.

## Founding Story

Traversal was founded in New York in 2023 by three researchers in causal machine learning and a former quantitative trader.

Anish Agarwal, the CEO, holds a PhD from MIT and is on the faculty at Columbia, with research in causal machine learning and reinforcement learning. Raaz Dwivedi is faculty at Cornell Tech. Raj Agrawal is the third of the PhDs Sequoia describes in its [partnership note](https://sequoiacap.com/article/partnering-with-traversal-because-every-engineer-remembers-their-first-time-troubleshooting). Ahmed Lone holds a Columbia master's and was a quantitative trader at Citadel Securities, where he lived the problem from the receiving end — trading infrastructure is an environment where nobody tolerates a slow answer about what broke.

The composition is unusual and matters for the product. Causal inference is a specific academic discipline concerned with distinguishing what caused an outcome from what merely correlated with it, which is precisely the question during an incident and precisely what a language model with tool access is weakest at. The standard concern about research-heavy founding teams is enterprise sales, and the counter-evidence here is strong: American Express became a named customer and then, in March 2026, an investor through Amex Ventures, inside the company's first years.

## Product

**Production World Model.** A live, continuously updated map of the customer's systems — services, dependencies, deployments, and how they actually relate in production rather than in the architecture diagram.

**Causal Search Engine.** Telemetry re-indexed so the agent can run thousands of targeted queries in parallel. Sequoia describes the method as swarms of parallel investigations using proprietary statistical tools. This is the technical core and the basis of the accuracy claim.

**Alert triage.** Filtering noisy alerts before they page a human, which is the least glamorous capability and frequently the one that sells the deal.

**Self-hosted deployment.** Available, and effectively mandatory for the banks that are the stated target market.

The product is widening beyond incidents:

| Capability | What it does | Example |
| --- | --- | --- |
| Incident response | Finds root cause and proposes or applies the fix | The core product |
| Alert triage | Filters noise before it pages anyone | The core product |
| Pre-deploy review | Flags a code change that conflicts with how production actually behaves | DigitalOcean, per the [company site](https://www.traversal.com/) |
| Production support | Gives any engineer plain-language access to the live state of systems | A top global crypto exchange projects over 2,000 senior engineering hours saved a month |

Pre-deploy review is the most interesting of these. It moves the product from reacting to incidents toward preventing them, and it uses the same world model, which means it costs the company relatively little to offer and gives the customer a second reason to keep paying.

## Customer

The target is the large, regulated enterprise — specifically global financial institutions, which the company names as its focus. The qualifying characteristics are a large engineering organization, multiple monitoring platforms in simultaneous use, a low tolerance for downtime, and a requirement to self-host.

Named customers span more than finance: American Express, PepsiCo, DigitalOcean, Eventbrite, and Cloudways, plus an unnamed top global crypto exchange. American Express is the anchor, and the fact that it invested as well as bought is the strongest available signal about how the product performs in the environment that matters most to the company's strategy.

Revenue and total customer count are not disclosed.

## Market Size

My estimate: 2,000 large enterprises at \$500,000 a year is a \$1 billion market. That is a sizing from the buyer side and not a published figure.

The better evidence is what a direct comparable cleared. Resolve AI [raised \$125 million at a \$1 billion valuation](https://resolve.ai/news/resolveai-raises-125-million-series-a) on roughly \$4 million of revenue, [per TechCrunch](https://techcrunch.com/2025/12/19/ex-splunk-execs-startup-resolve-ai-hits-1-billion-valuation-with-series-a). That tells you two things: investors are underwriting this category on the size of the engineering-labor budget it displaces rather than on current revenue, and any entry price here will be set by that comparable rather than by fundamentals.

## Competition

The direct rival is the clearest way to see the position.

|  | Traversal | Resolve AI |
| --- | --- | --- |
| Base | New York | San Francisco |
| Founders | Three PhDs in causal ML and RL, plus a former Citadel Securities quant | Former Splunk executives whose earlier startup Splunk acquired |
| Capital raised | \$48M, plus an undisclosed Amex Ventures investment | Over \$150M |
| Last valuation | Not disclosed | \$1B, February 2026 |
| Named customers | American Express, PepsiCo, DigitalOcean, Eventbrite, Cloudways | Coinbase, DoorDash, MongoDB, MSCI, Salesforce, Zscaler |
| Stated focus | Global financial institutions | Technology-led enterprises |
| Product emphasis | Causal root-cause analysis | A broader agent interface to production actions such as rollbacks |

The segmentation is real rather than rhetorical: regulated finance buys differently, requires self-hosting, and rewards accuracy over breadth. If Traversal holds that segment it has a defensible position. If the segmentation collapses, it is the less-capitalized company with fewer public logos.

| Competitor | Type | Threat |
| --- | --- | --- |
| Datadog, PagerDuty, incident.io | Incumbents adding their own agents | High. They own the buyer relationship and the data |
| Cleric, Ciroos | Smaller startups | Low to medium |
| In-house builds on general coding agents | The most technical customers | Medium |

The structural weakness is dependence. Traversal does not own the telemetry and reaches it through integrations with vendors that also compete with it. Nothing in the product roadmap fixes that; only contracts or standards would.

## Business Model

Pricing is undisclosed. The crypto exchange figure gives a way to reason about it: 2,000 senior engineering hours a month at \$150 an hour is about \$3.6 million of annual value, which comfortably supports a \$500,000 to \$1 million contract.

| Customers | Average contract | Implied recurring revenue |
| --- | --- | --- |
| 25 | \$500,000 | \$12.5M |
| 50 | \$500,000 | \$25M |
| 100 | \$750,000 | \$75M |

These are my assumptions. The middle row is roughly what a valuation near the rival's would need to grow into within two years.

## Traction

| Metric | Figure | Source |
| --- | --- | --- |
| Named customers | American Express, PepsiCo, DigitalOcean, Eventbrite, Cloudways | Company and Sequoia |
| Root-cause accuracy at American Express | 82% | [Third-party review](https://tooldirectory.ai/tools/traversal) citing the company |
| Engineering hours saved at a top crypto exchange | Over 2,000 a month, projected | Company site |
| Employees | About 100 | PitchBook |
| Revenue and customer count | Not disclosed | |

One caution worth stating plainly: multiple different recovery-time improvement figures are in circulation from the company's own materials, measuring different things. A careful buyer will notice the spread, and the right response is to ask which single number the company stands behind and how it was measured. Inconsistent performance claims are a small problem now and a large one when a procurement team builds a comparison sheet.

## Valuation

The last disclosed round was \$48 million across seed and Series A in June 2025, led by Sequoia and Kleiner Perkins, followed by an [undisclosed strategic investment from Amex Ventures](https://finance.yahoo.com/news/traversal-announces-strategic-investment-amex-140000290.html) in March 2026. No valuation has been published.

The reference point is Resolve AI at \$1 billion in February 2026 on roughly \$4 million of revenue. Any next round for Traversal prices against that mark, which means the entry is expensive relative to any plausible revenue and the discipline has to come from an absolute price ceiling rather than a multiple.

## Key Opportunities

**Owning regulated finance.** Banks require self-hosting, demand accuracy, buy slowly, and then stay. A company with American Express as customer and investor has the best possible opening credential for the rest of that segment, and it is a segment the San Francisco-based rival is not organized around.

**Autonomous fixes.** The product today mostly advises. Moving to applying fixes in production, at even one customer, changes what the company is worth — it is the difference between a tool that helps engineers and a system that replaces on-call work.

**Pre-deploy review.** Preventing incidents uses the same world model as diagnosing them, sells to the same buyer, and expands the contract without new infrastructure.

**Neutrality as a durable position.** If large enterprises continue running several monitoring platforms simultaneously — and there is no sign of consolidation there — the vendor-neutral reasoning layer is a position no single observability vendor can occupy.

## Key Risks

**Bundling.** Datadog or PagerDuty shipping a good-enough agent included with the platform is the failure mode that has ended many standalone categories. Accuracy that a bundled tool cannot match is the only defense, and it must be demonstrable to a buyer.

**Dependence on rivals for data.** Telemetry access runs through integrations controlled by companies that compete with Traversal. That access could be restricted.

**A better-funded direct rival.** Resolve AI has more than three times the capital and a longer public logo list.

**Trust and blast radius.** An agent that changes production needs accuracy far above 82% before a bank will let it act unsupervised. One autonomous fix that causes an outage at a regulated customer would confine the product to suggestions across the whole segment.

**Inconsistent public performance claims.** Several different figures circulate. This is fixable and should be fixed.

**Price.** The comparable's valuation makes any round expensive relative to disclosed revenue, which is zero.

## Summary

Traversal is a well-positioned company in a category whose central question is not about the product. The team is unusually well matched to the technical problem — causal inference is exactly the discipline that separates what caused an incident from what merely coincided with it, and it is the thing general models with tool access are worst at. The customer evidence is strong for a company this young, and American Express investing as well as buying is the kind of signal that is hard to manufacture.

The question is whether a reasoning layer that does not own the underlying data can stay independent. The observability vendors hold the buyer relationship, the telemetry, and the renewal conversation, and the history of enterprise infrastructure is mostly a history of such layers being absorbed. Traversal's answer is that large enterprises run several monitoring platforms at once, so only a neutral agent sees the whole picture. That is a genuinely good answer, and it depends on a market structure the incumbents would like to change.

Meanwhile a rival with three times the capital raised at \$1 billion on roughly \$4 million of revenue, which tells you what the entry price looks like and how little of it is supported by what either company currently earns.
