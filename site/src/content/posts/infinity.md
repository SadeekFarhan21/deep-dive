---
title: "Infinity"
description: "Infinity's agent writes the kernels, compiler and debugging tools a new AI chip needs to run models, attacking NVIDIA's software moat on the evidence of one live partner and company-reported numbers."
slug: infinity
company: "Infinity"
stage: "Seed"
sector: "AI infrastructure"
tags:
  - ai-infrastructure
  - semiconductors
  - compilers
draft: true
category: ventures
---

## Overview

Infinity builds an agent, called Ignition, that writes the software layer a new AI chip needs before anyone can run a model on it. That layer is not a driver. It is thousands of hand-tuned math routines called kernels, plus the compiler that lays a model across the chip's memory, plus the profiler, debugger and SDK that make the whole thing usable by an engineer who does not work at the chip company. Producing it has historically taken specialist teams years per chip, which is the single largest reason that better silicon keeps losing to NVIDIA. Infinity's claim is that an agent can do it in days, and it prices itself on a share of the performance it unlocks rather than a license fee.

| Fact | Detail |
| --- | --- |
| Founded | August 2025 |
| Headquarters | San Francisco |
| Founder | Jeremy Nixon (CEO) |
| Stage | Seed |
| Total funding | \$15M at \$100M post-money, July 2026 |
| Disclosed investors | Touring Capital, Principal VC, angels from chip companies, OpenAI and Anthropic, and the founder |
| Employees | 26 |
| Revenue | Millions recurring, company-reported |
| Chip partners | 1 live |

## Thesis

NVIDIA's position does not rest on transistors. It rests on the fact that a model written in PyTorch runs well on NVIDIA hardware on the first try and does not run well, or at all, on anything else. Two decades of CUDA is the reason, and every challenger chip, from startups to hyperscaler silicon teams, arrives at the same wall. The hardware benchmarks well in isolation and cannot be used by customers without a software stack that does not exist yet.

The money betting against that wall is now enormous. NVIDIA holds roughly 75% to 85% of data-center AI accelerators, depending on whether hyperscalers' in-house chips are counted. Deloitte predicts inference will be roughly two-thirds of AI compute in 2026, and inference is the workload where a specialized chip has the best case against a general one. Etched was valued at \$21 billion in August 2026; AMD agreed to acquire Taalas the same month; Google, Amazon, Microsoft and Meta all run their own inference silicon programs. The [Converge Digest tracker](https://convergedigest.com/ai-inference-semiconductor-startups-tracker/) is the running tally.

Infinity's bet is that the constraint on all of them is the same, and that it is automatable. If true, the company is the asset-light way to own the challenger race. It does not have to pick which chip wins, because it can sell to every program at once, and each engagement teaches the agent something that makes the next one cheaper.

The contrarian part is the claim itself. A twenty-year moat built by the best systems engineers in the industry, dissolved by an agent. That is either the most interesting thing in AI infrastructure or an overreading of one customer's results, and the public evidence does not yet separate the two.

## Founding Story

Jeremy Nixon founded Infinity in San Francisco in August 2025. He was previously a researcher at Google Brain, studied mathematics at Harvard, and created AGI House, the San Francisco residency and event series that functions as a hub for the technical AI community. He put his own money into the seed round alongside Touring Capital and Principal VC.

He is a solo founder, and who runs engineering under him is not public, which is a real gap. The product is a systems and compilers product, the hardest hiring market in software, and the company's entire claim rests on the quality of that team's output. The angel list of investors from chip companies, OpenAI and Anthropic suggests that the people closest to the problem think the approach is credible, which is the best available third-party signal at this stage.

## Product

Ignition is an agent that produces a toolchain, not a single artifact.

### Kernel generation

The agent writes, tests and tunes the kernels a model needs on a given chip. Engineers steer the architecture; the agent does the search over implementations that has traditionally consumed the specialist's year.

### The rest of the toolchain

Compilers, profilers, debuggers and SDKs come from the same system. In the d-Matrix engagement the founder has described the specific tools produced, a compiler that lays a model across the chip's memory hierarchy, a chip simulator that let most of the work proceed without physical cards, a static memory sanitizer that catches errors before a run and was made ninety times faster by a rewrite in Rust, and an agentic debugger that finds and fixes faults in generated code.

### Unfamiliar hardware

The stated differentiator against a general coding model is proprietary instruction sets that no frontier model has seen in training. This is the load-bearing technical claim of the business and the one with the shortest expected life if frontier models keep improving.

### A self-improvement loop

Performance data from deployed kernels feeds the next generation of the agent. If it works, it is the compounding asset; the company says the ten-day build is now its baseline for a new chip.

## Customer

Infinity sells to anyone shipping silicon that is not NVIDIA's, and the segments differ sharply in size and reachability.

| Segment | Examples | Status |
| --- | --- | --- |
| Challenger chip startups | d-Matrix, Etched, MatX, Positron, SambaNova, Fractile, Euclyd | d-Matrix live, others in talks |
| Hyperscaler silicon teams | Google, Amazon, Microsoft, Meta | None disclosed; the largest prize |
| Incumbents' non-CUDA lines | AMD, Qualcomm, Intel | None disclosed |
| Inference clouds on non-NVIDIA chips | General Compute on SambaNova | Indirect demand |

The hyperscaler row is where the money is and also where the risk of being insourced is highest. Those teams have compiler engineers already and may regard this software as core rather than procurable. The challenger startups are the reachable market today, and their willingness to outsource is partly a function of not having the engineers to do otherwise.

## Market Size

Twenty or more chip programs spending \$5 million to \$20 million a year each is a \$100 million to \$400 million market before any revenue share, and the revenue-share model is what would take it higher. That is a sizing from the supply side, not a published figure.

<figure data-figure="venture:infinity-challengers"></figure>

The more useful framing is derivative exposure. Infinity's revenue is a function of how much inference revenue moves to non-NVIDIA silicon. The tens of billions flowing into challenger chips, plus four hyperscaler in-house programs, is the bet that this share becomes material. If it does not, Infinity is selling into a category of customers who never reach scale, and the quality of its agent will not save it.

<figure data-figure="venture:infinity-etched-groq"></figure>

## Competition

| Competitor | Type | Threat |
| --- | --- | --- |
| Modular | Hardware-agnostic AI software, \$1.6B (2025) | High; closest comparable |
| Chip vendors' own compiler teams | In-house | High; may treat this as core |
| Triton, vLLM, SGLang | Open source | Medium; layer above, likelier partners |
| Frontier coding agents | General models | Medium, rising; could erase the edge |

The last row is the one that matters most and is the hardest to handicap. Infinity's defense is that proprietary instruction sets are absent from the training data of general models. That is true today. It is an argument about a gap in a distribution, and distributions are exactly what keeps getting filled.

The in-house threat has a particular shape. The fastest way for a chip vendor to learn that this work can be automated is to hire Infinity and watch. A contract that does not address ownership of the generated kernels hands the customer a blueprint.

## Business Model

Infinity charges no upfront license. It takes a share of the inference revenue earned on chips it enables, measured in tokens per second, which prices the outcome rather than the work. The terms are undisclosed; the table below assumes a 1% to 3% share, which is an assumption rather than a disclosed term.

| Partner annual inference revenue | Infinity at 1% to 3% |
| --- | --- |
| \$100M | \$1M to \$3M |
| \$500M | \$5M to \$15M |
| \$2B | \$20M to \$60M |

Five partners at the middle row is \$25 million to \$75 million a year. The model is elegant and completely untested. It requires metering someone else's revenue, auditing a performance attribution, and surviving a renegotiation the first time a partner's finance team models what the share costs at scale. The likeliest failure is not refusal but reversion, contracts settling into one-time fees with services margins, which is a different and much less valuable company.

## Traction

All figures are company-reported and unverified.

| Result | Figure | Hardware | Measured against |
| --- | --- | --- | --- |
| 92% of theoretical peak on tensor-parallel matrix multiplication, not end-to-end inference | 10 hours from first silicon | d-Matrix Corsair | The chip's own theoretical peak |
| Frontier models running end to end (Qwen3, Qwen3.5, Gemma4) | 3, within 10 days | d-Matrix Corsair | Nothing; an existence claim |
| Qwen 3 | [20x tokens per second](https://lasvegassun.com/news/2026/aug/13/infinitys-agentic-tools-get-ai-chips-inference-rea/), 16x context | One Corsair card | Infinity's own first port of the model |
| Qwen3-8B | 34% more throughput after one day | A single NVIDIA H100 | vLLM |

The d-Matrix results are genuinely striking if they hold, and they are a single data point produced by the vendor of the thing being measured, on hardware whose maker also benefits from the number. Read the columns before the figures. The 92% is a matrix-multiplication microbenchmark against the chip's own theoretical peak, not a model serving tokens; the 20x is measured against Infinity's own first attempt rather than against anything a customer would otherwise run; and the 34% is an NVIDIA result, which is the one number here that says nothing about unfamiliar silicon. d-Matrix has not submitted Corsair to MLPerf, so no neutral benchmark of the hardware exists, let alone of Infinity's software on it. What is missing is a second architecture. The human share of the work is also unclear, and the difference between an agent that did this and a strong team with excellent tooling that did this is the difference between the two largest outcome scenarios and the two smallest.

## Valuation

The July 2026 seed was [\$15 million at a \$100 million post-money valuation](https://www.businesswire.com/news/home/20260720324097/en/Infinity-Raises-\$15-Million-in-Seed-Funding-to-Build-the-Software-Layer-That-Makes-Any-AI-Chip-Inference-Ready), led by Touring Capital and Principal VC with angels from chip companies, OpenAI and Anthropic. The d-Matrix case study followed a month later. A company with revenue, a marquee technical result and a scarce capability in the most heavily funded hardware race in a generation will not price near \$100 million again.

## Key Opportunities

### A second architecture

One live partner on one memory architecture is the entire evidence base. A result on a fundamentally different chip converts the central claim from anecdote to capability, and it is the cheapest, fastest thing the company can do to remove the largest doubt about it.

### A hyperscaler silicon team

Google, Amazon, Microsoft and Meta run the largest non-NVIDIA programs in the world. One of them as a customer would simultaneously end concentration risk, validate the approach at the highest technical bar available, and reprice the company.

### The self-improvement loop as a real moat

If performance data from deployed kernels measurably improves the next engagement, Infinity accumulates an advantage no frontier model can replicate from public data, because the data is generated by deployment. This is the part of the thesis that could still be true even if general models catch up on raw code quality.

### Being the neutral layer

Every challenger needs this and none of them wants to fund it alone. A vendor that serves all of them occupies a position with real structural value, provided contracts prevent each customer from internalizing the capability after the first project.

## Key Risks

### Single partner

d-Matrix is the proof, the revenue and the reference. If d-Matrix loses momentum, all three go at once.

### Derivative demand

Infinity only wins if non-NVIDIA silicon takes meaningful inference share. That is a bet on an outcome the company does not influence.

### Disintermediation

The engagement teaches the customer that the work is automatable. Without contractual protection over the generated kernels, the second chip gets done in-house.

### Untested pricing

Revenue share on performance has to be metered and audited on the partner's books. Nobody has demonstrated this at scale, and the fallback is a much lower-margin business.

### Self-reported claims

Every performance figure comes from the company or its one partner, and the human share of the work is undisclosed.

### Frontier models close the gap

The entire technical differentiator is that general models have not seen proprietary instruction sets. Two years is a long time for that to remain true.

### Solo founder, undisclosed engineering leadership

Twenty-six people building compilers, and no public information about who leads them.

## Summary

Infinity is the clearest expression of a question the AI hardware market has been circling for three years. Is NVIDIA's software lead a permanent structural advantage, or an enormous pile of work that nobody had a way to automate until now?

The evidence that it might be the second thing is real but thin. Ten hours to 92% of theoretical peak on matrix multiplication on unfamiliar silicon, three frontier models running inside ten days, and a toolchain of compiler, simulator, sanitizer and debugger that looks reusable rather than bespoke. Nearly all of it comes from one partner, reported by the company, on one architecture, and none of it has been independently measured.

The two things that would settle it are a result on a fundamentally different chip and a customer who is not d-Matrix. Neither exists publicly yet. Until they do, this is a company selling a scarce capability into the best-funded hardware race in a generation on the strength of a single, very good demonstration. That is roughly the most interesting position a seed-stage infrastructure company can occupy, and also the least resolved.
