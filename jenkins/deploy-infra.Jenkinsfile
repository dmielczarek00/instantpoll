pipeline {
    agent any

    environment {
        APP_SERVER = '192.168.1.108'
        APP_DIR = '/opt/instantpoll'
    }

    stages {
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

        stage('Create env file') {
            steps {
                withCredentials([
                    string(credentialsId: 'instantpoll-postgres-password', variable: 'POSTGRES_PASSWORD_SECRET')
                ]) {
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
                                        sed -i \"s|^\\${KEY}=.*|\\${KEY}=\\${VALUE}|\" .env
                                    else
                                        echo \"\\${KEY}=\\${VALUE}\" >> .env
                                    fi
                                }

                                set_env POSTGRES_DB instantpoll
                                set_env POSTGRES_USER instantpoll
                                set_env POSTGRES_PASSWORD '${POSTGRES_PASSWORD_SECRET}'
                                set_env DATABASE_URL 'postgresql://instantpoll:${POSTGRES_PASSWORD_SECRET}@postgres:5432/instantpoll'
                                set_env REDIS_URL 'redis://redis:6379'

                                grep -q '^FRONTEND_TAG=' .env || echo 'FRONTEND_TAG=latest' >> .env
                                grep -q '^POLL_SERVICE_TAG=' .env || echo 'POLL_SERVICE_TAG=latest' >> .env
                                grep -q '^VOTE_SERVICE_TAG=' .env || echo 'VOTE_SERVICE_TAG=latest' >> .env
                                grep -q '^RESULTS_SERVICE_TAG=' .env || echo 'RESULTS_SERVICE_TAG=latest' >> .env
                                grep -q '^WORKER_TAG=' .env || echo 'WORKER_TAG=latest' >> .env

                                chmod 600 .env
                            "
                        '''
                    }
                }
            }
        }

        stage('Start infra') {
            steps {
                sshagent(credentials: ['app-server-ssh']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no sysadmin@${APP_SERVER} "
                            set -e
                            cd ${APP_DIR}
                            docker compose up -d postgres redis
                            docker compose ps
                        "
                    '''
                }
            }
        }
    }
}