---
title: "Wafer"
pubDatetime: 2026-09-14T14:56:28.000Z
description: "Wafer builds autonomous performance-engineering agents to optimize GPU kernels and inference stacks"
slug: wafer
company: "Wafer"
tags:
  - ai-infrastructure
  - inference
  - gpu
draft: false
category: ventures
---

## Overview

Wafer builds AI agents that optimize how models run in production, searching across the model, the serving engine, low-level GPU kernels, and the underlying hardware to find the fastest and cheapest deployment for a given workload. It sells the results as hosted open-source models served through a standard API, on both NVIDIA and AMD chips. The company addresses the shortage of performance engineers and the software gap that keeps buyers dependent on a single chip vendor.

| | |
| --- | --- |
| Founding Date | May 2025 |
| Headquarters | San Francisco, CA |
| Total Funding | \$44M |
| Status | Private |
| Stage | Series A |
| Employees | 10 |

*ARR is from a third-party tracker, September 2026, and is not company-confirmed.*

## Thesis

In AI Computing, NVIDIA is in a very unique position not only because of the hardware, but also because of its software. Since introducing CUDA in 2007, the company has accumulated a large portion of optimized code, along with compilers, profilers, and debuggers, and most AI frameworks assume NVIDIA hardware by default. Competing accelerators often come up with comparable specifications and lower prices, then deliver a fraction of their expected performance because the programs that execute a model's arithmetic have not been tuned for them.

Howeever, that optimization is skilled manual work. Each operation in a model is executed by a small program called a kernel, and a kernel written for a specific chip, batch size, and sequence length can be several times faster than a generic one. Above the kernels, the serving engine has dozens of settings governing batching, memory, and parallelism. Above that are choices about numerical precision, draft models, and how a model is divided across chips. These choices interact with one another and with the traffic a deployment receives. The people who can navigate this space are scarce. And Wafer's [2025 launch materials](https://www.ycombinator.com/companies/wafer) claimed that leading GPU engineers command compensation above \$2 million per year and that most teams use less than half of the hardware they pay for.

Optimization is also typically performed once, before launch. Traffic patterns then shift, new model versions ship, and new hardware becomes available, and the tuning becomes stale. As inference grows to a majority of AI infrastructure spending, which [Gartner](https://www.gartner.com/en/newsroom/press-releases/2026-08-10-gartner-forecasts-worldwide-artificial-intelligence-optimized-iaas-spending-to-grow-96-percent-in-2026) expects in 2026, the cost of running below a chip's potential rises with it.

The economic stakes rise with usage. According to [Contrary Research](https://research.contrary.com/company/openrouter), agentic systems require five to 30 times more compute per task than a standard chatbot, and the AI inference market is projected to grow from \$106 billion in 2025 to \$255 billion by 2030. As of November 2025, production LLM systems were already processing tens of trillions of tokens per day, which makes latency and cost central to whether AI applications can operate at scale.

## Founding Story

Wafer was founded in 2025 by Emilio Andere (CEO) and Steven Arellano. The two met in their first year at the University of Chicago, where they were roommates.

Andere studied mathematics, researched the use of transformers for weather prediction at Argonne National Laboratory, worked on adversarial machine learning at the university's SAND Lab, and was an engineer at the AI research company Elicit. Arellano studied computer science and economics, conducted research on large language models, and worked as an engineer at Two Sigma, at Google on infrastructure for the Bard assistant, and at Sei Labs.

The pair entered Y Combinator's Summer 2025 batch under the name Herdora, which remains the company's legal name. Their first product took a customer's PyTorch code and generated custom GPU kernels for it, then monitored the deployment in production to detect and fix inefficiencies. They described it as Cursor for CUDA. The target customers were machine learning teams with growing GPU bills that could not afford to hire GPU optimization specialists or pay consultants who, according to the launch post, charge \$50,000 or more per project.

The founders have framed the company's mission more broadly than its first product. In their words, the hardest problems are now limited by the cost of intelligence per unit of energy, and the goal is to maximize intelligence per watt by using AI to optimize AI infrastructure. The company states its long-term ambition as making intelligence "too cheap to meter."

## Product

Over its first year, Wafer shifted from selling an optimization tool to selling the output of that tool.1 As of September 2026, its primary offering is hosted inference for open-source models, with the optimization system serving as the means of production.

| Offering | Description | Public evidence |
| --- | --- | --- |
| Serverless inference | Hosted open-source models behind a standard API | Live; integrated with the TrueFoundry gateway |
| Tuned deployments on AMD | Open models tuned for AMD's MI355X | Published results for GLM-5.2, Kimi K3, Qwen 3.5, Qwen 3.6 |
| Tuned deployments on NVIDIA | Optimized weights and kernels for Blackwell | Low-precision Kimi K2.6 weights, with Parasail |
| Work inside other clouds | Wafer's engineering applied to another provider's infrastructure | Joint DigitalOcean write-up, large AMD speedups for Kimi, DeepSeek, GLM |
| The original developer tool | PyTorch in, custom kernels out, with production monitoring | The launch product; current status unclear publicly |

### Serverless inference

Wafer serves open-source models through an API that is compatible with OpenAI's, with zero retention of customer data. The company describes this as the fastest open-source models for enterprises at the lowest cost per token.

### Optimization agents

Wafer's agents learn a workload's traffic patterns and performance constraints, such as a latency ceiling or a cost target, and search for the best deployment across four layers. At the model layer they adjust numerical precision and draft models; at the engine layer they tune batching and memory; at the kernel layer they generate new code; and at the hardware layer they choose between NVIDIA and AMD. The agents compile, run, and measure the performance against speed and quality targets, and the ones that improve on the current deployment are kept while the search continues. A [job posting](https://www.ycombinator.com/companies/wafer/jobs/umtIMMA-member-of-technical-staff) describes the underlying system as an agent framework that iterates on kernels, profiling infrastructure that connects to both NVIDIA's and AMD's performance tools, and compiler tooling that analyzes low-level GPU code.

This problem is perfect for AI agents because feedback is instant and precise. A language model proposes a change, the system compiles and runs it, and a measurement is available within minutes. A second check confirms that model output quality has not degraded. The company contrasts this with current practice, which it characterizes as manual, service-heavy, and performed once before deployment. Its [Series A announcement](https://www.wafer.ai/blog/series-a) states that new funding will support further automation of the optimization loop, with the goal of giving every deployment the equivalent of a dedicated performance engineering team. This implies that some current results still involve engineers working alongside the agents.

### Multi-hardware support

On NVIDIA hardware, Wafer released low-precision weights for the Kimi K2.6 model for the Blackwell generation in partnership with Parasail. On AMD hardware, it has published results for several frontier open models on the MI355X accelerator.

## Customer

Wafer's customers are companies that consume open-source model inference at scale and are sensitive to price and latency. Because its API follows the same conventions as other providers, customers can adopt it without changing their applications, and can leave just as easily. The angel investors in its Series A include the chief executives of [Vercel](https://vercel.com), `Cloudflare, and Deepgram, each of which operates a business that purchases or serves inference in volume.

A second customer group consists of infrastructure providers that run their own hardware and want it to perform better, including cloud platforms and chip makers. Wafer's published work with DigitalOcean and Parasail, and the investment from AMD Ventures, are early indications of this segment. For AMD in particular, software that makes its accelerators competitive with NVIDIA's for production inference addresses the main obstacle to selling them.

Routing layers offer a further path to customers. [OpenRouter](https://research.contrary.com/company/openrouter), which as of August 2026 served more than 8 million developers and routed over 100 trillion tokens per month, benchmarks more than 80 providers on price, latency, and throughput and can direct traffic automatically to whichever performs best. For a provider whose advantage is cost per token and speed, listing on such a platform converts a benchmark lead directly into volume without a sales force. The same logic works in reverse. If a competitor matches Wafer's price and speed, the routing moves traffic away just as quickly.

## Market Size

Wafer sells into the inference market, which Gartner projected in August 2026 would reach \$23.3 billion of AI-optimized cloud infrastructure spending in 2026, and approximately \$39 billion in 2027 if its 59% inference share is applied to its \$66.1 billion total, a derivation Gartner did not itself publish.

| Cloud AI infrastructure spending | 2025 | 2026 | 2027 |
| --- | --- | --- | --- |
| Inference | Not split out | \$23.3B | ~\$39B |
| Training and other | Not split out | \$19.0B | ~\$27.1B |
| Total AI-optimized IaaS | \$21.5B | \$42.3B | \$66.1B |

*From Gartner, August 2026. The 2027 split applies Gartner's 59% inference share.*

<figure data-figure="venture:gartner-inference-spend"></figure>

MarketsandMarkets, the same firm behind the \$106 billion to \$255 billion figure above, projected in October 2025 that the narrower inference platform-as-a-service market would reach \$105.2 billion by 2030, and Deloitte estimated the market for inference-optimized chips at more than \$50 billion in 2026.

The portion addressable by Wafer depends on the share of inference that runs on open-weight models and on how much of it moves to non-NVIDIA hardware. NVIDIA held roughly 80% of data-center AI accelerators as of mid-2026. Any meaningful shift in that share would require the software gap to close, which is the problem Wafer addresses.

## Competition

Wafer competes with managed inference platforms for customers, with the companies behind open-source engines for technical leadership, and with chip vendors' own software teams over who makes alternative hardware usable. It also partners with or builds on several of these competitors. It is the smallest of them by capital raised, a little over twice below the engine companies and more than forty times below the platforms.

| Company | Total funding | Latest disclosed valuation |
| --- | --- | --- |
| Baseten | \$2.1B | \$13B (June 2026) |
| Fireworks AI | \$1.8B | \$17.5B (July 2026) |
| Together AI | \$1.3B | \$8.3B (July 2026) |
| Inferact (vLLM) | \$150M | \$800M |
| RadixArk (SGLang) | \$100M | \$400M |
| Wafer | \$44M | Above \$200M (reported) |

*From company announcements and Contrary Research. Totals as of September 2026.*

<figure data-figure="venture:wafer-capital"></figure>

**[Fireworks AI](https://fireworks.ai)**, founded in 2022, provides a managed platform for running open and enterprise-owned models. In July 2026 it raised \$1.5 billion in Series D funding at a \$17.5 billion valuation and reported more than \$1 billion in annualized revenue and 40 trillion tokens processed per day. It applies batching, caching, and speculative decoding through its own performance engineering team. Compared with Wafer, it has vastly greater scale, customers, and capital.

**[Together AI](https://together.ai)**, founded in 2022, offers cloud infrastructure for training and serving open models. It announced \$800 million in Series C funding in July 2026, for \$1.3 billion in total as of August 2026. It operates at far greater scale and offers training as well as inference, while Wafer's differentiation is automated optimization and its results on AMD hardware.

**Baseten**, founded in 2019, provides infrastructure for deploying models in production. It announced \$1.5 billion in Series F funding in June 2026, for \$2.1 billion in total. It has an established enterprise customer base and sales organization. Both compete on latency, throughput, and cost.

**RadixArk and Inferact** were formed around SGLang and vLLM, the two dominant open-source inference engines, and raised seed rounds at valuations of \$400 million and \$800 million respectively in 2026. Wafer builds on top of engines of this kind and selects among them, so their progress is an input to Wafer's product. Both also sell managed hosting, and each improvement they contribute to the open engines reduces the margin by which Wafer's tuning exceeds the default.

**Infinity**, founded in 2025, builds an AI agent that writes the inference software stack for new AI chips, including kernels, compilers, and debuggers. It raised \$15 million in seed funding at a \$100 million valuation in July 2026. Its technology is closely related to Wafer's, but its customers are chip makers instead of inference buyers.

**Modular** builds a hardware-agnostic AI software stack intended to reduce dependence on CUDA. It was valued at \$1.6 billion on a Series C in September 2025, and Qualcomm was reported in 2026 to be in advanced talks to acquire it for about \$4 billion.

**AMD** maintains its own software stack and publishes its own benchmarks comparing the MI355X with NVIDIA's B200. It is an investor in Wafer through AMD Ventures. Its interest is in its hardware performing well for every customer, which would favor Wafer's techniques becoming widely available.

**NVIDIA** continues to improve its own inference software and can adjust effective pricing. Either action would narrow the cost advantage of alternative hardware.

**Frontier labs** ship general-purpose coding agents that are improving at low-level systems work. If such agents become able to tune kernels as well as a specialized system, the basis for Wafer's differentiation would weaken.

## Business Model

Wafer charges for inference on a usage basis. As of September 2026 the company has disclosed neither pricing details nor gross margin, and the only revenue figure in circulation is the roughly \$8 million of ARR reported by a third-party tracker rather than by Wafer.

The economics rest on a cost advantage with two components. The first is hardware, since AMD accelerators are priced below NVIDIA's. The second is tuning, which allows the cheaper hardware to approach the performance of the more expensive hardware. In July 2026, Wafer [reported](https://x.com/wafer_ai/status/2073155792182907085) that AMD's MI355X achieved about 80% of the throughput of NVIDIA's B200 at less than half the cost on the GLM-5.2 model, which implies a cost per token roughly 38% lower.

| Illustrative economics per million output tokens | Price | Cost | Gross margin |
| --- | --- | --- | --- |
| Typical provider on NVIDIA B200 | \$2.00 | \$1.20 | 40% |
| Wafer on AMD MI355X | \$1.60 | \$0.75 | 53% |

*Illustrative. Prices and the NVIDIA cost are assumptions; Wafer's cost applies its published 62.5% ratio.*

<figure data-figure="venture:wafer-unit-economics"></figure>

A provider with Wafer's reported cost ratio could charge a 20% discount and still earn a higher gross margin than the incumbent. For reference, Fireworks AI's gross margin was approximately 50% as of July 2025.

The two components of the advantage differ in durability. The hardware discount is available to any provider that buys AMD chips. The tuning advantage persists only while Wafer's agents find improvements faster than those improvements spread to open-source engines and to AMD's own software.

## Traction

| Result | Figure |
| --- | --- |
| GLM-5.2 on AMD MI355X | 2,626 tokens/sec per node; 213 single stream |
| Against NVIDIA's B200 | 80% throughput at under half the cost |
| Kimi K3 on AMD | 952 tokens/sec per node |
| Qwen 3.6 35B on eight MI355X chips | 15,000 tokens/sec per node; leads a public generation-speed benchmark |
| Typical improvement over an untuned baseline | 2 to 2.8 times across open-source models |

These figures come from [Wafer's blog](https://www.wafer.ai/blog) and are self-reported. The models differ greatly in size, so the throughput numbers are not comparable with one another, and none had been independently reproduced as of September 2026.

Named partners include DigitalOcean, with which Wafer published joint work on AMD GPUs, Parasail, with which it released optimized weights for NVIDIA's Blackwell generation, and TrueFoundry, whose gateway integrates Wafer's inference service. AMD is an investor through AMD Ventures.

Wafer raised its Series A five months after its seed round, at ten times the size. The founders told The Information that the company had received multiple acquisition offers from larger inference and cloud providers. A Y Combinator job posting from before the Series A described a team of four; the company's YC profile now lists ten.

Wafer itself has published no revenue figure, but the ARR tracker arr.club [reported](https://www.arr.club/wafer/wafer-arr-hit-8m-after-four-months-launching-the-cloud) on September 2, 2026 that the company reached about \$8 million in annual recurring revenue within four months of launching its cloud, which places the launch around May 2026 and implies roughly \$2 million of ARR added per month. The figure should be read for what it is. Trackers of this kind compile numbers that are self-reported or estimated rather than audited, arr.club lists Wafer's growth rate as undetermined, and usage-based inference revenue annualized from four months of a rising ramp is the most flattering way to state it. Customer counts, concentration, and retention remain undisclosed, and for a product sold through an interchangeable API those are the numbers that determine whether \$8 million is a business or a moment.

## Valuation

In September 2026, Wafer announced a \$40 million Series A co-led by Marathon and Chemistry, with participation from Wing, AMD Ventures, and Outset Capital and from existing investors Fifty Years and Y Combinator. The Information [reported](https://www.benzinga.com/trading-ideas/movers/26/09/61555064/nvidia-wafer-ai) a valuation above \$200 million, which the company has not confirmed. Against the roughly \$8 million of ARR reported for the same month, that is a multiple of about 25 times, which is ordinary for inference infrastructure growing at this rate and demanding for a business whose customers can leave through a configuration change. Angel investors in the round included Jeff Dean, who left Google in August 2026 to co-found a new company, along with Guillermo Rauch of Vercel, Matthew Prince of Cloudflare, Scott Stephenson of Deepgram, Andy Fang of DoorDash, Akshay Kothari of Notion, and Kyle Vogt of The Bot Company.

The Series A came five months after a [\$4 million seed round](https://app.dealroom.co/news/feed/wafer-raises-4m-to-build-ai-that-optimises-ai-infrastructure) in April 2026, which was led by Fifty Years with participation from Liquid2 and Y Combinator and angel investments from Jeff Dean and OpenAI co-founder Wojciech Zaremba.

One widely syndicated notice of the Series A describes Wafer as a maker of inference chips led by different individuals. That description is inaccurate and illustrates the unreliability of secondary sources on very young companies.

## Key Opportunities

### Demand for a second hardware supplier

Enterprises and cloud providers want alternatives to a single accelerator vendor because of pricing, supply constraints, and regional availability. If Wafer can deliver comparable performance and reliability on AMD and other accelerators, it could become the means by which buyers adopt a second supplier without building the required engineering capability themselves. AMD's investment suggests the chip maker sees value in that role. Every point of accelerator share that moves away from NVIDIA requires software of the kind Wafer produces.

### Continuous optimization as a product

Compilers were once regarded as a convenience supplied by hardware makers and became a durable layer of computing, because the problem of translating intent into efficient execution changes whenever hardware or software changes. Inference optimization has a similar character. It must be redone whenever a model, a chip, or a traffic pattern changes. A system that performs this work continuously, and accumulates data on what works for which hardware under which conditions, could become a standing part of the inference stack instead of a one-time service. If customers come to expect their deployments to improve without intervention, the system that does this best would be difficult to displace.

### Licensing to infrastructure providers

Wafer's work with DigitalOcean and Parasail points to a business in which its system optimizes other providers' infrastructure. Selling the optimizer to clouds, chip makers, and large enterprises that run their own hardware would carry software-like margins, reduce exposure to direct price competition in hosted inference, and place the company inside customers' environments, which raises switching costs. There is precedent for strategic value at this layer. In August 2026, Stripe reportedly agreed to acquire OpenRouter for \$7.5 billion, and AMD acquired the inference chip startup Taalas in the same month.

### Distribution through routing layers

Inference routing platforms rank providers on price, latency, and throughput and can shift traffic automatically. In such marketplaces, a measurable cost and speed advantage translates into demand with little sales effort, which favors a small company with strong benchmarks.

## Key Risks

### Commoditization of optimizations

Each improvement Wafer's agents discover is ultimately a piece of code or a configuration, and such improvements spread. Open-source engines absorb effective techniques quickly, and AMD employs a large software organization with the same goal. If most of Wafer's gains become available for free within months, its cost advantage reduces to the hardware discount, which any provider can obtain. Wafer's response is that optimization is continuous, and that a static improvement copied into an open-source engine is less valuable than a system that keeps finding new ones for each specific workload. Whether that distinction holds in practice is the central question for the business.

### General-purpose coding agents

Wafer's differentiation depends on a specialized agent system outperforming general-purpose tools at systems optimization. Frontier coding agents are improving rapidly, and the largest inference providers have the resources to apply them internally. Infinity, which applies a similar approach to the software stacks of new chips, and the performance teams inside Fireworks AI, Together AI, and Baseten are all positioned to adopt the same methods.

### Dependence on AMD and partner conflicts

Wafer's headline results rely on AMD's pricing and supply, and NVIDIA could narrow the gap through pricing or software. Several of Wafer's partners, including DigitalOcean and Parasail, also sell inference, and the engine companies it builds on sell competing hosting. AMD's role is especially double-edged. It supplies the hardware behind Wafer's cost advantage and has invested in the company, and it also maintains its own software stack and publishes its own benchmarks against NVIDIA. AMD's commercial interest is served if the techniques Wafer develops become standard and freely available.

### Low switching costs and unverified claims

Hosted inference for open models is sold through interchangeable APIs, so customers can leave as easily as they arrive, and no retention data is public. Wafer's benchmark results are self-reported, and performance benchmarks are sensitive to batch size, sequence length, and other conditions. Results that do not hold up under independent testing or on customers' own workloads would undermine the company's central claim.

### Compressing inference prices

Per-token prices have fallen steeply. According to [Contrary Research](https://research.contrary.com/company/openrouter), inference costs dropped by a factor of 1,000 between 2022 and 2024 and are projected to fall a further 90% by 2030. A provider that charges per token must grow volume faster than prices decline to grow revenue, and falling prices narrow the absolute dollar value of any percentage cost advantage unless volumes are very large.

## Summary

Wafer builds AI agents that optimize inference across the model, the serving engine, GPU kernels, and hardware, and sells the results as fast, low-cost hosted open-source models on both NVIDIA and AMD accelerators. It began in Y Combinator's Summer 2025 batch as a developer tool for generating GPU kernels and shifted to selling inference directly.

As of September 2026, Wafer had raised approximately \$44 million, including a \$40 million Series A at a reported valuation above \$200 million, with AMD Ventures and Jeff Dean among its backers. Its reported results show AMD hardware reaching about 80% of NVIDIA B200 throughput at less than half the cost, which is the entire argument. Cheaper silicon made competitive by software, sold as tokens.

The question is whether that software stays proprietary. Every optimization the agents find is code, and code spreads, into vLLM and SGLang and into AMD's own stack. Wafer's bet is that a system which keeps finding new improvements for each specific workload outruns the diffusion of any individual one. If it does, continuous optimization becomes a layer of the inference stack. If it does not, Wafer is reselling AMD's discount alongside everyone else, against competitors with forty times the capital.

The company has published no revenue of its own, no customer count, and no independently reproduced benchmark; the \$8 million ARR figure attached to it comes from a third-party tracker.
