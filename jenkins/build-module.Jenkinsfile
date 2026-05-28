pipeline {
    agent any

    environment {
        REGISTRY = '192.168.1.107:5000'
        PROJECT = 'instantpoll'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Resolve module from job name') {
            steps {
                script {
                    def jobParts = env.JOB_NAME.tokenize('/')
                    env.MODULE_NAME = jobParts[-1]

                    def modulePaths = [
                        'frontend': 'src/frontend',
                        'poll-service': 'src/poll-service',
                        'vote-service': 'src/vote-service',
                        'results-service': 'src/results-service',
                        'worker': 'src/worker'
                    ]

                    env.MODULE_PATH = modulePaths[env.MODULE_NAME]

                    if (!env.MODULE_PATH) {
                        error("Cannot resolve module from job name: ${env.JOB_NAME}")
                    }
                }
            }
        }

        stage('Resolve image tag') {
            steps {
                script {
                    env.GIT_SHORT_SHA = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    env.IMAGE_TAG = "b${env.BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
                    env.IMAGE_NAME = "${env.REGISTRY}/${env.PROJECT}/${env.MODULE_NAME}:${env.IMAGE_TAG}"
                    env.LATEST_IMAGE_NAME = "${env.REGISTRY}/${env.PROJECT}/${env.MODULE_NAME}:latest"
                }
            }
        }

        stage('Build image') {
            steps {
                sh '''
                    docker build --pull \
                      -t "${IMAGE_NAME}" \
                      -t "${LATEST_IMAGE_NAME}" \
                      "${MODULE_PATH}"
                '''
            }
        }

        stage('Smoke test backend image') {
            when {
                expression {
                    return env.MODULE_NAME in ['poll-service', 'vote-service', 'results-service']
                }
            }
            steps {
                sh '''
                    CONTAINER_NAME="smoke-${MODULE_NAME}-${BUILD_NUMBER}"
                    POSTGRES_CONTAINER="smoke-postgres-${MODULE_NAME}-${BUILD_NUMBER}"
                    REDIS_CONTAINER="smoke-redis-${MODULE_NAME}-${BUILD_NUMBER}"
                    TEST_NETWORK="smoke-net-${MODULE_NAME}-${BUILD_NUMBER}"

                    case "${MODULE_NAME}" in
                    poll-service)
                        PORT=3001
                        ;;
                    vote-service)
                        PORT=3002
                        ;;
                    results-service)
                        PORT=3003
                        ;;
                    *)
                        echo "Unknown backend module: ${MODULE_NAME}"
                        exit 1
                        ;;
                    esac

                    docker network create "${TEST_NETWORK}"

                    docker run -d \
                    --name "${POSTGRES_CONTAINER}" \
                    --network "${TEST_NETWORK}" \
                    --network-alias smoke-postgres \
                    -e POSTGRES_DB=instantpoll \
                    -e POSTGRES_USER=instantpoll \
                    -e POSTGRES_PASSWORD=instantpoll \
                    postgres:16-alpine

                    docker run -d \
                    --name "${REDIS_CONTAINER}" \
                    --network "${TEST_NETWORK}" \
                    --network-alias smoke-redis \
                    redis:7-alpine

                    echo "Waiting for PostgreSQL..."
                    for i in $(seq 1 3); do
                        if docker exec "${POSTGRES_CONTAINER}" pg_isready -U instantpoll -d instantpoll >/dev/null 2>&1; then
                            echo "PostgreSQL is ready"
                            break
                        fi

                        if [ "$i" -eq 3 ]; then
                            echo "PostgreSQL did not become ready"
                            docker logs "${POSTGRES_CONTAINER}" || true
                            exit 1
                        fi

                        sleep 10
                    done

                    docker run -d \
                    --name "${CONTAINER_NAME}" \
                    --network "${TEST_NETWORK}" \
                    --network-alias "${MODULE_NAME}" \
                    -e PORT="${PORT}" \
                    -e DATABASE_URL="postgresql://instantpoll:instantpoll@smoke-postgres:5432/instantpoll" \
                    -e REDIS_URL="redis://smoke-redis:6379" \
                    "${IMAGE_NAME}"

                    echo "Waiting for ${MODULE_NAME} health..."
                    for i in $(seq 1 3); do
                        if docker run --rm \
                            --network "${TEST_NETWORK}" \
                            curlimages/curl:8.10.1 \
                            --fail --silent --show-error \
                            "http://${MODULE_NAME}:${PORT}/health"; then
                            echo ""
                            echo "${MODULE_NAME} healthcheck passed"
                            exit 0
                        fi

                        if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
                            echo "${MODULE_NAME} container exited before healthcheck passed"
                            docker logs "${CONTAINER_NAME}" || true
                            exit 1
                        fi

                        sleep 10
                    done

                    echo "${MODULE_NAME} healthcheck timeout"
                    docker logs "${CONTAINER_NAME}" || true
                    exit 1
                '''
            }
            post {
                always {
                    sh '''
                        docker rm -f "smoke-${MODULE_NAME}-${BUILD_NUMBER}" 2>/dev/null || true
                        docker rm -f "smoke-postgres-${MODULE_NAME}-${BUILD_NUMBER}" 2>/dev/null || true
                        docker rm -f "smoke-redis-${MODULE_NAME}-${BUILD_NUMBER}" 2>/dev/null || true
                        docker network rm "smoke-net-${MODULE_NAME}-${BUILD_NUMBER}" 2>/dev/null || true
                    '''
                }
            }
        }

        stage('Smoke test frontend image') {
            when {
                expression {
                    return env.MODULE_NAME == 'frontend'
                }
            }
            steps {
                sh '''
                    CONTAINER_NAME="smoke-${MODULE_NAME}-${BUILD_NUMBER}"

                    docker run -d \
                    --name "${CONTAINER_NAME}" \
                    -e PORT=3000 \
                    -e HOSTNAME=0.0.0.0 \
                    -e POLL_SERVICE_URL=http://poll-service:3001 \
                    -e VOTE_SERVICE_URL=http://vote-service:3002 \
                    -e RESULTS_SERVICE_URL=http://results-service:3003 \
                    "${IMAGE_NAME}"

                    sleep 8

                    docker exec "${CONTAINER_NAME}" sh -c '
                        wget -qO- http://127.0.0.1:3000/api/health
                    '

                    docker rm -f "${CONTAINER_NAME}"
                '''
            }
            post {
                always {
                    sh '''
                        docker rm -f "smoke-${MODULE_NAME}-${BUILD_NUMBER}" 2>/dev/null || true
                    '''
                }
            }
        }

        stage('Trivy scan') {
            steps {
                sh '''
                    trivy image \
                      --severity HIGH,CRITICAL \
                      --ignore-unfixed \
                      --exit-code 1 \
                      --no-progress \
                      "${IMAGE_NAME}"
                '''
            }
        }

        stage('Push image') {
            steps {
                sh '''
                    docker push "${IMAGE_NAME}"
                    docker push "${LATEST_IMAGE_NAME}"
                '''
            }
        }

        stage('Summary') {
            steps {
                echo "Built and pushed:"
                echo "${IMAGE_NAME}"
                echo "${LATEST_IMAGE_NAME}"
            }
        }
    }

    post {
        always {
            sh '''
                echo "Cleaning local Docker images and dangling layers..."

                docker rm -f "smoke-${MODULE_NAME}-${BUILD_NUMBER}" 2>/dev/null || true
                docker network rm "smoke-net-${MODULE_NAME}-${BUILD_NUMBER}" 2>/dev/null || true
                docker network rm "smoke-net-${BUILD_NUMBER}" 2>/dev/null || true

                if [ -n "${IMAGE_NAME}" ]; then
                    docker rmi "${IMAGE_NAME}" 2>/dev/null || true
                fi

                if [ -n "${LATEST_IMAGE_NAME}" ]; then
                    docker rmi "${LATEST_IMAGE_NAME}" 2>/dev/null || true
                fi

                docker image prune -f
            '''
        }
    }
}