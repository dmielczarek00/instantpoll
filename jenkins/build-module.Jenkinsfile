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

        stage('Check module files') {
            steps {
                sh '''
                    echo "Job: ${JOB_NAME}"
                    echo "Module: ${MODULE_NAME}"
                    echo "Path: ${MODULE_PATH}"
                    echo "Image: ${IMAGE_NAME}"
                    echo "Latest image: ${LATEST_IMAGE_NAME}"

                    echo ""
                    echo "Git commit:"
                    git rev-parse HEAD

                    echo ""
                    echo "Git branch:"
                    git branch --show-current || true

                    echo ""
                    echo "Module files:"
                    test -d "${MODULE_PATH}"
                    test -f "${MODULE_PATH}/Dockerfile"
                    test -f "${MODULE_PATH}/package.json"

                    if [ -f "${MODULE_PATH}/package-lock.json" ]; then
                        echo "package-lock.json exists"
                    else
                        echo "WARNING: package-lock.json does not exist"
                    fi

                    echo ""
                    echo "picomatch in module package files:"
                    grep -R '"picomatch"' -n "${MODULE_PATH}/package.json" "${MODULE_PATH}/package-lock.json" 2>/dev/null || true

                    echo ""
                    echo "picomatch 4.0.3 in module package files:"
                    grep -R '"4.0.3"' -n "${MODULE_PATH}/package.json" "${MODULE_PATH}/package-lock.json" 2>/dev/null || true

                    echo ""
                    echo "picomatch 4.0.4 in module package files:"
                    grep -R '"4.0.4"' -n "${MODULE_PATH}/package.json" "${MODULE_PATH}/package-lock.json" 2>/dev/null || true
                '''
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

        stage('Smoke test image') {
            when {
                expression {
                    return env.MODULE_NAME in ['poll-service', 'vote-service', 'results-service']
                }
            }
            steps {
                sh '''
                    CONTAINER_NAME="smoke-${MODULE_NAME}-${BUILD_NUMBER}"
                    TEST_NETWORK="smoke-net-${BUILD_NUMBER}"

                    docker network create "${TEST_NETWORK}"

                    docker run -d \
                    --name "${CONTAINER_NAME}" \
                    --network "${TEST_NETWORK}" \
                    -e PORT=3000 \
                    -e DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy" \
                    -e REDIS_URL="redis://dummy:6379" \
                    "${IMAGE_NAME}"

                    sleep 5

                    docker run --rm \
                    --network "${TEST_NETWORK}" \
                    curlimages/curl:8.10.1 \
                    --fail --silent --show-error \
                    "http://${CONTAINER_NAME}:3000/health"

                    docker rm -f "${CONTAINER_NAME}"
                    docker network rm "${TEST_NETWORK}"
                '''
            }
            post {
                always {
                    sh '''
                        docker rm -f "smoke-${MODULE_NAME}-${BUILD_NUMBER}" 2>/dev/null || true
                        docker network rm "smoke-net-${BUILD_NUMBER}" 2>/dev/null || true
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
}