# AWS credit-backed MVP deployment

This stack runs the web app, Django API, PostgreSQL, and Redis on one Free Tier eligible EC2 instance. It deliberately excludes RDS, ElastiCache, an Application Load Balancer, NAT Gateway, Kafka, and an always-running Jenkins controller.

## Current preview

- Application: [Anime Index on AWS](https://anime-index.13-232-238-146.sslip.io)
- Region: `ap-south-1`
- Stack: `anime-index-mvp`
- Transport: HTTPS through Caddy with automatic certificate renewal

The free `sslip.io` hostname resolves directly to the instance IP. A branded domain can replace it later without changing the application architecture.

Store the Gemini key as an encrypted standard Parameter Store value before deploying. The key never belongs in Git, a frontend variable, or a CloudFormation parameter:

```bash
aws ssm put-parameter \
  --region ap-south-1 \
  --name /anime-index/prod/gemini-api-key \
  --type SecureString \
  --value "YOUR_GEMINI_KEY" \
  --overwrite
```

The EC2 role can read only that named parameter. Bootstrap writes it to the server-only `.env.aws` file with command tracing disabled.

The deployment is intended for the MVP while AWS promotional credits are active. It has a single failure domain and should not be described as highly available. Data is stored on the instance's encrypted EBS volume and disappears when the CloudFormation stack is deleted.

Deploy:

```bash
aws cloudformation deploy \
  --region ap-south-1 \
  --stack-name anime-index-mvp \
  --template-file infra/aws/free-tier.yml \
  --capabilities CAPABILITY_NAMED_IAM
```

Read the URL:

```bash
aws cloudformation describe-stacks \
  --region ap-south-1 \
  --stack-name anime-index-mvp \
  --query "Stacks[0].Outputs" \
  --output table
```

Administration uses AWS Systems Manager Session Manager; port 22 is closed. The bootstrap log is `/var/log/anime-index-bootstrap.log` and application logs are available with `docker compose logs` from `/opt/anime-index/app`.

To update manually before the Jenkins controller exists:

```bash
cd /opt/anime-index/app
sudo git pull --ff-only origin master
sudo docker compose --profile https --env-file .env.aws -f docker-compose.yml -f docker-compose.aws.yml up --build --detach
```

Delete the stack before credits expire to stop instance, storage, and public IPv4 usage:

```bash
aws cloudformation delete-stack --region ap-south-1 --stack-name anime-index-mvp
```
