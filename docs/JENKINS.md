# Jenkins Setup and Deployment

> **Deployment sequence:** the live MVP currently uses the smaller single-EC2
> CloudFormation stack documented in [`infra/aws/README.md`](../infra/aws/README.md).
> This Jenkins/ECR/ECS design is the target production pipeline. It will be
> activated after the public discovery experience is substantially complete.
> The current EC2 preview already uses Caddy HTTPS; a branded domain remains a later step.

## Required Jenkins capabilities

Use a Linux Jenkins agent with Docker, AWS CLI v2, `jq`, and `curl`. Node.js 22.13 or newer is useful for local troubleshooting, while the pipeline itself builds with pinned container images. Install the Pipeline, Git, Credentials Binding, AWS Credentials, and Docker Pipeline plugins. The agent needs enough disk space for immutable container builds and must not expose the Docker socket to untrusted public jobs.

Create a GitHub multibranch Pipeline pointing at this repository. Jenkins discovers the root `Jenkinsfile`, runs every branch, and exposes deployment parameters for authorized users.

## Jenkins credentials

Create these credentials without placing their values in the repository:

| Jenkins ID | Type | Purpose |
| --- | --- | --- |
| `anime-search-aws` | AWS credentials | ECR and ECS deployment permissions |
| `anime-search-aws-region` | Secret text | AWS region such as `ap-south-1` |
| `anime-search-ecr-registry` | Secret text | Account registry such as `123456789012.dkr.ecr.ap-south-1.amazonaws.com` |

Configure two global environment variables:

- `ANIME_SEARCH_STAGING_URL`
- `ANIME_SEARCH_PRODUCTION_URL`

The AWS identity should be scoped to the Anime Search ECR repository and ECS services. It needs no interactive console access and no database credentials.

## AWS naming contract

The deployment script expects:

- clusters `anime-search-staging` and `anime-search-production`;
- services `anime-search-web-staging` and `anime-search-web-production`;
- task-definition families with the same service names;
- containers named `web` and `api` inside each task definition.

The pipeline builds each service once and tags both images with the exact Git commit. Staging and production receive the same artifacts. The deployment script clones the current task definition, changes the `web` and `api` container images, registers a new revision, updates the service, and waits for ECS stability.

## Safe rollout and rollback

ECS must use a deployment circuit breaker with rollback enabled and an ALB health check pointed at `/healthz`. If smoke tests fail after ECS becomes stable, Jenkins marks the release failed. Rollback selects the preceding task-definition revision and updates the service; a future pipeline stage will automate that selection after the first AWS environment exists.

Database migrations must run as a one-off ECS task before application promotion. Only backward-compatible expand-and-contract migrations are allowed during rolling releases.

## What each stage teaches

- **Checkout** fixes the release to an auditable Git commit.
- **Frontend checks** proves locked dependencies, tests, and production compilation work together.
- **Backend checks** builds and runs the Django test target.
- **Container build** creates the runtime artifact and records its commit label.
- **Publish image** uploads an immutable SHA tag to ECR.
- **Deploy staging** creates a new ECS task-definition revision and tests the public route.
- **Production approval** prevents an accidental promotion while the product is young.
- **Deploy production** promotes the already-tested artifact without rebuilding it.
