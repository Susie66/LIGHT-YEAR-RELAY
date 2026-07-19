# Light-Year Relay

> **Every message belongs to the past. Every reply changes the future.**

Light-Year Relay is a narrative science-fiction decision game where players become **Mission Control** instead of the astronaut.

Rather than piloting a spacecraft, players receive delayed transmissions, analyze mission reports, and make irreversible decisions that determine the future of both the mission and the people waiting back on Earth.

This prototype was created for **OpenAI Build Week** as the first playable adaptation of a narrative universe that I had previously developed as an AI-powered interactive storytelling experience.

---

# Overview

Light-Year Relay explores a simple but fascinating question:

> **What if communication—not distance—was the greatest challenge of deep-space exploration?**

Real interplanetary communication is limited by the speed of light.

Mission Control never sees the spacecraft in real time.

Every report belongs to the past.

Every command belongs to the future.

Instead of controlling the spacecraft directly, players experience the uncertainty, responsibility, and emotional weight of making decisions with incomplete information.

The project combines narrative storytelling, scientific authenticity, educational astronomy, and AI-assisted development into a single interactive experience.

---

# The Problem / Experience

Most space games ask players to become the astronaut.

**Light-Year Relay asks players to become the people waiting for the astronaut.**

Players receive delayed transmissions from **Aurora-7**, analyze engineering reports, crew health, scientific discoveries, and family communications before sending **one irreversible command** back to the spacecraft.

Because signals travel at the speed of light:

- Every report is already outdated.
- Every decision affects an unknown future.
- Every transmission carries uncertainty.

Communication itself becomes the core gameplay mechanic.

---

# Core Gameplay

Each mission follows the same decision loop:

1. Receive delayed transmission.
2. Read engineering reports.
3. Review crew status.
4. Read Family Relay messages.
5. Analyze mission conditions.
6. Select one irreversible command.
7. Wait for future consequences.

Unlike traditional strategy games, players never know the spacecraft's current condition when making decisions.

---

# Key Features

- Realistic light-speed communication delay
- Mission Control gameplay
- Narrative branching missions
- Irreversible player decisions
- Family Relay communication system
- Educational astronomy content
- Persistent mission consequences
- Cinematic interface
- Responsive web application
- AI-assisted English localization

---

# Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript

## AI

- GPT-5.6
- Codex

## Creative AI

- AI Image Generation
- AI Music Generation
- AI Sound Generation
- AI Video Generation

## Platform

- Web Browser
- GitHub Pages

---

# Architecture

```
Mission Data
        │
        ▼
Transmission System
        │
        ▼
Mission Control Interface
        │
        ▼
Decision Engine
        │
        ▼
Mission State
        │
        ▼
Future Transmission
```

Core systems include:

- Mission data model
- Delayed communication engine
- Mission state management
- Decision engine
- Family Relay system
- Educational content module
- Responsive UI

---

# How to Run Locally

Clone the repository.

```bash
git clone <repository-url>
```

Open:

```text
index.html
```

or launch any local web server.

Example:

```bash
python -m http.server
```

---

# How to Play

1. Receive a transmission.
2. Read all available reports.
3. Review crew and family communications.
4. Analyze mission conditions.
5. Send one command.
6. Observe future consequences.

Remember:

**Mission Control never knows the spacecraft's current situation.**

---

# Sample Mission

Incoming Transmission

```
Primary Power
41%

Battery Temperature
Critical

Crew Health
Stable

Signal Delay
21 minutes
```

Available Commands

- Preserve Life Support
- Preserve Scientific Samples
- Enter Low Power Mode

Once a command is sent, it cannot be changed.

Future transmissions reveal the consequences.

---

# Why AI Was Essential

Although the narrative universe already existed before Build Week, the playable game did not.

I discovered OpenAI Build Week with only **four days remaining** before the submission deadline and decided to finally transform this long-running story universe into a playable game.

The prototype itself was developed over the following **three days**.

Without AI, producing a project of this scope—including gameplay systems, localization, narrative content, artwork, music, sound, UI, and presentation—would not have been realistic for a solo developer within that timeframe.

Rather than replacing creativity, AI dramatically accelerated production, allowing me to spend more time designing gameplay, refining player decisions, and improving the overall experience.

---

# Built with Codex and GPT-5.6

## GPT-5.6

GPT-5.6 served as my primary creative collaborator throughout development.

### Game Design

- Transformed real-world light-speed communication into a playable game mechanic.
- Designed the mission loop and player decision flow.
- Explored alternative gameplay concepts and interaction models.
- Helped balance narrative pacing and player agency.

### Narrative Design

- Expanded worldbuilding and mission lore.
- Designed branching mission scenarios.
- Generated engineering reports and crew logs.
- Created Family Relay conversations.
- Generated event variations.
- Refined emotional storytelling.

### UX & Content

- Improved UI information hierarchy.
- Refined onboarding flow.
- Improved interface copy.
- Reviewed gameplay clarity.
- Produced English localization.
- Assisted in writing documentation.

GPT-5.6 greatly accelerated brainstorming and iteration, allowing me to explore many design alternatives before selecting the final implementation.

---

## Codex

Codex primarily assisted with software engineering.

### Architecture

- Organized project structure.
- Improved code organization.
- Increased maintainability.

### Gameplay Systems

- Implemented mission state management.
- Structured mission data models.
- Built delayed communication workflows.
- Assisted with event branching logic.
- Supported command selection and consequence systems.

### Frontend

- Built responsive interfaces.
- Refactored JavaScript modules.
- Improved UI interactions.
- Debugged runtime issues.
- Improved code quality.

### Development Workflow

- Assisted testing.
- Reviewed implementations.
- Helped prepare deployment.

Every AI-assisted implementation was reviewed, modified, tested, and validated before becoming part of the final project.

---

# Key Human Decisions

Although AI accelerated development, every major creative decision remained my own.

Key decisions included:

- Creating the original narrative universe before Build Week.
- Deciding that players become Mission Control instead of the astronaut.
- Making communication—not combat—the central gameplay mechanic.
- Limiting each mission to one irreversible command.
- Choosing delayed recordings instead of live communication.
- Designing the emotional relationship between Cassian and Sophie.
- Integrating astronomy education naturally into the story.
- Defining mission pacing and narrative structure.
- Choosing which AI-generated ideas to adopt, revise, or discard.
- Designing the final UI, visual direction, and gameplay experience.
- Reviewing, modifying, testing, and approving every AI-assisted code contribution.

---

# Development Timeline

Although the narrative universe existed before the hackathon, the playable prototype was created specifically for OpenAI Build Week.

### Before Build Week

- Created the original interactive narrative universe.
- Developed the world, characters, and emotional themes.

### Day 0

- Discovered OpenAI Build Week with four days remaining.

### Day 1

- Designed gameplay systems.
- Built project architecture.
- Created initial UI.

### Day 2

- Implemented gameplay.
- Integrated narrative systems.
- Produced artwork, music, sound, and promotional assets.

### Day 3

- Balanced gameplay.
- Improved localization.
- Fixed bugs.
- Polished UI.
- Final testing.
- Submitted the project.

---

# Testing

The prototype was tested through:

- Manual gameplay testing
- Decision branch verification
- Mission progression validation
- Responsive layout testing
- Cross-browser testing
- Localization review
- AI-generated content review
- Code review after every AI-assisted implementation

---

# Known Limitations

Current prototype limitations include:

- Limited mission count
- Narrative branches are still expanding
- No save/load system
- No voice acting yet
- Educational content is still growing
- More mission types and endings are planned

---

# Third-Party Assets and Licenses

This project uses AI-assisted creative tools for concept art, illustrations, music, sound effects, and promotional videos.

Any third-party assets remain subject to their respective licenses.

Open-source libraries retain their original licenses.

---

# License

This repository is provided for judging purposes during **OpenAI Build Week**.

All rights reserved.

The source code, artwork, music, narrative content, and all other project assets may not be copied, redistributed, modified, or used commercially without prior permission from the author.