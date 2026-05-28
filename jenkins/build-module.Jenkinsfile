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

        stage('Debug built image') {
            steps {
                sh '''
                    echo "Image inspect:"
                    docker image inspect "${IMAGE_NAME}" --format='ID={{.Id}} CREATED={{.Created}}'

                    echo ""
                    echo "Check package files and picomatch inside image:"
                    docker run --rm "${IMAGE_NAME}" sh -c '
                        echo ""
                        echo "Package files:"
                        find /app -maxdepth 2 -name "package*.json" -print || true

                        echo ""
                        echo "picomatch in /app package files:"
                        grep -R "\\"picomatch\\"" -n /app/package*.json 2>/dev/null || true

                        echo ""
                        echo "4.0.3 in /app package files:"
                        grep -R "\\"4.0.3\\"" -n /app/package*.json 2>/dev/null || true

                        echo ""
                        echo "4.0.4 in /app package files:"
                        grep -R "\\"4.0.4\\"" -n /app/package*.json 2>/dev/null || true

                        echo ""
                        echo "picomatch files in node_modules:"
                        find /app/node_modules -path "*picomatch*" 2>/dev/null || true

                        echo ""
                        echo "npm ls picomatch:"
                        npm ls picomatch || true
                    '
                '''
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