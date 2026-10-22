# Jenkins Setup and Deployment

## Required Jenkins capabilities

Use a Linux Jenkins agent with Docker, Node.js 20, AWS CLI v2, `jq`, and `curl`. Install the Pipeline, Git, Credentials Binding, AWS Credentials, JUnit, and Docker Pipeline plugins. The agent needs enough disk space for immutable container builds and must not expose the Docker socket to untrusted public jobs.

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
- a container named `web` inside each task definition.

The pipeline builds once and tags the image with the exact Git commit. Staging and production receive the same image. The deployment script clones the current task definition, changes only the `web` container image, registers a new revision, updates the service, and waits for ECS stability.

## Safe rollout and rollback

ECS must use a deployment circuit breaker with rollback enabled and an ALB health check pointed at `/healthz`. If smoke tests fail after ECS becomes stable, Jenkins marks the release failed. Rollback selects the preceding task-definition revision and updates the service; a future pipeline stage will automate that selection after the first AWS environment exists.

Database migrations will run as a one-off ECS task before application promotion once the Django service is added. Only backward-compatible expand-and-contract migrations are allowed during rolling releases.

## What each stage teaches

- **Checkout** fixes the release to an auditable Git commit.
- **Frontend checks** proves locked dependencies, tests, and production compilation work together.
- **Backend checks** builds the Django test target when the backend scaffold lands.
- **Container build** creates the runtime artifact and records its commit label.
- **Publish image** uploads an immutable SHA tag to ECR.
- **Deploy staging** creates a new ECS task-definition revision and tests the public route.
- **Production approval** prevents an accidental promotion while the product is young.
- **Deploy production** promotes the already-tested artifact without rebuilding it.
