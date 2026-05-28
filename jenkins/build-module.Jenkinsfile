pipeline {
    agent any

    environment {
        REGISTRY = '192.168.1.107:5000'
        PROJECT = 'instantpoll'
    }

    stages {
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

                    test -d "${MODULE_PATH}"
                    test -f "${MODULE_PATH}/Dockerfile"
                    test -f "${MODULE_PATH}/package.json"
                '''
            }
        }

        stage('Build image') {
            steps {
                sh '''
                    docker build \
                      -t "${IMAGE_NAME}" \
                      -t "${LATEST_IMAGE_NAME}" \
                      "${MODULE_PATH}"
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
            }
        }
    }
}