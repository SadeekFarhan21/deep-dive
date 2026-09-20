---
title: "Levocred"
pubDatetime: 2026-09-20T06:40:06.000Z
description: "Levocred puts AI agents inside credit funds and lenders to do the borrowing base reports, covenant checks and loan marks that analysts rebuild by hand. About $1B in receivables runs through it, and no disclosed revenue."
slug: levocred
company: "Levocred"
stage: "Pre-seed"
sector: "Fintech"
tags:
  - fintech
  - private-credit
  - agents
draft: true
category: ventures
---

## Overview

Levocred builds AI agents for the operational work inside private credit: borrowing base reports, covenant monitoring, credit memos, collections reconciliation, and the loan marks a fund publishes to its own investors. The work exists because a credit facility behaves like a credit card whose limit depends on the quality of the loans pledged against it, and both the lender and the borrower have to rebuild that calculation from raw loan data every week or month. Today an analyst does it in a spreadsheet. Levocred generates it in minutes with an audit trail. About \$1 billion in receivables across roughly 30 facilities runs through the platform, and the company does not disclose revenue.

| | |
| --- | --- |
| Founded | 2026 per Y Combinator, 2025 per an earlier profile |
| Headquarters | San Francisco |
| Founders | Mohit Gupta (CEO), Saksham Gupta (CTO) |
| Stage | Pre-seed. Y Combinator Summer 2026 |
| Employees | 2, as of late July 2026 |
| Status | About \$1B in receivables monitored. Revenue undisclosed |

## Thesis

Private credit has grown roughly tenfold since 2009 and the operations underneath it have not moved. The data for a single facility lives across five or six systems plus spreadsheets. The people assembling it are expensive analysts copying numbers between those systems. The fastest-growing corner of the asset class is asset-based finance, which is the segment with the most loan-level data and therefore the most manual work — this is [Fitch's read](https://www.hellenicshippingnews.com/?p=1117665) and it is the segment Levocred serves.

Two things make the work unusually attractive to automate. It is high-stakes, because a mistake delays funding and a missed covenant can put a facility into default, which means buyers have a real reason to pay rather than tolerate. And it is high-frequency, because the reports rebuild every period forever, which means the software sits in the operating rhythm of the firm rather than at the edge of it.

The company's larger claim is about sequence. Levocred now describes itself as the Bloomberg of loans, arguing that \$22 trillion of US loans never trade because nobody can price them efficiently and defensibly, and that fixing pricing from inside lenders is the route to eventually hosting the trading. Bonds developed in that order. Whether loans follow is unknowable now, but the first stage stands on its own, and the later stages are optionality rather than the basis for underwriting.

| Stage | Product | How it earns | Evidence |
| --- | --- | --- | --- |
| 1. Workflow | Agents for draws, covenants, memos and reporting | Software fees | Live. About \$1B in receivables on the platform |
| 2. Pricing | Marks and valuations for a lender's book | Software and data fees | One fund cut the time to mark its book from a week to two hours |
| 3. Trading | A venue where priced loans can change hands | Transaction fees | Vision only |

## Founding Story

Mohit Gupta and Saksham Gupta both built the thing they are now selling, from the inside.

Mohit was the first employee at a credit fund that grew from \$10 million to \$1 billion in assets. He managed a \$200 million book at 23 and has evaluated roughly \$100 billion of loans. Before that he worked in fixed income at Morgan Stanley. He studied computer science at IIT Bombay, where he placed 53rd out of 1.2 million candidates in the entrance exam, and finance at UC Berkeley.

Saksham was a founding engineer at a credit fund, where he built the trading and data infrastructure as it scaled from \$150 million to over \$1 billion. He studied electrical engineering at IIT Kanpur.

Y Combinator's launch post says their code ran billions in lending. The relevant gap is equally clear: neither has sold software to a bank. The buyers they can reach today are funds like the ones they worked at, and the buyers that would make this a large company purchase on a different clock, through procurement processes neither founder has run. That is the first hire, not a founder-level flaw.

## Product

| Workflow | Today | With Levocred |
| --- | --- | --- |
| Borrowing base report | An analyst rebuilds it in a spreadsheet each period | Generated in minutes, with an audit trail |
| Covenant monitoring | Checked by hand, periodically | Monitored in real time |
| Credit memos and lender packages | Written from scratch | Drafted from the firm's own data and past deals |
| Collections and cash reconciliation | Manual matching across bank feeds | Automated |
| Institutional memory | Lives in email and in people's heads | Searchable, including deals closed years ago |

Inputs are the loan tape, credit agreements, servicer reports and bank feeds. The "minutes, not days" framing is the company's own, from its [profile](https://yespress.io/levocred-ai-yc-s26) and [YC page](https://www.ycombinator.com/companies/levocred-ai).

The audit trail is the part that matters more than the speed. Software that produces a number a fund sends to its lender is only adoptable if the fund can show how the number was derived, and the absence of that is why general-purpose analyst tools do not win this work.

## Customer

Two buyers sit on opposite sides of the same facility, and Levocred sells to both. The fintech lender pledges loans and prepares the borrowing base report; the credit fund advances cash against them and monitors the covenants. Both rebuild the same calculation from the same underlying data, which is what makes a shared system of record plausible rather than merely convenient.

Today those buyers are small funds and lenders — the segment that moves fast, has no internal engineering team, and feels the analyst cost most acutely. Levocred names Pier Asset Management as a customer. One fund has gone further and named Levocred as data agent and system of record in its loan purchase agreements, which is a stronger commitment than a subscription and the single most interesting fact in the company's traction.

Banks and large funds are where the market size lives. There is no named bank customer, and nothing in the company's history suggests that sale is close.

## Market Size

My estimate: 2 to 5 basis points a year on \$2 trillion of monitored capital is \$400 million to \$1 billion of annual revenue. That is a sizing exercise, not a sourced figure, and it depends entirely on a pricing model the company has not disclosed.

The supporting context is in [Chambers' 2026 private credit guide](https://practiceguides.chambers.com/practice-guides/private-credit-2026) and [BlackRock's primer](https://www.blackrock.com/gls-download/literature/market-commentary/private-credit-primer-january-2026.pdf): an asset class that has grown tenfold in fifteen years, whose fastest-growing segment is the data-heavy one, running on tooling that predates all of that growth.

## Competition

| Competitor | Type | Why it matters |
| --- | --- | --- |
| Setpoint, Cascade Debt | Software for asset-backed lending | Closest rivals, selling to the same buyers |
| General finance AI tools | Horizontal analyst tools | Could move into credit workflows |
| In-house builds | Large funds' own engineering | Where Levocred's founders came from |
| Spreadsheets | The real incumbent | Analysts trust them and auditors accept them |

The last row is not a joke. The competitor that wins most deals in this category is the existing process, defended by the fact that it is understood, auditable, and already approved. Levocred's edge against the general tools is depth — a borrowing base report has to be correct to the dollar, and a tool built to summarize documents is not built to that standard. Its edge against Setpoint and Cascade is less clear from public information, and is the thing a buyer would actually test.

## Business Model

Pricing is undisclosed. The table assumes 3 basis points a year on capital monitored, which is my estimate, and exists mainly to show why platform volume should not be read as revenue.

| Capital monitored | Implied annual revenue at 3 basis points |
| --- | --- |
| \$1B, about today's level | \$0.3M |
| \$10B | \$3M |
| \$50B | \$15M |
| \$500B | \$150M |

One detail suggests genuine willingness to pay. Drawing on a credit line takes hours of spreadsheet work, so teams draw less often than they should and leave financing capacity unused. Faster draws have a direct, calculable dollar value to the borrower, which is a better basis for pricing than time saved.

## Traction

| Metric | Figure |
| --- | --- |
| Capital monitored, late July 2026 | Over \$500M across 10 facilities |
| Receivables on platform, August launch | About \$1B |
| Capital monitored, later profile | Over \$1B across 30 facilities |
| Time to mark a book, one fund | From a week to two hours |
| Contractual role at that fund | Named data agent and system of record in its loan purchase agreements |
| Time to prepare a draw | From a day of spreadsheet work to minutes |
| Asset classes live | Consumer, fintech, litigation finance, merchant cash advance |
| Named customer | Pier Asset Management |
| Revenue, pricing, customer count | Not disclosed |

Usage roughly doubled in weeks, and four asset classes running through one engine is early evidence that the product generalizes without per-client rule-writing. As [one newsletter covering the batch](https://enterpriseaiweeklybyvp.substack.com/p/what-ycombinators-september-2026) put it, receivables are not revenue. That is the first thing anyone should establish.

## Valuation

No priced round has been disclosed. Levocred participated in Y Combinator's Summer 2026 batch on standard terms; its YC partner is Brad Flora. A first priced round would be expected to form in the months after the batch.

## Key Opportunities

**Converting usage into contracts.** About \$1 billion in receivables across 30 facilities is a live deployment footprint that most pre-seed companies never reach. The gap between that and disclosed revenue is the company's single largest near-term value creation step, and it requires selling rather than building.

**System of record status.** One fund already names Levocred in its loan purchase agreements. That is contractual entrenchment rather than a subscription, it is extremely hard for a competitor to displace, and it is a repeatable motion if the company recognizes what it has.

**The pricing product.** Marking a book in two hours instead of a week is a distinct product with a distinct buyer inside the same account, and it is the bridge to stage two of the company's thesis. Three funds live on pricing would make the Bloomberg-of-loans framing an argument rather than an aspiration.

**Moving up-market.** The current customers validate the workflow. A single bank or large fund in production would multiply the addressable contract size and answer the main question about the founders' commercial range.

## Key Risks

**Revenue is entirely unproven.** Platform volume is public and revenue is not, and small funds have limited budgets. The whole investment case turns on an answer the company has not given.

**Two people supporting 30 live facilities.** That is fragile operationally and leaves no capacity to sell. The first engineering and sales hires are the point of the round.

**Accuracy is existential, not a quality metric.** One wrong compliance certificate delivered to a lender would travel through a small industry faster than any sales effort could repair.

**Better-funded rivals sell to the same buyers.** Setpoint and Cascade Debt have installed bases into which they can ship the same AI features.

**Intellectual property origin.** Both founders built tooling inside credit funds before starting this company. Claims from a former employer over that work would be difficult to unwind.

**Sales cycle mismatch.** The customers who can pay meaningfully buy slowly; the customers buying now cannot pay much.

**Credit cycle.** Stress would cut software budgets, though it would also raise demand for exactly this monitoring. The direction is genuinely ambiguous.

## Summary

Levocred is the rare pre-seed company whose product is already load-bearing for its customers. About \$1 billion in receivables across 30 facilities, four asset classes running through one engine, and one fund that has written the company into its loan purchase agreements as data agent and system of record — that last fact is worth more than the volume figure, because it is a commitment a fund cannot casually reverse.

Against that, the company is two people, and it has disclosed no revenue, no pricing, and no customer count. Usage is not the same as a business, and private credit is full of small funds that will happily adopt a free-feeling tool and balk at a six-figure contract. The founders have done this job, which is the best possible preparation for building the product and no preparation at all for selling it to a bank.

The question is not whether the work is worth automating. Analysts rebuilding borrowing base reports in spreadsheets on a \$2 trillion asset class settles that. The question is what anyone will pay, and the company has not yet said.
