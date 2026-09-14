# Integrating MCP Servers via Docker + SSE Transport for Email Automation

**Published:** 2026-05-01 · **Author:** Leonardo Jacobi · **Tags:** #MCP #Docker #GenAI #EmailAutomation #Agentics

![Architecture diagram showing Google GenAI (the LLM agent layer, using litellm for automatic tool-fetching) connected over an SSE transport bridge to a Docker container running an MCP-Bridge and an MCP Server (JS) that holds the email-automation credentials — with a benefits panel below covering CI/CD-friendly builds, container isolation, per-agent network segmentation, and automatic tool discovery](mcp-sse-docker-architecture.svg)

We've been working on an exciting project that integrates Model Context Protocol (MCP) servers running in Docker with Google's GenAI for email automation. Here's a quick overview.

## Key Components

- **MCP-Bridge:** Allows us to access the MCP remotely via SSE (Server-Sent Events) transport.
- **MCP Server:** We've used an MCP written in JS for email automation. It's running inside a Docker container for portability and isolation.
- **Dockerized Environment:** We created a base image with MCP bridge. We then installed the MCP server and created a script to start it.
- **Google GenAI:** We're using Google's GenAI to interact with the MCP server. We leveraged the litellm module to simplify tool parsing, avoiding the need to manually parse tools and handle Pydantic errors.

## Benefits of this Architecture

- **CI/CD:** Docker enables seamless Continuous Integration and Continuous Deployment pipelines.
- **Secure Deployment:** Docker provides a secure and isolated deployment environment.
- **Access Control & Network Segmentation:** We can restrict access and segment the network to enhance security.

## Why is this cool?

You don't need to manually add tools for all the different MCPs. You simply install all your MCP servers in your Docker container and fetch all the tools at once. Each agent gets its own Docker container, allowing for network separation. The MCP server stores the credentials, preventing potential leaks.

While solutions like Claude Desktop also use Docker, our approach can be deployed remotely and utilizes SSE transport.

## What's next?

We're going to integrate this into our dashboard with FastAPI and WebSockets! We will also create cronjobs that access the agent, as well as integrating webhooks/events to run workflows.
