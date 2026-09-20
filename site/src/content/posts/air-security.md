---
title: "AIR Security"
description: "AIR Security vets the skills, plug-ins and MCP servers that enterprise AI agents install. It left stealth in September 2026 with more than 20 customers and $50 million raised across two seed rounds."
slug: air-security
company: "AIR Security"
stage: "Seed"
sector: "AI security"
tags:
  - ai-security
  - agents
  - enterprise-software
draft: true
category: ventures
---

## Overview

AIR Security sells a control layer for the software that AI agents install in order to do their jobs. An enterprise agent is rarely useful on its own; it becomes useful when it picks up a skill, a plug-in, or an MCP server that teaches it to query a database, file a ticket, or move money. Each of those add-ons is code and instructions written by someone outside the company, installed by a system that already holds valid credentials. AIR discovers every agent running inside an organization, inspects each add-on before it is approved, re-inspects it after deployment, and traces and revokes anything that turns out to be malicious. The company left stealth on September 1, 2026 with more than 20 customers and \$50 million raised across two seed rounds.

| Fact | Detail |
| --- | --- |
| Founded | February 2026 |
| Founders | Yair Saban (CEO), Niv Hoffman (CTO) |
| Stage | Seed |
| Total funding | \$50M across two rounds |
| Disclosed investors | Sequoia (led \$10M), Greenoaks (led \$40M), Swish, Netz |
| Employees | 40 |
| Customers | 20+ |

## Thesis

Every previous wave of enterprise software produced a supply chain, and every supply chain eventually produced an attack on it. Package registries gave us dependency confusion and typosquatting. Browser extension stores gave us permission abuse. Mobile app stores gave us code signing, review, and revocation, built after the fact and at considerable cost. Agent add-ons are the current instance of the pattern, and they arrived without any of the controls the earlier ones eventually acquired.

What makes this instance different is that the payload need not be code. An add-on can be dangerous because of what it tells the agent to do in plain language, and the agent will comply using credentials the company issued it. AIR's own research puts numbers on how wide the exposure already is. More than 17,800 public add-ons pull instructions from sources outside themselves after installation, and those add-ons account for [6.7 million installs](https://www.securityweek.com/ai-agent-firewall-startup-air-security-emerges-from-stealth-with-50-million/). About 27% of what the company scans gets filtered out, though that is its product's reject rate at its own thresholds rather than a measured property of the ecosystem, published without a methodology or a false-positive rate. The one independent study of the same terrain, from a university group in January 2026, found 26.1% of skills carrying at least one vulnerability across a different population and a different definition, so the two numbers agree by coincidence rather than corroboration. It has found skills impersonating Anthropic and OpenAI, built specifically to pass a security review.

The structural argument for a company here is that nothing in the existing stack looks at this. Code scanners read source and dependencies, and the instruction is not code. A one-time security review inspects the add-on on the day it is approved, and the add-on fetches new instructions the following week. Endpoint and network tools watch devices and traffic, and the agent's traffic is authenticated and ordinary. Identity tools know which permissions an actor holds, not what an installed skill is telling that actor to do. Sequoia's partner framed the gap as a continuous re-verification problem rather than a scanning problem, which is the right distinction and also the harder product.

The thesis that has to hold beyond the wedge is that a neutral third party gets to own this. That is the open question, and the whole valuation rests on it.

## Founding Story

Yair Saban and Niv Hoffman both came out of Unit 8200, Israel's signals intelligence corps, from the offensive side. That background is the most relevant credential available for this particular problem, because supply chain compromise, getting your code into something the target already trusts and letting the target run it with its own privileges, is the technique offensive teams practice rather than the one defensive vendors are organized around. The founders were, in effect, selling a product against the attack they knew best.

They founded the company in February 2026 and raised twice in quick succession, \$10 million led by Sequoia, then \$40 million led by Greenoaks weeks later, with Swish and Netz participating. The second round arriving that fast, at that size, before any public launch, is a signal about competitive pressure in the category more than about the company's progress.

They added Ryan Knisley as chief strategy officer. He was previously chief information security officer at Disney and at Costco, and his function is legible. Two offensive security founders can build the product but cannot, on their own, sit across from a bank's security committee as a peer. The angel list points the same direction, with Wiz co-founder Yinon Costica, Clay co-founder Varun Anand, former US cyber official Anne Neuberger, and Cognition's Zach Frankel.

## Product

AIR's product is organized around the lifecycle of an add-on rather than around a single inspection event.

### Discover

Find every agent running inside the company, including the ones no one told security about. This is the unglamorous half of every security product and usually the reason the first meeting goes well, because the inventory itself is a finding.

### Vet

Inspect each skill, plug-in, and MCP server for malicious instructions, excessive permissions, and supply chain risk before it is approved.

### Re-verify

Check again after deployment. This is the part that distinguishes the product from a scanner, and it exists because add-ons pull fresh instructions from outside sources after they have been approved. An add-on that was safe at review time is not necessarily safe now.

### Trace and revoke

When something is found to be bad, find every agent and workflow that depends on it and remove it everywhere. In an environment where agents install add-ons that call other agents, this is a graph problem rather than a delete operation.

### Marketplace

Offer a catalog of add-ons that have already been vetted. This is the piece with the most strategic upside and the least evidence behind it. A vetted registry that enterprises standardize on is a durable position, and it is also precisely what a model provider could ship for free.

## Customer

The buyer is the enterprise security organization, and the demand is concentrated where it usually is for a new control, in financial services and pharmaceuticals. Those are the segments that deploy agents against regulated data, carry audit obligations that require them to say what software is running and why, and have budget lines for categories that did not exist last year.

More than 20 customers signed in roughly six months, about a quarter of them large enterprises. For a company that launched publicly on September 1, that is real commercial traction and not yet evidence of anything durable. None of these contracts has reached a renewal, there is no disclosed expansion data, and founder-led selling into a novel category with a \$50 million round behind it is the easiest selling conditions a security company ever has.

## Market Size

The honest version of this market is that it is small now and everyone is pricing it for what it becomes.

| Signal | Figure |
| --- | --- |
| Category revenue today | Under \$100M |
| AIR's projection, end of 2027 | \$1B+ |
| Agent security funding, two weeks at RSA (March 2026) | \$392M+ |
| Peer valuations | Glow \$1.2B, 7AI \$700M, Onyx \$640M |
| Incumbent entry | Microsoft Agent 365, \$15 per user per month on top of an E5-class licence |

Sources are [Enera](https://www.eneralabs.com/blog/air-security-50m-ai-agent-firewall-enterprise-2026/) and [Software Strategies](https://softwarestrategiesblog.com/2026/03/28/agentic-ai-security-startups-funding-mna-rsac-2026/).

A category with under \$100 million of combined revenue supporting several unicorn valuations is a category being priced on the size of the installed base it might eventually tax, not on what it currently earns. The Microsoft line is the one to watch, because \$15 per user per month for Agent 365 sets a reference price for agent governance that every startup in the category will be compared against, whether or not the products actually overlap.

<figure data-figure="venture:air-funding"></figure>

## Competition

The category has organized itself into layers faster than most, and AIR sits in one that nobody else leads.

| Layer | What it secures | Companies |
| --- | --- | --- |
| Add-on supply chain | The skills, plug-ins and MCP servers agents install | AIR, Traceforce |
| Runtime control plane | Each step of an agent's reasoning and actions | Onyx Security, Noma, Zenity |
| Machine identity | Credentials and access for non-human actors | Oasis Security |
| Offensive testing | Finding flaws before attackers do | Fabraix, RunSybil |
| Certification and insurance | Proof an agent is safe to deploy | AIUC |
| Endpoint | Employee devices in the AI era | Glow |

That map is the opportunity and the risk in one picture. AIR owns its layer, and the layer above it is occupied by companies with more capital and a broader surface area. **Onyx Security** has raised \$153 million for a control plane that monitors each step of an agent's reasoning, and is integrated with Anthropic; add-on vetting is a feature it could ship rather than a company it would have to buy. **Noma**, **Zenity**, and **Geordie**, which won the 2026 RSA Innovation Sandbox, are adjacent. **AIUC** certifies agents and is complementary.

The largest threat is not a startup. If Anthropic, OpenAI, or Microsoft sign and verify add-ons at the platform level, the way mobile app stores eventually did, the independent vetting layer becomes a compliance checkbox rather than a control. Two of the three have already started. Anthropic's Software Directory Policy, updated in April 2026, commits it to "both initial and ongoing reviews" of listed software and requires developers to verify ownership of any external resource their software retrieves, which is AIR's re-verification pillar and its central threat written into platform policy. Microsoft's Agent 365, generally available since May 2026, is converging into a unified agent registry carrying publisher provenance. Neither yet inspects what an enterprise installs from outside its own directory, and neither has shipped cryptographic signing, which is the gap AIR occupies.

<figure data-figure="venture:air-timeline"></figure>

## Business Model

Pricing and revenue are undisclosed. The table below assumes \$100,000 to \$400,000 per enterprise customer per year, which is a working assumption for a security control sold to this buyer and not a figure the company has published.

| Customers | Implied recurring revenue | Multiple at a \$600M valuation |
| --- | --- | --- |
| 20, today | \$2M to \$8M | 75 to 300 times |
| 100 | \$10M to \$40M | 15 to 60 times |
| 300 | \$30M to \$120M | 5 to 20 times |

The first row is the price risk stated in one line. Anyone entering at the valuations this category is currently clearing is paying for the third row and taking the execution between them on faith.

## Traction

| Metric | Figure |
| --- | --- |
| Large enterprises among customers | 25% |
| Company age | Six months |

The research output deserves separate mention, because it is doing commercial work as well as technical work. Publishing that 6.7 million installs trace to add-ons which fetch instructions from untrusted sources, and that skills impersonating Anthropic and OpenAI are circulating, defines the problem in public in terms that make AIR the obvious first call. That is the standard playbook for a new security category and it is being run well.

## Valuation

The \$50 million seed was raised across two rounds, and neither valuation is public. The relevant comparables are peers rather than the company's own history. Glow is at \$1.2 billion, 7AI at about \$700 million, Onyx at about \$640 million, with Onyx having reached its Series B price roughly four months after its Series A. A Series A for AIR in the coming months would form against those marks, in a category whose combined revenue is under \$100 million.

## Key Opportunities

### The marketplace becomes the registry

If enterprises standardize on a vetted catalog as the only sanctioned way to install an add-on, AIR stops being an inspection tool and becomes the distribution point. That is a far more defensible position than scanning, and it is the version of this company worth the prices being discussed.

### Partnership with a model provider

The largest threat and the largest distribution opportunity are the same event. A provider that decides verification is better done by a specialist, and routes it through AIR, converts the platform risk into a channel.

### Expansion along the agent lifecycle

Discovery and revocation give the company an inventory of every agent and every dependency in the enterprise. That graph is the natural substrate for adjacent products, and it accrues while the wedge is being sold.

### Regulated-buyer gravity

Banks and pharmaceutical companies buy slowly and then buy deeply, and they set the reference architecture others copy. Concentration in those segments early is a better sign than the same customer count spread across technology companies.

## Key Risks

### Platform risk is the whole thesis

Signed, verified add-on registries from Anthropic, OpenAI, or Microsoft would move this problem to the platform layer, where it has historically ended up. This is no longer a risk about intentions. Anthropic committed to ongoing review of its directory in April 2026 and Microsoft shipped an agent registry in May, both before AIR launched publicly. What remains unresolved is scope rather than direction. Platform review covers a platform's own directory, not the add-on an enterprise installs from anywhere else, and that gap is the whole of AIR's position.

### The layer above can absorb this one

Onyx and the other control-plane companies are one product release away from add-on vetting, and they are selling to the same security leader with a broader story.

### No renewal data exists

The company is six months old. Every customer is inside its first contract, and founder-led selling in a new category with a large round behind it is not yet evidence of product-led retention.

### Valuations are far ahead of category revenue

Under \$100 million of combined revenue is supporting several unicorns. If the agent deployment curve flattens for a year, the repricing in this category will be severe regardless of which company executes best.

### Consolidation may arrive before scale

There are more funded companies here than the category can support. Two or three platforms will absorb the rest, and the question for any given company is whether it has the revenue to be an acquirer rather than a component.

## Summary

AIR Security is a well-executed answer to a problem that is real, growing, and currently unowned. The research is credible, the founders' background matches the threat, the early customer mix is the right one, and the layer they have chosen is genuinely unoccupied by a leader.

The difficulty is structural rather than operational. The history of software supply chains is that the platform eventually absorbs verification. Code signing, app review, and package attestation all ended up with the platform rather than with a third party. The platforms in question here are three of the best-capitalized companies in the world. AIR's path to durability runs through becoming the registry enterprises standardize on before that happens, or through a partnership that turns the platform into a channel.

The customer count, the research and the round sizes are all evidence that the category is real. None of it yet settles who ends up owning it.
