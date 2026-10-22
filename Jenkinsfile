pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '30'))
    timeout(time: 35, unit: 'MINUTES')
  }

  parameters {
    booleanParam(name: 'DEPLOY_STAGING', defaultValue: false, description: 'Publish and deploy the tested commit to AWS staging')
    booleanParam(name: 'DEPLOY_PRODUCTION', defaultValue: false, description: 'Promote the tested image to AWS production')
  }

  environment {
    CI = 'true'
    AWS_REGION = credentials('anime-search-aws-region')
    ECR_REGISTRY = credentials('anime-search-ecr-registry')
    WEB_IMAGE = "${ECR_REGISTRY}/anime-search-web"
    API_IMAGE = "${ECR_REGISTRY}/anime-search-api"
    IMAGE_TAG = "${GIT_COMMIT}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Frontend checks') {
      steps {
        sh 'docker build --target test -t anime-search-web-test:${GIT_COMMIT} web'
        sh 'docker build --target build -t anime-search-web-build:${GIT_COMMIT} web'
      }
    }

    stage('Backend checks') {
      when { expression { fileExists('backend/pyproject.toml') } }
      steps {
        sh 'docker build --target test -t anime-search-api-test:${GIT_COMMIT} backend'
        sh 'docker run --rm anime-search-api-test:${GIT_COMMIT}'
      }
    }

    stage('Container build') {
      when { expression { params.DEPLOY_STAGING || params.DEPLOY_PRODUCTION } }
      steps {
        sh 'docker build --pull --label org.opencontainers.image.revision=${GIT_COMMIT} -t ${WEB_IMAGE}:${IMAGE_TAG} web'
        sh 'docker build --pull --target runtime --label org.opencontainers.image.revision=${GIT_COMMIT} -t ${API_IMAGE}:${IMAGE_TAG} backend'
        sh 'docker inspect ${WEB_IMAGE}:${IMAGE_TAG} > web-image-metadata.json'
        sh 'docker inspect ${API_IMAGE}:${IMAGE_TAG} > api-image-metadata.json'
      }
    }

    stage('Publish image') {
      when { expression { params.DEPLOY_STAGING || params.DEPLOY_PRODUCTION } }
      steps {
        withCredentials([aws(credentialsId: 'anime-search-aws', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
          sh 'aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}'
          sh 'docker push ${WEB_IMAGE}:${IMAGE_TAG}'
          sh 'docker push ${API_IMAGE}:${IMAGE_TAG}'
        }
      }
    }

    stage('Deploy staging') {
      when { expression { params.DEPLOY_STAGING || params.DEPLOY_PRODUCTION } }
      steps {
        withCredentials([aws(credentialsId: 'anime-search-aws', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
          sh './infra/scripts/deploy-ecs.sh staging ${IMAGE_TAG}'
          sh './infra/scripts/smoke-test.sh ${ANIME_SEARCH_STAGING_URL}'
        }
      }
    }

    stage('Production approval') {
      when { expression { params.DEPLOY_PRODUCTION } }
      input { message 'Promote the tested staging image to production?'; ok 'Deploy' }
      steps { echo "Promoting immutable image ${IMAGE_TAG}" }
    }

    stage('Deploy production') {
      when { expression { params.DEPLOY_PRODUCTION } }
      steps {
        withCredentials([aws(credentialsId: 'anime-search-aws', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
          sh './infra/scripts/deploy-ecs.sh production ${IMAGE_TAG}'
          sh './infra/scripts/smoke-test.sh ${ANIME_SEARCH_PRODUCTION_URL}'
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: '*-image-metadata.json', allowEmptyArchive: true, fingerprint: true
      deleteDir()
    }
  }
}
