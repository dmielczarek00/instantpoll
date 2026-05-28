pipeline {
    agent any

    environment {
        APP_SERVER = '192.168.1.108'
        APP_DIR = '/opt/instantpoll'
    }

    stages {
        stage('Upload changelog') {
            steps {
                sshagent(credentials: ['app-server-ssh']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no sysadmin@${APP_SERVER} "mkdir -p ${APP_DIR}/db"
                        scp -o StrictHostKeyChecking=no infra/db/changelog.sql sysadmin@${APP_SERVER}:${APP_DIR}/db/changelog.sql
                    '''
                }
            }
        }

        stage('Run Liquibase') {
            steps {
                sshagent(credentials: ['app-server-ssh']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no sysadmin@${APP_SERVER} '
                            set -e
                            cd /opt/instantpoll

                            docker run --rm \
                            --network instantpoll_instantpoll \
                            -v /opt/instantpoll/db:/liquibase/changelog \
                            liquibase/liquibase:latest-alpine \
                            --url=jdbc:postgresql://postgres:5432/instantpoll \
                            --username=instantpoll \
                            --password="$(grep "^POSTGRES_PASSWORD=" .env | cut -d= -f2-)" \
                            --changeLogFile=/liquibase/changelog/changelog.sql \
                            update
                        '
                    '''
                }
            }
        }
    }
}