---
title: "Dipole Labs"
description: "Dipole Labs builds optical circuit switches that keep data as light between GPU racks, targeting sub-microsecond reconfiguration so an AI cluster's network can reshape itself around each workload."
slug: dipole-labs
company: "Dipole Labs"
stage: "Pre-seed"
sector: "AI infrastructure"
tags:
  - ai-infrastructure
  - photonics
  - semiconductors
draft: true
category: ventures
---

## Overview

Dipole Labs builds optical circuit switches for AI data centers. Data between GPU racks already travels as light, but routing it means converting the signal to electricity and back at every switching point, which costs power, generates heat, and adds latency. Dipole's switch keeps the signal in the optical domain and steers it with software-programmable mirrors, targeting sub-microsecond reconfiguration at large port counts. At that speed the network can reshape itself around a single training or inference job rather than holding a fixed topology. The company estimates this yields up to 25% more useful compute from hardware already purchased.

| Fact | Detail |
| --- | --- |
| Founded | 2026 |
| Headquarters | Boston, with a European base in Zurich |
| Founders | Deepankur Thureja (CEO), Gabriele Pasquale (CTO) |
| Stage | Pre-seed (Y Combinator Summer 2026) |
| Disclosed investors | Y Combinator, [Cisco Investments](https://runtimewire.com/article/startup-spotlight-dipole-labs-optical-switches-ai-clusters) |
| Employees | 2 |

*Investment amounts are unpublished.*

## Thesis

The economics of AI infrastructure have shifted from acquiring compute to using the compute already installed. Capital spending by the five largest hyperscalers, Amazon, Alphabet, Meta, Microsoft and Oracle, was about \$448 billion in 2025 by their SEC filings, or roughly \$390 billion without Oracle, and was guided in February to between \$660 billion and \$690 billion in 2026, a figure four of the five have since raised to a combined \$720 billion to \$745 billion, but the GPUs bought with that money spend a substantial share of their time waiting. Y Combinator's Jared Friedman, writing about the company, [put the idle figure at about half](https://x.com/snowmaker/article/2088040385474122139). The bottleneck is increasingly the network between accelerators rather than the accelerators themselves, because the collective communication steps in distributed training force thousands of GPUs to synchronize before any of them can proceed.

Optical circuit switching is the response the largest operator has already validated. Google has run optical circuit switches in production for more than a decade; its 2022 papers describe tens of thousands of switches deployed over the preceding ten years, and credit the resulting network evolution, of which optical switching is one part alongside software-defined control and a direct-connect topology, with five times the speed and capacity of what it replaced, a 30% reduction in capital cost and a 41% reduction in power. What was once a Google-only technique has become a merchant market. Cignal AI forecast in July 2026 that it would exceed \$8 billion by 2030, and in March 2026 NVIDIA invested \$2 billion each into Coherent, Lumentum, and Marvell, then joined a \$125 million round in the switch startup iPronics in September.

Dipole's specific bet is about speed rather than optics generally. The optical switches shipping today move physical mirrors, which takes milliseconds. That is fast enough to set a topology between jobs and far too slow to change one inside a job. Dipole says its mirrors are software-programmable with no moving parts, and Friedman [puts the reconfiguration at over 1,000 times faster](https://x.com/snowmaker/article/2088040385474122139) than the optical switches running in data centers today. Against the mechanical switches that dominate deployments, at tens of milliseconds, a sub-microsecond target is a jump of that order. Against the nearest merchant rival it is smaller. Salience Labs already ships a switch specified below 300 microseconds, so the gap there is closer to 300 times.

<figure data-figure="venture:dipole-reconfiguration"></figure> If that holds, the fabric can follow traffic between individual communication steps, which is a different product rather than a cheaper version of an existing one.

The claim is unproven outside the company. Dipole has published no port count, insertion loss, power draw, or bench results, and has no data center customer.

## Founding Story

Deepankur Thureja and Gabriele Pasquale met as postdoctoral researchers at Harvard, and both arrived there after doctorates spent manipulating light and electronic states at the nanometer scale.

Thureja completed his physics doctorate at ETH Zurich on the electrical control of excitons in semiconductors. His 2022 paper in *Nature* demonstrated electrically tunable confinement of neutral excitons below ten nanometers, and ETH Zurich awarded him its 2024 Medal for the thesis, "Electrically tunable quantum confinement of neutral excitons." He went on to work on quantum optics at Harvard.

Pasquale earned his doctorate in applied physics and materials science at EPFL, working on indium selenide, and joined Harvard's Low-Dimensional Quantum Materials Laboratory as a postdoctoral researcher in July 2024. His January 2025 paper in *Nature Materials* reported the electrical detection of light's chirality in two-dimensional materials, work for which EPFL awarded him its 2025 IBM Prize.

Neither founder came from networking. What they shared was a decade of building optical devices where fabrication error determines whether anything works at all, which is the same discipline that decides whether a photonic switch survives packaging, insertion loss, and thermal cycling in a rack. The company was founded in 2026 in Boston, keeping a European base in Zurich near the institutions where both trained, and joined Y Combinator's Summer 2026 batch. It launched publicly on August 13, 2026. After the batch's Demo Day on September 10, TechCrunch named Dipole [one of the nine most-discussed companies](https://techcrunch.com/2026/09/13/the-9-buzziest-startups-from-y-combinators-latest-demo-day-according-to-vcs/) among the early-stage investors it polled.

## Product

Dipole's platform has two halves, a switch and the software that decides when to reconfigure it.

### The optical circuit switch

The device steers light from an input fiber to an output fiber without converting the signal to electricity at any point along the way. The company describes the mechanism as high-speed spatial light modulators and software-programmable mirrors, with no moving parts and no energy conversion. The absence of mechanical motion is what allows the speed claim. Where a mirror-based switch reconfigures in milliseconds, Dipole targets under a microsecond.

### The control layer

A switch that can reconfigure quickly is only useful if something decides when. Dipole's software observes a cluster's communication patterns and synchronizes the optical topology with the job currently running, timing each reconfiguration to the phases of training or inference rather than to the boundaries between jobs.

The claimed result is that a cluster of 10,000 GPUs performs like one of 12,500, which the company frames as up to 25% more useful compute. Applied to a one-gigawatt site, Dipole models up to \$1 billion a year in additional compute capacity.

These are projections rather than measurements. As of September 2026 the company has not published port count, insertion loss, bandwidth, or power consumption, and the model behind the 25% figure does not specify workload mix, baseline network conditions, or GPU utilization assumptions. The disclosure gap is conspicuous next to competitors. Salience Labs publishes a full specification for a 32-port all-optical switch, including 10-nanosecond latency, sub-300-microsecond reconfiguration, insertion loss below 2 decibels, and under one watt per port.

<figure data-figure="venture:dipole-disclosure"></figure>

## Customer

Dipole has two distinct buyers, and only one of them is the reason the company exists.

The intended customer is the operator of a large GPU cluster, a hyperscaler or neocloud provider running training and inference at a scale where network inefficiency is measured in millions of dollars of idle silicon. These buyers qualify hardware slowly, demand results across many collective communication patterns and failure scenarios, and expect years of field reliability. Dipole has no deployed customer in this segment and is [opening design partnerships](https://runtimewire.com/article/startup-spotlight-dipole-labs-optical-switches-ai-clusters) with hyperscalers and neocloud operators.

The near-term customer is a different industry entirely. Neutral-atom quantum computers need the same component Dipole is building, because holding atoms in place requires steering large numbers of laser beams with precision. That market is far smaller and far less demanding about long-run reliability, but it pays now. Dipole reports over \$1 million in letters of intent from neutral-atom quantum computing companies, a figure that appears in no public document and rests on the company's word.

## Market Size

Cignal AI forecast in July 2026 that the optical circuit switching market would exceed \$8 billion by 2030, growing at more than 30% a year, up from a December 2025 forecast of \$2.5 billion by 2029. The revenue is already visible in public company results. Lumentum and Coherent are guiding to between \$100 million and \$400 million from switching within a few quarters, and Lumentum has disclosed a multi-year, multi-billion-dollar switching agreement with one hyperscaler that it expects to approach a \$1 billion annual run rate in 2027. That last figure matters more than the market total for a company at Dipole's stage, because it establishes that one hyperscaler design win can carry a supplier on its own.

The demand driver is the gap between what data centers cost and how well they are used. When capital spending at the five largest buyers approaches \$690 billion a year, a 25% improvement in useful compute is worth more than most software categories. It is also why the incumbents are moving. NVIDIA's \$6 billion of investment across three optics suppliers in a single month of 2026, and its participation in iPronics in September, are the clearest signal that the company closest to the bottleneck considers optical switching strategic.

## Competition

The category has attracted well-capitalized entrants, and Dipole is the smallest of them by a wide margin.

**nEye** is the closest comparable and the furthest ahead. It is building an optical circuit switch on a silicon photonics chip, moving toward a semiconductor foundry model, and raised an \$80 million Series C in April 2026 for [\$152 million in total](https://www.sdxcentral.com/news/neyeai-secures-80m-series-c-to-enhance-optical-circuit-switching-for-ai-infrastructure/) from Sutter Hill, CapitalG, and M12. That is more than twenty-five times the capital Dipole is likely to have raised, with Google's and Microsoft's venture arms on the cap table.

**iPronics** raised a \$125 million Series B in September 2026 in a round NVIDIA joined, for \$177 million in total, giving it both capital and a relationship with the company that defines rack architecture.

**Salience Labs** competes on transparency as much as technology. Its published 32-port specification sets a disclosure standard that Dipole has not yet met, and a buyer comparing the two today has numbers from one and targets from the other.

**Oriole Networks** is pursuing a full-stack photonic networking approach spanning interface cards, switches, passive routing, and software.

**Lumentum and Coherent** are the incumbents, supplying Google today. They compete on distribution, manufacturing maturity, and customer relationships rather than on switching speed, which is the axis Dipole has chosen.

**Google and Meta** design in-house, which removes the two largest potential buyers from the addressable market for any merchant vendor, at least for their own fleets.

Standardization cuts both ways. The Open Compute Project launched an optical circuit switching subproject in July 2025 with Google, Microsoft, NVIDIA, and several photonic vendors participating. Common interfaces lower the cost for a buyer to adopt a new switch, which helps a startup get in the door. They also make vendors substitutable once several of them meet the same control and reliability requirements, which erodes pricing power later.

## Business Model

Dipole sells hardware, and the pricing logic follows the value it claims to unlock rather than the cost to build. If a one-gigawatt site gains up to \$1 billion a year in effective compute, a component vendor capturing the 5% to 10% of created value that hardware suppliers typically command would earn \$50 million to \$100 million a year from that site. On those assumptions, three to six gigawatt-scale sites support roughly \$300 million in annual revenue. Both the value figure and the capture rate are estimates rather than disclosed terms.

The quantum business operates on different logic. It will never be large enough to carry the company, and its purpose is not revenue. It funds device iterations and, more importantly, generates reliability data from customers who are actually running the hardware. A hyperscaler will not qualify a switch on bench results alone, and the quantum market is the cheapest available path to a field record.

## Traction

As of September 2026, Dipole has no revenue, no data center pilot, and no published prototype data.

What exists is commercial interest from the secondary market and institutional interest from investors. The company reports over \$1 million in letters of intent from neutral-atom quantum computing companies, unpublished and unverified, which if accurate is meaningful at pre-seed chiefly because it is a commitment from a technical buyer who has evaluated the device. Cisco Investments has taken a position, though amounts and structure are unpublished; for a networking incumbent, an early stake functions as a window onto the category as much as a financial bet. The company launched publicly on August 13, 2026, and was among the most-cited names from a Demo Day that venture investors described to TechCrunch as feeling like science fiction.

Headcount is two.

## Valuation

No priced round has been disclosed. Dipole participated in Y Combinator's Summer 2026 batch on standard terms and lists Cisco Investments as a backer without published amounts. A first priced round would be expected to form in the months following the September 10 Demo Day.

For reference on where the category prices, nEye has raised \$152 million in total across a Series C, and iPronics closed \$125 million in September 2026. Those are several rounds ahead of where Dipole sits.

## Key Opportunities

### Converting the quantum beachhead into a reliability record

The letters of intent are worth more as a source of field data than as revenue. If Dipole ships to neutral-atom customers and accumulates operating hours, it arrives at hyperscaler conversations with something no competitor's bench specification can substitute for, which is evidence that the device survives use.

### A design partnership with a neocloud rather than a hyperscaler

Google and Meta build their own, and the remaining hyperscalers qualify hardware on multi-year cycles. Neocloud operators run clusters at comparable scale with far shorter procurement cycles and a sharper incentive to squeeze utilization out of GPUs they have financed. A neocloud pilot would be the fastest available route to real workload data.

### Owning the control layer as well as the switch

The hardware advantage is replicable by a better-capitalized competitor; the software that learns a cluster's communication patterns and times reconfiguration to job phases is a compounding asset that improves with every deployment. If the control layer becomes the part customers depend on, the switch underneath becomes harder to swap out.

### Computing with light rather than only moving it

The company has gestured at a roadmap extending from optical transport toward optical computation. Nothing has been described publicly, and it is best treated as a direction rather than a plan, but it is the version of the company that would justify the largest outcomes.

## Key Risks

### The device may not survive packaging

Photonic components routinely lose their laboratory advantage in the transition to a manufacturable product, where yield, insertion loss, thermal behavior, and control electronics compound. This is the failure mode that ends most hardware companies at this stage, and the founders' device expertise is the main argument against it.

### The disclosure gap is widening

Competitors publish specifications; Dipole publishes targets. As the category matures and the Open Compute Project standardizes interfaces, buyers will compare measured numbers. A company that cannot publish port count, loss, and power at some point stops being considered.

### Capital asymmetry

nEye has \$152 million in funding, likely more than twenty-five times Dipole's undisclosed total, with Google's and Microsoft's investment arms behind it; iPronics has NVIDIA. Photonic tape-outs and packaging consume tens of millions before revenue, and a well-funded competitor reaching adequate performance first would likely end the race regardless of who had the better physics.

### The gain depends on software Dipole does not control

A fabric that can reconfigure inside a job only helps if schedulers and collective communication libraries cooperate with it. Those libraries are controlled by NVIDIA and the frameworks, and if they never adapt to a fast fabric, the 25% figure stays theoretical.

### Buyer concentration

A handful of operators constitute the market, and two of the largest design in-house. Design partnerships with a few hyperscalers can absorb years of engineering adaptation without producing a repeatable product.

### Intellectual property origin

Both founders did the underlying work as postdoctoral researchers at Harvard, and university ownership or licensing terms covering inventions from that period would encumber the company.

## Summary

Dipole Labs is a bet that a physics result becomes a manufacturable product before better-funded competitors reach the same performance. The market signal is unambiguous. Google has validated optical circuit switching in production for more than a decade, NVIDIA committed \$6 billion across three optics suppliers in a single month, and the constraint on AI capacity has moved from acquiring GPUs to using them. The question is not whether fast optical switching matters.

The question is whether two physicists with no product, no foundry, no published specification, and no data center customer can get there ahead of nEye and iPronics. The most interesting detail in the company's position is the quantum beachhead, a second market that needs the identical component, tolerates far lower reliability, and pays while the real product matures. If those shipments happen, the operating data they generate is worth more than the revenue.

Everything else waits on a number the company has not yet published.
