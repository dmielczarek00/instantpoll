def registryUrl = 'http://192.168.1.107:5000'
def projectName = 'instantpoll'

def tagScriptForModule = { moduleName ->
    return """
import groovy.json.JsonSlurper

def module = '${moduleName}'
def url = '${registryUrl}/v2/${projectName}/' + module + '/tags/list'

try {
    def response = new URL(url).text
    def json = new JsonSlurper().parseText(response)

    def tags = json.tags ?: []

    def buildNo = { tag ->
        try {
            if (!tag.startsWith('b') || !tag.contains('-')) {
                return -1
            }

            return tag.substring(1).split('-')[0].toInteger()
        } catch (Exception ignored) {
            return -1
        }
    }

    tags = tags
        .findAll { it != 'latest' }
        .sort { a, b ->
            def byBuild = buildNo(b) <=> buildNo(a)

            if (byBuild != 0) {
                return byBuild
            }

            return b <=> a
        }

    return tags ?: ['NO_TAGS_FOUND']
} catch (Exception e) {
    return ['ERROR: ' + e.message]
}
"""
}

def fallbackScript = """
return ['NO_TAGS_FOUND']
"""

properties([
    parameters([
        booleanParam(
            name: 'DEPLOY_FRONTEND',
            defaultValue: false,
            description: 'Wdrożyć frontend?'
        ),
        [
            $class: 'ChoiceParameter',
            name: 'FRONTEND_TAG',
            description: 'Tag obrazu frontend',
            choiceType: 'PT_SINGLE_SELECT',
            filterable: false,
            filterLength: 1,
            script: [
                $class: 'GroovyScript',
                script: [
                    sandbox: true,
                    classpath: [],
                    script: tagScriptForModule('frontend')
                ],
                fallbackScript: [
                    sandbox: true,
                    classpath: [],
                    script: fallbackScript
                ]
            ]
        ],

        booleanParam(
            name: 'DEPLOY_POLL_SERVICE',
            defaultValue: false,
            description: 'Wdrożyć poll-service?'
        ),
        [
            $class: 'ChoiceParameter',
            name: 'POLL_SERVICE_TAG',
            description: 'Tag obrazu poll-service',
            choiceType: 'PT_SINGLE_SELECT',
            filterable: false,
            filterLength: 1,
            script: [
                $class: 'GroovyScript',
                script: [
                    sandbox: true,
                    classpath: [],
                    script: tagScriptForModule('poll-service')
                ],
                fallbackScript: [
                    sandbox: true,
                    classpath: [],
                    script: fallbackScript
                ]
            ]
        ],

        booleanParam(
            name: 'DEPLOY_VOTE_SERVICE',
            defaultValue: false,
            description: 'Wdrożyć vote-service?'
        ),
        [
            $class: 'ChoiceParameter',
            name: 'VOTE_SERVICE_TAG',
            description: 'Tag obrazu vote-service',
            choiceType: 'PT_SINGLE_SELECT',
            filterable: false,
            filterLength: 1,
            script: [
                $class: 'GroovyScript',
                script: [
                    sandbox: true,
                    classpath: [],
                    script: tagScriptForModule('vote-service')
                ],
                fallbackScript: [
                    sandbox: true,
                    classpath: [],
                    script: fallbackScript
                ]
            ]
        ],

        booleanParam(
            name: 'DEPLOY_RESULTS_SERVICE',
            defaultValue: false,
            description: 'Wdrożyć results-service?'
        ),
        [
            $class: 'ChoiceParameter',
            name: 'RESULTS_SERVICE_TAG',
            description: 'Tag obrazu results-service',
            choiceType: 'PT_SINGLE_SELECT',
            filterable: false,
            filterLength: 1,
            script: [
                $class: 'GroovyScript',
                script: [
                    sandbox: true,
                    classpath: [],
                    script: tagScriptForModule('results-service')
                ],
                fallbackScript: [
                    sandbox: true,
                    classpath: [],
                    script: fallbackScript
                ]
            ]
        ],

        booleanParam(
            name: 'DEPLOY_WORKER',
            defaultValue: false,
            description: 'Wdrożyć worker?'
        ),
        [
            $class: 'ChoiceParameter',
            name: 'WORKER_TAG',
            description: 'Tag obrazu worker',
            choiceType: 'PT_SINGLE_SELECT',
            filterable: false,
            filterLength: 1,
            script: [
                $class: 'GroovyScript',
                script: [
                    sandbox: true,
                    classpath: [],
                    script: tagScriptForModule('worker')
                ],
                fallbackScript: [
                    sandbox: true,
                    classpath: [],
                    script: fallbackScript
                ]
            ]
        ]
    ])
])

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
                    if (params.DEPLOY_FRONTEND && (!params.FRONTEND_TAG?.trim() || params.FRONTEND_TAG == 'NO_TAGS_FOUND' || params.FRONTEND_TAG.startsWith('ERROR:'))) {
                        error('Zaznaczono frontend, ale FRONTEND_TAG jest pusty albo niepoprawny')
                    }
                    if (params.DEPLOY_POLL_SERVICE && (!params.POLL_SERVICE_TAG?.trim() || params.POLL_SERVICE_TAG == 'NO_TAGS_FOUND' || params.POLL_SERVICE_TAG.startsWith('ERROR:'))) {
                        error('Zaznaczono poll-service, ale POLL_SERVICE_TAG jest pusty albo niepoprawny')
                    }
                    if (params.DEPLOY_VOTE_SERVICE && (!params.VOTE_SERVICE_TAG?.trim() || params.VOTE_SERVICE_TAG == 'NO_TAGS_FOUND' || params.VOTE_SERVICE_TAG.startsWith('ERROR:'))) {
                        error('Zaznaczono vote-service, ale VOTE_SERVICE_TAG jest pusty albo niepoprawny')
                    }
                    if (params.DEPLOY_RESULTS_SERVICE && (!params.RESULTS_SERVICE_TAG?.trim() || params.RESULTS_SERVICE_TAG == 'NO_TAGS_FOUND' || params.RESULTS_SERVICE_TAG.startsWith('ERROR:'))) {
                        error('Zaznaczono results-service, ale RESULTS_SERVICE_TAG jest pusty albo niepoprawny')
                    }
                    if (params.DEPLOY_WORKER && (!params.WORKER_TAG?.trim() || params.WORKER_TAG == 'NO_TAGS_FOUND' || params.WORKER_TAG.startsWith('ERROR:'))) {
                        error('Zaznaczono worker, ale WORKER_TAG jest pusty albo niepoprawny')
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

        stage('Upload deploy data') {
            steps {
                sshagent(credentials: ['app-server-ssh']) {
                    sh '''
                        cat > .env.deploy-updates <<EOF
${ENV_UPDATES}
EOF

                        cat > .selected-services <<EOF
${SELECTED_SERVICES}
EOF

                        scp -o StrictHostKeyChecking=no .env.deploy-updates sysadmin@${APP_SERVER}:${APP_DIR}/.env.deploy-updates
                        scp -o StrictHostKeyChecking=no .selected-services sysadmin@${APP_SERVER}:${APP_DIR}/.selected-services

                        rm -f .env.deploy-updates .selected-services
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
                            test -f .selected-services

                            while IFS="=" read -r KEY VALUE; do
                                [ -z "$KEY" ] && continue

                                if grep -q "^${KEY}=" .env; then
                                    sed -i "s|^${KEY}=.*|${KEY}=${VALUE}|" .env
                                else
                                    echo "${KEY}=${VALUE}" >> .env
                                fi
                            done < .env.deploy-updates

                            SELECTED_SERVICES="$(cat .selected-services)"

                            rm -f .env.deploy-updates .selected-services

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