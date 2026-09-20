---
title: "RadixArk"
pubDatetime: 2026-09-09T15:27:44.000Z
description: "RadixArk is the company formed around SGLang, one of the two open-source engines serving most open-model inference, selling managed infrastructure on software it gave away and does not own."
slug: radixark
company: "RadixArk"
stage: "Seed"
sector: "AI infrastructure"
tags:
  - ai-infrastructure
  - open-source
  - inference
draft: false
category: ventures
---

## Overview

RadixArk builds infrastructure for running and continuously improving open AI models in production. It was founded by the creators and core maintainers of SGLang, an open-source inference engine that serves trillions of tokens per day for organizations including Google, Microsoft, NVIDIA and xAI, and it also maintains Miles, an open-source framework for reinforcement learning. On top of these projects the company sells managed infrastructure and tooling, aimed at teams that want to own and operate their AI systems instead of renting tokens through another company's API.

| | |
| --- | --- |
| Founded | 2025 |
| Headquarters | Palo Alto, California |
| Founders | Ying Sheng (CEO), Banghua Zhu |
| Stage | Seed. \$100 million at a \$400 million post-money valuation |
| Disclosed investors | Accel (lead), Spark Capital (co-lead), NVentures, AMD, MediaTek, HOF Capital |
| Employees | Not disclosed |
| Status | Open-source adoption at scale, commercial traction undisclosed |

## Thesis

For most of the period since ChatGPT's release, the cost of AI was dominated by training. That is no longer the case. In August 2026, Gartner forecast that spending on inference within AI-optimized cloud infrastructure would reach \$23.3 billion in 2026, surpassing training spending of \$19 billion for the first time, with inference rising from 55% of that spending in 2026 to 59% in 2027. On NVIDIA's February 2026 earnings call, Jensen Huang told investors that inference now equals revenue. The shift is driven by how models are used: agents make dozens of model calls to complete one task, and reasoning models generate thousands of tokens before answering. As of November 2025, production LLM systems were reportedly processing tens of trillions of tokens per day.

Enterprise buying behavior reinforces it. According to [Contrary Research](https://research.contrary.com/company/fireworks-ai), enterprise LLM budgets grew 75% year over year in 2025 and moved from experimental into permanent budgets, and 37% of enterprises reportedly run five or more models across experimentation and production. Agentic systems, which plan, call tools and iterate, require [five to 30 times more compute per task](https://research.contrary.com/company/openrouter) than a standard chatbot.

At that volume the software between the GPU and the application becomes economically important. The inference engine decides how GPU memory is managed, how requests are batched and scheduled, which low-level kernels run, and which chips are supported. An engine that serves twice as many requests on the same hardware has effectively doubled its operator's GPU fleet at a time when both chips and power are constrained. As of 2026, open-model inference is dominated by two open-source engines, vLLM and SGLang, both of which originated in 2023 in the UC Berkeley lab of Databricks co-founder Ion Stoica.

Enterprises, meanwhile, are moving from treating AI as a feature to building products on top of it, often with multiple models, retrieval pipelines, fine-tuning loops and continuous post-training running as a single system. Closed-model APIs are easy to adopt but limit customization, control and cost management at scale. Open-weight models such as Llama, Qwen, DeepSeek, Kimi and GLM offer control, but running them well requires specialized performance engineering for every new model and every new chip. Most teams do not have that expertise, and RadixArk's bet is that they will pay someone who does.

## Founding Story

RadixArk was founded in 2025 by Ying Sheng (CEO) and Banghua Zhu, together with a group of SGLang's core developers and contributors to related open-source reinforcement learning projects.

Sheng studied in the ACM Class at Shanghai Jiao Tong University, earned a master's degree at Columbia, and completed a PhD in computer science at Stanford, where she won a best paper award for work in formal verification before shifting her research to high-throughput inference. She then worked as a research scientist at Databricks, which she has credited with shaping her commitment to open source, and co-founded LMSYS, a nonprofit research collective started by students from Stanford, Berkeley, Carnegie Mellon and other universities that is best known for Chatbot Arena.

SGLang began in the summer of 2023 and was released publicly in January 2024. The name refers to a structured generation language, and the original goal was a better way for programs to hold structured interactions with models. It gained adoption primarily because of its performance. Sheng has described several waves of growth after the first release, including long nights in the summer of 2024 spent debugging with a small group of other core developers.

In October 2024, Sheng joined xAI, where she co-led the team responsible for serving the Grok models. She left in August 2025, reportedly two months before her first equity cliff, to work on SGLang full time. In her announcement of the company in [December 2025](https://x.com/ying11231/status/1998079551369593222?lang=en), she wrote that hundreds of people had contributed to the project over two years and that demand had grown to the point where it required a dedicated organization. Zhu joined from NVIDIA, where he had worked on AI systems.

HOF Capital, one of the seed investors, has said it met the founders before the company was incorporated and that the team was the primary reason for its investment. News of the financing first surfaced in January 2026, and RadixArk formally launched on May 5, 2026. At launch Sheng described the scope by saying the company treats "inference, training, and post-training as first-class citizens," with the goal of end-to-end infrastructure that gives developers more speed and control. Accel, which led the round, characterized the engine as a way of expanding the capacity of hardware customers already own, given that demand for compute is growing faster than the supply of chips.

## Product

RadixArk's offering has three parts: two open-source projects it maintains and gives away, and a commercial platform built on top of them. The company does not keep a private fork of SGLang. The project belongs to the LMSYS community, and all of RadixArk's contributions to it are public.

**SGLang.** A model generates text one token at a time and must account for all preceding text at each step. To avoid recomputing that work, the engine stores intermediate results in a structure called the KV cache, which is large, resides in scarce GPU memory, and grows with every token. Much of inference performance comes down to how well this cache is managed.

SGLang's signature technique is RadixAttention. When many requests begin with the same text, such as a system prompt, a set of tool descriptions, or the earlier turns of a conversation, the shared portion only needs to be computed once. SGLang indexes every prefix it has processed in a radix tree and maps each to memory that already holds its results, so a new request with a matching prefix skips directly to the new portion. Prefix sharing is common in nearly all production workloads and is especially pronounced in agentic applications, where each step resends the history of previous steps.

| Technique | What it does | Why it matters now |
| --- | --- | --- |
| RadixAttention | Reuses computed memory across requests that share a prefix | Agents and multi-turn conversations resend the same context constantly |
| Prefill and decode separation | Runs the phase that reads the prompt and the phase that writes the answer on different workers | The two phases stress hardware differently, so separating them raises utilization |
| Speculative decoding | A small model drafts several tokens and the large model verifies them in a single pass | Reduces waiting time for models that write long answers |
| Structured output | Constrains the model to valid JSON or another grammar without slowing it down | Agents that call tools fail when output is malformed |
| Large-scale expert parallelism | Spreads a mixture-of-experts model efficiently across many GPUs | The strongest open models are built this way |
| Broad hardware support | Runs on many kinds of accelerator | Buyers want leverage against any single chip vendor |

According to HOF Capital, SGLang has provided day-of-release support across the Llama, Qwen, DeepSeek, Kimi, GLM, Gemma and Mistral model families, and runs on NVIDIA GPUs, AMD GPUs, Intel CPUs and Google TPUs. For users, this cadence is arguably the product: assurance that the next important model or chip will be supported well on the day it arrives.

**Miles.** An open-source reinforcement learning framework aimed at enterprises, released in 2026. Reinforcement learning is now the primary method for specializing and improving models after initial training: a model attempts a task many times, the attempts are scored, and the model is updated toward the better ones. The most expensive step in that loop is generating the attempts, which is an inference workload. Sheng has noted that a reward engine is essentially an inference engine. A team with a lead in efficient inference therefore has a structural advantage in making reinforcement learning affordable, which is the rationale for pairing the two projects.

**The managed platform.** On top of the open-source projects, RadixArk sells managed infrastructure for inference and training with enterprise reliability, security and support. A press report in January 2026 said the company had begun charging for managed hosting. The company describes its longer-term direction as a complete foundation for building specialized models: codebases, tools, sandboxes, training environments and intermediate checkpoints that teams assemble according to their own data and goals. HOF Capital has summarized the positioning by contrasting it with inference APIs, which deliver a finished product as a rented service, saying that RadixArk instead "gives you the factory."

## Customer

RadixArk's open-source users include some of the largest AI organizations in the world. According to the company, SGLang serves trillions of tokens per day for Google, Microsoft, NVIDIA, Oracle, AMD, Nebius, LinkedIn, xAI, Thinking Machines Lab and humans&, across hundreds of thousands of GPUs. These organizations use SGLang as free software, and none has been publicly identified as a paying customer.

The target customer for the commercial platform is a different profile: an enterprise or AI-native company that wants to run and adapt open models on infrastructure it controls, but does not want to staff a low-level optimization team. Such a buyer typically serves multiple models, cares about latency and cost at high volume, has proprietary data it wants to use to specialize models, and may face regulatory or contractual limits on sending data to third-party APIs. The alternative for these teams is either a closed-model API, which offers limited control, or self-hosting an open engine, which requires scarce expertise.

## Market Size

Gartner [projected in August 2026](https://www.gartner.com/en/newsroom/press-releases/2026-08-10-gartner-forecasts-worldwide-artificial-intelligence-optimized-iaas-spending-to-grow-96-percent-in-2026) that worldwide spending on AI-optimized infrastructure as a service would grow from \$21.5 billion in 2025 to \$42.3 billion in 2026 and \$66.1 billion in 2027, with inference accounting for 55% of the 2026 total and 59% of the 2027 total.

| Year | Inference | Training and other |
| --- | --- | --- |
| 2026 | \$23.3B | \$19.0B |
| 2027 | \$39.0B | \$27.1B |

Fortune Business Insights estimated the broader AI inference market at \$103.7 billion in 2025 and \$117.8 billion in 2026. Longer-range estimates point the same direction: inference is projected to grow from \$106 billion in 2025 to \$255 billion by 2030 and to account for 75% of all AI compute by 2030, according to figures compiled by [Contrary Research](https://research.contrary.com/company/openrouter). Enterprise spending on foundation model APIs rose from \$3.5 billion in all of 2024 to \$8.4 billion in the first half of 2025, and the share of companies using agentic AI to at least a moderate extent is expected to rise from 23% in 2026 to 74% within two years.

Usage has so far grown faster than prices have fallen. Each decline in the cost per token has been followed by a larger increase in tokens consumed, as applications such as agents and long-form reasoning become economically viable. That dynamic suggests efficiency gains at the engine layer expand the market instead of shrinking it, which is the assumption underneath RadixArk's entire position.

## Competition

RadixArk competes at two levels. At the engine level its rival is vLLM and the company formed around it. At the platform level it competes with managed inference providers, with the AI services of the large clouds, and with chip vendors' own serving software. Many of these competitors are also users of SGLang.

| Company | Total funding | Latest disclosed valuation |
| --- | --- | --- |
| Baseten | \$2.1B | Not disclosed |
| Fireworks AI | \$1.8B | \$17.5B (July 2026) |
| Together AI | \$1.3B | Not disclosed |
| Inferact (vLLM) | \$150M | \$800M |
| RadixArk (SGLang) | \$100M | \$400M |
| Wafer | \$44M | Above \$200M (reported) |

**Inferact** was founded by the creators and core maintainers of vLLM, which, like SGLang, originated in Ion Stoica's lab at Berkeley in 2023. vLLM's founding contribution was PagedAttention, which manages the KV cache in pages in the manner of an operating system, and the project reportedly runs on more than 400,000 GPUs. In January 2026, Inferact [raised \$150 million](https://techcrunch.com/2026/01/22/inference-startup-inferact-lands-150m-to-commercialize-vllm/) in seed funding at an \$800 million valuation, co-led by Andreessen Horowitz and Lightspeed with participation from Sequoia, Altimeter, Redpoint and ZhenFund. It plans a commercial product described as a universal inference layer that works with existing providers.

| | RadixArk | Inferact |
| --- | --- | --- |
| Open-source engine | SGLang | vLLM |
| Origin | Ion Stoica's lab at Berkeley, 2023 | Ion Stoica's lab at Berkeley, 2023 |
| Founding idea | Sharing the cache across requests | Paging the cache like an operating system |
| Seed round | \$100M at a \$400M valuation | \$150M at an \$800M valuation |
| Lead investors | Accel and Spark Capital | Andreessen Horowitz and Lightspeed |
| Reported scale | Hundreds of thousands of GPUs, trillions of tokens a day | More than 400,000 GPUs |
| Commercial direction | Managed infrastructure for inference and reinforcement learning | A universal inference layer alongside existing providers |
| Chief executive | Ying Sheng, formerly of xAI | Simon Mo, formerly a Berkeley doctoral student |

**Fireworks AI**, founded in 2022 by former Meta engineers who worked on PyTorch, provides a managed platform for running open and enterprise-owned models. In July 2026 it raised \$1.5 billion at a \$17.5 billion valuation and announced that it had surpassed \$1 billion in annualized revenue and 40 trillion tokens processed per day. It competes directly with RadixArk's managed platform from a position of far greater scale.

**Together AI**, founded in 2022, provides cloud infrastructure for training and deploying open models. In July 2026 it announced \$800 million in Series C funding, bringing total funding to \$1.3 billion. It operates its own large-scale GPU capacity and competes for the same enterprises, while also being a potential user of open engines such as SGLang.

**Baseten**, founded in 2019, provides infrastructure for deploying and serving models in production and competes on latency, throughput and reliability. Its \$1.5 billion Series F in June 2026 brought total funding to \$2.1 billion. It is a mature commercial platform with an established enterprise sales motion, which is precisely the capability RadixArk has yet to build.

**The clouds.** Amazon Bedrock reached a multi-billion-dollar annualized run rate as of the fourth quarter of 2025, with customer spend up 60% quarter over quarter. Google and Microsoft offer comparable services and are both listed among SGLang's users. These platforms integrate with the security, identity and procurement systems enterprises already use, can host the open engine at no licensing cost, and sell the hosting themselves. They offer convenience and existing contracts in place of specialization.

**NVIDIA and AMD** both ship their own inference software and both invested in RadixArk's seed round. They benefit from an engine that runs well on their hardware, and they are equally capable of absorbing its techniques into their own software.

## Business Model

RadixArk follows an open-core model in an unusually strict form. The engine is free, is owned by its community, and has no proprietary version. Revenue comes from managed hosting, enterprise support, and tooling around reinforcement learning. As of September 2026 the company had not disclosed pricing, revenue or gross margin.

The revenue mix will determine how the business is valued. Managed hosting involves reselling compute, and comparable businesses report gross margins near 50%: Fireworks AI's gross margin was approximately 50% as of July 2025, with a management target of about 60%. Software and support typically earn 80% or more.

| Company | Open project | What happened |
| --- | --- | --- |
| Databricks | Apache Spark, from the same professor | Became one of the most valuable private software companies; the managed platform grew far larger than the engine |
| Confluent | Apache Kafka | A public company of substantial size, but cloud providers offered the open project themselves and took a large share |
| MongoDB and Elastic | Their own database and search engine | Large public companies; both changed their licenses to stop clouds from reselling their work |
| HashiCorp | Terraform and related tools | Also changed its license. Acquired by IBM for roughly \$6.4 billion, a good result rather than a spectacular one |
| Anyscale | Ray, from the same lab | Reached roughly a \$1 billion valuation and has grown slowly |
| Docker | Docker | Ubiquity without a product; the original company failed to monetize and was restructured |

Among companies built on open infrastructure, those that became large did so by building a product clearly broader than the open project, and several later restricted their licenses to prevent cloud providers from reselling their work. RadixArk's governance choices foreclose the second option entirely.

## Traction

As of May 2026, RadixArk reported that SGLang was deployed across hundreds of thousands of GPUs and served trillions of tokens per day, with named users including Google, Microsoft, NVIDIA, Oracle, AMD, Nebius, LinkedIn, xAI, Thinking Machines Lab and humans&. Sheng has said hundreds of people have contributed since 2023. For comparison, vLLM reportedly runs on more than 400,000 GPUs.

The release cadence is the leading indicator worth watching. SGLang has supported the Llama, Qwen, DeepSeek, Kimi, GLM, Gemma and Mistral families on the day of their release, across four classes of accelerator, several of whose vendors are investors. That cadence is what makes the project the default choice for a team standing up a new model, and it is expensive to sustain.

Commercial traction is not public. A January 2026 press report, citing a person familiar with the company, said RadixArk had begun charging for managed hosting. No revenue figures, customer counts or named paying customers had been disclosed as of September 2026. The company was hiring across research, engineering, product, sales and operations as of May 2026.

## Valuation

In May 2026, RadixArk [announced](https://www.businesswire.com/news/home/20260505077157/en/RadixArk-Launches-with-\$100-Million-in-Seed-Funding-Led-by-Accel-to-Grow-SGLang-and-Democratize-Frontier-AI-Infrastructure) \$100 million in seed funding at a \$400 million post-money valuation. The round, first reported in January 2026, was led by Accel and co-led by Spark Capital. Seed proceeds represent a quarter of the post-money valuation.

| Category | Investors |
| --- | --- |
| Leads | Accel led, Spark Capital co-led |
| Chip makers | NVentures (NVIDIA's venture arm), AMD, MediaTek |
| Chip executives, personally | Lip-Bu Tan of Intel, Hock Tan of Broadcom |
| Other funds | Salience Capital, A&E Investments, HOF Capital, Walden Catalyst, LDV Partners, WTT Investment. One report adds Databricks |
| Researchers and founders | Igor Babuschkin, John Schulman, Soumith Chintala, Thomas Wolf, Olivier Pomel, Robert Nishihara, William Fedus, Eric Zelikman, Logan Kilpatrick |

The participation of NVIDIA, AMD and MediaTek, alongside the personal investments of the chief executives of Intel and Broadcom, is the most unusual feature of the cap table, because these companies compete with one another. It suggests a shared interest in an inference engine that is open, well funded and not controlled by any single chip vendor.

For comparison, Inferact was valued at \$800 million at its seed round in the same month, and Fireworks AI at \$17.5 billion in July 2026 on more than \$1 billion of annualized revenue. Strategic interest in the layer has been rising: in August 2026, Stripe reportedly agreed to acquire OpenRouter, which routes inference requests across models and providers, for \$7.5 billion, three months after a Series B valued it at \$1.3 billion, according to [Contrary Research](https://research.contrary.com/company/openrouter).

## Key Opportunities

**Reinforcement learning as a second platform.** Enterprise adoption of reinforcement learning is early and no standard tooling has emerged. Contrary Research reported in August 2026 that 95% of the tokens Fireworks AI processes come from models specialized on customer data, which indicates strong demand for customization. Because reinforcement learning workloads are dominated by inference, RadixArk's engine gives it a cost advantage here. If Miles becomes a default way to run reinforcement learning on open models, the company owns a product that is harder to commoditize than raw throughput, sold as a platform and a workflow rather than as commodity tokens, in a market where it is not competing against vLLM's installed base.

**A neutral runtime across hardware.** Enterprises increasingly want to avoid dependence on one cloud or one accelerator, because prices change and supply is uneven. An engine that performs well across NVIDIA, AMD, Intel and Google hardware lets customers move workloads as conditions change, and an investor base spanning competing chip makers supports that position. Contrary Research has observed that investment by both NVIDIA and AMD may support positioning as a neutral runtime while noting it does not prove demand will develop in that direction. The opportunity depends on delivering comparable performance and reliability across hardware types, which is an engineering burden that grows with every new chip.

**Agentic workloads favor prefix reuse.** Agents and multi-turn applications resend large amounts of shared context with every call. RadixAttention was designed for this pattern before agents became a commercial category. As agentic usage grows as a share of inference, the performance gap between an engine that reuses prefixes well and one that does not becomes more valuable. It is the rare case of a core design decision becoming more correct with time.

## Key Risks

**Monetizing software it does not own.** RadixArk's most widely cited users pay nothing for SGLang, and the company has given up the tools other open-source companies used to compel payment. There is no proprietary version that is faster than the open one, and because the project belongs to the LMSYS community the license cannot be changed. HOF Capital describes the intended path as open-sourcing the core engine and then productizing the operational complexity of running it at production scale. That pattern produced Databricks, and it also produced widely used projects with modest businesses attached, of which Anyscale, which commercializes Ray from the same Berkeley lab at roughly a \$1 billion valuation, is the uncomfortably close comparison. Which outcome applies here cannot be determined from public information.

**Competition for the default engine.** Open infrastructure markets have historically settled on a default and an alternative, with most of the value accruing to the default. Inferact has 50% more capital, a larger reported installed base, and investors with extensive enterprise networks. Sheng has argued that inference is an incremental market in which all participants grow together, and the market's growth rate supports that in the near term. Over a longer period enterprise buyers standardize, and the engine with the broader ecosystem of integrations, documentation and trained engineers usually wins.

**Value capture by clouds and chip vendors.** Cloud providers can host SGLang themselves and bundle it with services their customers already buy; chip vendors can incorporate its techniques into their own software. Both groups benefit from the engine remaining free, and several are investors, which aligns them with the project's health but not with the company's revenue. Contrary Research identifies bundled cloud platforms winning by default as a key risk even for Fireworks AI, a company with more than \$1 billion in annualized revenue. A seed-stage company with no disclosed revenue is more exposed, not less.

**Talent retention and commercial execution.** The core asset is a small group of systems engineers who are heavily recruited by frontier labs. The founding team consists largely of researchers, and the company has not announced experienced leaders in enterprise sales or product. A significant share of SGLang's contributor community and of the open models it supports originates in China, which may complicate sales to US government and regulated enterprise customers.

## Summary

RadixArk is the company formed around SGLang, one of the two open-source inference engines that serve most open-model workloads. The technical position is strong and the timing is right: inference spending passed training spending in 2026, agentic workloads are the fastest-growing segment of it, and RadixAttention is the design that benefits most from exactly that shift. The cap table is a signal in its own right, since NVIDIA, AMD, MediaTek and the chief executives of Intel and Broadcom rarely agree on anything except that no single one of them should control the layer above the chip.

The difficulty is that none of this is the business. Google, Microsoft, NVIDIA and xAI run SGLang for free, the license cannot be changed to stop them, and the company cannot ship a faster private version without abandoning the openness that made the project the default. The paying customer is someone else entirely, an enterprise that wants to own its models without owning a kernel team, and reaching that buyer requires an enterprise sales motion that Fireworks, Together and Baseten have already built at several times the capital.

The most interesting position the company holds is Miles. Reinforcement learning is an inference workload wearing different clothes, it is sold as a platform rather than as tokens, and it is the one market where vLLM's installed base confers no advantage. Whether RadixArk becomes Databricks or Anyscale probably turns on that product rather than on the engine everyone already uses.
