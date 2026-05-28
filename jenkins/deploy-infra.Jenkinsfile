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
                            cat > .env.instantpoll <<EOF
POSTGRES_DB=instantpoll
POSTGRES_USER=instantpoll
POSTGRES_PASSWORD=${POSTGRES_PASSWORD_SECRET}
DATABASE_URL=postgresql://instantpoll:${POSTGRES_PASSWORD_SECRET}@postgres:5432/instantpoll
REDIS_URL=redis://redis:6379
EOF

                            scp -o StrictHostKeyChecking=no .env.instantpoll sysadmin@${APP_SERVER}:${APP_DIR}/.env
                            ssh -o StrictHostKeyChecking=no sysadmin@${APP_SERVER} "chmod 600 ${APP_DIR}/.env"
                            rm -f .env.instantpoll
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