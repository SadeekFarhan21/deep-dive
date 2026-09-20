---
title: "Extropic"
pubDatetime: 2026-09-11T17:42:10.000Z
description: "Extropic is a physics-based hardware company developing thermodynamic computing chips that harness thermal noise to run probabilistic AI models with extreme energy efficiency."
slug: extropic
company: "Extropic"
tags:
  - semiconductors
  - ai-infrastructure
  - frontier-tech
draft: false
category: ventures
---

## Overview

Extropic designs thermodynamic sampling units, a new class of semiconductor that uses the natural thermal noise of standard transistors to draw samples directly from programmable probability distributions. Because sampling is the core operation of generative AI, the company aims to run probabilistic workloads at a fraction of the energy a GPU requires. It pairs the chips with an open-source software stack for writing, training, and compiling probabilistic programs, and targets generative AI, scientific simulation, and low-power reasoning under uncertainty.

| | |
| --- | --- |
| Founding Date | August 2022 |
| Headquarters | San Francisco, CA |
| Total Funding | \$14.1M |
| Status | Private |
| Stage | Seed |
| Employees | 25 |

## Thesis

Energy is becoming the binding constraint on AI. The five largest cloud companies were guided in February to between [\$660 billion and \$690 billion](https://introl.com/blog/hyperscaler-capex-690-billion-microsoft-azure-power-bottleneck-2026) of capital spending in 2026, and four of them have since raised their guidance to a combined \$720 billion to \$745 billion for the calendar year, against about \$448 billion spent in 2025, and data center siting is increasingly determined by where power is available. A single modern GPU draws on the order of a kilowatt. The industry's main response has been to build more generation and more data centers.

There is a physical inefficiency underneath that spending. A digital chip represents each bit with a voltage held far enough from the noise floor that thermal fluctuations almost never flip it, and maintaining that margin costs energy on every operation. Generative AI, however, depends on randomness. To produce an image or a sentence, a model computes a probability distribution and then draws from it. A GPU therefore spends energy suppressing physical noise, performs a large amount of exact arithmetic, and then runs an algorithm to manufacture artificial randomness. Biological brains, which are noisy and imprecise, operate on roughly 20 watts.

The demand side is growing quickly. Inference is projected to account for [75% of all AI compute by 2030](https://research.contrary.com/company/openrouter), and agentic systems require five to thirty times more compute per task than a chatbot. Verdon has framed the company's goal as delivering more intelligence per watt.

Hardware that samples natively could avoid much of this cost, but only if three conditions hold. The devices must be manufacturable at scale, models must fit the hardware while matching the quality of conventional ones, and the energy advantage must survive when the whole system is measured. Earlier attempts to change the basis of computing, from analog to optical to quantum annealing, have often satisfied the first condition and struggled with the others.

## Founding Story

Extropic was founded in 2022 by Guillaume Verdon, Trevor McCourt, and Christopher Chamberland. All three came from quantum computing.

Verdon is a mathematical physicist who worked as a research scientist at Alphabet, where he led quantum machine learning efforts at X and at Google and helped create TensorFlow Quantum. McCourt also worked on Google's quantum programs, and Chamberland was a researcher in quantum error correction. That background shaped the company in two ways. It led them to treat computation as a physical process to be engineered, and it gave them a view of how long exotic hardware takes to become commercially useful. Extropic's chips are not quantum devices. They are built from standard transistors and operate at room temperature.

Verdon is also known by the pseudonym Beff Jezos, under which he co-founded effective accelerationism, an online movement advocating faster technological progress. [His identity was made public](https://en.wikipedia.org/wiki/Guillaume_Verdon) in late 2023, shortly before the company announced a \$14.1 million seed round led by Kindred Ventures. Extropic [emerged from stealth](https://www.prnewswire.com/news-releases/extropic-emerges-from-stealth-aiming-to-revolutionize-generative-ai-with-physics-based-ai-processors-302090040.html) in March 2024 with a short technical paper describing its approach.

| Date | Milestone |
| --- | --- |
| December 2023 | \$14.1M seed, led by Kindred Ventures |
| March 2024 | Emerged from stealth, with a technical paper |
| October 2025 | X0 silicon, XTR-0 desktop system, THRML library |
| 2025 to 2026 | Dozens of XTR-0 systems shipped to early users |
| July 2026 | US Commerce letter of intent, up to \$75M |
| August 2026 | Z1 chip, Torx framework, Thermalizers compiler |
| September 2026 | Z1T, open-weight models for Z1 |
| 2027 | Planned early access to Z1 |

## Product

Extropic's product is a family of probabilistic chips and an open-source stack for programming them.

### Thermodynamic sampling units

The basic component is the probabilistic bit, or pbit, a small circuit of ordinary transistors operated near the noise floor so that its output fluctuates between zero and one, with a control voltage setting the probability of each state. [Extropic describes](https://extropic.ai/writing/thermodynamic-computing-from-zero-to-one) a family of such primitives and states that they generate a random sample using orders of magnitude less energy than conventional methods.

When pbits are connected so that each one's probability depends on its neighbors, the grid behaves like a physical system that settles into low-energy configurations, a structure known in physics as an Ising model. If a probability distribution is encoded in the connection strengths, the grid's natural fluctuations produce samples from that distribution. The device does not calculate a result in the conventional sense. A generative task is expressed as an energy-based model, the Thermalizers compiler maps it onto the grid, the grid is allowed to settle, a sample is read out, and a conventional processor handles everything around it.

### X0, XTR-0, and Z1

X0, announced in October 2025, was the first silicon and demonstrated the circuits. XTR-0 is a desktop development platform built around it, and the company says it manufactured dozens of these systems and shipped them to early adopters. Z1, [announced in August 2026](https://extropic.ai/writing/from-one-to-one-billion/), is the first production-scale chip.

| Z1 specification | Figure |
| --- | --- |
| Probabilistic bits | 269,568 |
| Cores | 8 |
| Connections per pbit | 16 neighbors (2.16M physical couplings, 215,904 tunable parameters) |
| Sampling rate | 50 MHz+ |
| Power | Under 1 watt |
| Die size | Under 12 mm on a side |
| Manufacturing | Standard CMOS on mature nodes |
| Availability | 2027 early access, two form factors |

Two characteristics shape what Z1 can run. Each pbit connects to sixteen neighbors, whereas a transformer layer connects every element to every other, so models must be redesigned for sparse connectivity. And the chip is manufactured on mature process nodes, which lowers cost and allows production in US fabs.

### The software stack

Extropic released its software before its hardware was broadly available, which lets researchers develop algorithms in simulation. THRML, open source since October 2025, describes and simulates thermodynamic models on ordinary GPUs. Torx, open source since August 2026, is used to write probabilistic programs and train them with gradient descent as neural networks are trained; an investor has called it the PyTorch of probabilistic computing. Thermalizers compiles a high-level probabilistic program down to the hardware, with a paper published and an open-source release announced. Early users can run workloads through a simulator interface as though on a Z1, though the simulation itself runs on GPUs. [Z1T](https://extropic.ai/writing/z1t/), released in September 2026, is a family of language models redesigned for Z1's sparse connections, with open weights and a published training recipe; they cannot yet generate text on physical hardware.

The Z1T work also explores running a single model across GPUs and TSUs together, with each handling the operations it suits. A co-processor that works alongside installed hardware faces a lower adoption barrier than a replacement.

## Customer

Extropic has not announced commercial customers. Descriptions of its early access program mention frontier AI research labs, a weather modeling company, and government-linked research institutions. The company names generative AI, simulation of biological systems and financial markets, and probabilistic inference for robots, autonomous systems, and defense sensor platforms as target applications, and has published hardware-grounded energy estimates for a pharmaceutical workload.

| Market | Fit with the hardware | Size | Likelihood |
| --- | --- | --- | --- |
| Scientific and financial sampling | Natural; already sampling problems | Small | Highest |
| Edge devices and defense | Good; low power and uncertainty both matter | Medium | Moderate |
| Co-processor beside GPUs in data centers | Plausible, if hybrid models prove out | Large | Lower |
| Replacement for GPUs in mainstream generative AI | Requires industry-wide model redesign | Very large | Lowest |

The US government is positioned as both an early customer and a funder. In July 2026 Extropic signed a [letter of intent with the Department of Commerce](https://extropic.ai/writing/thermodynamic-computing-chips-in-america) for up to \$75 million through the CHIPS Research and Development Office, to bring the first Z1 clusters online, demonstrate performance on generative AI benchmarks, develop rack-scale systems, and qualify a domestic manufacturing path for a successor chip, the Z1.5.

## Market Size

If thermodynamic computing proves competitive for mainstream generative AI, its addressable market is AI compute itself. Deloitte estimated the market for inference-optimized chips at more than \$50 billion in 2026, and Gartner projected \$66.1 billion of spending on AI-optimized infrastructure as a service in 2027, against combined hyperscaler capital spending guided at \$660 billion to \$690 billion for 2026.

The markets that fit the hardware most naturally are far smaller. Scientific and financial workloads already formulated as sampling problems represent a specialized segment, comparable to the market served by quantum annealing, where D-Wave has operated for more than two decades with modest revenue. The size of Extropic's opportunity therefore depends on how far it can move from sampling-native niches toward general generative AI.

## Competition

Extropic competes less with any single company than with the rate of improvement of conventional computing. Its claimed advantages will be measured against the GPUs, model compression techniques, and serving software that exist when its hardware ships, not against those available today.

### Conventional accelerators

NVIDIA and AMD release new data center GPUs roughly annually, each generation improving performance per watt, and they hold the entire existing software ecosystem; NVIDIA reported record quarterly revenue of \$68.1 billion in its fiscal fourth quarter of 2026. A second tier of startups, [tracked across the category](https://convergedigest.com/ai-inference-semiconductor-startups-tracker/), builds digital chips specialized for transformer inference. Etched raised \$700 million at a \$21 billion valuation in 2026, SambaNova closed the first \$1 billion of a round at \$11 billion, and MatX raised a \$500 million Series B. These companies compete with Extropic for customer attention, engineering talent, and foundry relationships, and they require no change to how models are built.

### Efficiency through software

Low-precision methods represent model weights with one or two bits instead of sixteen, cutting memory and energy by large factors on existing hardware. [PrismML reported](https://www.newsbreak.com/techcrunch-com-332114314/4892662126160-prismml-hopes-its-tiny-llm-will-change-how-we-all-use-ai) that its compressed 27-billion-parameter model retains 98% of the original's benchmark performance at 5.9 GB. Inference engines such as SGLang and vLLM raise the useful output of installed GPUs. These approaches address the same energy problem without requiring new chips.

### Unconventional computing

Normal Computing is pursuing thermodynamic computing by a different technical route and has announced its own silicon; it is the closest direct competitor. D-Wave, founded in 1999, builds quantum annealers that sample from Ising models in hardware, is publicly traded, and has modest revenue after more than two decades, which illustrates the difficulty of finding commercial workloads for sampling hardware. Probabilistic bits have also been studied in university laboratories for years, so the core concept is not proprietary; Extropic's differentiation rests on its circuit designs, its compiler, and its practical experience.

The category's history is instructive. Cerebras built a processor the size of a wafer and took roughly a decade to reach substantial revenue, but it kept the same mathematics as GPUs and changed only the packaging. Graphcore raised about \$700 million for a new AI architecture and sold to SoftBank for less than that, because a better chip without the software ecosystem loses. Mythic's analog in-memory computing nearly closed in 2022 after its device-level advantages shrank at the system level. Lightmatter pivoted from computing with light to connecting chips with light and prospered, because the physics was real but the market wanted a different product. Groq struggled for years and then found its market when inference took off, which is the case for timing rescuing a chip company.

## Business Model

Extropic has not disclosed a commercial model or pricing. Based on its announcements, potential revenue sources include sales of chips and systems, of which it plans two Z1 form factors, cloud access to hardware, and government research funding. Today it offers early access to a simulator interface.

Hardware companies with differentiated products typically earn gross margins above 60%, and Extropic's use of mature manufacturing nodes should reduce production costs relative to leading-edge chips. In the near term, the planned Commerce Department funding of up to \$75 million would be non-dilutive and would exceed the company's total disclosed equity financing by about five times. A letter of intent is not a finalized award, and its terms have not been made public.

## Traction

In October 2025 Extropic announced X0 and the XTR-0 development platform built around it, and says it manufactured dozens of XTR-0 systems and shipped them to early adopters. In August 2026 it announced Z1, with 269,568 pbits on a die under 12 mm on a side drawing less than one watt. Early access to Z1 is planned for 2027.

<figure data-figure="venture:extropic-timeline"></figure>

Alongside the hardware, the company has released three open-source software projects and published a hardware architecture paper in a peer-reviewed Nature-family journal whose authors include MIT's Isaac Chuang. Its efficiency claims are large and, so far, unmeasured on shipping hardware.

| Claim | Basis | Caveat |
| --- | --- | --- |
| Up to 10,000x vs GPUs on suitable workloads | Simulation, small image datasets | Small tasks, simulated, purpose-built model |
| Up to 140x on transformer-like language models | Z1T release, September 2026 | Self-reported, cannot yet run on silicon, and set by the GPU baseline chosen (Extropic's own table gives 139x at 10% H100 utilization, 28x at 50%, and 14x at full) |
| A new scaling law for sparse transformers | Quality improves predictably with size | Worse rate, 10x computation for equal quality |
| Working silicon | X0 circuits; dozens of XTR-0 shipped | Proves the primitive, not an accelerator |
| Peer-reviewed architecture | Nature-family journal | Science, not a competitive product |

Independent analysts have raised three qualifications. Extropic's own benchmark shows its sparse models need [about ten times more computation](https://www.explainx.ai/blog/extropic-z1t-thermodynamic-sparse-transformer-hardware-2026) than a standard transformer to reach GPT-2 level quality, so the entire advantage must come from lower energy per operation. In the current system a [conventional helper chip](https://www.mindstudio.ai/blog/extropic-z1-probabilistic-chip) performs most of the processing and accounts for more than 95% of system energy. And because outside access to Z1 is not expected until 2027, the efficiency figures are projections from simulation.

<figure data-figure="venture:extropic-efficiency"></figure>

The July 2026 Commerce letter of intent is the other significant piece of traction, and it cuts in several directions. The money would not dilute shareholders and is roughly five times the company's entire disclosed equity funding. It is also a letter of intent rather than a signed award, with conditions, timing, and terms unpublished, and programs can change. It fits an industrial-policy narrative cleanly, since this is a new class of chip that can be manufactured today in American factories without dependence on the most advanced foreign ones. And it carries political exposure. The company's statement thanked the administration and the commerce secretary by name, and support identified with one administration can be withdrawn by another.

The company has announced no commercial customers and no revenue as of September 2026.

## Valuation

Extropic's only disclosed equity financing is a \$14.1 million seed round announced in December 2023 and led by Steve Jang of Kindred Ventures. Other investors included Buckley Ventures, HOF Capital, Julian Capital, Marque VC, OSS Capital, Valor Equity Partners, and Weekend Fund, along with angels including Aidan Gomez of Cohere, Amjad Masad of Replit, Arash Ferdowsi of Dropbox, Aravind Srinivas of Perplexity, Garry Tan of Y Combinator, Naval Ravikant, Balaji Srinivasan, Scott Belsky, and Tobias Lütke of Shopify. The valuation was not disclosed, and no priced round has been announced since.

The output relative to that funding is unusual. Conventional AI chip startups raised rounds of \$230 million to \$1 billion each in 2026, with SambaNova's first close at \$1 billion, Etched at \$700 million, MatX at \$500 million, Euclyd at over €200 million. Extropic has produced at least two chips, shipped systems, and released a software stack on \$14.1 million, which suggests either undisclosed financing or exceptional capital efficiency, aided by the low cost of mature manufacturing nodes.

<figure data-figure="venture:extropic-capital"></figure>

## Key Opportunities

### Energy as the binding constraint

If power availability continues to limit AI deployment, technologies that deliver more computation per watt become strategically valuable regardless of raw performance. This distinguishes the present from earlier eras in which alternative architectures failed, when transistor scaling rather than energy was the scarce resource. Even a small share of annual hyperscaler spending redirected toward more efficient computation would be a large market for a company of this size.

### Government as first customer

New semiconductor categories have historically relied on public funding and procurement in their early years, including the first integrated circuits. Extropic's use of mature nodes that can be manufactured domestically aligns with US industrial policy, and the planned CHIPS funding would finance the transition from single chips to rack-scale systems without dilutive capital at a stage when commercial evidence is limited. Defense applications involving low-power reasoning under uncertainty could provide early revenue.

### Hybrid systems alongside GPUs

If sampling-heavy portions of generative models can be offloaded to a low-power co-processor while dense matrix operations stay on GPUs, customers could adopt incrementally without abandoning existing infrastructure or software. Extropic has published open weights and a training recipe so outside researchers can test the approach before hardware is available, and adoption by even a few research groups would help establish whether hybrid architectures are practical.

### Sampling-native markets

Molecular simulation, financial risk modeling, and probabilistic inference for autonomous systems are already formulated as sampling problems and do not require redesigning transformers. They are smaller than generative AI, and D-Wave's experience shows sampling hardware can remain confined to them for many years, but they are the most plausible source of early customers, reference deployments, and reliability data.

## Key Risks

### The algorithm and the hardware must both succeed

Today's AI is built on dense matrix multiplication, which Extropic's chips do not perform. The company must develop new model architectures that fit sparse probabilistic hardware and match the quality of transformers, in addition to building the hardware. Its own results show a roughly tenfold gap in computational efficiency for the same quality, and customers are unlikely to accept lower output quality in exchange for energy savings. Extropic has responded by building the models and compiler itself and releasing them openly, which is a sound strategy but means conducting hardware development, systems software, and machine learning research in parallel with a team of about 25 people.

### System-level energy accounting

The efficiency of the pbits does not determine the efficiency of a complete system. Control electronics, memory, data movement, and a conventional helper processor all consume power, and in the current design the FPGA helper chip accounts for more than 95% of it. Several earlier analog and in-memory efforts showed large device-level advantages that diminished substantially once the full system was measured. Extropic has acknowledged that much of the remaining work lies beyond the chip, and the planned government funding is directed at exactly that.

### A moving conventional baseline

GPU generations, low-precision models, and better serving software each improve efficiency independently, and their effects multiply. Assume three times from GPU generations, seven and a half times from low precision, and two times from serving software, and the conventional stack improves by roughly 45 times without any change in how models are built. Those factors are illustrative rather than sourced, and they overlap, because a new GPU generation's per-watt gain already includes its low-precision hardware. Read as a range, something closer to 20 to 45 times, it still makes a simulated 140x advantage much smaller by the time hardware meets then-current alternatives. PrismML's compressed model is an example of exactly this kind of gain arriving on existing hardware with no new chips required.

<figure data-figure="venture:extropic-baseline"></figure>

### Commercialization, funding, and founder profile

Extropic has no announced customers, a team composed largely of scientists, and no publicly disclosed experience in high-volume chip manufacturing or enterprise hardware sales. Its largest prospective funding source is a government letter of intent that is not yet a finalized award. Verdon's public persona has brought the company attention and prominent early backers, and it is also polarizing, which may affect hiring, customer relationships, and future financing; political alignment that aids government support under one administration could become a liability under another.

## Summary

Extropic is a bet that the energy cost of generative AI is a physics problem rather than an engineering one. Conventional chips spend energy suppressing thermal noise, then spend more manufacturing artificial randomness; Extropic's thermodynamic sampling units let the noise do the work. The company has produced prototype silicon, shipped development systems, open-sourced a full software stack, and announced Z1 with 269,568 pbits drawing under a watt, all on \$14.1 million of disclosed equity.

Everything that matters remains unproven. The efficiency claims of up to 10,000 times on suitable workloads and 140 times on language models come from simulation, the models require about ten times more computation for equivalent quality, a conventional helper chip consumes most of the energy in the current system, physical hardware reaches outside users no earlier than 2027, and no customer has been announced. The nearest analogy is D-Wave, which built elegant sampling hardware and spent two decades looking for workloads that pay.

The question is not whether the physics works. It is whether a system-level energy advantage on commercially relevant tasks arrives large enough, and soon enough, to outpace a conventional stack that improves roughly 45 times on its own while Extropic builds.
