Stretto Notes Lambda Monorepo
This repo contains all AWS Lambda functions for Stretto Notes logging and analysis.
CI/CD is handled via GitHub Actions, with each Lambda in its own folder and auto-deployed to AWS when its folder changes.

🗂 Structure
lambdas/
  note-create/ 
  note-list/
  rep-create/
  rep-list/
  note-rollup/
  log-to-mongo (being refactored)
  log-to-notion (being refactored)

shared/
  blocks.js
  mongo-client.js
  notion-client.js
.github/
  workflows/
    deploy-log-to-mongo.yml (removing after refactor - adding new one)
    deploy-log-to-notion.yml (removing after refactor - adding new one)
    (more coming)


