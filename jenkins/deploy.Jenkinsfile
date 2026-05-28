pipeline {
    agent any

    parameters {
        booleanParam(name: 'DEPLOY_FRONTEND', defaultValue: false, description: 'Wdrożyć frontend?')
        string(name: 'FRONTEND_TAG', defaultValue: '', description: 'Tag obrazu frontend, np. b12-a1b2c3d')

        booleanParam(name: 'DEPLOY_POLL_SERVICE', defaultValue: false, description: 'Wdrożyć poll-service?')
        string(name: 'POLL_SERVICE_TAG', defaultValue: '', description: 'Tag obrazu poll-service')

        booleanParam(name: 'DEPLOY_VOTE_SERVICE', defaultValue: false, description: 'Wdrożyć vote-service?')
        string(name: 'VOTE_SERVICE_TAG', defaultValue: '', description: 'Tag obrazu vote-service')

        booleanParam(name: 'DEPLOY_RESULTS_SERVICE', defaultValue: false, description: 'Wdrożyć results-service?')
        string(name: 'RESULTS_SERVICE_TAG', defaultValue: '', description: 'Tag obrazu results-service')

        booleanParam(name: 'DEPLOY_WORKER', defaultValue: false, description: 'Wdrożyć worker?')
        string(name: 'WORKER_TAG', defaultValue: '', description: 'Tag obrazu worker')
    }

    environment {
        APP_SERVER = '192.168.1.108'
        APP_DIR = '/opt/instantpoll'
    }

    stages {
        stage('Validate parameters') {
            steps {
                script {
                    if (params.DEPLOY_FRONTEND && !params.FRONTEND_TAG?.trim()) {
                        error('Zaznaczono frontend, ale FRONTEND_TAG jest pusty')
                    }
                    if (params.DEPLOY_POLL_SERVICE && !params.POLL_SERVICE_TAG?.trim()) {
                        error('Zaznaczono poll-service, ale POLL_SERVICE_TAG jest pusty')
                    }
                    if (params.DEPLOY_VOTE_SERVICE && !params.VOTE_SERVICE_TAG?.trim()) {
                        error('Zaznaczono vote-service, ale VOTE_SERVICE_TAG jest pusty')
                    }
                    if (params.DEPLOY_RESULTS_SERVICE && !params.RESULTS_SERVICE_TAG?.trim()) {
                        error('Zaznaczono results-service, ale RESULTS_SERVICE_TAG jest pusty')
                    }
                    if (params.DEPLOY_WORKER && !params.WORKER_TAG?.trim()) {
                        error('Zaznaczono worker, ale WORKER_TAG jest pusty')
                    }

                    if (
                        !params.DEPLOY_FRONTEND &&
                        !params.DEPLOY_POLL_SERVICE &&
                        !params.DEPLOY_VOTE_SERVICE &&
                        !params.DEPLOY_RESULTS_SERVICE &&
                        !params.DEPLOY_WORKER
                    ) {
                        error('Nie wybrano żadnego modułu do wdrożenia')
                    }
                }
            }
        }

        stage('Prepare selected services') {
            steps {
                script {
                    def services = []
                    def envUpdates = []

                    if (params.DEPLOY_FRONTEND) {
                        services << 'frontend'
                        envUpdates << "set_env FRONTEND_TAG ${params.FRONTEND_TAG}"
                    }
                    if (params.DEPLOY_POLL_SERVICE) {
                        services << 'poll-service'
                        envUpdates << "set_env POLL_SERVICE_TAG ${params.POLL_SERVICE_TAG}"
                    }
                    if (params.DEPLOY_VOTE_SERVICE) {
                        services << 'vote-service'
                        envUpdates << "set_env VOTE_SERVICE_TAG ${params.VOTE_SERVICE_TAG}"
                    }
                    if (params.DEPLOY_RESULTS_SERVICE) {
                        services << 'results-service'
                        envUpdates << "set_env RESULTS_SERVICE_TAG ${params.RESULTS_SERVICE_TAG}"
                    }
                    if (params.DEPLOY_WORKER) {
                        services << 'worker'
                        envUpdates << "set_env WORKER_TAG ${params.WORKER_TAG}"
                    }

                    env.SELECTED_SERVICES = services.join(' ')
                    env.ENV_UPDATES = envUpdates.join('\n')
                }
            }
        }

        stage('Upload compose') {
            steps {
                sshagent(credentials: ['app-server-ssh']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no sysadmin@${APP_SERVER} "mkdir -p ${APP_DIR}"
                        scp -o StrictHostKeyChecking=no infra/compose/docker-compose.prod.yml sysadmin@${APP_SERVER}:${APP_DIR}/docker-compose.yml
                    '''
                }
            }
        }

        stage('Update versions and deploy selected modules') {
            steps {
                sshagent(credentials: ['app-server-ssh']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no sysadmin@${APP_SERVER} "
                            set -e
                            cd ${APP_DIR}

                            touch .env

                            set_env() {
                                KEY=\\$1
                                VALUE=\\$2

                                if grep -q \"^\\${KEY}=\" .env; then
                                    sed -i \"s/^\\${KEY}=.*/\\${KEY}=\\${VALUE}/\" .env
                                else
                                    echo \"\\${KEY}=\\${VALUE}\" >> .env
                                fi
                            }

                            grep -q '^FRONTEND_TAG=' .env || echo 'FRONTEND_TAG=latest' >> .env
                            grep -q '^POLL_SERVICE_TAG=' .env || echo 'POLL_SERVICE_TAG=latest' >> .env
                            grep -q '^VOTE_SERVICE_TAG=' .env || echo 'VOTE_SERVICE_TAG=latest' >> .env
                            grep -q '^RESULTS_SERVICE_TAG=' .env || echo 'RESULTS_SERVICE_TAG=latest' >> .env
                            grep -q '^WORKER_TAG=' .env || echo 'WORKER_TAG=latest' >> .env

                            ${ENV_UPDATES}

                            echo 'Selected services: ${SELECTED_SERVICES}'

                            docker compose pull ${SELECTED_SERVICES}
                            docker compose up -d ${SELECTED_SERVICES}
                            docker compose ps
                        "
                    '''
                }
            }
        }
    }
}