---
title: "Watney Robotics"
description: "Watney's dual-arm robots have been swapping network cables inside a Meta data center since June 2025, still supervised, and the economics turn on how many robots one operator can run."
slug: watney-robotics
company: "Watney Robotics"
stage: "Series A"
sector: "Robotics"
tags:
  - robotics
  - data-centers
  - physical-ai
draft: true
category: ventures
---

## Overview

Watney Robotics builds two-armed robots that replace network cables and perform server maintenance inside data centers, and operates them as a service in the customer's facility. The robots are task-specific rather than humanoid, which is the company's stated design philosophy: take only problems where a machine has an order-of-magnitude advantage in precision, reliability or scale. Two of them have been working on cabling at Meta's Altoona, Iowa campus since June 2025. The company closed an \$80 million Series A on September 17, 2026, bringing total funding above \$100 million.

| Fact | Detail |
| --- | --- |
| Founded | 2023 |
| Headquarters | San Francisco |
| Founders | Ryan Gannon (CEO), Sean Cheong |
| Stage | Series A |
| Total funding | \$80M, September 2026 |
| Disclosed investors | Valor Atreides AI Fund, Hummingbird (co-leads); Conviction, Abstract, A\* (returning from seed) |
| Status | Deployed at Meta since June 2025 |

## Thesis

The public conversation about AI infrastructure limits is about chips and power. The third constraint is people. Hyperscaler capital spending was about \$443 billion in 2025 and is guided to between \$660 billion and \$690 billion in 2026, roughly 55% growth, and every dollar of it eventually requires technicians in an aisle. Roles like robotic technician and HVAC engineer grew between 51% and 107% from 2022 to 2026 per Randstad, which is a wage signal as much as a headcount one. The context is in [Introl's capital spending summary](https://introl.com/de/blog/hyperscaler-capex-690-billion-microsoft-azure-power-bottleneck-2026) and a [summary of the Randstad analysis](https://letsdatascience.com/news/hyperscalers-drive-data-center-skilled-labor-shortage-e77a3b6f).

The specific work suits machines. A modern AI rack carries thousands of fiber and copper connections, each GPU generation changes the layout, and every failed link idles expensive silicon until someone swaps a part. The task is repetitive, demands millimeter precision, runs around the clock, and happens in hot, loud aisles. It is close to the canonical case for automation, with one complication: it requires dexterity in an unstructured environment, which is the thing robotics has been worst at for forty years.

Watney's bet is that a purpose-built dual-arm machine, operated as a service with a human supervising, crosses that threshold now, and that supervision falls away as the fleet generates training data. The entire financial case rests on that last clause.

## Founding Story

Ryan Gannon and Sean Cheong founded Watney in San Francisco in 2023. Gannon graduated from Penn's Jerome Fisher Program in Management and Technology, the joint Wharton and engineering degree. Beyond that, very little about either founder is public, and the public record on Cheong is thinner still.

That is a real gap in any assessment of this company, and the best available substitute is investor behavior: Conviction, Abstract and A\* seeded the company in April 2025 and all three returned for the \$80 million Series A seventeen months later, after having watched the Meta deployment from the inside. Existing investors re-upping with full information is the most reliable signal available when the founders themselves are undocumented.

## Product

| Aspect | Detail |
| --- | --- |
| Form | Two arms, task-built; not a humanoid |
| Tasks | Cable replacement and server maintenance |
| Delivery | Watney installs and operates robots on the customer's site |
| Design rule | Order-of-magnitude edge in precision, reliability or scale |
| Longer ambition | Beyond compute, into energy and materials work |

Underneath is a stack a supplier profile describes as Rust-based precision teleoperation plus cloud-hosted robot foundation models ([RobotToday](https://robottoday.com/suppliers-discovery/watney-robotics-inc)). That points to a familiar flywheel: an operator drives the robot remotely, every task becomes training data, models learn the task, the robot does more on its own, and one operator eventually covers many robots.

The service model is the right choice for this customer. A hyperscaler does not want to buy robots, hire roboticists, and own the integration risk; it wants the cables swapped. Selling the outcome also keeps the operating data with Watney, which is what feeds the flywheel.

## Customer

The buyer is the hyperscaler data center operations organization, and today the market is a handful of companies. Meta is the named customer, running two dual-arm Watney robots on cable replacement at Altoona, Iowa since June 2025.

Meta's own behavior is the most useful evidence about the category, because it is testing three vendors on three different tasks at once. WIRED's reporting, [summarized by TechRepublic](https://www.techrepublic.com/article/news-meta-data-center-robots-maintenance-automation/), lays out the trial:

| Vendor | Task | Site |
| --- | --- | --- |
| Watney Robotics | Replacing network cables; two dual-arm robots | Altoona, Iowa, since June 2025 |
| ABB | Reseating hardware in racks; wheeled base, lift, six-axis arm | Prometheus campus, New Albany, Ohio |
| Kinova | Power-cycling unresponsive servers | Under evaluation |

The same reporting is candid about the limits. The robots are slower than human technicians, need time to recharge, struggle with cables on the floor, and require people to open doors or guide them between buildings. The widely-quoted figure that some technician roles could see up to 80% of their workload removed comes from one worker's estimate, not a Meta forecast. Meta's robotics lead has described faster incident response, environmental monitoring and preventative maintenance as the longer-term goals, which is a different and larger scope than cable swapping.

Neocloud operators, meaning companies that run large GPU fleets without hyperscaler engineering organizations, are the natural second segment, and none is publicly a customer.

## Market Size

Two thousand robots at \$150,000 a year each is \$300 million of recurring revenue. No reliable count of data center technicians is available, so this is sized from the robot side, and it is an estimate rather than a sourced figure.

The number that matters more than market size at this stage is the operator ratio. At one robot per operator, the service loses money on every unit deployed, because the customer is paying for a machine plus a person to run it instead of a person. At ten robots per operator it is a good industrial business with real margins. Everything about how this company should be valued sits on that curve, and where Watney sits on it today is not public.

## Competition

| Competitor | Approach | Threat |
| --- | --- | --- |
| ABB | Industrial robotics giant, in Meta's trials for reseating hardware | High. Deep pockets, existing sales channel |
| Kinova | Robotic arm maker, in Meta's trials for power-cycling | Medium |
| Hyperscalers' own automation teams | They control the facilities and run the trials | High |
| General-purpose humanoids | Mastering dexterous work would erase the task-specific edge | Medium, rising |
| Exclaim Robotics, Shepherd Robotics | Small startups on the same problem | Low for now |
| Rack vendors | Could redesign racks to need far less manual cabling | Medium |

The last row is the quiet one and deserves more weight than its position suggests. Watney's task exists because current racks require thousands of manual connections. If the next generation of rack design replaces that with cartridges or backplanes, a change the rack vendors have every incentive to make for their own reasons, the core task shrinks regardless of how good the robots become. That is a risk no amount of execution addresses.

The in-house threat is structural too. The customers run the trials, own the facilities, and can observe exactly how the work gets done before deciding whether to buy it or build it.

## Business Model

Watney sells the outcome: it installs and operates robots in the customer's facility, presumably on a per-robot or per-task recurring basis. Pricing is not disclosed.

The economics reduce to the operator ratio and to field service cost. Hardware operated in someone else's building is service-heavy: parts, maintenance, recharge logistics, on-site presence. Gross margin per robot after field service is the number that decides whether this is a software-like business or a staffing company with capital equipment. Neither figure is public.

## Traction

| Metric | Figure |
| --- | --- |
| Operating hours in customer facilities | Hundreds of thousands |
| Reliability | Better than 99.99% |
| Fleet | Largest dexterous fleet running around the clock in the US |
| Named customer | Meta: two dual-arm robots on cabling, Altoona, Iowa (press) |
| Performance today | Slower than technicians, and supervised (press) |

*All figures are company-reported except where marked (press).*

This is a stronger evidence base than almost any robotics company at this stage. Hundreds of thousands of operating hours inside the facility of one of the most demanding customers on earth is not a pilot in a warehouse; it is production, and it has run for over a year. The caveats are that every favorable figure is company-reported, every unfavorable one comes from press reporting, and two robots at one site is a deployment, not a business.

## Valuation

The [\$80 million Series A](https://en.wowtale.net/2026/09/18/235152/) closed September 17, 2026, co-led by Valor Atreides AI Fund and Hummingbird, with Conviction, Abstract and A\* returning from the April 2025 seed of \$21 million. Total raised is above \$100 million. No valuation has been disclosed.

Physical AI is being priced aggressively across the board, and a company with robots in production at Meta sits at the favorable end of that. The realistic entry for a new investor is the next round, and it should be expected to price above \$1 billion.

## Key Opportunities

**A second named customer.** One hyperscaler is a reference; two is a market. Neocloud operators are the fastest path, since they run comparable facilities with shorter procurement cycles and less internal robotics capability.

**Crossing the operator ratio.** Every point of improvement in robots-per-operator flows straight to gross margin. This is the single metric that converts an interesting deployment into an industrial business, and the teleoperation-to-autonomy flywheel is the mechanism.

**Multi-year, multi-site contracts.** Trials become revenue at the moment a customer commits across sites. That transition is also what would justify a growth-stage price.

**Beyond data centers.** The company's stated ambition extends into energy and materials work, and most of the upside in any reasonable outcome distribution depends on it. It is ambition, not business, today.

## Key Risks

**The operator ratio may not improve enough.** If the robots stay close to one operator each, the service never earns an industrial margin no matter how many are deployed.

**Concentration.** A handful of hyperscalers constitute the market, and the named one is also evaluating two competitors on adjacent tasks.

**Performance today is worse than a human.** Slower, supervised, blocked by doors and floor cables, and needing recharge time. These are solvable engineering problems, and they are also the objections in every piece of press coverage the company has.

**Rack design could remove the task.** Cartridge or backplane connections in the next generations would shrink the core work independently of Watney's execution.

**In-house and general-purpose alternatives.** The customers run the trials and could build; humanoid platforms could generalize into the same work.

**Service-heavy margins.** Operating hardware in the field consumes gross margin in ways that are invisible until the fleet is large.

**Undocumented founders.** Very little about either founder is public, and the strongest counter-signal is that three seed investors re-upped after watching the deployment.

## Summary

Watney is the unusual robotics company whose robots are already working. Not in a demonstration, not in a warehouse pilot, but inside a Meta data center, on a real task, for more than a year, at a scale the company describes as hundreds of thousands of operating hours. In a category where most companies are selling a video, that is a different kind of evidence.

What it is not yet is a business with proven unit economics. The robots are slower than the technicians they would replace and still need people watching them. The market today is a handful of hyperscalers, one of which is simultaneously testing two other vendors on adjacent tasks. And the entire financial case reduces to a single number nobody outside the company knows: how many robots one operator can run. At one, the service loses money on every unit. At ten, it is a good industrial business. The funding, the deployment and the labor shortage behind it are all context for that question.

The most interesting risk is not competitive. It is that the next generation of rack design replaces thousands of manual cable connections with something that does not need hands at all, and the task Watney has automated so well simply becomes smaller.
