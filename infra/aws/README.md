# AWS credit-backed MVP deployment

This stack runs the web app, Django API, PostgreSQL, and Redis on one Free Tier eligible EC2 instance. It deliberately excludes RDS, ElastiCache, an Application Load Balancer, NAT Gateway, Kafka, and an always-running Jenkins controller.

## Current preview

- Application: [Anime Index on AWS](http://ec2-13-232-238-146.ap-south-1.compute.amazonaws.com)
- Region: `ap-south-1`
- Stack: `anime-index-mvp`
- Transport: HTTP during the product-development preview

A stable domain and HTTPS are the next infrastructure improvement. They are deliberately scheduled after the core discovery flows are developed so the next deployment work promotes a substantially more useful application.

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
sudo docker compose --env-file .env.aws -f docker-compose.yml -f docker-compose.aws.yml up --build --detach
```

Delete the stack before credits expire to stop instance, storage, and public IPv4 usage:

```bash
aws cloudformation delete-stack --region ap-south-1 --stack-name anime-index-mvp
```
