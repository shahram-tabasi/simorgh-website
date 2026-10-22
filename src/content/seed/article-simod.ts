// The article on SIMOD and process simulation in Kara (October 2026).
// Applied to stored content by migration "2026-10-production-products".
import type { Article } from '../types';

export const simodArticle: Article = {
  slug: 'business-process-simulation-simod-kara',
  title: 'What if? Discovering business process simulation models from event logs with SIMOD, and how Kara puts it to work',
  kind: 'Technical Article',
  category: 'Process Intelligence',
  readTime: '14 min read',
  date: '2026-10-22',
  author: 'SIMORGH Engineering',
  excerpt:
    'SIMOD, an open-source tool from the University of Tartu, discovers a calibrated business process simulation model from the event logs your systems already record. How it works, how to run it on your own data, its limits, and how Simorgh Kara turns everyday work into the event log and the what-if decisions.',
  cover: '/articles/simod-process-simulation.jpg',
  video: '',
  status: 'published',
  seo: {
    title: 'Business process simulation from event logs: SIMOD explained, and what-if analysis in Simorgh Kara',
    description: 'How SIMOD discovers a business process simulation model from event logs (Split Miner, resource calendars, extraneous delays, Prosimos), how to run it on your data, its limits, and how Simorgh Kara applies it.',
    keywords: 'SIMOD, business process simulation, process mining, event log, Prosimos, what-if analysis, BPMN, Simorgh Kara',
    image: '/articles/simod-process-simulation.jpg',
  },
  body: `Every operations manager eventually asks a question that no dashboard answers: **what happens if we change something?** If we hire one more cost engineer, will tender offers leave on time? If purchase orders above a threshold need a second signature, how much longer will procurement take? If we move the factory-acceptance test team to a two-shift calendar, does delivery improve or does the bottleneck just move?

Dashboards describe the past. Answering *what if* needs a model of the process that can be run forward: a **business process simulation (BPS) model**. Until recently, building one meant weeks of interviews, a hand-drawn BPMN diagram, guessed task durations and a model nobody fully trusted. The open-source tool **SIMOD**, developed at the University of Tartu and described in *SoftwareX* (2025), turns that around: it **discovers** the simulation model from the event logs your systems already record, and tunes it until its simulated behaviour matches reality.

This article explains how SIMOD works, how to use it on your own data, where its limits are, and how we are building the same capability into **Simorgh Kara**, our enterprise organisation platform.

## Why hand-built simulation models disappoint

A simulation model needs far more than a flowchart. To reproduce how a process really behaves it must know:

- **the control flow**: which activities exist, in which order, where work branches and how often each branch is taken;
- **the arrival pattern**: how many new cases (offers, orders, tickets) start per hour and day;
- **the resources**: who can perform each activity, how long they take, and *when they are actually available*, because nobody works 24 hours a day;
- **the waiting that is not caused by resources**: the customer who answers after two days, the batch that is only released on Thursdays, the document waiting for a signature.

Analysts traditionally fill these in by hand. The result is usually optimistic (people underestimate waiting), static (it reflects the process of the interview, not of today) and unvalidated: nobody checks whether the model, run over last year, would have produced last year.

## What SIMOD does

SIMOD takes three inputs:

1. an **event log** in CSV format, one row per executed activity;
2. a **YAML configuration** that says what to discover and how hard to search;
3. optionally, a **BPMN model** of the process, if you already have one you trust.

Its output is a complete BPS model: a BPMN file plus a JSON file of simulation parameters, ready to run in **Prosimos**, the simulation engine embedded in SIMOD.

The minimum event log is small. For our offer process it would look like this:

| case_id | activity | start_time | end_time | resource |
|---|---|---|---|---|
| OFF-1042 | Register tender | 2026-03-02 08:12 | 2026-03-02 08:31 | Sara |
| OFF-1042 | Technical scope | 2026-03-02 09:05 | 2026-03-03 15:40 | Reza |
| OFF-1043 | Register tender | 2026-03-02 10:20 | 2026-03-02 10:36 | Sara |
| OFF-1042 | Costing | 2026-03-04 08:30 | 2026-03-04 13:10 | Ali |
| OFF-1042 | Approve offer | 2026-03-05 11:02 | 2026-03-05 11:20 | Maryam |

A *case* is one instance of the process (here, one offer). Column names are configurable. Start times matter: without them SIMOD cannot separate working time from waiting time, although it can estimate missing ones.

![SIMOD's discovery pipeline: from an event log to a simulation model that runs in Prosimos](/articles/simod-pipeline.svg)

### The discovery pipeline

SIMOD is organised as a pipeline of stages. Each stage discovers one part of the model, and the stages with tunable choices run an **optimisation loop** (Tree-structured Parzen Estimator, via *hyperopt*): try a parameter set, simulate, compare the simulated log to a validation part of the real log, keep the best.

**1. Preprocessing.** SIMOD computes when each activity became *enabled* (ready to start), detects concurrency, and can correct multitasking, where one person appears to work on several things at once.

**2. Control flow.** The process map is discovered with **Split Miner**. Its two key knobs, how much concurrency to accept and how aggressively to filter rare paths, are searched rather than guessed. Branching probabilities at each gateway are either learned from the log or set equal. Newer versions can learn **data-aware branching rules**, for example "offers above 2 billion rials go to the board".

**3. Case arrivals.** SIMOD fits a probability distribution to the time between new cases, or replays the observed pattern.

**4. Resource model.** This is where SIMOD is markedly better than manual models. It discovers **availability calendars** from when people actually worked, either one calendar per person (*differentiated*), one per pool, or *fuzzy* calendars that express availability as a probability. It also learns how long each person takes for each activity. Prioritisation and batching rules can be discovered too.

**5. Extraneous delays.** Waiting that is not explained by resource availability, such as a supplier's reply or a customer's signature, is discovered and added to the model as timers. In real processes this is often where most of the cycle time hides.

**6. Evaluation.** The final model is simulated several times and compared with a test part of the log using a family of distances: n-gram distance for control flow, and distributions of events over time, over the day (circadian), of arrivals and of cycle times. The 2025 quality framework by Chapela-Campa and colleagues explains what each measure captures.

Each optimisation metric is aligned with the stage it tunes. Control flow is judged by n-gram distance, so the order of activities matches. The resource model is judged by circadian earth mover's distance, so work happens at the right hours of the day.

## Running it on your own data

SIMOD needs Python 3.11 and Java 8, or simply Docker:

\`\`\`bash
pip install simod
simod --configuration config.yml
\`\`\`

A compact configuration for a first run:

\`\`\`yaml
version: 5.2
common:
  train_log_path: offers_2025.csv
  log_ids:
    case: case_id
    activity: activity
    resource: resource
    start_time: start_time
    end_time: end_time
  perform_final_evaluation: true
  evaluation_metrics: [two_gram_distance, circadian_event_distribution, cycle_time_distribution]
control_flow:
  optimization_metric: two_gram_distance
  num_iterations: 20
  mining_algorithm: sm1
resource_model:
  optimization_metric: circadian_emd
  num_iterations: 20
  resource_profiles:
    discovery_type: differentiated
    granularity: 60
extraneous_activity_delays:
  discovery_method: eclipse-aware
  num_iterations: 1
\`\`\`

The best model lands in \`outputs/<run>/best_result/\`: the BPMN diagram, the simulation parameters, and the evaluation report.

Practical lessons from preparing logs:

- **Hundreds of cases are a minimum; thousands are better.** Calendars and durations per person need enough observations.
- **Shared accounts break the resource model.** If three engineers log in as "office", SIMOD sees one superhuman resource.
- **Bulk entries lie.** Activities recorded at the end of the day, all at 17:00, look like instant work followed by long waits.
- **One process per log.** Mixing offer handling with after-sales tickets produces a meaningless map.
- **Keep a holdout.** Judge the model on months it did not learn from.

## From model to decision

The discovered model is the baseline. *What-if* analysis means copying it, changing one thing, and simulating both:

| Scenario | Change in the model | What to compare |
|---|---|---|
| Hire a second cost engineer | add a resource to the *Costing* pool with the same calendar | offer lead time, costing queue |
| Two-level approval above a threshold | data-aware rule at the approval gateway | approval waiting time, share of late offers |
| Workshop on two shifts | extend the calendar of the assembly pool | throughput, work in progress |
| Faster supplier replies | shorten the discovered extraneous delay | procurement cycle time |

Because the model was calibrated on reality, the *difference* between baseline and scenario is meaningful even where absolute numbers carry error. Always compare distributions, not single averages: a change that shortens the median but lengthens the tail can still hurt customers.

## Limits worth knowing

SIMOD is a strong tool, not magic. It assumes the future resembles the logged past; a reorganisation invalidates the model until new data accumulates. Each process is simulated in isolation, so shared resources across several processes need care. Costs and quality outcomes are outside the standard pipeline. And the model is only as good as the log, which brings us to the real bottleneck in most organisations.

## The real bottleneck: getting a usable event log

In most companies the data SIMOD needs is scattered: tasks in e-mail, approvals on paper, orders in an ERP, engineering work in spreadsheets. Exporting a clean log with consistent case identifiers, real start and end times and real people becomes a project of its own. That is exactly the gap we designed **Simorgh Kara** to close.

## The Simorgh solution: process intelligence in Kara

Simorgh Kara is our platform for running a complex, multi-company organisation, a *virtual enterprise*, on one screen. Sales and offers, engineering, project control, procurement, warehouse, production, quality and after-sales all run as processes in Kara, with Odoo as the ERP behind them.

![How Kara turns everyday work into a simulation model and back into decisions](/articles/kara-process-intelligence.svg)

**1. The event log is a by-product of everyday work.** Every task in a Kara work queue (kartabl) carries who did it and when it was created, started and finished. Every business document changes state in the ERP (offer sent, order confirmed, production order done) and is published as an event on our message bus. Every BPMN process instance runs on the process engine with its own case identifier. Together these give exactly the columns SIMOD needs, with real start times and real people. No shared accounts are allowed, because everyone signs in personally.

**2. Calendars come from the organisation itself.** Kara already keeps attendance, shift schedules, holidays and leave. That is ground truth for the resource calendars, which SIMOD would otherwise have to infer.

**3. Discovered versus designed.** Processes in Kara are designed in a BPMN modeller. Putting the *discovered* model next to the *designed* one shows where reality departs from the procedure: skipped approvals, rework loops, informal shortcuts.

**4. A process lab for what-if decisions.** We are building a *Process Lab* into Kara. It exports the log of a chosen process and period, runs SIMOD on our own Kubernetes cluster (no data leaves the company), and lets a manager clone the baseline into scenarios: another engineer, a different approval rule, a new shift. The results come back as lead-time distributions side by side, with the assumptions written down.

**5. Close the loop.** When a scenario is adopted, the change is made in the same BPMN model the engine runs, and next quarter's log shows whether the prediction held.

For an engineering company that sells switchgear projects, the first candidates are the **tender-to-offer** process (where lead time wins or loses contracts), **procurement** (where supplier delays dominate) and **factory acceptance testing** (where a small team is shared across many projects).

Kara's process engine and work queues are being rolled out now. The Process Lab follows on the same foundation. If you would like to evaluate it on one of your processes, [request a demo](/request-demo) and we will start from your existing data.

## References

- Chapela-Campa, D., López-Pintado, O., Suvorau, I., Dumas, M. (2025). *SIMOD: Automated discovery of business process simulation models.* SoftwareX 30, 102157. [doi:10.1016/j.softx.2025.102157](https://doi.org/10.1016/j.softx.2025.102157)
- Camargo, M., Dumas, M., González, O. (2020). *Automated discovery of business process simulation models from event logs.* Decision Support Systems 134, 113284. [doi:10.1016/j.dss.2020.113284](https://doi.org/10.1016/j.dss.2020.113284)
- Chapela-Campa, D., Dumas, M. (2024). *Enhancing business process simulation models with extraneous activity delays.* Information Systems 122, 102346. [doi:10.1016/j.is.2024.102346](https://doi.org/10.1016/j.is.2024.102346)
- Chapela-Campa, D., et al. (2025). *A framework for measuring the quality of business process simulation models.* Information Systems 127, 102447. [doi:10.1016/j.is.2024.102447](https://doi.org/10.1016/j.is.2024.102447)
- López-Pintado, O., Dumas, M. (2023). *Discovery and simulation of business processes with probabilistic resource availability calendars.* ICPM 2023. [doi:10.1109/ICPM60904.2023.10271965](https://doi.org/10.1109/ICPM60904.2023.10271965)
- SIMOD source code (Apache-2.0): [github.com/AutomatedProcessImprovement/Simod](https://github.com/AutomatedProcessImprovement/Simod) · documentation: [simod.readthedocs.io](https://simod.readthedocs.io/en/latest/)`,
};
