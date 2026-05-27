pipeline {
    agent any

    parameters {
        choice(
            name: 'MODULE',
            choices: ['frontend', 'poll-service', 'vote-service', 'results-service', 'worker'],
            description: 'Który moduł zbudować'
        )
    }

    environment {
        REGISTRY = '192.168.1.107:5000'
        PROJECT = 'instantpoll'
    }

    stages {
        stage('Resolve module') {
            steps {
                script {
                    def modulePaths = [
                        'frontend': 'src/frontend',
                        'poll-service': 'src/poll-service',
                        'vote-service': 'src/vote-service',
                        'results-service': 'src/results-service',
                        'worker': 'src/worker'
                    ]

                    env.MODULE_NAME = params.MODULE
                    env.MODULE_PATH = modulePaths[params.MODULE]

                    if (!env.MODULE_PATH) {
                        error("Unknown module: ${params.MODULE}")
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
                    echo "Module: ${MODULE_NAME}"
                    echo "Path: ${MODULE_PATH}"
                    echo "Image: ${IMAGE_NAME}"

                    test -d "${MODULE_PATH}"
                    test -f "${MODULE_PATH}/Dockerfile"
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