library 'pipeline-utils@master'

CCV = ""
CURR_TIMESTAMP = ""

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
        cpu: "512m"
        memory: "1024Mi"
        ephemeral-storage: "2Gi"
      limits:
        cpu: "1024m"
        memory: "2048Mi"
        ephemeral-storage: "2Gi"
    command:
    - /busybox/cat
    tty: true
    volumeMounts:
    - name: jenkins-docker-cfg
      mountPath: /kaniko/.docker
  - name: go
    workingDir: /home/jenkins/agent
    image: golang:1.19.1
    imagePullPolicy: Always
    resources:
      requests:
        cpu: "512m"
        memory: "1024Mi"
        ephemeral-storage: "1Gi"
      limits:
        cpu: "512m"
        memory: "2048Mi"
        ephemeral-storage: "1Gi"
    command:
    - /bin/bash
    tty: true
  - name: crane
    workingDir: /tmp/jenkins
    image: gcr.io/go-containerregistry/crane:debug
    imagePullPolicy: Always
    command:
    - /busybox/cat
    tty: true
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
    environment {
        PATH = "/busybox:/kaniko:/ko-app/:$PATH"
        GITHUB_CREDS = credentials("${env.GITHUB_CREDS_ID_STR}")
        DOCKERHUB_CREDS = credentials("${env.CONTAINERS_REGISTRY_CREDS_ID_STR}")
        REGISTRY = "${env.REGISTRY}"
        REG_OWNER="helxplatform"
        REPO_NAME="helx-ui"
        COMMIT_HASH="${sh(script:"git rev-parse --short HEAD", returnStdout: true).trim()}"
        IMAGE_NAME="${REGISTRY}/${REG_OWNER}/${REPO_NAME}"
    }
    stages {
        stage('Build') {
            steps {
              script {
                container(name: 'kaniko', shell: '/busybox/sh') {
                    def now = new Date()
                    CURR_TIMESTAMP = now.format("yyyy-MM-dd'T'HH.mm'Z'", TimeZone.getTimeZone('UTC'))
                    kaniko.build("./Dockerfile", ["$IMAGE_NAME:$BRANCH_NAME", "$IMAGE_NAME:$COMMIT_HASH", "$IMAGE_NAME:$CURR_TIMESTAMP", "$IMAGE_NAME:latest"])
                }
                container(name: 'go', shell: '/bin/bash') {
                    if (BRANCH_NAME.equals("master")) { 
                        CCV = go.ccv()
                    }
                }
              }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'image.tar', onlyIfSuccessful: true
                }
            }
        }
        stage('Test') {
            steps {
                sh '''
                echo "Test stage"
                '''
            }
        }
        stage('Publish') {
            steps {
                script {
                    container(name: 'crane', shell: '/busybox/sh') {
                        def imageTagsPushAlways = ["$IMAGE_NAME:$BRANCH_NAME", "$IMAGE_NAME:$COMMIT_HASH"]
                        def imageTagsPushForDevelopBranch = ["$IMAGE_NAME:$CURR_TIMESTAMP"]
                        def imageTagsPushForMasterBranch = ["$IMAGE_NAME:latest"]
                        if(CCV != null && !CCV.trim().isEmpty()) {
                            imageTagsPushForMasterBranch.add("$IMAGE_NAME:$CCV")
                        }
                        image.publish2(
                            imageTagsPushAlways,
                            imageTagsPushForDevelopBranch,
                            imageTagsPushForMasterBranch
                        )
                    }
                }
            }
        }
    }
}
