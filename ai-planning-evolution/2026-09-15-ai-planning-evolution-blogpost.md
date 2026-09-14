# The Evolution of AI Planning: From GOAP in Games to LLM-Driven Robotics

**Published:** 2026-09-15 · **Author:** Leonardo Jacobi · **Tags:** #AI #GOAP #BehaviorTrees #PDDL #LLM #Robotics

A major milestone was Goal-Oriented Action Planning (GOAP), famously showcased in F.E.A.R.'s AI. Its ability to dynamically find a sequence of actions to achieve a goal was a huge step up from the "state spaghetti" of complex Finite State Machines (FSMs). This planner-first approach was also adopted in robotics, with modules available in frameworks like ROS.

However, the modern landscape for task execution has evolved into a multi-layered stack:

## 1. Execution Layer: Behavior Trees

For moment-to-moment reactive control, Behavior Trees have largely become the standard. In ROS 2, BehaviorTree.CPP is the go-to for orchestrating skills (many of which can be powered by Neural Networks!).

## 2. Strategic Layer: Formal Planners (PDDL)

For complex, multi-step tasks, the focus shifted to formal methods using the Planning Domain Definition Language (PDDL). Systems like ROSPlan use dedicated solvers to find optimal plans, which are then often executed by a Behavior Tree.

## 3. Interface Layer: Large Language Models (LLMs)

The current cutting edge isn't using LLMs to replace these systems, but to interface with them. As recent papers show, LLMs are being trained to act as a bridge — translating high-level human commands ("clean up the table") into structured PDDL that a formal planner can solve.

## Sources

- [The Evolution of AI Planning: From Games to LLM-Driven Robotics](https://www.linkedin.com/pulse/evolution-ai-planning-from-games-llm-driven-robotics-leonardo-j--kdkie/)
