pipeline {
    agent {
      kubernetes {
            yaml '''
kind: Pod
metadata:
  name: kaniko
spec:
  containers:
  - name: jnlp
    workingDir: /home/jenkins/agent
  - name: kaniko
    workingDir: /home/jenkins/agent
    image: gcr.io/kaniko-project/executor:debug
    imagePullPolicy: Always
    resources:
      requests:
        cpu: "1000m"
        memory: "1024Mi"
        ephemeral-storage: "5Gi"
      limits:
        cpu: "1000m"
        memory: "2048Mi"
        ephemeral-storage: "5Gi"
    command:
    - /busybox/cat
    tty: true
    volumeMounts:
    - name: jenkins-docker-cfg
      mountPath: /kaniko/.docker
  volumes:
  - name: jenkins-docker-cfg
    projected:
      sources:
      - secret:
          name: rencibuild-imagepull-secret
          items:
            - key: .dockerconfigjson
              path: config.json
'''
        }
    }
    stages {
        // stage('Test') {
        //     steps {
        //         container('agent-docker') {
        //             sh '''
        //             make test
        //             '''
        //         }
        //     }
        // }
        stage('Build and Push Image') {
            environment {
                PATH = "/busybox:/kaniko:$PATH"
                DOCKERHUB_CREDS = credentials("${env.REGISTRY_CREDS_ID_STR}")
                DOCKER_REGISTRY = "${env.DOCKER_REGISTRY}"
                BUILD_NUMBER = "${env.BUILD_NUMBER}"
            }
            steps {
                container(name: 'kaniko', shell: '/busybox/sh') {
                    sh '''
                    /kaniko/executor --dockerfile Dockerfile \
                        --context . \
                        --destination helxplatform/helx-ui:new-jenkins-test-$BUILD_NUMBER
                    '''
                }
            }
        }
    }
}