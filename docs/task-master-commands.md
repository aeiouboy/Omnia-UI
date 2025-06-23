# Task Master AI Commands Reference

This document provides a comprehensive reference for all Task Master AI commands available through both CLI and MCP interfaces.

## Table of Contents

1. [Installation](#installation)
2. [Project Setup](#project-setup)
3. [Task Management](#task-management)
4. [Task Organization](#task-organization)
5. [Analysis & Planning](#analysis--planning)
6. [Research](#research)
7. [Tag Management](#tag-management)
8. [Model Configuration](#model-configuration)
9. [MCP Commands](#mcp-commands)
10. [Natural Language Commands](#natural-language-commands)

## Installation

```bash
# Install globally via npm
npm i -g task-master-ai

# Run locally without installation
npx task-master-ai

# Verify installation
task-master --help
```

## Project Setup

### Initialize Project

```bash
# Initialize with all default rules
task-master init

# Initialize with specific rules
task-master init --rules cursor,windsurf,vscode

# Skip shell aliases
task-master init --no-aliases

# Skip dependency installation
task-master init --skip-install
```

### Parse PRD (Product Requirements Document)

```bash
# Parse PRD and generate tasks
task-master parse-prd your-prd.txt

# Limit number of tasks generated
task-master parse-prd your-prd.txt --num-tasks=10

# Append to existing tasks
task-master parse-prd additional-requirements.txt --append

# Use research model for generation
task-master parse-prd your-prd.txt --research

# Target specific tag
task-master parse-prd your-prd.txt --tag=feature-name
```

### Rule Management

```bash
# Add rule profiles
task-master rules add windsurf,roo,vscode

# Remove rule profiles
task-master rules remove windsurf

# Force removal (dangerous)
task-master rules remove windsurf --force

# Interactive rule setup
task-master rules setup
```

## Task Management

### Listing Tasks

```bash
# List all tasks
task-master list

# List with specific status
task-master list --status=pending
task-master list --status=done
task-master list --status=in-progress

# List with subtasks
task-master list --with-subtasks

# Combine filters
task-master list --status=pending --with-subtasks
```

### Viewing Tasks

```bash
# Show next task
task-master next

# Show specific task
task-master show 5
task-master show --id=5

# Show multiple tasks
task-master show 1,3,5

# Show subtask
task-master show 5.2

# Filter subtasks by status
task-master show 5 --status=pending
```

### Creating Tasks

```bash
# Add task with AI assistance
task-master add-task --prompt="Implement user authentication"

# Add with research
task-master add-task --prompt="Add OAuth2 integration" --research

# Add with dependencies
task-master add-task --prompt="Add tests" --dependencies=1,2,3

# Add with priority
task-master add-task --prompt="Fix critical bug" --priority=high

# Manual task creation
task-master add-task --title="Task Title" --description="Description" --details="Implementation details"
```

### Updating Tasks

```bash
# Update single task
task-master update-task --id=5 --prompt="Add error handling"

# Update with research
task-master update-task --id=5 --prompt="Use best practices" --research

# Append to task details
task-master update-task --id=5 --prompt="Additional notes" --append

# Update multiple tasks from ID
task-master update --from=5 --prompt="Change to PostgreSQL"

# Update subtask
task-master update-subtask --id=5.2 --prompt="Add rate limiting"
```

### Task Status

```bash
# Set task status
task-master set-status --id=5 --status=done
task-master set-status --id=5 --status=in-progress
task-master set-status --id=5 --status=pending

# Set multiple tasks
task-master set-status --id=1,2,3 --status=done

# Set subtask status
task-master set-status --id=5.2 --status=done
```

### Expanding Tasks

```bash
# Expand specific task
task-master expand --id=5

# Expand with custom number of subtasks
task-master expand --id=5 --num=5

# Expand with context
task-master expand --id=5 --prompt="Focus on security"

# Expand all pending tasks
task-master expand --all

# Force regeneration
task-master expand --all --force

# Use research model
task-master expand --id=5 --research
```

### Removing Tasks

```bash
# Remove task
task-master remove-task --id=5

# Remove multiple tasks
task-master remove-task --id=1,2,3

# Skip confirmation
task-master remove-task --id=5 --confirm

# Remove subtask
task-master remove-subtask --id=5.2

# Convert subtask to standalone task
task-master remove-subtask --id=5.2 --convert
```

### Clear Subtasks

```bash
# Clear from specific task
task-master clear-subtasks --id=5

# Clear from multiple tasks
task-master clear-subtasks --id=1,2,3

# Clear all subtasks
task-master clear-subtasks --all
```

## Task Organization

### Moving Tasks

```bash
# Move task to become subtask
task-master move --from=5 --to=7

# Move subtask to standalone
task-master move --from=5.2 --to=7

# Move subtask to different parent
task-master move --from=5.2 --to=7.3

# Reorder within same parent
task-master move --from=5.2 --to=5.4

# Move to new ID position
task-master move --from=5 --to=25

# Move multiple tasks
task-master move --from=10,11,12 --to=16,17,18
```

### Dependencies

```bash
# Add dependency
task-master add-dependency --id=5 --depends-on=3

# Remove dependency
task-master remove-dependency --id=5 --depends-on=3

# Validate dependencies
task-master validate-dependencies

# Fix invalid dependencies
task-master fix-dependencies
```

### Generate Task Files

```bash
# Generate markdown files from tasks.json
task-master generate

# Generate to custom directory
task-master generate --output=custom-dir
```

## Analysis & Planning

### Complexity Analysis

```bash
# Analyze all tasks
task-master analyze-complexity

# Save to custom location
task-master analyze-complexity --output=my-report.json

# Use specific model
task-master analyze-complexity --model=claude-3-opus-20240229

# Set complexity threshold
task-master analyze-complexity --threshold=6

# Use research model
task-master analyze-complexity --research

# Analyze specific IDs
task-master analyze-complexity --ids=1,3,5

# Analyze range
task-master analyze-complexity --from=5 --to=10
```

### View Complexity Report

```bash
# View default report
task-master complexity-report

# View custom report
task-master complexity-report --file=my-report.json
```

## Research

```bash
# Basic research
task-master research "What are the latest JWT best practices?"

# Research with task context
task-master research "How to implement this?" --id=15,16

# Research with file context
task-master research "Optimize this API?" --files=src/api.js,src/auth.js

# Include project tree
task-master research "Best error handling?" --tree

# Custom context
task-master research "Best practices?" --context="Using Express.js"

# Detailed response
task-master research "Migration guide" --detail=high

# Save to file
task-master research "Database optimization" --save-file

# Save to task
task-master research "OAuth implementation" --save-to=15

# Save to subtask
task-master research "API optimization" --save-to=15.2
```

## Tag Management

### List Tags

```bash
# List all tags
task-master tags

# Show with metadata
task-master tags --show-metadata
```

### Create Tags

```bash
# Create empty tag
task-master add-tag feature-auth

# Create with description
task-master add-tag feature-auth --description="Authentication feature"

# Create from git branch name
task-master add-tag --from-branch

# Copy from current tag
task-master add-tag new-feature --copy-from-current

# Copy from specific tag
task-master add-tag new-feature --copy-from=old-feature
```

### Manage Tags

```bash
# Switch to tag
task-master use-tag feature-auth

# Rename tag
task-master rename-tag old-name new-name

# Copy entire tag
task-master copy-tag source-tag target-tag

# Delete tag
task-master delete-tag feature-auth

# Delete without confirmation
task-master delete-tag feature-auth --yes
```

### Tag-Specific Operations

Most commands support the `--tag` flag:

```bash
# Parse PRD for specific tag
task-master parse-prd prd.txt --tag=feature-auth

# List tasks in tag
task-master list --tag=feature-auth

# Analyze complexity for tag
task-master analyze-complexity --tag=feature-auth
```

## Model Configuration

### View Models

```bash
# Show current configuration
task-master models

# List available models
task-master models --list-available
```

### Set Models

```bash
# Set main model
task-master models --set-main=claude-3-opus-20240229

# Set research model
task-master models --set-research=sonar-pro

# Set fallback model
task-master models --set-fallback=gpt-4o-mini

# Set custom Ollama model
task-master models --set-main=my-llama --ollama

# Set OpenRouter model
task-master models --set-research=google/gemini-pro --openrouter

# Set Azure OpenAI model
task-master models --set-main=gpt-4 --azure

# Set AWS Bedrock model
task-master models --set-main=claude-v3 --bedrock

# Interactive setup
task-master models --setup
```

## MCP Commands

When using Task Master through MCP in your IDE:

```bash
# Initialize project
mcp__task-master-ai__initialize_project --projectRoot="/path/to/project"

# Parse PRD
mcp__task-master-ai__parse_prd --projectRoot="/path/to/project" --input="prd.txt"

# Get tasks
mcp__task-master-ai__get_tasks --projectRoot="/path/to/project"

# Get next task
mcp__task-master-ai__next_task --projectRoot="/path/to/project"

# Set task status
mcp__task-master-ai__set_task_status --projectRoot="/path/to/project" --id="5" --status="done"

# Add task
mcp__task-master-ai__add_task --projectRoot="/path/to/project" --prompt="New task description"

# Expand task
mcp__task-master-ai__expand_task --projectRoot="/path/to/project" --id="5" --num="3"

# Research
mcp__task-master-ai__research --projectRoot="/path/to/project" --query="Best practices?"
```

## Natural Language Commands

When chatting with AI assistants that have Task Master integration:

### Project Setup
- "Can you parse my PRD at .taskmaster/docs/prd.txt?"
- "Initialize task-master in this project"
- "Set up task-master with cursor and windsurf rules"

### Daily Workflow
- "What's the next task I should work on?"
- "Show me task 5"
- "Show me tasks 1, 3, and 5"
- "Mark task 5 as done"
- "Set task 5 to in-progress"

### Task Management
- "Can you help me implement task 3?"
- "Break down task 5 into subtasks"
- "Add a new task: implement user authentication"
- "Update task 5 with this new information: [details]"
- "Move task 5 to become a subtask of task 7"

### Analysis
- "Analyze the complexity of my tasks"
- "Show me the complexity report"
- "Which tasks are the most complex?"
- "Expand all high-complexity tasks"

### Research
- "Research the latest best practices for JWT authentication"
- "Research React Query v5 migration for our API in src/api.js"
- "Research how to implement OAuth and save it to task 15"

### Organization
- "Show me all pending tasks"
- "List all done tasks with subtasks"
- "Show me all available tags"
- "Create a new tag for the authentication feature"
- "Switch to the feature-auth tag"

## Additional Resources

### Export to README

```bash
# Export task list to README.md
task-master sync-readme

# Include subtasks
task-master sync-readme --with-subtasks

# Filter by status
task-master sync-readme --status=pending
task-master sync-readme --status=done --with-subtasks
```

### Troubleshooting

If `task-master init` doesn't respond:

```bash
# Direct execution
node node_modules/claude-task-master/scripts/init.js

# Or clone and run
git clone https://github.com/eyaltoledano/claude-task-master.git
cd claude-task-master
node scripts/init.js
```

### Environment Variables

Task Master uses these environment variables for API keys:

```bash
# OpenAI
OPENAI_API_KEY=your-key

# Anthropic
ANTHROPIC_API_KEY=your-key

# OpenRouter
OPENROUTER_API_KEY=your-key

# Perplexity
PERPLEXITY_API_KEY=your-key

# Google (for Vertex AI)
GOOGLE_API_KEY=your-key

# Azure OpenAI
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=your-endpoint

# AWS Bedrock
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=your-region
```

## Best Practices

1. **Always start with `task-master next`** to get the most important task
2. **Use tags** to separate different features or branches
3. **Run complexity analysis** before expanding tasks
4. **Use research** for tasks involving new technologies
5. **Keep tasks updated** with implementation notes using `update-subtask`
6. **Validate dependencies** regularly to avoid circular references
7. **Use bulk operations** for efficiency (e.g., `set-status --id=1,2,3`)
8. **Export to README** to keep team informed of progress

## Command Shortcuts

Task Master also includes shorter aliases:

```bash
# Using 'tm' alias (if configured during init)
tm list
tm next
tm show 5

# Using 'taskmaster' alias
taskmaster list
taskmaster next
```