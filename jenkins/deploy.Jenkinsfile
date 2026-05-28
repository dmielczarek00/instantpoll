pipeline {
    agent any

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
                        envUpdates << "FRONTEND_TAG=${params.FRONTEND_TAG}"
                    }
                    if (params.DEPLOY_POLL_SERVICE) {
                        services << 'poll-service'
                        envUpdates << "POLL_SERVICE_TAG=${params.POLL_SERVICE_TAG}"
                    }
                    if (params.DEPLOY_VOTE_SERVICE) {
                        services << 'vote-service'
                        envUpdates << "VOTE_SERVICE_TAG=${params.VOTE_SERVICE_TAG}"
                    }
                    if (params.DEPLOY_RESULTS_SERVICE) {
                        services << 'results-service'
                        envUpdates << "RESULTS_SERVICE_TAG=${params.RESULTS_SERVICE_TAG}"
                    }
                    if (params.DEPLOY_WORKER) {
                        services << 'worker'
                        envUpdates << "WORKER_TAG=${params.WORKER_TAG}"
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

        stage('Upload selected tag updates') {
            steps {
                sshagent(credentials: ['app-server-ssh']) {
                    sh '''
                        cat > .env.deploy-updates <<EOF
${ENV_UPDATES}
EOF

                        scp -o StrictHostKeyChecking=no .env.deploy-updates sysadmin@${APP_SERVER}:${APP_DIR}/.env.deploy-updates
                        rm -f .env.deploy-updates
                    '''
                }
            }
        }

        stage('Update versions and deploy selected modules') {
            steps {
                sshagent(credentials: ['app-server-ssh']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no sysadmin@${APP_SERVER} '
                            set -e
                            cd /opt/instantpoll

                            test -f .env
                            test -f .env.deploy-updates

                            while IFS='=' read -r KEY VALUE; do
                                [ -z "$KEY" ] && continue

                                if grep -q "^${KEY}=" .env; then
                                    sed -i "s|^${KEY}=.*|${KEY}=${VALUE}|" .env
                                else
                                    echo "${KEY}=${VALUE}" >> .env
                                fi
                            done < .env.deploy-updates

                            rm -f .env.deploy-updates

                            echo "Selected services: ${SELECTED_SERVICES}"

                            docker compose pull ${SELECTED_SERVICES}
                            docker compose up -d ${SELECTED_SERVICES}
                            docker compose ps
                        '
                    '''
                }
            }
        }
    }
}