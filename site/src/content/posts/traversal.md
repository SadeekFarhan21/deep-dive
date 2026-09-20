---
title: "Traversal"
description: "Traversal builds an AI site-reliability engineer that finds the root cause of production incidents by running causal searches over a customer's existing telemetry. American Express is both a customer and an investor."
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

Traversal builds an agent that does the work of a site-reliability engineer during a production incident, figuring out what actually broke. It maintains a live map of the customer's systems, re-indexes their telemetry so it can run thousands of targeted queries in parallel, and searches causally through that data to identify the root cause, then proposes or applies the fix. It does not collect the telemetry itself, since Datadog and its peers still do that, and it does not replace the observability stack. It sits on top of whatever the customer already runs and does the detective work a war room would otherwise do by hand.

| | |
| --- | --- |
| Founding Date | 2023 |
| Headquarters | New York, NY |
| Total Funding | \$53M |
| Status | Private |
| Stage | Series A |
| Employees | 90 |

## Thesis

Two things are true about production incidents at large companies, and the gap between them is the business. Enterprises already spend heavily on collecting operational data, since observability is a mature, well-funded category, and they spend far more on the engineers who interpret it. At a Fortune 100 company, in the CEO's description, 50 or 100 engineers may join a war room for a single incident. The data is not the constraint. The reasoning over it is.

That gap is widening for a specific reason. AI writes a growing share of production code, so more changes reach production, written by systems with no memory of why the last outage happened, failing in ways that are unfamiliar to the people on call. The volume of incidents is rising while the number of engineers who deeply understand any given system is falling.

The structural argument for an independent company, rather than a feature of a monitoring vendor, is that large enterprises run several monitoring platforms at once and no vendor will reason over a competitor's data. A neutral agent is the only one that sees everything. The CEO makes this case directly in an [interview with SiliconANGLE](https://siliconangle.com/2026/03/04/exclusive-american-express-partners-invests-ai-operations-startup-traversal/). Collecting data is solved, interpreting it is not.

The counter-argument is equally structural. The observability vendors own the buyer relationship, the data, and the renewal, and a good-enough bundled agent has historically been enough to end a standalone category. This is the central tension in the investment, and no amount of product quality fully resolves it.

## Founding Story

Traversal was founded in New York in 2023 by three researchers in causal machine learning and a former quantitative trader.

Anish Agarwal, the CEO, holds a PhD from MIT and is on the faculty at Columbia, with research in causal machine learning and reinforcement learning. Raaz Dwivedi is faculty at Cornell Tech. Raj Agrawal is the third of the PhDs Sequoia describes in its [partnership note](https://sequoiacap.com/article/partnering-with-traversal-because-every-engineer-remembers-their-first-time-troubleshooting). Ahmed Lone holds a Columbia master's and was a quantitative trader at Citadel Securities, where he lived the problem from the receiving end. Trading infrastructure is an environment where nobody tolerates a slow answer about what broke.

The composition is unusual and matters for the product. Causal inference is a specific academic discipline concerned with distinguishing what caused an outcome from what merely correlated with it, which is precisely the question during an incident and precisely what a language model with tool access is weakest at. The standard concern about research-heavy founding teams is enterprise sales, and the counter-evidence here is strong. American Express became a named customer and then, in March 2026, an investor through Amex Ventures, inside the company's first years.

## Product

### Production World Model

A live, continuously updated map of the customer's systems, including services, dependencies, deployments, and how they actually relate in production rather than in the architecture diagram.

### Causal Search Engine

Telemetry re-indexed so the agent can run thousands of targeted queries in parallel. Sequoia describes the method as swarms of parallel investigations using proprietary statistical tools. This is the technical core and the basis of the accuracy claim.

### Alert triage

Filtering noisy alerts before they page a human, which is the least glamorous capability and frequently the one that sells the deal.

### Self-hosted deployment

Available, and effectively mandatory for the banks that are the stated target market.

The product is widening beyond incidents.

| Capability | What it does | Example |
| --- | --- | --- |
| Incident response | Finds root cause and proposes or applies the fix | The core product |
| Alert triage | Filters noise before it pages anyone | The core product |
| Pre-deploy review | Flags code changes that conflict with production behavior | DigitalOcean ([company site](https://www.traversal.com/)) |
| Production support | Plain-language access to live system state | Top crypto exchange, 2,000+ engineer-hours saved a month (projected) |

Pre-deploy review is the most interesting of these. It moves the product from reacting to incidents toward preventing them, and it uses the same world model, which means it costs the company relatively little to offer and gives the customer a second reason to keep paying.

## Customer

The target is the large, regulated enterprise, specifically the global financial institutions the company names as its focus. The qualifying characteristics are a large engineering organization, multiple monitoring platforms in simultaneous use, a low tolerance for downtime, and a requirement to self-host.

Named customers span more than finance. They include American Express, PepsiCo, DigitalOcean, Eventbrite, and Cloudways, plus an unnamed top global crypto exchange. American Express is the anchor, and the fact that it invested as well as bought is the strongest available signal about how the product performs in the environment that matters most to the company's strategy.

Revenue and total customer count are not disclosed.

## Market Size

Two thousand large enterprises at \$500,000 a year is a \$1 billion market. That is a sizing from the buyer side and not a published figure.

The better evidence is what a direct comparable cleared. Resolve AI announced in February 2026 that it had [raised \$125 million at a \$1 billion valuation](https://resolve.ai/news/resolveai-raises-125-million-series-a). Two months earlier, [TechCrunch had reported](https://techcrunch.com/2025/12/19/ex-splunk-execs-startup-resolve-ai-hits-1-billion-valuation-with-series-a), citing people familiar with the round, that annual recurring revenue was approximately \$4 million and that a multi-tranche structure put the effective valuation below the headline; the company's release describes the round as non-blended, which reads as a reply. The revenue figure is anonymously sourced and nine months old. That tells you two things. Investors are underwriting this category on the size of the engineering-labor budget it displaces rather than on current revenue, and any entry price here will be set by that comparable rather than by fundamentals.

## Competition

The direct rival is the clearest way to see the position.

| Dimension | Traversal | Resolve AI |
| --- | --- | --- |
| Base | New York | San Francisco |
| Founders | Three causal ML/RL PhDs, ex-Citadel Securities quant | Ex-Splunk executives (prior startup acquired by Splunk) |
| Capital raised | \$53M | \$150M+ |
| Last valuation | Not disclosed | \$1B, February 2026 |
| Named customers | American Express, PepsiCo, DigitalOcean, Eventbrite, Cloudways | Coinbase, DoorDash, MongoDB, MSCI, Salesforce, Zscaler |
| Stated focus | Global financial institutions | Technology-led enterprises |
| Product emphasis | Causal root-cause analysis | Broader agent interface to production actions, e.g. rollbacks |

The segmentation is real rather than rhetorical. Regulated finance buys differently, requires self-hosting, and rewards accuracy over breadth. If Traversal holds that segment it has a defensible position. If the segmentation collapses, it is the less-capitalized company with fewer public logos.

<figure data-figure="venture:traversal-capital"></figure>

| Competitor | Type | Threat |
| --- | --- | --- |
| Datadog, PagerDuty, incident.io | Incumbents adding their own agents | High; they own the buyer and the data |
| Cleric, Ciroos | Smaller startups | Low to medium |
| In-house builds on general coding agents | The most technical customers | Medium |

The structural weakness is dependence. Traversal does not own the telemetry and reaches it through integrations with vendors that also compete with it. Nothing in the product roadmap fixes that; only contracts or standards would.

<figure data-figure="venture:traversal-timeline"></figure>

## Business Model

Pricing is undisclosed. The crypto exchange figure gives a way to reason about it. Two thousand senior engineering hours a month at \$150 an hour is about \$3.6 million of annual value, which comfortably supports a \$500,000 to \$1 million contract.

| Customers | Average contract | Implied recurring revenue |
| --- | --- | --- |
| 25 | \$500,000 | \$12.5M |
| 50 | \$500,000 | \$25M |
| 100 | \$750,000 | \$75M |

These are assumptions rather than disclosed figures. The middle row is roughly what a valuation near the rival's would need to grow into within two years.

## Traction

| Metric | Figure | Source |
| --- | --- | --- |
| Named customers | American Express, PepsiCo, DigitalOcean, Eventbrite, Cloudways | Company and Sequoia |
| Root-cause accuracy at an unnamed Fortune 100 financial services customer | 82%, with a 32% reduction in potential MTTR | Company case study. A [third-party directory](https://tooldirectory.ai/tools/traversal) identifies the customer as American Express; the company does not |
| Engineering hours saved at a top crypto exchange | 2,000+ a month (projected) | Company site |

At least seven recovery-time figures are in circulation from the company's own materials. They run 32%, 38%, 40%, a projected 40% or more, 70%, 85% and 85% or more, some for single customers and some as averages across clients, some measuring time to recovery and some time to resolution. The sharpest case is the March 2026 American Express announcement, where the wire release states an average MTTR reduction of 40% across enterprise clients and the company's own blog post for the same announcement states 85%, in the same sentence with the same scope. Accuracy claims spread the same way, from 75% on evaluated incidents at one customer to more than 90% in the June 2025 launch post. A careful buyer will notice, and the right response is to ask which single number the company stands behind and how it was measured. Inconsistent performance claims are a small problem now and a large one when a procurement team builds a comparison sheet.

<figure data-figure="venture:traversal-mttr"></figure>

## Valuation

The last disclosed round was \$48 million across seed and Series A in June 2025, led by Sequoia and Kleiner Perkins, followed by a [\$5 million strategic investment from Amex Ventures](https://siliconangle.com/2026/03/04/exclusive-american-express-partners-invests-ai-operations-startup-traversal/) in March 2026, for roughly \$53 million in total. No valuation has been published.

The reference point is Resolve AI at \$1 billion in February 2026, on revenue reported two months earlier at roughly \$4 million. Any next round for Traversal prices against that mark, which means the entry is expensive relative to any plausible revenue and the discipline has to come from an absolute price ceiling rather than a multiple.

## Key Opportunities

### Owning regulated finance

Banks require self-hosting, demand accuracy, buy slowly, and then stay. A company with American Express as customer and investor has the best possible opening credential for the rest of that segment, and it is a segment the San Francisco-based rival is not organized around.

### Autonomous fixes

The product today mostly advises. Moving to applying fixes in production, at even one customer, changes what the company is worth. It is the difference between a tool that helps engineers and a system that replaces on-call work.

### Pre-deploy review

Preventing incidents uses the same world model as diagnosing them, sells to the same buyer, and expands the contract without new infrastructure.

### Neutrality as a durable position

If large enterprises continue running several monitoring platforms simultaneously, and there is no sign of consolidation there, the vendor-neutral reasoning layer is a position no single observability vendor can occupy.

## Key Risks

### Bundling

Datadog or PagerDuty shipping a good-enough agent included with the platform is the failure mode that has ended many standalone categories. Accuracy that a bundled tool cannot match is the only defense, and it must be demonstrable to a buyer.

### Dependence on rivals for data

Telemetry access runs through integrations controlled by companies that compete with Traversal. That access could be restricted.

### A better-funded direct rival

Resolve AI has more than three times the capital and a longer public logo list.

### Trust and blast radius

An agent that changes production needs accuracy far above 82% before a bank will let it act unsupervised, and the company's own claims already range from 75% to more than 90% depending on the document. One autonomous fix that causes an outage at a regulated customer would confine the product to suggestions across the whole segment.

### Inconsistent public performance claims

Seven recovery-time figures circulate, and the company's own blog and wire release give 40% and 85% for the same claim on the same day. This is fixable and should be fixed.

### Price

The comparable's valuation makes any round expensive relative to disclosed revenue, which is zero.

## Summary

Traversal is a well-positioned company in a category whose central question is not about the product. The team is unusually well matched to the technical problem. Causal inference is exactly the discipline that separates what caused an incident from what merely coincided with it, and it is the thing general models with tool access are worst at. The customer evidence is strong for a company this young, and American Express investing as well as buying is the kind of signal that is hard to manufacture.

The question is whether a reasoning layer that does not own the underlying data can stay independent. The observability vendors hold the buyer relationship, the telemetry, and the renewal conversation, and the history of enterprise infrastructure is mostly a history of such layers being absorbed. Traversal's answer is that large enterprises run several monitoring platforms at once, so only a neutral agent sees the whole picture. That is a genuinely good answer, and it depends on a market structure the incumbents would like to change.

Meanwhile a rival with three times the capital has raised at \$1 billion on reported revenue of roughly \$4 million, which tells you what the entry price looks like and how little of it is supported by what either company currently earns.
