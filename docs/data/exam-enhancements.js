(function () {
  "use strict";

  const A = window.AcademyData;
  const H = window.AcademyContent;
  if (!A || !H || !Array.isArray(A.lessons)) return;

  const { question, table, diagram } = H;
  const lesson = (id) => A.lessons.find((x) => x.id === id);
  const addUnique = (arr, value) => {
    if (!arr.some((x) => Array.isArray(x) ? x[0] === value[0] : x === value)) arr.push(value);
  };
  const addSource = (key, title, url) => {
    A.sources = A.sources || {};
    A.sources[key] = { title, url };
  };
  const attachSources = (l, core = [], deep = []) => {
    l.sources = l.sources || { core: [], deep: [] };
    l.sources.core = l.sources.core || [];
    l.sources.deep = l.sources.deep || [];
    core.forEach((x) => { if (!l.sources.core.includes(x)) l.sources.core.push(x); });
    deep.forEach((x) => { if (!l.sources.deep.includes(x)) l.sources.deep.push(x); });
  };
  const addSection = (l, section) => {
    if (!l.sections.some((s) => s.id === section.id)) l.sections.push(section);
  };
  const prependQuestions = (l, qs) => {
    const ids = new Set(l.quiz.map((q) => q.id));
    l.quiz.unshift(...qs.filter((q) => !ids.has(q.id)));
  };

  addSource(
    "saudiPDPL",
    "SDAIA — Personal Data Protection Law (PDPL)",
    "https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/PDPL"
  );
  addSource(
    "saudiPDPLGuide",
    "SDAIA — Guide to the Saudi PDPL for Controllers and Processors",
    "https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/PDPLCP"
  );
  addSource(
    "saudiPDPLBreach",
    "SDAIA — Personal Data Breach Notification",
    "https://dgp.sdaia.gov.sa/wps/portal/pdp/services/personaldatabreachnotification/"
  );
  addSource(
    "saudiPDPLTransfer",
    "SDAIA — Regulation on Personal Data Transfer Outside the Kingdom",
    "https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/RegulationonPersonalDataTransferOutsidetheKingdom"
  );
  addSource(
    "sdaiaEthics",
    "SDAIA — AI Ethics Principles",
    "https://sdaia.gov.sa/en/SDAIA/about/Documents/ai-principles.pdf"
  );
  addSource(
    "sdaiaAdoption",
    "SDAIA — AI Adoption Framework",
    "https://sdaia.gov.sa/en/SDAIA/about/Files/AIAdoptionFramework.pdf"
  );

  // D5 — architecture selection under hard constraints.
  {
    const l = lesson(49);
    if (l) {
      addSection(l, {
        id: "constraint-first",
        title: "Architecture selection starts with hard constraints, not favorite technologies",
        body: [
          "Certification scenarios often give several attractive architectures and a short list of requirements such as latency, accuracy, cost, availability, freshness, privacy, or throughput. Treat those requirements as a feasibility filter before comparing elegance. A design that violates one hard requirement is not the best answer merely because it is cheaper or more accurate on another dimension.",
          "Start by separating hard constraints from optimization goals. If the service must respond within 150 ms and accuracy must be at least 92%, any candidate above 150 ms or below 92% is eliminated before cost is compared. Only after feasibility is established should you optimize the remaining objective, such as lowest monthly cost or simplest operation.",
          "This changes exam behavior: read the scenario, write the constraints mentally, then inspect the options. Reading options first encourages anchoring on a familiar technology and makes near-miss distractors harder to reject."
        ],
        table: table(
          "Requirement matching example",
          ["Candidate", "p95 latency", "Accuracy", "Cost / 1k", "Feasible?"],
          [
            ["A", "120 ms", "92.4%", "$0.11", "Yes"],
            ["B", "80 ms", "90.8%", "$0.09", "No — accuracy"],
            ["C", "165 ms", "94.1%", "$0.10", "No — latency"],
            ["D", "130 ms", "93.0%", "$0.16", "Yes, but more expensive"]
          ]
        ),
        example: "If the hard requirements are p95 ≤150 ms and accuracy ≥92%, candidates A and D survive. If the goal is then minimum cost, choose A. Candidate C has the best accuracy but is infeasible because it misses the latency SLO.",
        failure: "Do not average requirements into one vague score when the scenario states hard limits. A 94% accurate model does not compensate for violating a mandatory latency ceiling.",
        check: {
          question: "A candidate is cheapest and most accurate but exceeds the required p95 latency. Should it remain in consideration?",
          answer: "No. A hard requirement is a feasibility gate; optimize among candidates that satisfy every mandatory constraint."
        }
      });
      addUnique(l.glossary, ["Hard constraint", "A requirement that must be satisfied before optimization among feasible designs."]);
      addUnique(l.glossary, ["Feasibility filter", "Eliminating candidates that violate any mandatory requirement."]);
      prependQuestions(l, [
        question("X49Q1", "Requirement matching", "An inference service must achieve p95 latency ≤150 ms, accuracy ≥92%, and then minimize cost. Candidate A: 120 ms, 92.4%, $0.11/1k. B: 80 ms, 90.8%, $0.09/1k. C: 165 ms, 94.1%, $0.10/1k. D: 130 ms, 93.0%, $0.16/1k. Which candidate best satisfies the decision rule?", [
          ["Candidate A", "A satisfies both hard constraints and is cheaper than the other feasible candidate."],
          ["Candidate B", "B is cheaper and faster but violates the minimum accuracy requirement."],
          ["Candidate C", "C is accurate and inexpensive but violates the p95 latency ceiling."],
          ["Candidate D", "D is feasible, but once feasibility is met A has the lower stated cost."]
        ], 0),
        question("X49Q2", "Hard constraints", "A team ranks architectures by a weighted average of latency, cost, and accuracy even though the contract requires p95 <200 ms. The top-ranked option has p95 260 ms. What is the reasoning error?", [
          ["They should increase the weight on accuracy.", "Changing another weight does not repair a mandatory latency violation."],
          ["They treated a hard constraint as a soft preference.", "A contractual ceiling should eliminate infeasible candidates before weighted optimization."],
          ["They should use mean latency instead.", "Changing the statistic can hide the stated p95 requirement rather than satisfy it."],
          ["They should always choose the cheapest option.", "Cost optimization applies only among feasible choices."]
        ], 1),
        question("X49Q3", "Inference mode", "A nightly risk-scoring job processes 20 million records before 6 AM. No user waits for an individual prediction, and GPU utilization is much better with large batches. Which design is most appropriate?", [
          ["A synchronous online endpoint for every row", "Per-request serving adds overhead without a latency need."],
          ["Batch inference with throughput-oriented scheduling", "The requirement is completion by a deadline, so batching can maximize utilization and reduce per-record overhead."],
          ["A browser-only model", "The workload is centralized and large-scale rather than interactive."],
          ["A streaming endpoint because streaming is always faster", "Streaming is useful when outputs must arrive continuously; it is not inherently cheaper or better for this deadline-based job."]
        ], 1)
      ]);
    }
  }

  {
    const l = lesson(50);
    if (l) {
      addSection(l, {
        id: "capacity-cost",
        title: "Cost analysis follows the bottleneck and the capacity equation",
        body: [
          "Cost questions are often disguised capacity questions. Start from required throughput, add the stated headroom, divide by sustainable throughput per replica, and round up. Only then multiply by the cost per replica. Scaling from intuition can under-provision a service or pay for idle accelerators.",
          "A GPU can be expensive and still not be the bottleneck. If utilization is low while input queues stall on storage, adding GPUs increases cost without materially increasing throughput. Likewise, a larger model may improve quality but increase memory pressure, batch limits and tail latency. The engineering task is to identify which resource constrains the objective.",
          "Cost comparisons must use the same unit and workload assumption: per request, per 1,000 requests, per hour, or monthly at a specified traffic level. A cheaper hourly instance can be more expensive per completed request if utilization is poor."
        ],
        example: "Demand is 180 requests/s and each replica sustains 50 requests/s. With 25% headroom, required capacity is 225 requests/s. 225/50 = 4.5, so five replicas are required. Four replicas provide only 200 requests/s and fail the headroom requirement.",
        check: {
          question: "Why is multiplying instance price by replica count before calculating required capacity dangerous?",
          answer: "Because cost depends on how many replicas are actually required to satisfy throughput and headroom; guessing the count can compare infeasible systems."
        }
      });
      prependQuestions(l, [
        question("X50Q1", "Capacity planning", "Traffic is 180 requests/s. One replica sustainably serves 50 requests/s. The design requires 25% capacity headroom. What is the minimum replica count?", [
          ["3", "Three replicas provide only 150 requests/s, below current demand."],
          ["4", "Four provide 200 requests/s, which is above current demand but below the 225 requests/s headroom target."],
          ["5", "180 × 1.25 = 225 required requests/s; 225/50 = 4.5, so round up to five replicas."],
          ["6", "Six would work but is not the minimum count requested."]
        ], 2),
        question("X50Q2", "Bottleneck cost", "GPU utilization is 22%, the accelerator queue is usually empty, and requests wait on remote feature reads. Which first action best addresses both performance and cost?", [
          ["Double the GPU count", "More accelerators will mostly remain idle while the I/O bottleneck persists."],
          ["Move or cache hot features closer to inference and re-measure", "Reducing the identified I/O stall can improve throughput and raise useful GPU utilization before scaling compute."],
          ["Increase model size", "A larger model increases compute demand without fixing remote-read latency."],
          ["Disable monitoring", "Removing evidence does not remove the bottleneck and makes diagnosis harder."]
        ], 1),
        question("X50Q3", "Cost normalization", "Two providers quote $2.20 per GPU-hour and $0.003 per prediction. What must you know before declaring one cheaper?", [
          ["Only which provider is more popular", "Popularity does not normalize the cost basis."],
          ["Expected throughput/utilization and workload volume", "You need to convert both options to the same unit under realistic utilization and traffic."],
          ["Only the model's parameter count", "Parameter count alone does not convert hourly infrastructure cost to cost per completed prediction."],
          ["Nothing; $0.003 is always cheaper", "A per-prediction price cannot be compared directly with hourly compute without workload assumptions."]
        ], 1)
      ]);
    }
  }

  // D6 — Saudi privacy/governance supplement plus exam distinction patterns.
  {
    const l = lesson(61);
    if (l) {
      addSection(l, {
        id: "classify-control-family",
        title: "First classify the violated control family: privacy, security, ethics, or governance",
        body: [
          "Many difficult scenarios deliberately mix several concerns. Privacy asks whether personal data is collected, processed, retained, disclosed, or transferred on an appropriate basis and within purpose. Security asks whether confidentiality, integrity, availability, identity and authorization controls prevent unauthorized access or action. Ethics asks whether the AI outcome is fair, transparent, safe, accountable and appropriately human-governed. Governance asks whether ownership, risk classification, approvals, documentation, monitoring and change controls exist and are followed.",
          "The categories overlap but are not interchangeable. Encryption can be a security control that supports privacy, yet encryption alone does not establish a lawful processing purpose. Likewise, a signed approval record is governance evidence but does not automatically make a discriminatory model ethically acceptable.",
          "When a question asks which standard or control is primarily violated, identify the mechanism first. If an employee assistant retains identifiable prompts beyond the stated purpose, start with privacy/data-protection reasoning. If the same system lets a user read another employee's record, authorization is also a security failure."
        ],
        table: table(
          "Control-family diagnosis",
          ["Primary lens", "Typical exam signal", "Engineering response"],
          [
            ["Privacy / PDPL", "Personal data, purpose, consent/legal basis, retention, rights, transfer", "Minimize, establish basis/purpose, honor rights, control disclosure/transfer"],
            ["Security", "Unauthorized access, credential leak, privilege escalation, tampering", "IAM, least privilege, secrets, encryption, isolation, detection"],
            ["Responsible AI / ethics", "Bias, unsafe decisions, opacity, lack of human oversight", "Subgroup evaluation, transparency, safety controls, human oversight"],
            ["Governance", "No owner, missing approval, undocumented change, no audit trail", "Risk classification, approvals, documentation, monitoring, accountability"]
          ]
        ),
        failure: "Do not answer every data scenario with 'encrypt it.' Encryption protects data in transit/at rest, but does not by itself answer whether the organization should process, retain or transfer the data at all.",
        check: {
          question: "A model stores encrypted employee prompts indefinitely even though the stated purpose needs only 30 days. Is encryption a complete answer?",
          answer: "No. Encryption is a security control; purpose limitation, minimization and retention remain privacy/governance questions."
        }
      });
      attachSources(l, ["saudiPDPL", "sdaiaEthics"], ["saudiPDPLGuide", "sdaiaAdoption"]);
      addUnique(l.glossary, ["Control-family diagnosis", "Classifying a scenario by its primary privacy, security, ethics, or governance mechanism before selecting a control."]);
      prependQuestions(l, [
        question("X61Q1", "Control classification", "An AI assistant encrypts employee prompts but retains identifiable prompts indefinitely despite a 30-day stated purpose. Which issue is most directly unresolved?", [
          ["Only transport security", "Encryption may already address transport/storage confidentiality; it does not address excessive retention."],
          ["Privacy and purpose/retention governance", "The core issue is continued processing and retention beyond the stated need."],
          ["GPU utilization", "Compute efficiency is unrelated to the data-lifecycle issue."],
          ["Tokenizer vocabulary", "Tokenization does not determine lawful retention."]
        ], 1),
        question("X61Q2", "Privacy vs security", "A user can retrieve another employee's private record because the RAG index ignores access control. Which pair best describes the failure?", [
          ["Privacy exposure plus authorization/security failure", "Private personal data is exposed because access control failed."],
          ["Only model calibration", "Probability calibration does not govern record access."],
          ["Only fairness", "The main mechanism is unauthorized data access, not subgroup performance."],
          ["Only cost governance", "Cost is not the relevant control boundary."]
        ], 0),
        question("X61Q3", "Governance vs ethics", "A high-impact AI system has no named owner, approval record, or documented change history. Outputs are currently accurate. What is the primary gap?", [
          ["Governance and accountability", "Accuracy does not replace ownership, approval and traceability controls."],
          ["Tokenizer selection", "Tokenization is unrelated to ownership and change approval."],
          ["Only data drift", "No drift evidence is given; the missing controls are organizational and auditable."],
          ["Only encryption", "Confidentiality controls do not establish accountable ownership."]
        ], 0)
      ]);
    }
  }

  {
    const l = lesson(62);
    if (l) {
      addSection(l, {
        id: "pdpl-engineering",
        title: "PDPL as an engineering decision system: purpose, roles, rights, sensitive data, incidents, and transfers",
        body: [
          "Saudi Arabia's Personal Data Protection Law (PDPL) should be reasoned about as a data-lifecycle control system, not a memorized acronym. The controller determines the purpose and manner of processing. A processor processes personal data for and on behalf of the controller. In an AI architecture, a company can remain the controller while a cloud or model provider acts as a processor for a defined service; contractual wording does not replace the need to understand who actually determines purpose and means.",
          "Start with purpose and legal basis, then minimize the data needed for that purpose. Data subjects have rights including being informed, access, obtaining their data in readable form, correction/completion/update, and requesting destruction when the data is no longer needed subject to the Law's conditions. Consent is important but is not the only possible basis described by the PDPL; scenario questions may require distinguishing consent from another lawful basis rather than assuming consent is universally mandatory.",
          "Sensitive data requires additional care. SDAIA guidance identifies categories such as health, genetic and identification-use biometric data among sensitive data, and notes that legitimate interest is not available as the basis for processing sensitive data. When consent is used for sensitive data, the implementing guidance requires explicit consent. The engineering consequence is that schema classification and policy metadata must travel with the data so that pipelines do not silently apply a weaker rule to a sensitive field.",
          "For a personal-data breach that may harm personal data or the data subject or conflict with their rights or interests, the PDPL implementing regulation requires notification to the competent authority within no more than 72 hours of awareness. If the breach may cause damage or conflict with the data subject's rights or interests, the controller must also notify the data subject without undue delay. Incident response therefore needs an evidence clock, affected-data classification and an accountable notification workflow — not only technical containment.",
          "Cross-border transfer is not equivalent to 'use encryption and continue.' The transfer regulation adds conditions and safeguards concerning purpose, minimum necessary data, protection level, data-subject rights and transfer risk. Architecture review should identify where prompts, embeddings, logs, backups and support traces physically or legally move, because a system can transfer personal data through telemetry even when the primary database remains in the Kingdom."
        ],
        table: table(
          "PDPL engineering distinctions",
          ["Concept", "Decision question", "Common trap"],
          [
            ["Controller", "Who determines why and how personal data is processed?", "Assuming the cloud vendor is always the controller"],
            ["Processor", "Who processes for/on behalf of the controller?", "Treating processor status as freedom to choose a new purpose"],
            ["Data subject rights", "Can the person be informed, access, obtain, correct/update, and request destruction where applicable?", "Designing a data lake with no retrieval/deletion path"],
            ["Sensitive data", "Does the field trigger stronger restrictions or safeguards?", "Treating all PII as one risk class"],
            ["Breach notification", "When did the controller become aware, what harm is possible, and who must be notified?", "Starting the clock only after root cause is known"],
            ["Cross-border transfer", "Where do data, prompts, embeddings, logs and backups go?", "Checking only the production database location"]
          ]
        ),
        diagram: diagram(
          "pdpl",
          "PDPL-aware AI data path",
          ["Purpose + legal basis", "Classify/minimize data", "Authorized processing", "Retention + rights", "Incident/transfer controls"],
          [[0,1],[1,2],[2,3],[3,4]],
          "Privacy controls follow the data through prompts, retrieval, logs, exports and deletion — not only database storage."
        ),
        example: "An HR RAG assistant sends employee questions, retrieved records and raw traces to an overseas managed service. A sound review asks: what is the purpose and basis, which party is controller/processor, what fields are necessary, which are sensitive, where every copy is transferred, what safeguard applies, how rights are served, and how breach evidence/notification would work.",
        failure: "Do not memorize '72 hours' as a generic timer for every cyber incident. The specific PDPL notification rule depends on a personal-data breach and the harm/rights criteria stated in the implementing regulation.",
        check: {
          question: "An AI team says, 'The vendor encrypts everything, so PDPL is handled.' What is missing?",
          answer: "Purpose/legal basis, minimization, roles, rights, sensitive-data handling, retention, disclosure/transfer analysis, incident workflow and other applicable obligations. Encryption is only one control."
        }
      });
      attachSources(l, ["saudiPDPL", "saudiPDPLGuide", "saudiPDPLBreach"], ["saudiPDPLTransfer"]);
      [
        ["PDPL", "Saudi Arabia's Personal Data Protection Law governing processing of personal data."],
        ["Controller", "The party that determines the purpose and manner of processing personal data."],
        ["Processor", "A party processing personal data for and on behalf of the controller."],
        ["Data subject", "The individual to whom personal data relates."],
        ["Sensitive data", "A higher-risk subset of personal data subject to additional requirements and safeguards."],
        ["Cross-border transfer", "Transfer or disclosure of personal data to a party outside the Kingdom for processing."],
        ["Breach notification", "Regulatory/data-subject notification workflow triggered by applicable personal-data breach conditions."]
      ].forEach((x) => addUnique(l.glossary, x));
      prependQuestions(l, [
        question("X62Q1", "Controller vs processor", "A Saudi employer decides why an employee-support AI processes HR records and chooses the categories to use. A managed provider processes those records only to run the service under the employer's instructions. Which role mapping is most defensible?", [
          ["Employer = controller; provider = processor", "The employer determines purpose/manner while the provider processes on its behalf in the scenario."],
          ["Employer = processor; provider = controller", "This reverses the described decision authority."],
          ["Both are automatically data subjects", "A data subject is the individual the personal data relates to."],
          ["Roles depend only on who owns the servers", "Infrastructure ownership alone does not determine purpose and processing roles."]
        ], 0),
        question("X62Q2", "Data subject rights", "A product stores personal data but has no way to locate a person's records for correction or applicable destruction requests. What engineering weakness does this create?", [
          ["Only a GPU scheduling issue", "Compute scheduling is unrelated to serving data-subject rights."],
          ["The architecture cannot operationalize important PDPL data-subject rights", "Rights need searchable lineage and controlled correction/destruction workflows where applicable."],
          ["The system is automatically anonymous", "Inability to find data operationally does not make it anonymized."],
          ["No issue if the model is accurate", "Model accuracy does not replace data-protection obligations."]
        ], 1),
        question("X62Q3", "Sensitive data", "A healthcare AI team proposes processing identifiable health data using legitimate interest as its legal basis. Which concern should be raised first from SDAIA's PDPL guidance?", [
          ["Health data is sensitive data, and legitimate interest is not available as the basis for processing sensitive data", "The guidance explicitly identifies health data as sensitive and notes this restriction."],
          ["Health data is never personal data", "Identifiable health data is specifically treated as sensitive personal data."],
          ["Sensitive data can always be processed for marketing with consent", "SDAIA guidance notes additional restrictions for sensitive data, including marketing restrictions."],
          ["Only model size matters", "The issue is legal/privacy classification, not parameter count."]
        ], 0),
        question("X62Q4", "Breach response", "A controller becomes aware that exposed personal records may harm affected individuals. Under the PDPL implementing regulation, what timing concept should the incident workflow immediately track?", [
          ["A 72-hour maximum window for notification to the competent authority from awareness when the stated harm/rights condition applies", "The implementing regulation sets this notification timing for qualifying personal-data breaches."],
          ["Wait until every root cause is proven before starting any clock", "The rule is tied to awareness of the incident; missing details can be supplemented with justification."],
          ["Exactly 30 days for every incident", "That is not the stated PDPL breach-notification window."],
          ["No notification can ever be required if encryption existed", "Encryption does not automatically remove all possible harm or notification duties."]
        ], 0),
        question("X62Q5", "Cross-border transfer", "An AI assistant keeps its main database in Riyadh but sends prompts and traces containing personal data to an overseas service. Which review is most appropriate?", [
          ["No transfer review because the primary database is in the Kingdom", "Prompts and traces can themselves constitute transferred personal data."],
          ["Assess the overseas processing/transfer purpose, minimum necessary data, protection/safeguards and risks", "Transfer analysis follows the personal data copies, not just the main database."],
          ["Only increase model temperature", "Sampling does not address transfer compliance."],
          ["Rename the trace fields", "Renaming does not change the underlying data transfer."]
        ], 1),
        question("X62Q6", "Purpose limitation", "A recruiting model collected candidate data for hiring. Months later the team wants to reuse identifiable records for unrelated marketing because the data is already available. What should happen first?", [
          ["Reuse automatically because collection already occurred", "Existing possession does not by itself authorize a new purpose."],
          ["Assess whether the new processing purpose and legal basis are permitted, then apply minimization and transparency requirements", "Purpose and basis must be considered before secondary processing."],
          ["Only compress the dataset", "Compression is unrelated to purpose legitimacy."],
          ["Increase retention indefinitely", "Longer retention increases exposure and does not establish a valid new purpose."]
        ], 1)
      ]);
    }
  }

  {
    const l = lesson(63);
    if (l) {
      addSection(l, {
        id: "dynamic-rag",
        title: "When source documents change, freshness becomes part of RAG correctness",
        body: [
          "A RAG assistant connected to policies, prices, product catalogs or operational procedures can become wrong even if its embedding model never changes. The corpus is a living dependency. Correctness therefore includes document freshness, revision identity, deletion propagation and re-index latency.",
          "Do not fine-tune an LLM merely because the facts change frequently. Fine-tuning changes model behavior/weights and is a poor mechanism for rapidly changing factual knowledge. Prefer a retrieval pipeline that detects source changes, reprocesses affected documents or chunks, records revision timestamps, removes superseded content and evaluates whether retrieval returns the latest authoritative version.",
          "Freshness and authority are separate. A newly uploaded document can be malicious or unofficial; an authoritative policy can be stale. Metadata should encode source owner, effective date, revision, access class and ingestion time so filters and rerankers can prefer evidence that is both permitted and current."
        ],
        table: table(
          "Dynamic knowledge choices",
          ["Need", "Best first mechanism", "Why"],
          [
            ["Facts change daily", "Incremental RAG re-indexing", "Updates knowledge without retraining model weights"],
            ["Tone/format behavior changes", "Prompting or fine-tuning depending scale", "The target is behavior rather than factual freshness"],
            ["Source deleted", "Deletion propagation to index/cache", "Stale chunks must stop being retrievable"],
            ["Conflicting revisions", "Authority + effective-date metadata", "Similarity alone cannot identify the governing version"]
          ]
        ),
        check: {
          question: "A bank's policy documents change every week. Why is monthly fine-tuning a weak primary update mechanism?",
          answer: "The problem is changing external knowledge. Incremental retrieval/index updates provide fresher evidence without repeatedly modifying model weights."
        }
      });
      attachSources(l, [], ["saudiPDPLTransfer"]);
      addUnique(l.glossary, ["Re-index latency", "Time between a source change and that change becoming correctly reflected in retrieval."]);
      prependQuestions(l, [
        question("X63Q1", "RAG freshness", "An internal assistant answers from policies that change several times per week. The model's writing style is acceptable, but answers often cite last month's policy. What is the best first improvement?", [
          ["Fine-tune the LLM every night on all policies", "Frequent factual updates are better handled as an external knowledge freshness problem."],
          ["Implement incremental ingestion/re-indexing with revision and effective-date metadata", "This targets source freshness and lets retrieval prefer the current authoritative version."],
          ["Increase temperature", "Sampling randomness does not make evidence fresher."],
          ["Remove citations", "That hides evidence quality instead of fixing it."]
        ], 1),
        question("X63Q2", "Deletion propagation", "A policy is revoked in the source system but its chunks remain in the vector index and semantic cache for three weeks. What failure occurred?", [
          ["Deletion/freshness propagation failure", "Revoked content remained retrievable after the authoritative source removed it."],
          ["Only tokenizer drift", "Tokenization is not the described lifecycle failure."],
          ["Only GPU underutilization", "Compute utilization does not explain stale evidence."],
          ["A model-registry alias issue", "The stale artifact is retrieval data, not the served model version."]
        ], 0)
      ]);
    }
  }

  // D7 — exam reasoning and business/technical requirement extraction.
  {
    const l = lesson(67);
    if (l) {
      addSection(l, {
        id: "scenario-extraction",
        title: "Scenario solving: extract the decision before reading the distractors",
        body: [
          "Long scenarios create reading load by mixing context, constraints and irrelevant detail. Before comparing answer options, identify four things: the decision being asked, hard constraints, the primary failure mechanism, and the optimization goal. This produces a compact decision rule you can test against each option.",
          "For example: 'choose deployment; p95 ≤180 ms; accuracy ≥91%; cost should be minimized; no sensitive data may leave region.' An option that violates data location is eliminated even if it is cheapest. An option below the accuracy floor is eliminated even if its latency is excellent. Only feasible options deserve deeper comparison.",
          "This method also prevents definition traps. If the scenario says the fraud team can review only 1,000 alerts/day, the threshold decision is constrained by operational capacity. Maximizing recall without considering precision can generate more alerts than investigators can process, so a metric must be interpreted through the workflow."
        ],
        diagram: diagram(
          "reasoning",
          "Four-pass scenario reasoning",
          ["What decision?", "Hard constraints", "Failure mechanism", "Optimize among feasible options"],
          [[0,1],[1,2],[2,3]],
          "Do not let a familiar option redefine the problem after you have read it."
        ),
        failure: "Reading A/B/C/D first can anchor you on a familiar technology. Extracting the requirement set first makes near-miss distractors easier to eliminate.",
        check: {
          question: "A scenario contains a mandatory data-residency rule and a soft preference for lower cost. Which should be applied first?",
          answer: "Data residency is a feasibility constraint; eliminate violating options before optimizing cost."
        }
      });
      addUnique(l.glossary, ["Decision rule", "A compact statement of the decision, hard constraints and optimization objective extracted from a scenario."]);
      prependQuestions(l, [
        question("X67Q1", "Scenario reasoning", "A question gives a page of architecture detail and asks for the best deployment under three mandatory requirements. What is the strongest first exam move?", [
          ["Read the answer choices first and choose the most familiar service", "This encourages anchoring before the problem is defined."],
          ["Extract the requested decision and hard requirements, then eliminate infeasible options", "A constraint-first decision rule reduces distractor influence and reading load."],
          ["Ignore numerical requirements because they are usually background", "Numbers often encode the hard feasibility conditions."],
          ["Choose the highest-accuracy option", "Accuracy may be only one of several mandatory constraints."]
        ], 1),
        question("X67Q2", "Metric to workflow", "A fraud model has 62% recall and 91% precision. The team can investigate only 1,000 alerts/day. What additional information is most important before lowering the classification threshold?", [
          ["How the lower threshold changes daily alert volume and false-positive burden", "Threshold movement trades false negatives for more positives, and the team has a hard review-capacity constraint."],
          ["Only the model file size", "File size does not determine operational alert capacity."],
          ["Only training epoch count", "Training duration does not tell whether investigators can handle the resulting alerts."],
          ["The dashboard color", "Presentation does not determine decision quality."]
        ], 0),
        question("X67Q3", "Technical vs business success", "An assistant's answer accuracy improves from 86% to 92%, but average handling time rises and users abandon the workflow. What is the best conclusion?", [
          ["The product necessarily improved because the technical metric rose", "A technical metric is not sufficient when workflow outcomes deteriorate."],
          ["Evaluate the technical gain together with business/user KPIs and the latency/workflow trade-off", "Production success is multi-objective and must connect model quality to the actual operating outcome."],
          ["Accuracy should never be measured", "Accuracy can be useful; it is simply not the only success criterion."],
          ["Immediately fine-tune a larger model", "A larger model may worsen latency/cost and does not diagnose the adoption problem."]
        ], 1)
      ]);
    }
  }

  {
    const l = lesson(77);
    if (l) {
      addSection(l, {
        id: "exam-patterns",
        title: "Exam reasoning patterns worth rehearsing under time pressure",
        body: [
          "Treat these as practice heuristics, not claims about official question wording. Pattern one is standards distinction: decide whether the mechanism is privacy, security, responsible AI or governance before selecting a control. Pattern two is cost/capacity: normalize units, calculate required capacity, then compare cost. Pattern three is requirement matching: eliminate any option that violates one hard constraint. Pattern four is living knowledge: when facts change frequently, favor retrieval freshness and versioning over repeated weight updates.",
          "Pattern five is production causality. More replicas can raise capacity but also cost; lower thresholds can raise recall but also false positives; larger context can increase evidence coverage but also latency, cost and injection exposure. Whenever an option changes one variable, ask what moves downstream and whether that violates another requirement.",
          "Use a two-pass time strategy. On the first pass, answer questions whose decision rule becomes clear quickly and flag high-reading-load items. On the second pass, return to flagged items with the remaining time budget. A 210-minute / 140-question exam averages 90 seconds per question, so repeatedly spending four minutes on one early table can create a larger score risk than flagging it and returning later."
        ],
        table: table(
          "Fast recognition map",
          ["Scenario signal", "First reasoning move"],
          [
            ["PDPL / personal data", "Identify role, purpose/basis, data class, rights, retention/transfer/incident implications"],
            ["Latency + cost + quality table", "Mark hard constraints, remove infeasible rows, optimize remaining objective"],
            ["RAG with changing documents", "Check freshness, revision metadata, re-index/deletion propagation"],
            ["High accuracy but bad operations", "Connect model metric to capacity, latency, cost and business KPI"],
            ["Two plausible governance principles", "Match the mechanism to the exact principle rather than choosing the broadest label"]
          ]
        ),
        check: {
          question: "At 90 seconds average per question, what should you do with a dense item that still has no clear decision rule after several minutes?",
          answer: "Flag it, preserve time for higher-confidence questions, and return in a second pass with the remaining budget."
        }
      });
      attachSources(l, ["saudiPDPL", "sdaiaEthics"], ["sdaiaAdoption"]);
    }
  }

  // Final review: add a Saudi governance mini-checklist without turning the course into a legal-only module.
  {
    const l = lesson(78);
    if (l) {
      addSection(l, {
        id: "saudi-final-check",
        title: "Final Saudi governance check: know the names, then reason from the mechanism",
        body: [
          "Before the exam, be able to distinguish PDPL data-protection concepts from AI ethics and general security controls. Know what controller, processor, data subject, sensitive data, purpose/minimization, data-subject rights, breach notification and cross-border transfer mean at an engineering level. Do not rely on recognizing an acronym alone.",
          "For responsible AI, connect principle names to concrete evidence: fairness to subgroup outcomes and discrimination controls; privacy/security to personal-data and protection controls; reliability/safety to predictable operation and harm prevention; transparency/interpretability to understandable decision processes and disclosures; accountability/responsibility to named ownership, approvals and remedy. Broader human and social considerations matter when the scenario is about autonomy, human oversight or societal impact.",
          "If two choices sound ethically positive, ask which one directly addresses the failure described. The exam skill is discrimination between neighboring concepts, not selecting the most impressive phrase."
        ],
        check: {
          question: "Why is memorizing 'Privacy and Security' insufficient for a PDPL scenario?",
          answer: "Because the decision may turn on controller/processor roles, legal purpose/basis, rights, sensitive data, retention, breach or transfer requirements that require more specific reasoning."
        }
      });
      attachSources(l, ["saudiPDPL", "sdaiaEthics"], ["saudiPDPLGuide", "saudiPDPLBreach", "saudiPDPLTransfer"]);
    }
  }

  A.examEnhancement = {
    label: "Saudi governance + scenario reasoning enhancement",
    note: "Practice additions are informed by public learner experience only as a study signal; they are not official SDAIA questions or an official exam blueprint.",
    addedAt: "2026-09-09"
  };
})();
